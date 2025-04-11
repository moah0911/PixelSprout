from flask import Blueprint, request, jsonify, session, g, redirect, url_for
import logging
import json
import os
import time
from datetime import datetime, timedelta
import random
from functools import wraps

# Create blueprint
plants_bp = Blueprint('plants', __name__)

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            # Return 401 Unauthorized for API requests
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Authentication required', 'code': 'auth_required'}), 401
            # Redirect to login page for regular requests
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Mock data storage (in a real app, this would be in a database)
PLANTS_DATA = {}

# Load mock data from JSON files if they exist
def load_plants_data():
    data_dir = os.path.join(os.path.dirname(__file__), 'mock_data')
    os.makedirs(data_dir, exist_ok=True)
    
    file_path = os.path.join(data_dir, 'plants.json')
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r') as f:
                global PLANTS_DATA
                PLANTS_DATA = json.load(f)
            logging.info(f"Loaded mock data for plants")
        except Exception as e:
            logging.error(f"Error loading mock data for plants: {str(e)}")

# Save mock data to JSON files
def save_plants_data():
    data_dir = os.path.join(os.path.dirname(__file__), 'mock_data')
    os.makedirs(data_dir, exist_ok=True)
    
    file_path = os.path.join(data_dir, 'plants.json')
    try:
        with open(file_path, 'w') as f:
            json.dump(PLANTS_DATA, f, indent=2)
        logging.info(f"Saved mock data for plants")
    except Exception as e:
        logging.error(f"Error saving mock data for plants: {str(e)}")

# Initialize data when module is loaded
load_plants_data()

# Get all plants for a user
@plants_bp.route('/api/plants', methods=['GET'])
@login_required
def get_plants():
    """Get all plants for the current user"""
    user_id = session.get('user_id')
    
    # Filter plants by user ID
    user_plants = []
    for plant_id, plant in PLANTS_DATA.items():
        if plant.get('user_id') == user_id:
            user_plants.append(plant)
    
    # If no plants exist, create some sample plants
    if not user_plants:
        sample_plants = [
            {
                'id': f'plant-1-{user_id}',
                'name': 'Emerald Fern',
                'type': 'fern',
                'stage': 2,
                'health': 85,
                'progress': 45,
                'created_at': (datetime.now() - timedelta(days=30)).isoformat(),
                'last_watered': (datetime.now() - timedelta(days=2)).isoformat(),
                'user_id': user_id
            },
            {
                'id': f'plant-2-{user_id}',
                'name': 'Sunset Succulent',
                'type': 'succulent',
                'stage': 1,
                'health': 90,
                'progress': 25,
                'created_at': (datetime.now() - timedelta(days=15)).isoformat(),
                'last_watered': (datetime.now() - timedelta(days=5)).isoformat(),
                'user_id': user_id
            }
        ]
        
        for plant in sample_plants:
            PLANTS_DATA[plant['id']] = plant
            user_plants.append(plant)
        
        save_plants_data()
    
    return jsonify(user_plants)

# Add a new plant
@plants_bp.route('/api/plants', methods=['POST'])
@login_required
def add_plant():
    """Add a new plant for the current user"""
    user_id = session.get('user_id')
    
    data = request.json
    name = data.get('name')
    plant_type = data.get('type')
    
    if not name or not plant_type:
        return jsonify({
            'success': False,
            'message': 'Plant name and type are required'
        }), 400
    
    # Generate a unique ID
    plant_id = f'plant-{len(PLANTS_DATA) + 1}-{user_id}'
    
    # Create the new plant
    new_plant = {
        'id': plant_id,
        'name': name,
        'type': plant_type,
        'stage': 0,  # Start at seed stage
        'health': 100,
        'progress': 0,
        'created_at': datetime.now().isoformat(),
        'last_watered': datetime.now().isoformat(),
        'user_id': user_id
    }
    
    # Add to storage
    PLANTS_DATA[plant_id] = new_plant
    save_plants_data()
    
    return jsonify({
        'success': True,
        'message': f'Plant {name} added successfully',
        'plant': new_plant
    })

# Get a specific plant
@plants_bp.route('/api/plants/<plant_id>', methods=['GET'])
@login_required
def get_plant(plant_id):
    """Get a specific plant by ID"""
    user_id = session.get('user_id')
    
    if plant_id not in PLANTS_DATA:
        return jsonify({
            'success': False,
            'message': 'Plant not found'
        }), 404
    
    plant = PLANTS_DATA[plant_id]
    
    # Check if the plant belongs to the current user
    if plant.get('user_id') != user_id:
        return jsonify({
            'success': False,
            'message': 'Plant not found'
        }), 404
    
    return jsonify(plant)

# Update a plant
@plants_bp.route('/api/plants/<plant_id>', methods=['PUT'])
@login_required
def update_plant(plant_id):
    """Update a plant's details"""
    user_id = session.get('user_id')
    
    if plant_id not in PLANTS_DATA:
        return jsonify({
            'success': False,
            'message': 'Plant not found'
        }), 404
    
    plant = PLANTS_DATA[plant_id]
    
    # Check if the plant belongs to the current user
    if plant.get('user_id') != user_id:
        return jsonify({
            'success': False,
            'message': 'Plant not found'
        }), 404
    
    data = request.json
    
    # Update allowed fields
    if 'name' in data:
        plant['name'] = data['name']
    
    if 'health' in data:
        plant['health'] = max(0, min(100, data['health']))
    
    if 'progress' in data:
        plant['progress'] = max(0, min(100, data['progress']))
    
    if 'stage' in data:
        plant['stage'] = max(0, min(6, data['stage']))
    
    # Save changes
    PLANTS_DATA[plant_id] = plant
    save_plants_data()
    
    return jsonify({
        'success': True,
        'message': 'Plant updated successfully',
        'plant': plant
    })

# Water a plant
@plants_bp.route('/api/plants/<plant_id>/water', methods=['POST'])
@login_required
def water_plant(plant_id):
    """Water a specific plant"""
    user_id = session.get('user_id')
    
    if plant_id not in PLANTS_DATA:
        return jsonify({
            'success': False,
            'message': 'Plant not found'
        }), 404
    
    plant = PLANTS_DATA[plant_id]
    
    # Check if the plant belongs to the current user
    if plant.get('user_id') != user_id:
        return jsonify({
            'success': False,
            'message': 'Plant not found'
        }), 404
    
    # Update plant health and last watered time
    plant['health'] = min(100, plant['health'] + 10)
    plant['last_watered'] = datetime.now().isoformat()
    
    # Increase progress a bit
    plant['progress'] = min(100, plant['progress'] + 5)
    
    # Check if plant should advance to next stage
    if plant['progress'] >= 100 and plant['stage'] < 6:
        plant['stage'] += 1
        plant['progress'] = 0
    
    # Save changes
    PLANTS_DATA[plant_id] = plant
    save_plants_data()
    
    return jsonify({
        'success': True,
        'message': 'Plant watered successfully',
        'plant': plant
    })

# Delete a plant
@plants_bp.route('/api/plants/<plant_id>', methods=['DELETE'])
@login_required
def delete_plant(plant_id):
    """Delete a specific plant"""
    user_id = session.get('user_id')
    
    if plant_id not in PLANTS_DATA:
        return jsonify({
            'success': False,
            'message': 'Plant not found'
        }), 404
    
    plant = PLANTS_DATA[plant_id]
    
    # Check if the plant belongs to the current user
    if plant.get('user_id') != user_id:
        return jsonify({
            'success': False,
            'message': 'Plant not found'
        }), 404
    
    # Delete the plant
    del PLANTS_DATA[plant_id]
    save_plants_data()
    
    return jsonify({
        'success': True,
        'message': 'Plant deleted successfully'
    })

# Get plant types
@plants_bp.route('/api/plant-types', methods=['GET'])
@login_required
def get_plant_types():
    """Get available plant types"""
    plant_types = [
        {
            'id': 'fern',
            'name': 'Fern',
            'description': 'A leafy plant that thrives in indirect light',
            'water_frequency': 3,
            'light_needs': 'medium'
        },
        {
            'id': 'succulent',
            'name': 'Succulent',
            'description': 'A drought-resistant plant that stores water',
            'water_frequency': 7,
            'light_needs': 'high'
        },
        {
            'id': 'flower',
            'name': 'Flower',
            'description': 'A flowering plant that adds color to your garden',
            'water_frequency': 2,
            'light_needs': 'high'
        },
        {
            'id': 'herb',
            'name': 'Herb',
            'description': 'An aromatic plant with culinary uses',
            'water_frequency': 2,
            'light_needs': 'medium'
        },
        {
            'id': 'vine',
            'name': 'Vine',
            'description': 'A climbing plant that grows upward',
            'water_frequency': 4,
            'light_needs': 'medium'
        },
        {
            'id': 'tree',
            'name': 'Tree',
            'description': 'A slow-growing plant with a woody stem',
            'water_frequency': 5,
            'light_needs': 'high'
        }
    ]
    
    return jsonify(plant_types)