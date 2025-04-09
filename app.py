import os
import logging
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_login import LoginManager

# Set up logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

# Create SQLAlchemy instance
db = SQLAlchemy(model_class=Base)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET") or "dev-secret-key"

# Enable CORS
CORS(app)

# Configure app
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
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
