from flask import Blueprint, request, jsonify, session, g
import logging
import json
import os
import time
from datetime import datetime, timedelta
import random

# Create blueprint
advanced_bp = Blueprint('advanced', __name__)

# Mock data storage (in a real app, this would be in a database)
MOCK_DATA = {
    'users': {},
    'plants': {},
    'habits': {},
    'achievements': [],
    'challenges': [],
    'rewards': []
}

# Load mock data from JSON files if they exist
def load_mock_data():
    data_dir = os.path.join(os.path.dirname(__file__), 'mock_data')
    os.makedirs(data_dir, exist_ok=True)
    
    for key in MOCK_DATA.keys():
        file_path = os.path.join(data_dir, f'{key}.json')
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r') as f:
                    MOCK_DATA[key] = json.load(f)
                logging.info(f"Loaded mock data for {key}")
            except Exception as e:
                logging.error(f"Error loading mock data for {key}: {str(e)}")

# Save mock data to JSON files
def save_mock_data():
    data_dir = os.path.join(os.path.dirname(__file__), 'mock_data')
    os.makedirs(data_dir, exist_ok=True)
    
    for key, data in MOCK_DATA.items():
        file_path = os.path.join(data_dir, f'{key}.json')
        try:
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
            logging.info(f"Saved mock data for {key}")
        except Exception as e:
            logging.error(f"Error saving mock data for {key}: {str(e)}")

# Initialize mock data
def init_mock_data():
    # Only initialize if data doesn't exist
    if not MOCK_DATA['achievements']:
        # Sample achievements
        MOCK_DATA['achievements'] = [
            {
                'id': 'first_plant',
                'name': 'Green Thumb',
                'description': 'Add your first plant to the garden',
                'icon': 'seedling',
                'xpReward': 50,
                'criteria': {'type': 'plants_added', 'threshold': 1}
            },
            {
                'id': 'plant_collector',
                'name': 'Plant Collector',
                'description': 'Add 5 different plants to your garden',
                'icon': 'leaf',
                'xpReward': 100,
                'criteria': {'type': 'plants_added', 'threshold': 5}
            },
            {
                'id': 'watering_routine',
                'name': 'Watering Routine',
                'description': 'Water your plants 10 times',
                'icon': 'tint',
                'xpReward': 75,
                'criteria': {'type': 'watering_count', 'threshold': 10}
            }
        ]
    
    if not MOCK_DATA['challenges']:
        # Sample challenges
        MOCK_DATA['challenges'] = [
            {
                'id': 'weekly_watering',
                'name': 'Weekly Watering',
                'description': 'Water your plants 3 days in a row',
                'icon': 'tint',
                'xpReward': 150,
                'waterCreditsReward': 10,
                'duration': 7,
                'criteria': {'type': 'watering_streak', 'threshold': 3}
            },
            {
                'id': 'plant_diversity',
                'name': 'Plant Diversity',
                'description': 'Add 3 different types of plants to your garden',
                'icon': 'pagelines',
                'xpReward': 200,
                'waterCreditsReward': 15,
                'duration': 14,
                'criteria': {'type': 'plant_types', 'threshold': 3}
            }
        ]
    
    if not MOCK_DATA['rewards']:
        # Sample rewards
        MOCK_DATA['rewards'] = [
            {
                'id': 'rare_plant_1',
                'name': 'Rare Plant: Crystal Rose',
                'description': 'A beautiful, rare plant with crystalline petals',
                'icon': 'gem',
                'cost': 500,
                'type': 'plant',
                'rarity': 'rare',
                'unlockCriteria': {'level': 5}
            },
            {
                'id': 'garden_theme_1',
                'name': 'Garden Theme: Enchanted Forest',
                'description': 'Transform your garden into a magical forest',
                'icon': 'tree',
                'cost': 300,
                'type': 'theme',
                'unlockCriteria': {'achievements': 5}
            }
        ]
    
    # Save initialized data
    save_mock_data()

# Get or create user data
def get_user_data(user_id=None):
    if not user_id:
        user_id = session.get('user_id', 'default_user')
    
    if user_id not in MOCK_DATA['users']:
        # Create new user data
        MOCK_DATA['users'][user_id] = {
            'id': user_id,
            'level': 1,
            'xp': 0,
            'totalXp': 0,
            'plantsAdded': 0,
            'wateringCount': 0,
            'earliestHabitHour': 8,
            'latestHabitHour': 22,
            'plantsAtMaxGrowth': 0,
            'streaks': {},
            'achievements': [],
            'completedChallenges': [],
            'unlockedRewards': []
        }
        save_mock_data()
    
    return MOCK_DATA['users'][user_id]

# Get or create plant data
def get_plant_data(plant_id=None):
    if plant_id and plant_id in MOCK_DATA['plants']:
        return MOCK_DATA['plants'][plant_id]
    
    # Return all plants if no ID specified
    return list(MOCK_DATA['plants'].values())

# Get or create habit data
def get_habit_data(habit_id=None):
    if habit_id and habit_id in MOCK_DATA['habits']:
        return MOCK_DATA['habits'][habit_id]
    
    # Return all habits if no ID specified
    return list(MOCK_DATA['habits'].values())

# Initialize data when module is loaded
load_mock_data()
init_mock_data()

# User data endpoint
@advanced_bp.route('/api/user/data', methods=['GET'])
def user_data():
    """Get user data for advanced features"""
    user_id = session.get('user_id', 'default_user')
    user_data = get_user_data(user_id)
    return jsonify(user_data)

# Plant data endpoint
@advanced_bp.route('/api/plants/data', methods=['GET'])
def plants_data():
    """Get plant data for advanced features"""
    plant_id = request.args.get('id')
    plants = get_plant_data(plant_id)
    
    # If no plants exist, create some sample plants
    if not plants and not plant_id:
        sample_plants = [
            {
                'id': 'plant-1',
                'name': 'Emerald Fern',
                'type': 'fern',
                'growthStage': 3,
                'maxGrowthStage': 5,
                'health': 0.9,
                'waterLevel': 0.7,
                'lastWatered': (datetime.now() - timedelta(days=1)).isoformat(),
                'sunlightNeeds': 'medium',
                'wateringFrequency': 3,
                'growthHistory': [
                    {'stage': 1, 'date': (datetime.now() - timedelta(days=30)).isoformat()},
                    {'stage': 2, 'date': (datetime.now() - timedelta(days=20)).isoformat()},
                    {'stage': 3, 'date': (datetime.now() - timedelta(days=10)).isoformat()}
                ]
            },
            {
                'id': 'plant-2',
                'name': 'Sunset Succulent',
                'type': 'succulent',
                'growthStage': 2,
                'maxGrowthStage': 4,
                'health': 0.8,
                'waterLevel': 0.4,
                'lastWatered': (datetime.now() - timedelta(days=5)).isoformat(),
                'sunlightNeeds': 'high',
                'wateringFrequency': 7,
                'growthHistory': [
                    {'stage': 1, 'date': (datetime.now() - timedelta(days=25)).isoformat()},
                    {'stage': 2, 'date': (datetime.now() - timedelta(days=15)).isoformat()}
                ]
            }
        ]
        
        for plant in sample_plants:
            MOCK_DATA['plants'][plant['id']] = plant
        
        save_mock_data()
        plants = sample_plants
    
    return jsonify(plants if isinstance(plants, list) else [plants])

# Habit data endpoint
@advanced_bp.route('/api/habits/data', methods=['GET'])
def habits_data():
    """Get habit data for advanced features"""
    habit_id = request.args.get('id')
    habits = get_habit_data(habit_id)
    
    # If no habits exist, create some sample habits
    if not habits and not habit_id:
        today = datetime.now().strftime('%Y-%m-%d')
        yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        
        sample_habits = [
            {
                'id': 'habit-1',
                'name': 'Morning Watering',
                'description': 'Water plants in the morning',
                'type': 'daily',
                'icon': 'tint',
                'streak': 3,
                'completionDates': [
                    yesterday,
                    (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d'),
                    (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
                ],
                'preferredTimeStart': 6,
                'preferredTimeEnd': 10,
                'tags': ['watering', 'morning', 'plant-care']
            },
            {
                'id': 'habit-2',
                'name': 'Sunlight Check',
                'description': 'Check if plants are getting enough sunlight',
                'type': 'daily',
                'icon': 'sun',
                'streak': 1,
                'completionDates': [
                    yesterday
                ],
                'preferredTimeStart': 10,
                'preferredTimeEnd': 14,
                'tags': ['sunlight', 'plant-care', 'outdoor']
            }
        ]
        
        for habit in sample_habits:
            MOCK_DATA['habits'][habit['id']] = habit
        
        save_mock_data()
        habits = sample_habits
    
    return jsonify(habits if isinstance(habits, list) else [habits])

# Achievement endpoints
@advanced_bp.route('/api/gamification/achievements', methods=['GET'])
def get_achievements():
    """Get achievements for gamification"""
    return jsonify(MOCK_DATA['achievements'])

@advanced_bp.route('/api/gamification/achievements', methods=['POST'])
def complete_achievements():
    """Mark achievements as completed"""
    user_id = session.get('user_id', 'default_user')
    user_data = get_user_data(user_id)
    
    data = request.json
    achievements = data.get('achievements', [])
    
    for achievement_id in achievements:
        if achievement_id not in user_data['achievements']:
            user_data['achievements'].append(achievement_id)
    
    save_mock_data()
    return jsonify({'success': True, 'achievements': user_data['achievements']})

# Challenge endpoints
@advanced_bp.route('/api/gamification/challenges', methods=['GET'])
def get_challenges():
    """Get challenges for gamification"""
    return jsonify(MOCK_DATA['challenges'])

@advanced_bp.route('/api/gamification/challenges', methods=['POST'])
def complete_challenge():
    """Complete a challenge"""
    user_id = session.get('user_id', 'default_user')
    user_data = get_user_data(user_id)
    
    data = request.json
    challenge_id = data.get('challengeId')
    
    if not challenge_id:
        return jsonify({'success': False, 'message': 'Challenge ID is required'}), 400
    
    # Find the challenge
    challenge = next((c for c in MOCK_DATA['challenges'] if c['id'] == challenge_id), None)
    if not challenge:
        return jsonify({'success': False, 'message': 'Challenge not found'}), 404
    
    # Mark as completed
    if challenge_id not in user_data['completedChallenges']:
        user_data['completedChallenges'].append(challenge_id)
    
    save_mock_data()
    return jsonify({
        'success': True, 
        'challenge': challenge,
        'completedChallenges': user_data['completedChallenges']
    })

# Reward endpoints
@advanced_bp.route('/api/gamification/rewards', methods=['GET'])
def get_rewards():
    """Get rewards for gamification"""
    return jsonify(MOCK_DATA['rewards'])

@advanced_bp.route('/api/gamification/rewards', methods=['POST'])
def unlock_reward():
    """Unlock a reward"""
    user_id = session.get('user_id', 'default_user')
    user_data = get_user_data(user_id)
    
    data = request.json
    reward_id = data.get('rewardId')
    from_level_up = data.get('fromLevelUp', False)
    
    if not reward_id:
        return jsonify({'success': False, 'message': 'Reward ID is required'}), 400
    
    # Find the reward
    reward = next((r for r in MOCK_DATA['rewards'] if r['id'] == reward_id), None)
    if not reward:
        return jsonify({'success': False, 'message': 'Reward not found'}), 404
    
    # Check if already unlocked
    if reward_id in user_data['unlockedRewards']:
        return jsonify({'success': False, 'message': 'Reward already unlocked'}), 400
    
    # Check if user has enough XP
    if not from_level_up and reward.get('cost', 0) > user_data['xp']:
        return jsonify({'success': False, 'message': 'Not enough XP'}), 400
    
    # Deduct XP if not from level up
    if not from_level_up and reward.get('cost', 0) > 0:
        user_data['xp'] -= reward['cost']
    
    # Unlock reward
    user_data['unlockedRewards'].append(reward_id)
    
    save_mock_data()
    return jsonify({
        'success': True, 
        'reward': reward,
        'unlockedRewards': user_data['unlockedRewards'],
        'xp': user_data['xp']
    })

# XP endpoints
@advanced_bp.route('/api/gamification/xp', methods=['POST'])
def award_xp():
    """Award XP to user"""
    user_id = session.get('user_id', 'default_user')
    user_data = get_user_data(user_id)
    
    data = request.json
    amount = data.get('amount', 0)
    source = data.get('source', 'action')
    
    if amount <= 0:
        return jsonify({'success': False, 'message': 'XP amount must be positive'}), 400
    
    # Award XP
    user_data['xp'] += amount
    user_data['totalXp'] += amount
    
    # Check for level up
    level_up = False
    old_level = user_data['level']
    
    # Simple level formula: level = 1 + floor(totalXp / 100)
    new_level = 1 + user_data['totalXp'] // 100
    if new_level > old_level:
        user_data['level'] = new_level
        level_up = True
    
    save_mock_data()
    return jsonify({
        'success': True,
        'xp': user_data['xp'],
        'totalXp': user_data['totalXp'],
        'level': user_data['level'],
        'levelUp': level_up,
        'oldLevel': old_level,
        'newLevel': user_data['level']
    })

# Streak endpoints
@advanced_bp.route('/api/gamification/streaks', methods=['POST'])
def update_streak():
    """Update activity streak"""
    user_id = session.get('user_id', 'default_user')
    user_data = get_user_data(user_id)
    
    data = request.json
    activity = data.get('activity')
    streak = data.get('streak', 0)
    date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    if not activity:
        return jsonify({'success': False, 'message': 'Activity is required'}), 400
    
    # Update streak
    user_data['streaks'][activity] = streak
    
    save_mock_data()
    return jsonify({
        'success': True,
        'activity': activity,
        'streak': streak,
        'date': date,
        'streaks': user_data['streaks']
    })

# AI Advisor endpoints
@advanced_bp.route('/api/ai-advisor', methods=['GET'])
def get_ai_advice():
    """Get AI advice"""
    topic = request.args.get('topic', 'general')
    
    # Sample advice by topic
    advice = {
        'watering': [
            "Remember that consistent watering is key to healthy plants. Try to water at the same time each day.",
            "When watering, aim for the soil rather than the leaves to prevent fungal issues.",
            "Most plants prefer deep, infrequent watering rather than frequent light watering."
        ],
        'sunlight': [
            "Rotate your plants occasionally so all sides get equal sunlight exposure.",
            "If your plant's leaves are yellowing, it might be getting too much direct sunlight.",
            "For plants that need indirect light, place them near a north or east-facing window."
        ],
        'motivation': [
            "Building habits takes time. Focus on consistency rather than perfection.",
            "Try linking your new habit to an existing routine to make it easier to remember.",
            "Celebrate small wins! Each day you complete your habit is a success."
        ],
        'general': [
            "Taking care of plants can improve your mood and reduce stress levels.",
            "Consider keeping a plant journal to track growth and changes over time.",
            "Talking to your plants might sound silly, but the extra CO2 can actually help them grow!"
        ]
    }
    
    # Get random advice for the topic
    topic_advice = advice.get(topic, advice['general'])
    selected_advice = random.choice(topic_advice)
    
    return jsonify({
        'success': True,
        'topic': topic,
        'advice': f"🌱 {selected_advice}"
    })

# Water credits endpoint
@advanced_bp.route('/api/water-credits/add', methods=['POST'])
def add_water_credits():
    """Add water credits"""
    user_id = session.get('user_id', 'default_user')
    user_data = get_user_data(user_id)
    
    data = request.json
    amount = data.get('amount', 1)
    
    # Initialize water credits if not present
    if 'water_credits' not in user_data:
        user_data['water_credits'] = 0
    
    # Add credits
    user_data['water_credits'] += amount
    
    save_mock_data()
    return jsonify({
        'success': True,
        'message': f"Added {amount} water credits",
        'water_credits': user_data['water_credits']
    })