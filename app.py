import os
import logging
import secrets
import time
from datetime import timedelta
from flask import Flask, request, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from werkzeug.middleware.proxy_fix import ProxyFix

# Set up logging with more detailed format
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Create SQLAlchemy instance with older style configuration
db = SQLAlchemy()

# Function to generate a secure secret key
def generate_secret_key():
    # Generate a secure random string of 32 bytes (256 bits)
    return secrets.token_hex(32)

# Function to manage the secret key
def get_or_create_secret_key():
    # Check if SESSION_SECRET is in environment variables
    secret_key = os.environ.get("SESSION_SECRET")
    
    if secret_key:
        return secret_key
    
    # Check if we have a stored secret key in a file
    secret_file = os.path.join(os.path.dirname(__file__), 'instance', 'secret_key')
    
    try:
        # Try to create the instance directory if it doesn't exist
        os.makedirs(os.path.dirname(secret_file), exist_ok=True)
        
        # Check if the secret file exists
        if os.path.exists(secret_file):
            with open(secret_file, 'r') as f:
                secret_key = f.read().strip()
                if secret_key:
                    return secret_key
        
        # If we get here, we need to generate a new secret key
        secret_key = generate_secret_key()
        
        # Save it to the file for future use
        with open(secret_file, 'w') as f:
            f.write(secret_key)
        
        logging.info("Generated and saved new secret key")
        return secret_key
    
    except Exception as e:
        # If there's any error in the process, fall back to a generated key
        # but don't save it (will regenerate on restart)
        logging.warning(f"Error managing secret key file: {str(e)}")
        return generate_secret_key()

# Create Flask app
app = Flask(__name__)
app.secret_key = get_or_create_secret_key()

# Fix for proper IP detection when behind a proxy
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)

# Enable CORS with more restrictive settings
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5000", 
            "https://pixelsprout.vercel.app",
            "https://pixelsprout.onrender.com"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Configure app with enhanced security settings
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(days=7),  # Session expires after 7 days
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB max upload size
)

# Security headers middleware
@app.after_request
def add_security_headers(response):
    # Content Security Policy
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com 'unsafe-inline'; style-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https://via.placeholder.com; connect-src 'self'"
    
    # Prevent MIME type sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    # Prevent clickjacking
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    
    # Enable XSS protection
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Referrer policy
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # Permissions policy
    response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
    
    return response

# Request logging middleware
@app.before_request
def log_request_info():
    if request.path.startswith('/api/'):
        logging.debug(f"Request: {request.method} {request.path} from {request.remote_addr}")
        g.request_start_time = time.time()

@app.after_request
def log_response_info(response):
    if hasattr(g, 'request_start_time') and request.path.startswith('/api/'):
        duration = time.time() - g.request_start_time
        logging.debug(f"Response: {response.status_code} in {duration:.4f}s")
    return response

# Configure database connection
database_url = os.environ.get("DATABASE_URL")

# Check if the database URL is in the Heroku/Render format and fix it if needed
# (Heroku/Render use postgres:// but SQLAlchemy requires postgresql://)
if database_url and database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

# Use a default SQLite database for local development if no DATABASE_URL is provided
app.config["SQLALCHEMY_DATABASE_URI"] = database_url or "sqlite:///pixelsprout.db"
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize SQLAlchemy with Flask app
db.init_app(app)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login_page'

# This function is used by Flask-Login to load a user from the database
@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(user_id)

# Initialize Supabase Storage buckets
try:
    from supabase_storage import SupabaseStorage
    SupabaseStorage.initialize_buckets()
    logging.info("Supabase Storage bucket check completed")
except Exception as e:
    logging.error(f"Failed to check Supabase Storage buckets: {str(e)}")
    logging.warning("Continuing application startup despite storage initialization issues")
    # We'll continue anyway and handle storage errors at the API level

# Import and register blueprints
try:
    from routes_auth import auth_bp
    app.register_blueprint(auth_bp)
    
    from routes_storage import storage_bp
    app.register_blueprint(storage_bp)
    
    from routes_advanced import advanced_bp
    app.register_blueprint(advanced_bp)
    logging.info("Advanced features API routes registered")
    
    from routes_plants import plants_bp
    app.register_blueprint(plants_bp)
    logging.info("Plant API routes registered")
    
    from routes_test import test_bp
    app.register_blueprint(test_bp)
    logging.info("Test routes registered")
except Exception as e:
    logging.error(f"Failed to register blueprints: {str(e)}")
