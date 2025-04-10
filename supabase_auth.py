import os
import json
import logging
from supabase import create_client, Client
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.warning("Supabase credentials not found in environment variables")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

class SupabaseAuth:
    """Enhanced Supabase authentication wrapper with improved error handling"""
    
    @staticmethod
    def register(email, password, username):
        """Register a new user with Supabase Auth"""
        if not supabase:
            raise Exception("Supabase client not initialized")
            
        try:
            # Create user with Auth
            user_data = {
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "username": username
                    }
                }
            }
            auth_response = supabase.auth.sign_up(user_data)
            
            # Check if the user was created
            if not auth_response.user:
                raise Exception("User registration failed")
                
            return {
                'success': True,
                'user': {
                    'id': auth_response.user.id,
                    'email': auth_response.user.email,
                    'username': username
                }
            }
        except Exception as e:
            logging.error(f"Registration error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def login(email, password):
        """Log in a user with Supabase Auth"""
        if not supabase:
            raise Exception("Supabase client not initialized")
            
        try:
            # Login user with Auth
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            # Check if the login was successful
            if not auth_response.user:
                raise Exception("Login failed")
                
            # Get user profile
            user_id = auth_response.user.id
            user_response = supabase.table('users').select('*').eq('id', user_id).execute()
            
            # If user exists in Auth but not in users table, something is wrong
            if not user_response.data:
                raise Exception("User profile not found. Database may need to be set up.")
                
            user_data = user_response.data[0]
            
            return {
                'success': True,
                'user': {
                    'id': user_id,
                    'email': auth_response.user.email,
                    'username': user_data.get('username', email.split('@')[0]),
                    'water_credits': user_data.get('water_credits', 20)
                },
                'session': auth_response.session
            }
        except Exception as e:
            logging.error(f"Login error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def logout():
        """Sign out the current user"""
        if not supabase:
            raise Exception("Supabase client not initialized")
            
        try:
            supabase.auth.sign_out()
            return {'success': True}
        except Exception as e:
            logging.error(f"Logout error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_current_user():
        """Get the current authenticated user"""
        if not supabase:
            raise Exception("Supabase client not initialized")
            
        try:
            # Get current session
            session = supabase.auth.get_session()
            if not session or not session.user:
                return {'success': False, 'error': 'No active session'}
                
            user = session.user
            
            # Get user profile
            user_response = supabase.table('users').select('*').eq('id', user.id).execute()
            
            if not user_response.data:
                return {
                    'success': True,
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'username': user.email.split('@')[0],
                        'water_credits': 20
                    }
                }
                
            user_data = user_response.data[0]
            
            return {
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user_data.get('username', user.email.split('@')[0]),
                    'water_credits': user_data.get('water_credits', 20)
                }
            }
        except Exception as e:
            logging.error(f"Get current user error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_water_credits(user_id):
        """Get the water credits for a user"""
        if not supabase:
            raise Exception("Supabase client not initialized")
            
        try:
            # Get user profile
            user_response = supabase.table('users').select('water_credits').eq('id', user_id).execute()
            
            if not user_response.data:
                return {
                    'success': False,
                    'error': 'User not found'
                }
                
            water_credits = user_response.data[0].get('water_credits', 20)
            
            return {
                'success': True,
                'water_credits': water_credits
            }
        except Exception as e:
            logging.error(f"Get water credits error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def update_water_credits(user_id, amount, operation='add'):
        """Update the water credits for a user
        
        Args:
            user_id: The user ID
            amount: The amount to add or subtract
            operation: 'add' to add credits, 'subtract' to subtract credits
        """
        if not supabase:
            raise Exception("Supabase client not initialized")
            
        try:
            # Get current water credits
            user_response = supabase.table('users').select('water_credits').eq('id', user_id).execute()
            
            if not user_response.data:
                return {
                    'success': False,
                    'error': 'User not found'
                }
                
            current_credits = user_response.data[0].get('water_credits', 20)
            
            # Calculate new credits
            if operation == 'add':
                new_credits = current_credits + amount
            elif operation == 'subtract':
                # Check if user has enough credits
                if current_credits < amount:
                    return {
                        'success': False,
                        'error': 'Not enough water credits'
                    }
                new_credits = current_credits - amount
            else:
                return {
                    'success': False,
                    'error': 'Invalid operation'
                }
            
            # Update water credits
            supabase.table('users').update({'water_credits': new_credits}).eq('id', user_id).execute()
            
            return {
                'success': True,
                'water_credits': new_credits
            }
        except Exception as e:
            logging.error(f"Update water credits error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def reset_password(email):
        """Send a password reset email"""
        if not supabase:
            raise Exception("Supabase client not initialized")
            
        try:
            supabase.auth.reset_password_email(email)
            return {'success': True}
        except Exception as e:
            logging.error(f"Reset password error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def update_user_profile(user_id, username=None, profile_picture_url=None):
        """Update the user profile
        
        Args:
            user_id: The user ID
            username: Optional new username
            profile_picture_url: Optional profile picture URL
        """
        if not supabase:
            raise Exception("Supabase client not initialized")
            
        try:
            # Build update data
            update_data = {}
            if username:
                update_data['username'] = username
            if profile_picture_url:
                update_data['profile_picture_url'] = profile_picture_url
            
            # If nothing to update, return success
            if not update_data:
                return {'success': True}
                
            # Update user profile
            supabase.table('users').update(update_data).eq('id', user_id).execute()
            
            return {'success': True}
        except Exception as e:
            logging.error(f"Update user profile error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }