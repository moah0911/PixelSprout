from flask import render_template, request, redirect, url_for, flash, session, jsonify
from app import app
import logging
import supabase_client as sb
from models import PlantType, User

# Authentication routes
@app.route('/register', methods=['GET'])
def register_page():
    if 'user_id' in session:
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
    
    try:
        user = sb.create_user(email, password, username)
        session['user_id'] = user.id
        return jsonify({'success': True, 'user_id': user.id})
    except Exception as e:
        logging.error(f"Registration error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/login', methods=['GET'])
def login_page():
    if 'user_id' in session:
        return redirect(url_for('garden_page'))
    return render_template('login.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Missing email or password'}), 400
    
    user = sb.login_user(email, password)
    if user:
        session['user_id'] = user.id
        return jsonify({'success': True, 'user_id': user.id})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login_page'))

# Garden routes
@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return redirect(url_for('garden_page'))

@app.route('/garden')
def garden_page():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    
    user_id = session['user_id']
    user = sb.get_user_by_id(user_id)
    
    if not user:
        session.pop('user_id', None)
        return redirect(url_for('login_page'))
    
    return render_template('garden.html', username=user.username)

@app.route('/profile')
def profile_page():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    
    user_id = session['user_id']
    user = sb.get_user_by_id(user_id)
    
    if not user:
        session.pop('user_id', None)
        return redirect(url_for('login_page'))
    
    return render_template('profile.html', username=user.username)

# API routes
@app.route('/api/plants', methods=['GET'])
def get_plants():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401
    
    user_id = session['user_id']
    plants = sb.get_plants_by_user_id(user_id)
    
    plants_data = []
    for plant in plants:
        plants_data.append({
            'id': plant.id,
            'name': plant.name,
            'type': plant.plant_type.value,
            'stage': plant.stage.value,
            'health': plant.health,
            'progress': plant.progress,
            'created_at': plant.created_at.isoformat() if hasattr(plant.created_at, 'isoformat') else plant.created_at,
            'last_watered': plant.last_watered.isoformat() if hasattr(plant.last_watered, 'isoformat') else plant.last_watered
        })
    
    return jsonify({'success': True, 'plants': plants_data})

@app.route('/api/plants', methods=['POST'])
def create_plant():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401
    
    data = request.json
    name = data.get('name')
    plant_type_str = data.get('type')
    
    if not name or not plant_type_str:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    try:
        plant_type = PlantType(plant_type_str)
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid plant type'}), 400
    
    user_id = session['user_id']
    plant = sb.create_plant(user_id, name, plant_type)
    
    if plant:
        return jsonify({
            'success': True, 
            'plant': {
                'id': plant.id,
                'name': plant.name,
                'type': plant.plant_type.value,
                'stage': plant.stage.value,
                'health': plant.health
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Failed to create plant'}), 500

@app.route('/api/conditions', methods=['GET'])
def get_conditions():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401
    
    user_id = session['user_id']
    conditions = sb.get_conditions_by_user_id(user_id)
    
    conditions_data = []
    for condition in conditions:
        conditions_data.append({
            'id': condition.id,
            'type_name': condition.type_name,
            'value': condition.value,
            'date_logged': condition.date_logged.isoformat() if hasattr(condition.date_logged, 'isoformat') else condition.date_logged
        })
    
    return jsonify({'success': True, 'conditions': conditions_data})

@app.route('/api/conditions', methods=['POST'])
def log_condition():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401
    
    data = request.json
    type_name = data.get('type_name')
    value = data.get('value')
    
    if not type_name or value is None:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    try:
        value = float(value)
    except ValueError:
        return jsonify({'success': False, 'message': 'Value must be a number'}), 400
    
    user_id = session['user_id']
    condition = sb.log_condition(user_id, type_name, value)
    
    if condition:
        return jsonify({
            'success': True, 
            'condition': {
                'id': condition.id,
                'type_name': condition.type_name,
                'value': condition.value,
                'date_logged': condition.date_logged.isoformat() if hasattr(condition.date_logged, 'isoformat') else condition.date_logged
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Failed to log condition'}), 500

@app.route('/api/condition-types', methods=['GET'])
def get_condition_types():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401
    
    user_id = session['user_id']
    condition_types = sb.get_condition_types_for_user(user_id)
    
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
def create_condition_type():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401
    
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
    
    user_id = session['user_id']
    condition_type = sb.create_custom_condition_type(user_id, name, description, unit, default_goal)
    
    if condition_type:
        return jsonify({
            'success': True, 
            'condition_type': {
                'id': condition_type.id,
                'name': condition_type.name,
                'description': condition_type.description,
                'unit': condition_type.unit,
                'default_goal': condition_type.default_goal,
                'is_custom': True
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Failed to create condition type'}), 500

@app.route('/api/plant-types', methods=['GET'])
def get_plant_types():
    plant_types = [{'value': pt.value, 'name': pt.name} for pt in PlantType]
    return jsonify({'success': True, 'plant_types': plant_types})
