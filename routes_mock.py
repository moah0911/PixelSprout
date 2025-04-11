from flask import Blueprint, jsonify

# Create blueprint
mock_bp = Blueprint('mock', __name__)

# Mock data for testing
@mock_bp.route('/api/mock/plants', methods=['GET'])
def get_mock_plants():
    """Get mock plants data for testing"""
    plants = [
        {
            'id': 'plant-1',
            'name': 'Emerald Fern',
            'type': 'fern',
            'stage': 2,
            'health': 85,
            'progress': 45,
            'created_at': '2023-01-01T12:00:00',
            'last_watered': '2023-01-10T12:00:00',
            'user_id': 'user-1'
        },
        {
            'id': 'plant-2',
            'name': 'Sunset Succulent',
            'type': 'succulent',
            'stage': 1,
            'health': 90,
            'progress': 25,
            'created_at': '2023-01-05T12:00:00',
            'last_watered': '2023-01-12T12:00:00',
            'user_id': 'user-1'
        }
    ]
    
    return jsonify(plants)

@mock_bp.route('/api/mock/plant-types', methods=['GET'])
def get_mock_plant_types():
    """Get mock plant types data for testing"""
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