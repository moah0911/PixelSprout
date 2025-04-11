from flask import Blueprint, request, jsonify, session, g, redirect, url_for
from flask_login import login_required, current_user
import logging
import json
import os
import time
from datetime import datetime, timedelta
import random
from functools import wraps
from app import db
from models import Plant, PlantType, User

# Create blueprint
plants_bp = Blueprint('plants', __name__)

# Simple health check route that doesn't require authentication
@plants_bp.route('/api/plants/health', methods=['GET'])
def health_check():
    """Health check endpoint for the plants API"""
    return jsonify({
        'status': 'ok',
        'message': 'Plants API is working'
    })

# Authentication decorator for API endpoints
def api_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            # Return 401 Unauthorized for API requests
            return jsonify({'error': 'Authentication required', 'code': 'auth_required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Initialize plant types if they don't exist
def initialize_plant_types():
    # Check if we already have plant types
    if PlantType.query.count() > 0:
        return
    
    # Create default plant types
    default_types = [
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
    
    for type_data in default_types:
        plant_type = PlantType(
            id=type_data['id'],
            name=type_data['name'],
            description=type_data['description'],
            water_frequency=type_data['water_frequency'],
            light_needs=type_data['light_needs']
        )
        db.session.add(plant_type)
    
    try:
        db.session.commit()
        logging.info("Initialized default plant types")
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error initializing plant types: {str(e)}")

# Initialize data when module is loaded
try:
    initialize_plant_types()
except Exception as e:
    logging.error(f"Error during initialization: {str(e)}")

# Get all plants for a user
@plants_bp.route('/api/plants', methods=['GET'])
@api_login_required
def get_plants():
    """Get all plants for the current user"""
    user_id = session.get('user_id')
    
    try:
        # Get all plants for the current user
        plants = Plant.query.filter_by(user_id=user_id).all()
        
        # Convert to dictionary format
        plants_data = [plant.to_dict() for plant in plants]
        
        return jsonify(plants_data)
    except Exception as e:
        logging.error(f"Error getting plants: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error retrieving plants'
        }), 500

# Add a new plant
@plants_bp.route('/api/plants', methods=['POST'])
@api_login_required
def add_plant():
    """Add a new plant for the current user"""
    user_id = session.get('user_id')
    
    try:
        data = request.json
        name = data.get('name')
        plant_type_id = data.get('type')
        
        if not name or not plant_type_id:
            return jsonify({
                'success': False,
                'message': 'Plant name and type are required'
            }), 400
        
        # Check if plant type exists
        plant_type = PlantType.query.get(plant_type_id)
        if not plant_type:
            return jsonify({
                'success': False,
                'message': f'Plant type {plant_type_id} not found'
            }), 400
        
        # Create new plant
        new_plant = Plant(
            user_id=user_id,
            name=name,
            plant_type_id=plant_type_id,
            stage=0,  # Start at seed stage
            health=100,
            progress=0,
            created_at=datetime.now(),
            last_watered=datetime.now()
        )
        
        # Add to database
        db.session.add(new_plant)
        db.session.commit()
        
        # Get the user and increase their garden score
        from models import User
        user = User.query.get(user_id)
        if user:
            user.increase_garden_score(25, "Added a new plant")
        
        return jsonify({
            'success': True,
            'message': f'Plant {name} added successfully',
            'plant': new_plant.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error adding plant: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error adding plant'
        }), 500

# Get a specific plant
@plants_bp.route('/api/plants/<int:plant_id>', methods=['GET'])
@api_login_required
def get_plant(plant_id):
    """Get a specific plant by ID"""
    user_id = session.get('user_id')
    
    try:
        # Get the plant
        plant = Plant.query.get(plant_id)
        
        if not plant:
            return jsonify({
                'success': False,
                'message': 'Plant not found'
            }), 404
        
        # Check if the plant belongs to the current user
        if str(plant.user_id) != str(user_id):
            return jsonify({
                'success': False,
                'message': 'Plant not found'
            }), 404
        
        return jsonify(plant.to_dict())
    except Exception as e:
        logging.error(f"Error getting plant: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error retrieving plant'
        }), 500

# Update a plant
@plants_bp.route('/api/plants/<int:plant_id>', methods=['PUT'])
@api_login_required
def update_plant(plant_id):
    """Update a plant's details"""
    user_id = session.get('user_id')
    
    try:
        # Get the plant
        plant = Plant.query.get(plant_id)
        
        if not plant:
            return jsonify({
                'success': False,
                'message': 'Plant not found'
            }), 404
        
        # Check if the plant belongs to the current user
        if str(plant.user_id) != str(user_id):
            return jsonify({
                'success': False,
                'message': 'Plant not found'
            }), 404
        
        data = request.json
        
        # Update allowed fields
        if 'name' in data:
            plant.name = data['name']
        
        if 'health' in data:
            plant.health = max(0, min(100, data['health']))
        
        if 'progress' in data:
            plant.progress = max(0, min(100, data['progress']))
        
        if 'stage' in data:
            plant.stage = max(0, min(6, data['stage']))
        
        # Save changes
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Plant updated successfully',
            'plant': plant.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating plant: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error updating plant'
        }), 500

# Water a plant
@plants_bp.route('/api/plants/<int:plant_id>/water', methods=['POST'])
@api_login_required
def water_plant(plant_id):
    """Water a specific plant"""
    user_id = session.get('user_id')
    
    try:
        # Get the plant
        plant = Plant.query.get(plant_id)
        
        if not plant:
            return jsonify({
                'success': False,
                'message': 'Plant not found'
            }), 404
        
        # Check if the plant belongs to the current user
        if str(plant.user_id) != str(user_id):
            return jsonify({
                'success': False,
                'message': 'Plant not found'
            }), 404
        
        # Get the user to update water credits
        user = User.query.get(user_id)
        
        # For now, allow watering even without credits
        water_credits = 20
        if user:
            water_credits = user.water_credits
        
        # Update plant health and last watered time
        plant.health = min(100, plant.health + 10)
        plant.last_watered = datetime.now()
        
        # Increase progress a bit
        plant.progress = min(100, plant.progress + 5)
        
        # Check if plant should advance to next stage
        if plant.progress >= 100 and plant.stage < 6:
            plant.stage += 1
            plant.progress = 0
            
            # Award points for advancing a stage
            if user:
                try:
                    user.increase_garden_score(50, f"Plant {plant.name} advanced to stage {plant.stage}")
                except Exception as score_error:
                    logging.error(f"Error increasing garden score: {str(score_error)}")
        
        # Decrease water credits if user exists
        if user:
            try:
                user.water_credits = max(0, user.water_credits - 1)
            except Exception as credit_error:
                logging.error(f"Error updating water credits: {str(credit_error)}")
        
        # Save changes
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Plant watered successfully',
            'plant': plant.to_dict(),
            'water_credits': user.water_credits if user else water_credits
        })
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error watering plant: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error watering plant: {str(e)}'
        }), 500

# Delete a plant
@plants_bp.route('/api/plants/<int:plant_id>', methods=['DELETE'])
@api_login_required
def delete_plant(plant_id):
    """Delete a specific plant"""
    user_id = session.get('user_id')
    
    try:
        # Get the plant
        plant = Plant.query.get(plant_id)
        
        if not plant:
            return jsonify({
                'success': False,
                'message': 'Plant not found'
            }), 404
        
        # Check if the plant belongs to the current user
        if str(plant.user_id) != str(user_id):
            return jsonify({
                'success': False,
                'message': 'Plant not found'
            }), 404
        
        # Delete the plant
        db.session.delete(plant)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Plant deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error deleting plant: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error deleting plant'
        }), 500

# Get plant types
@plants_bp.route('/api/plant-types', methods=['GET'])
@api_login_required
def get_plant_types():
    """Get available plant types"""
    try:
        # Get all plant types
        plant_types = PlantType.query.all()
        
        # Convert to dictionary format
        types_data = []
        for pt in plant_types:
            types_data.append({
                'id': pt.id,
                'name': pt.name,
                'description': pt.description,
                'water_frequency': pt.water_frequency,
                'light_needs': pt.light_needs
            })
        
        return jsonify(types_data)
    except Exception as e:
        logging.error(f"Error getting plant types: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error retrieving plant types'
        }), 500

# Get water credits
@plants_bp.route('/api/water-credits', methods=['GET'])
@api_login_required
def get_water_credits():
    """Get water credits for the current user"""
    user_id = session.get('user_id')
    
    try:
        # Get the user
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': True,
                'water_credits': 20  # Default value
            })
        
        return jsonify({
            'success': True,
            'water_credits': user.water_credits
        })
    except Exception as e:
        logging.error(f"Error getting water credits: {str(e)}")
        return jsonify({
            'success': True,
            'water_credits': 20,  # Default value on error
            'error': str(e)
        })