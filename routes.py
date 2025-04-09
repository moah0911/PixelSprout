from flask import render_template, request, redirect, url_for, flash, session, jsonify
from flask_login import login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app import app, db
import logging
import uuid
from datetime import datetime
from models import PlantType, User, Plant, Condition, ConditionType, PlantStage

# Authentication routes
@app.route('/register', methods=['GET'])
def register_page():
    if current_user.is_authenticated:
        return redirect(url_for('garden_page'))
    return render_template('register.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    
    if not email or not password or not username:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Email already registered'}), 400
    
    try:
        # Create new user
        user_id = str(uuid.uuid4())
        new_user = User(
            id=user_id,
            email=email,
            username=username
        )
        
        # Add user to database
        db.session.add(new_user)
        db.session.commit()
        
        # Log in the user
        login_user(new_user)
        
        # Return success
        return jsonify({'success': True, 'user_id': user_id})
    except Exception as e:
        db.session.rollback()
        logging.error(f"Registration error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/login', methods=['GET'])
def login_page():
    if current_user.is_authenticated:
        return redirect(url_for('garden_page'))
    return render_template('login.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Missing email or password'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    
    if user:
        # Skip password check for now as we're transitioning from Supabase
        # In a production app, you would check the password here
        
        # Log in the user
        login_user(user)
        return jsonify({'success': True, 'user_id': user.id})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login_page'))

# Garden routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/garden')
@login_required
def garden_page():
    return render_template('garden.html', username=current_user.username)

@app.route('/profile')
@login_required
def profile_page():
    return render_template('profile.html', username=current_user.username)

# API routes
@app.route('/api/plants', methods=['GET'])
@login_required
def get_plants():
    plants = Plant.query.filter_by(user_id=current_user.id).all()
    
    plants_data = []
    for plant in plants:
        plants_data.append({
            'id': plant.id,
            'name': plant.name,
            'type': plant.plant_type,
            'stage': plant.stage,
            'health': plant.health,
            'progress': plant.progress,
            'created_at': plant.created_at.isoformat() if hasattr(plant.created_at, 'isoformat') else str(plant.created_at),
            'last_watered': plant.last_watered.isoformat() if hasattr(plant.last_watered, 'isoformat') else str(plant.last_watered)
        })
    
    return jsonify({'success': True, 'plants': plants_data})

@app.route('/api/plants', methods=['POST'])
@login_required
def create_plant():
    data = request.json
    name = data.get('name')
    plant_type_str = data.get('type')
    
    if not name or not plant_type_str:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    try:
        plant_type = PlantType(plant_type_str)
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid plant type'}), 400
    
    # Create new plant
    new_plant = Plant(
        id=None,  # Auto-incremented
        user_id=current_user.id,
        name=name,
        plant_type=plant_type
    )
    
    # Add to database
    db.session.add(new_plant)
    db.session.commit()
    
    return jsonify({
        'success': True, 
        'plant': {
            'id': new_plant.id,
            'name': new_plant.name,
            'type': new_plant.plant_type,
            'stage': new_plant.stage,
            'health': new_plant.health
        }
    })

@app.route('/api/conditions', methods=['GET'])
@login_required
def get_conditions():
    conditions = Condition.query.filter_by(user_id=current_user.id).order_by(Condition.date_logged.desc()).limit(10).all()
    
    conditions_data = []
    for condition in conditions:
        conditions_data.append({
            'id': condition.id,
            'type_name': condition.type_name,
            'value': condition.value,
            'date_logged': condition.date_logged.isoformat() if hasattr(condition.date_logged, 'isoformat') else str(condition.date_logged)
        })
    
    return jsonify({'success': True, 'conditions': conditions_data})

@app.route('/api/conditions', methods=['POST'])
@login_required
def log_condition():
    data = request.json
    type_name = data.get('type_name')
    value = data.get('value')
    
    if not type_name or value is None:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    try:
        value = float(value)
    except ValueError:
        return jsonify({'success': False, 'message': 'Value must be a number'}), 400
    
    # Create new condition
    new_condition = Condition(
        id=None,  # Auto-incremented
        user_id=current_user.id,
        type_name=type_name,
        value=value
    )
    
    # Add to database
    db.session.add(new_condition)
    db.session.commit()
    
    # Apply condition to plants
    apply_condition_to_plants(current_user.id, type_name, value)
    
    return jsonify({
        'success': True, 
        'condition': {
            'id': new_condition.id,
            'type_name': new_condition.type_name,
            'value': new_condition.value,
            'date_logged': new_condition.date_logged.isoformat() if hasattr(new_condition.date_logged, 'isoformat') else str(new_condition.date_logged)
        }
    })

@app.route('/api/condition-types', methods=['GET'])
@login_required
def get_condition_types():
    # Get system condition types (user_id is NULL) and user-defined condition types
    condition_types = ConditionType.query.filter(
        (ConditionType.user_id == None) | (ConditionType.user_id == current_user.id)
    ).all()
    
    types_data = []
    for ct in condition_types:
        types_data.append({
            'id': ct.id,
            'name': ct.name,
            'description': ct.description,
            'unit': ct.unit,
            'default_goal': ct.default_goal,
            'is_custom': ct.user_id is not None
        })
    
    return jsonify({'success': True, 'condition_types': types_data})

@app.route('/api/condition-types', methods=['POST'])
@login_required
def create_condition_type():
    data = request.json
    name = data.get('name')
    description = data.get('description')
    unit = data.get('unit')
    default_goal = data.get('default_goal')
    
    if not name or not description or not unit:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    try:
        default_goal = float(default_goal) if default_goal else None
    except ValueError:
        return jsonify({'success': False, 'message': 'Default goal must be a number'}), 400
    
    # Create new condition type
    new_condition_type = ConditionType(
        id=None,  # Auto-incremented
        name=name,
        description=description,
        unit=unit,
        default_goal=default_goal,
        user_id=current_user.id
    )
    
    # Add to database
    db.session.add(new_condition_type)
    db.session.commit()
    
    return jsonify({
        'success': True, 
        'condition_type': {
            'id': new_condition_type.id,
            'name': new_condition_type.name,
            'description': new_condition_type.description,
            'unit': new_condition_type.unit,
            'default_goal': new_condition_type.default_goal,
            'is_custom': True
        }
    })

# Plant growth logic
def apply_condition_to_plants(user_id, condition_type, value):
    """Apply a logged condition to all plants of the user"""
    try:
        plants = Plant.query.filter_by(user_id=user_id).all()
        
        for plant in plants:
            # Calculate effect on health and progress based on condition type and value
            health_change, progress_change = calculate_condition_effect(condition_type, value)
            
            # Update plant health
            plant.health = min(100, max(0, plant.health + health_change))
            
            # Update plant progress and potentially advance stage
            plant.progress += progress_change
            
            # Check if plant should advance to next stage
            if plant.progress >= 100 and plant.stage < PlantStage.DEAD.value:
                plant.progress = 0
                plant.stage = min(PlantStage.DEAD.value, plant.stage + 1)
            
            # Update last_watered time for water_intake condition
            if condition_type == 'water_intake':
                plant.last_watered = datetime.now()
        
        # Save all plant changes
        db.session.commit()
    except Exception as e:
        db.session.rollback()
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

@app.route('/api/plant-types', methods=['GET'])
def get_plant_types():
    plant_types = [{'value': pt.value, 'name': pt.name} for pt in PlantType]
    return jsonify({'success': True, 'plant_types': plant_types})

# Water credits API routes
@app.route('/api/water-credits', methods=['GET'])
@login_required
def get_water_credits():
    return jsonify({
        'success': True,
        'water_credits': current_user.water_credits
    })

@app.route('/api/water-credits/add', methods=['POST'])
@login_required
def add_water_credits():
    data = request.json
    amount = data.get('amount', 1)
    
    # Add credits
    current_user.water_credits += amount
    db.session.commit()
    
    return jsonify({
        'success': True,
        'water_credits': current_user.water_credits,
        'message': f'Added {amount} water credits!'
    })

@app.route('/api/water-credits/use', methods=['POST'])
@login_required
def use_water_credits():
    data = request.json
    amount = data.get('amount', 1)
    
    # Check if user has enough credits
    if current_user.water_credits < amount:
        return jsonify({
            'success': False,
            'message': 'Not enough water credits!'
        }), 400
    
    # Use credits
    current_user.water_credits -= amount
    db.session.commit()
    
    return jsonify({
        'success': True,
        'water_credits': current_user.water_credits,
        'message': f'Used {amount} water credits!'
    })

@app.route('/api/water-plant/<int:plant_id>', methods=['POST'])
@login_required
def water_plant(plant_id):
    # Get the plant
    plant = Plant.query.get(plant_id)
    
    if not plant:
        return jsonify({
            'success': False,
            'message': 'Plant not found!'
        }), 404
    
    # Check if the plant belongs to the current user
    if plant.user_id != current_user.id:
        return jsonify({
            'success': False,
            'message': 'You do not own this plant!'
        }), 403
    
    # Check if user has water credits
    if current_user.water_credits < 1:
        return jsonify({
            'success': False,
            'message': 'Not enough water credits!'
        }), 400
    
    # Use water credit
    current_user.water_credits -= 1
    
    # Update plant
    plant.last_watered = datetime.now()
    
    # Improve plant health
    health_gain = min(10, 100 - plant.health)  # Don't exceed 100
    plant.health += health_gain
    
    # Add some progress
    plant.progress += 5
    
    # Check if plant should advance to next stage
    if plant.progress >= 100 and plant.stage < PlantStage.DEAD.value:
        plant.progress = 0
        plant.stage = min(PlantStage.DEAD.value, plant.stage + 1)
    
    # Save changes
    db.session.commit()
    
    # Log water condition
    new_condition = Condition(
        id=None,
        user_id=current_user.id,
        type_name='water_intake',
        value=1
    )
    db.session.add(new_condition)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'water_credits': current_user.water_credits,
        'plant': {
            'id': plant.id,
            'name': plant.name,
            'type': plant.plant_type,
            'stage': plant.stage,
            'health': plant.health,
            'progress': plant.progress,
            'last_watered': plant.last_watered.isoformat() if hasattr(plant.last_watered, 'isoformat') else str(plant.last_watered)
        },
        'message': f'{plant.name} has been watered!'
    })

# Preset plants API route
@app.route('/api/preset-plants', methods=['POST'])
@login_required
def add_preset_plants():
    # Define preset plants
    preset_plants = [
        {"name": "Sunflower", "type": "flower", "stage": PlantStage.MATURE.value, "health": 95, "progress": 50},
        {"name": "Ivy", "type": "vine", "stage": PlantStage.GROWING.value, "health": 80, "progress": 30},
        {"name": "Cactus", "type": "succulent", "stage": PlantStage.FLOWERING.value, "health": 100, "progress": 75},
        {"name": "Basil", "type": "herb", "stage": PlantStage.SPROUT.value, "health": 75, "progress": 10},
        {"name": "Bonsai", "type": "tree", "stage": PlantStage.MATURE.value, "health": 90, "progress": 60}
    ]
    
    plants_added = []
    
    # Create plants
    for plant_data in preset_plants:
        # Check if plant with same name already exists for this user
        existing_plant = Plant.query.filter_by(user_id=current_user.id, name=plant_data["name"]).first()
        if existing_plant:
            continue
        
        # Create new plant
        new_plant = Plant(
            id=None,
            user_id=current_user.id,
            name=plant_data["name"],
            plant_type=plant_data["type"],
            stage=plant_data["stage"],
            health=plant_data["health"],
            progress=plant_data["progress"]
        )
        
        db.session.add(new_plant)
        plants_added.append(plant_data["name"])
    
    # Commit changes
    db.session.commit()
    
    return jsonify({
        'success': True,
        'plants_added': plants_added,
        'message': f'Added {len(plants_added)} preset plants to your garden!'
    })
