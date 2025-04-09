import os
import json
import logging
from supabase import create_client
from models import User, Plant, Condition, ConditionType, PlantStage, PlantType
from datetime import datetime

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.warning("Supabase credentials not found in environment variables")

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

def convert_to_dict(obj):
    """Convert an object to a dictionary, handling enum types"""
    if isinstance(obj, (PlantStage, PlantType)):
        return obj.value
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif hasattr(obj, '__dict__'):
        result = {}
        for key, val in obj.__dict__.items():
            if key.startswith('_'):
                continue
            result[key] = convert_to_dict(val)
        return result
    elif isinstance(obj, list):
        return [convert_to_dict(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_to_dict(val) for key, val in obj.items()}
    else:
        return obj

# User functions
def create_user(email, password, username):
    """Create a new user in Supabase Auth and create a corresponding user in the database"""
    try:
        # Create user with Auth
        auth_response = supabase.auth.sign_up({"email": email, "password": password})
        user_id = auth_response.user.id
        
        try:
            # Create user record in the users table
            user_data = {
                'id': user_id,
                'email': email,
                'username': username,
                'created_at': datetime.now().isoformat()
            }
            
            supabase.table('users').insert(user_data).execute()
            
            # Create default condition types for the user
            try:
                create_default_condition_types(user_id)
            except Exception as e:
                logging.warning(f"Failed to create default condition types: {str(e)}")
                
        except Exception as db_error:
            logging.warning(f"Failed to create user record in database: {str(db_error)}")
            logging.warning("This might be because the required tables don't exist.")
            logging.warning("Please run setup_database.py to create the necessary tables.")
        
        # Return user object even if database operations fail
        return User(user_id, email, username)
    except Exception as e:
        logging.error(f"Failed to create user: {str(e)}")
        raise

def login_user(email, password):
    """Log in a user with Supabase Auth"""
    try:
        auth_response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        user_id = auth_response.user.id
        user_email = auth_response.user.email
        
        try:
            # Get user details from the users table
            user_response = supabase.table('users').select('*').eq('id', user_id).execute()
            
            if user_response.data:
                user_data = user_response.data[0]
                return User(
                    user_data['id'],
                    user_data['email'],
                    user_data['username'],
                    user_data['created_at']
                )
            else:
                # If user exists in Auth but not in users table, create a simplified user object
                logging.warning(f"User {user_id} found in Auth but not in users table")
                logging.warning("This might be because the required tables don't exist.")
                logging.warning("Please run setup_database.py to create the necessary tables.")
                
                # Use email as username if no username is available
                username = user_email.split('@')[0]
                return User(user_id, user_email, username)
        except Exception as db_error:
            logging.warning(f"Failed to get user from database: {str(db_error)}")
            logging.warning("This might be because the required tables don't exist.")
            logging.warning("Please run setup_database.py to create the necessary tables.")
            
            # Use email as username if no username is available
            username = user_email.split('@')[0]
            return User(user_id, user_email, username)
            
    except Exception as e:
        logging.error(f"Failed to login user: {str(e)}")
        return None

def get_user_by_id(user_id):
    """Get a user by ID"""
    try:
        try:
            user_response = supabase.table('users').select('*').eq('id', user_id).execute()
            
            if user_response.data:
                user_data = user_response.data[0]
                return User(
                    user_data['id'],
                    user_data['email'],
                    user_data['username'],
                    user_data['created_at']
                )
            else:
                # Try to get the user from Auth
                try:
                    # We can't directly get a single user by ID with the anon key
                    # So we'll create a simplified user object
                    logging.warning(f"User {user_id} not found in users table")
                    logging.warning("This might be because the required tables don't exist.")
                    logging.warning("Please run setup_database.py to create the necessary tables.")
                    
                    # Return a dummy user with just the ID
                    return User(user_id, f"user_{user_id}", f"user_{user_id}")
                except Exception as auth_error:
                    logging.error(f"Failed to get user from Auth: {str(auth_error)}")
                    return None
        except Exception as db_error:
            logging.warning(f"Failed to get user from database: {str(db_error)}")
            logging.warning("This might be because the required tables don't exist.")
            logging.warning("Please run setup_database.py to create the necessary tables.")
            
            # Return a dummy user with just the ID
            return User(user_id, f"user_{user_id}", f"user_{user_id}")
    except Exception as e:
        logging.error(f"Failed to get user: {str(e)}")
        return None

# Plant functions
def create_plant(user_id, name, plant_type):
    """Create a new plant for a user"""
    try:
        plant_data = {
            'user_id': user_id,
            'name': name,
            'plant_type': plant_type.value,
            'stage': PlantStage.SEED.value,
            'health': 100,
            'created_at': datetime.now().isoformat(),
            'last_watered': datetime.now().isoformat(),
            'progress': 0
        }
        
        response = supabase.table('plants').insert(plant_data).execute()
        if response.data:
            plant_id = response.data[0]['id']
            return Plant(
                plant_id,
                user_id,
                name,
                plant_type,
                PlantStage.SEED,
                100
            )
        return None
    except Exception as e:
        logging.error(f"Failed to create plant: {str(e)}")
        return None

def get_plants_by_user_id(user_id):
    """Get all plants for a user"""
    try:
        plants_response = supabase.table('plants').select('*').eq('user_id', user_id).execute()
        
        plants = []
        for plant_data in plants_response.data:
            plants.append(Plant(
                plant_data['id'],
                plant_data['user_id'],
                plant_data['name'],
                PlantType(plant_data['plant_type']),
                PlantStage(plant_data['stage']),
                plant_data['health'],
                plant_data['created_at'],
                plant_data['last_watered'],
                plant_data['progress']
            ))
        return plants
    except Exception as e:
        logging.error(f"Failed to get plants: {str(e)}")
        return []

def update_plant(plant):
    """Update a plant"""
    try:
        plant_data = convert_to_dict(plant)
        supabase.table('plants').update(plant_data).eq('id', plant.id).execute()
        return True
    except Exception as e:
        logging.error(f"Failed to update plant: {str(e)}")
        return False

# Condition functions
def log_condition(user_id, type_name, value):
    """Log a condition for a user"""
    try:
        condition_data = {
            'user_id': user_id,
            'type_name': type_name,
            'value': value,
            'date_logged': datetime.now().isoformat()
        }
        
        response = supabase.table('conditions').insert(condition_data).execute()
        if response.data:
            condition_id = response.data[0]['id']
            
            # Apply condition to plants
            apply_condition_to_plants(user_id, type_name, value)
            
            return Condition(
                condition_id,
                user_id,
                type_name,
                value
            )
        return None
    except Exception as e:
        logging.error(f"Failed to log condition: {str(e)}")
        return None

def get_conditions_by_user_id(user_id, limit=10):
    """Get recent conditions for a user"""
    try:
        conditions_response = supabase.table('conditions').select('*').eq('user_id', user_id).order('date_logged', desc=True).limit(limit).execute()
        
        conditions = []
        for condition_data in conditions_response.data:
            conditions.append(Condition(
                condition_data['id'],
                condition_data['user_id'],
                condition_data['type_name'],
                condition_data['value'],
                condition_data['date_logged']
            ))
        return conditions
    except Exception as e:
        logging.error(f"Failed to get conditions: {str(e)}")
        return []

# ConditionType functions
def create_default_condition_types(user_id):
    """Create default condition types for a new user"""
    default_conditions = [
        {
            'name': 'water_intake',
            'description': 'Daily water intake in glasses',
            'unit': 'glasses',
            'default_goal': 8
        },
        {
            'name': 'focus_time',
            'description': 'Time spent focusing on tasks',
            'unit': 'minutes',
            'default_goal': 120
        },
        {
            'name': 'sunlight',
            'description': 'Time spent outside in sunlight',
            'unit': 'minutes',
            'default_goal': 30
        },
        {
            'name': 'exercise',
            'description': 'Physical activity time',
            'unit': 'minutes',
            'default_goal': 30
        },
        {
            'name': 'sleep',
            'description': 'Hours of sleep',
            'unit': 'hours',
            'default_goal': 8
        }
    ]
    
    try:
        for condition in default_conditions:
            condition_data = {
                'name': condition['name'],
                'description': condition['description'],
                'unit': condition['unit'],
                'default_goal': condition['default_goal'],
                'user_id': None  # System-defined condition
            }
            
            supabase.table('condition_types').insert(condition_data).execute()
    except Exception as e:
        logging.error(f"Failed to create default condition types: {str(e)}")

def get_condition_types_for_user(user_id):
    """Get all condition types available to a user"""
    try:
        # Get system condition types and user-defined condition types
        query = f"user_id.is.null,user_id.eq.{user_id}"
        condition_types_response = supabase.table('condition_types').select('*').or_(query).execute()
        
        condition_types = []
        for ct_data in condition_types_response.data:
            condition_types.append(ConditionType(
                ct_data['id'],
                ct_data['name'],
                ct_data['description'],
                ct_data['unit'],
                ct_data['default_goal'],
                ct_data['user_id']
            ))
        return condition_types
    except Exception as e:
        logging.error(f"Failed to get condition types: {str(e)}")
        return []

def create_custom_condition_type(user_id, name, description, unit, default_goal):
    """Create a custom condition type for a user"""
    try:
        condition_type_data = {
            'name': name,
            'description': description,
            'unit': unit,
            'default_goal': default_goal,
            'user_id': user_id
        }
        
        response = supabase.table('condition_types').insert(condition_type_data).execute()
        if response.data:
            ct_id = response.data[0]['id']
            return ConditionType(
                ct_id,
                name,
                description,
                unit,
                default_goal,
                user_id
            )
        return None
    except Exception as e:
        logging.error(f"Failed to create custom condition type: {str(e)}")
        return None

# Plant growth logic
def apply_condition_to_plants(user_id, condition_type, value):
    """Apply a logged condition to all plants of the user"""
    try:
        plants = get_plants_by_user_id(user_id)
        
        for plant in plants:
            # Calculate effect on health and progress based on condition type and value
            health_change, progress_change = calculate_condition_effect(condition_type, value)
            
            # Update plant health
            plant.health = min(100, max(0, plant.health + health_change))
            
            # Update plant progress and potentially advance stage
            plant.progress += progress_change
            
            # Check if plant should advance to next stage
            if plant.progress >= 100 and plant.stage.value < PlantStage.DEAD.value:
                plant.progress = 0
                plant.stage = PlantStage(min(PlantStage.DEAD.value, plant.stage.value + 1))
            
            # Update last_watered time for water_intake condition
            if condition_type == 'water_intake':
                plant.last_watered = datetime.now()
            
            # Save the updated plant
            update_plant(plant)
    except Exception as e:
        logging.error(f"Failed to apply condition to plants: {str(e)}")

def calculate_condition_effect(condition_type, value):
    """Calculate the effect of a condition on plant health and progress"""
    # Default changes
    health_change = 0
    progress_change = 0
    
    # Adjust based on condition type and value
    if condition_type == 'water_intake':
        health_change = min(10, value) - 4  # Penalty for < 4 glasses, bonus for > 4 glasses
        progress_change = value / 2
    elif condition_type == 'focus_time':
        health_change = min(value / 30, 10)  # Max health gain of 10 for focus time
        progress_change = value / 30
    elif condition_type == 'sunlight':
        health_change = min(value / 10, 15)  # Max health gain of 15 for sunlight
        progress_change = value / 10
    elif condition_type == 'exercise':
        health_change = min(value / 10, 10)  # Max health gain of 10 for exercise
        progress_change = value / 10
    elif condition_type == 'sleep':
        if value < 6:
            health_change = -5  # Penalty for under 6 hours
        else:
            health_change = min((value - 6) * 3, 10)  # Max health gain of 10 for sleep > 6 hours
        progress_change = max(0, value - 5) * 3
    else:
        # Generic calculation for custom conditions
        health_change = value / 10
        progress_change = value / 10
    
    return health_change, progress_change
