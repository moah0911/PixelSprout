import os
import json
import logging
import hashlib
import secrets
from supabase import create_client, Client
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask import request

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.warning("Supabase credentials not found in environment variables")

# Enhanced password hashing with Argon2 if available, otherwise use bcrypt
try:
    from argon2 import PasswordHasher
    ph = PasswordHasher(
        time_cost=3,       # Number of iterations
        memory_cost=65536, # Memory usage in kibibytes
        parallelism=4,     # Number of parallel threads
        hash_len=32,       # Length of the hash in bytes
        salt_len=16        # Length of the salt in bytes
    )
    
    def hash_password(password):
        """Hash a password using Argon2"""
        return ph.hash(password)
    
    def verify_password(hashed_password, password):
        """Verify a password against a hash using Argon2"""
        try:
            return ph.verify(hashed_password, password)
        except:
            return False
            
    logging.info("Using Argon2 for password hashing")
except ImportError:
    # Fallback to Werkzeug's generate_password_hash which uses pbkdf2:sha256
    def hash_password(password):
        """Hash a password using pbkdf2:sha256"""
        return generate_password_hash(password, method='pbkdf2:sha256:150000')
    
    def verify_password(hashed_password, password):
        """Verify a password against a hash using pbkdf2:sha256"""
        return check_password_hash(hashed_password, password)
        
    logging.info("Using pbkdf2:sha256 for password hashing (Argon2 not available)")

# Generate a secure token for API operations
def generate_secure_token(length=32):
    """Generate a cryptographically secure token"""
    return secrets.token_hex(length)

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

class SupabaseAuth:
    """Enhanced Supabase authentication wrapper with improved error handling"""
    
    @staticmethod
    def register(email, password, username):
        """Register a new user with Supabase Auth with enhanced security"""
        if not supabase:
            raise Exception("Supabase client not initialized")
            
        try:
            # Hash the password before sending to Supabase
            # This adds an extra layer of security even though Supabase also hashes passwords
            hashed_password = hash_password(password)
            
            # Create user with Auth
            user_data = {
                "email": email,
                "password": password,  # Supabase will hash this again
                "options": {
                    "data": {
                        "username": username,
                        "registration_ip": request.remote_addr if 'request' in globals() else None,
                        "registration_date": datetime.now().isoformat(),
                        "last_login": datetime.now().isoformat()
                    }
                }
            }
            auth_response = supabase.auth.sign_up(user_data)
            
            # Check if the user was created
            if not auth_response.user:
                raise Exception("User registration failed")
            
            # Store our own password hash in a separate secure table for additional verification
            # This is optional but provides an extra layer of security
            try:
                secure_hash_data = {
                    "user_id": auth_response.user.id,
                    "password_hash": hashed_password,
                    "created_at": datetime.now().isoformat()
                }
                supabase.table('secure_password_hashes').insert(secure_hash_data).execute()
            except Exception as hash_error:
                logging.warning(f"Could not store secure password hash: {str(hash_error)}")
                # Continue anyway as the user was created successfully
                
            # Log successful registration
            logging.info(f"User registered successfully: {email}")
                
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
        """Log in a user with Supabase Auth with enhanced security"""
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
            
            # Update last login time and IP
            try:
                login_data = {
                    "last_login": datetime.now().isoformat(),
                    "last_login_ip": request.remote_addr if 'request' in globals() else None
                }
                supabase.table('users').update(login_data).eq('id', user_id).execute()
            except Exception as update_error:
                logging.warning(f"Could not update last login info: {str(update_error)}")
                # Continue anyway as the login was successful
            
            # Log successful login
            logging.info(f"User logged in successfully: {email}")
            
            return {
                'success': True,
                'user': {
                    'id': user_id,
                    'email': auth_response.user.email,
                    'username': user_data.get('username', email.split('@')[0]),
                    'water_credits': user_data.get('water_credits', 20),
                    'profile_picture_url': user_data.get('profile_picture_url')
                },
                'session': auth_response.session
            }
        except Exception as e:
            # Log failed login attempt
            logging.warning(f"Login failed for {email}: {str(e)}")
            
            return {
                'success': False,
                'error': "Invalid email or password"  # Generic error message for security
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
                        'water_credits': 20,
                        'profile_picture_url': None
                    }
                }
                
            user_data = user_response.data[0]
            
            return {
                'success': True,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user_data.get('username', user.email.split('@')[0]),
                    'water_credits': user_data.get('water_credits', 20),
                    'profile_picture_url': user_data.get('profile_picture_url')
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