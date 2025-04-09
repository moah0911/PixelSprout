from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from app import app, db
from models import User, Friendship, FriendshipStatus
import logging

# Friends page route
@app.route('/friends')
@login_required
def friends_page():
    """Show the friends page with a list of friends and friend requests"""
    # Get user's friends
    friends = current_user.get_friends()
    
    # Get pending friend requests
    friend_requests = current_user.get_friend_requests()
    
    # Get suggested friends (other users who are not friends)
    # In a real app, you would have a more sophisticated algorithm
    all_users = User.query.filter(User.id != current_user.id).limit(10).all()
    
    # Filter out users who are already friends
    friends_ids = [friend.id for friend in friends]
    suggested_friends = [user for user in all_users if user.id not in friends_ids]
    
    return render_template(
        'friends.html',
        friends=friends,
        friend_requests=friend_requests,
        suggested_friends=suggested_friends
    )

# API route to send a friend request
@app.route('/api/friends/request', methods=['POST'])
@login_required
def send_friend_request():
    """API endpoint to send a friend request to another user"""
    data = request.json
    addressee_id = data.get('addressee_id')
    
    if not addressee_id:
        return jsonify({'success': False, 'message': 'Missing required fields'})
    
    addressee = User.query.get(addressee_id)
    if not addressee:
        return jsonify({'success': False, 'message': 'User not found'})
    
    success, message = current_user.send_friend_request(addressee)
    return jsonify({'success': success, 'message': message})

# API route to accept or decline a friend request
@app.route('/api/friends/respond', methods=['POST'])
@login_required
def respond_to_friend_request():
    """API endpoint to accept or decline a friend request"""
    data = request.json
    friendship_id = data.get('friendship_id')
    accept = data.get('accept', False)
    
    if not friendship_id:
        return jsonify({'success': False, 'message': 'Missing required fields'})
    
    success, message = current_user.handle_friend_request(friendship_id, accept)
    return jsonify({'success': success, 'message': message})

# API route to get all friends
@app.route('/api/friends', methods=['GET'])
@login_required
def get_friends():
    """API endpoint to get all friends"""
    friends = current_user.get_friends()
    
    friend_list = []
    for friend in friends:
        friend_list.append({
            'id': friend.id,
            'username': friend.username,
            'water_credits': friend.water_credits,
            'created_at': friend.created_at.isoformat()
        })
    
    return jsonify({
        'success': True,
        'friends': friend_list
    })

# API route to get all friend requests
@app.route('/api/friends/requests', methods=['GET'])
@login_required
def get_friend_requests():
    """API endpoint to get all pending friend requests"""
    friend_requests = current_user.get_friend_requests()
    
    request_list = []
    for request in friend_requests:
        requester = User.query.get(request.requester_id)
        request_list.append({
            'id': request.id,
            'requester_id': request.requester_id,
            'requester_username': requester.username,
            'created_at': request.created_at.isoformat()
        })
    
    return jsonify({
        'success': True,
        'friend_requests': request_list
    })

# API route to get friend's garden data
@app.route('/api/friends/<user_id>/garden', methods=['GET'])
@login_required
def get_friend_garden(user_id):
    """API endpoint to get a friend's garden data"""
    friend = User.query.get(user_id)
    
    if not friend:
        return jsonify({'success': False, 'message': 'User not found'})
    
    # Verify that the user is actually a friend
    friends = current_user.get_friends()
    friend_ids = [f.id for f in friends]
    
    if friend.id not in friend_ids:
        return jsonify({'success': False, 'message': 'You are not friends with this user'})
    
    # Get friend's plants
    plants = []
    for plant in friend.plants:
        plants.append({
            'id': plant.id,
            'name': plant.name,
            'type': plant.plant_type,
            'stage': plant.stage,
            'health': plant.health,
            'progress': plant.progress,
            'created_at': plant.created_at.isoformat(),
            'last_watered': plant.last_watered.isoformat()
        })
    
    return jsonify({
        'success': True,
        'username': friend.username,
        'plants': plants
    })