from flask import Blueprint, request, jsonify, session, g
from supabase_auth import SupabaseAuth
import logging
import os
import re
import time
from models import User
from app import db

auth_bp = Blueprint('auth', __name__)

def validate_password(password):
    """
    Validate password strength
    
    Requirements:
    - At least 8 characters
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one digit"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    return True, "Password is strong"

def validate_email(email):
    """Validate email format"""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False, "Invalid email format"
    
    # Check if email already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return False, "Email is already registered"
    
    return True, "Email is valid"

def validate_username(username):
    """Validate username"""
    if len(username) < 3:
        return False, "Username must be at least 3 characters long"
    
    if len(username) > 30:
        return False, "Username must be less than 30 characters"
    
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores"
    
    # Check if username already exists
    existing_user = User.query.filter(User.username.ilike(username)).first()
    if existing_user:
        return False, "Username is already taken"
    
    return True, "Username is valid"

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user with enhanced validation"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    username = data.get('username', email.split('@')[0] if email else None)
    
    # Validate required fields
    if not email or not password or not username:
        return jsonify({
            'success': False,
            'message': 'Email, password, and username are required'
        }), 400
    
    # Validate email
    email_valid, email_message = validate_email(email)
    if not email_valid:
        return jsonify({
            'success': False,
            'message': email_message
        }), 400
    
    # Validate username
    username_valid, username_message = validate_username(username)
    if not username_valid:
        return jsonify({
            'success': False,
            'message': username_message
        }), 400
    
    # Validate password strength
    password_valid, password_message = validate_password(password)
    if not password_valid:
        return jsonify({
            'success': False,
            'message': password_message
        }), 400
    
    # Register with Supabase
    result = SupabaseAuth.register(email, password, username)
    
    if result['success']:
        # Store user info in session
        session['user_id'] = result['user']['id']
        session['email'] = result['user']['email']
        session['username'] = result['user']['username']
        session['water_credits'] = 20
        
        # Set secure session cookies
        session.permanent = True
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': {
                'id': result['user']['id'],
                'email': result['user']['email'],
                'username': result['user']['username'],
                'water_credits': 20
            }
        })
    else:
        return jsonify({
            'success': False,
            'message': f"Registration failed: {result.get('error', 'Unknown error')}"
        }), 400

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """Log in a user with enhanced security"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({
            'success': False,
            'message': 'Email and password are required'
        }), 400
    
    # Add rate limiting for login attempts (simple implementation)
    # In a production environment, you would use a more robust solution like Redis
    ip_address = request.remote_addr
    login_attempts_key = f"login_attempts_{ip_address}"
    login_attempts = session.get(login_attempts_key, 0)
    
    # If too many login attempts, require a cooldown period
    if login_attempts >= 5:
        return jsonify({
            'success': False,
            'message': 'Too many login attempts. Please try again later.'
        }), 429  # Too Many Requests
    
    # Login with Supabase
    result = SupabaseAuth.login(email, password)
    
    if result['success']:
        # Reset login attempts on successful login
        if login_attempts_key in session:
            session.pop(login_attempts_key)
        
        # Store user info in session
        session['user_id'] = result['user']['id']
        session['email'] = result['user']['email']
        session['username'] = result['user']['username']
        session['water_credits'] = result['user'].get('water_credits', 20)
        session['profile_picture_url'] = result['user'].get('profile_picture_url')
        session['login_time'] = str(time.time())  # Track login time
        
        # Set secure session cookies
        session.permanent = True
        
        # Log successful login
        logging.info(f"User {email} logged in successfully from {ip_address}")
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': result['user']['id'],
                'email': result['user']['email'],
                'username': result['user']['username'],
                'water_credits': result['user'].get('water_credits', 20),
                'profile_picture_url': result['user'].get('profile_picture_url')
            }
        })
    else:
        # Increment login attempts on failure
        session[login_attempts_key] = login_attempts + 1
        
        # Log failed login attempt
        logging.warning(f"Failed login attempt for {email} from {ip_address}")
        
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

@auth_bp.route('/api/auth/test-login', methods=['GET'])
def test_login():
    """Test login route that sets a session for testing"""
    try:
        # Find the test user
        test_user = User.query.filter_by(email="test@example.com").first()
        
        if not test_user:
            return jsonify({
                'success': False,
                'message': 'Test user not found. Run create_tables.py first.'
            }), 404
        
        # Set session
        session['user_id'] = test_user.id
        session['username'] = test_user.username
        session['email'] = test_user.email
        session['water_credits'] = test_user.water_credits
        
        return jsonify({
            'success': True,
            'message': 'Test login successful',
            'user': {
                'id': test_user.id,
                'username': test_user.username,
                'email': test_user.email,
                'water_credits': test_user.water_credits,
                'garden_score': test_user.garden_score
            }
        })
    except Exception as e:
        logging.error(f"Error in test login: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error in test login: {str(e)}'
        }), 500

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
        session['profile_picture_url'] = result['user'].get('profile_picture_url')
        
        return jsonify({
            'success': True,
            'user': {
                'id': result['user']['id'],
                'email': result['user']['email'],
                'username': result['user']['username'],
                'water_credits': result['user'].get('water_credits', 20),
                'profile_picture_url': result['user'].get('profile_picture_url')
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
            'water_credits': session.get('water_credits', 20),
            'profile_picture_url': session.get('profile_picture_url')
        }