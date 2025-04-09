from flask import Blueprint, request, jsonify, session, g
from supabase_auth import SupabaseAuth
import logging
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    username = data.get('username', email.split('@')[0])
    
    if not email or not password:
        return jsonify({
            'success': False,
            'message': 'Email and password are required'
        }), 400
    
    # Register with Supabase
    result = SupabaseAuth.register(email, password, username)
    
    if result['success']:
        # Store user info in session
        session['user_id'] = result['user']['id']
        session['email'] = result['user']['email']
        session['username'] = result['user']['username']
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': {
                'id': result['user']['id'],
                'email': result['user']['email'],
                'username': result['user']['username']
            }
        })
    else:
        return jsonify({
            'success': False,
            'message': f"Registration failed: {result.get('error', 'Unknown error')}"
        }), 400

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """Log in a user"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({
            'success': False,
            'message': 'Email and password are required'
        }), 400
    
    # Login with Supabase
    result = SupabaseAuth.login(email, password)
    
    if result['success']:
        # Store user info in session
        session['user_id'] = result['user']['id']
        session['email'] = result['user']['email']
        session['username'] = result['user']['username']
        session['water_credits'] = result['user'].get('water_credits', 20)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': result['user']['id'],
                'email': result['user']['email'],
                'username': result['user']['username'],
                'water_credits': result['user'].get('water_credits', 20)
            }
        })
    else:
        return jsonify({
            'success': False,
            'message': f"Login failed: {result.get('error', 'Invalid email or password')}"
        }), 401

@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    """Log out a user"""
    # Log out with Supabase
    result = SupabaseAuth.logout()
    
    # Clear session
    session.clear()
    
    return jsonify({
        'success': True,
        'message': 'Logout successful'
    })

@auth_bp.route('/api/auth/me', methods=['GET'])
def get_current_user():
    """Get the current authenticated user"""
    # Get current user
    result = SupabaseAuth.get_current_user()
    
    if result['success']:
        # Update session
        session['user_id'] = result['user']['id']
        session['email'] = result['user']['email']
        session['username'] = result['user']['username']
        session['water_credits'] = result['user'].get('water_credits', 20)
        
        return jsonify({
            'success': True,
            'user': {
                'id': result['user']['id'],
                'email': result['user']['email'],
                'username': result['user']['username'],
                'water_credits': result['user'].get('water_credits', 20)
            }
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401

@auth_bp.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Send a password reset email"""
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({
            'success': False,
            'message': 'Email is required'
        }), 400
    
    # Reset password with Supabase
    result = SupabaseAuth.reset_password(email)
    
    if result['success']:
        return jsonify({
            'success': True,
            'message': 'Password reset email sent'
        })
    else:
        return jsonify({
            'success': False,
            'message': f"Failed to send reset email: {result.get('error', 'Unknown error')}"
        }), 400

@auth_bp.route('/api/auth/update-profile', methods=['POST'])
def update_profile():
    """Update the user profile"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401
    
    data = request.json
    username = data.get('username')
    
    # Update profile with Supabase
    result = SupabaseAuth.update_user_profile(session['user_id'], username)
    
    if result['success']:
        if username:
            session['username'] = username
            
        return jsonify({
            'success': True,
            'message': 'Profile updated'
        })
    else:
        return jsonify({
            'success': False,
            'message': f"Failed to update profile: {result.get('error', 'Unknown error')}"
        }), 400

@auth_bp.before_app_request
def load_logged_in_user():
    """Load the logged-in user if available"""
    user_id = session.get('user_id')
    
    if user_id is None:
        g.user = None
    else:
        g.user = {
            'id': session.get('user_id'),
            'email': session.get('email'),
            'username': session.get('username'),
            'water_credits': session.get('water_credits', 20)
        }