import os
import logging
import secrets
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

# Set up logging
logging.basicConfig(level=logging.DEBUG)

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

# Enable CORS
CORS(app)

# Configure app
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB max upload size
)

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
except Exception as e:
    logging.error(f"Failed to register blueprints: {str(e)}")
