from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from app import app, db
from models import User, Friendship, FriendshipStatus, Plant
import logging
from sqlalchemy import or_, and_

# Friends page route
@app.route('/friends')
@login_required
def friends_page():
    """Show the friends page with a list of friends and friend requests"""
    return render_template('friends_new.html')

# API route to search for users
@app.route('/api/friends/search', methods=['GET'])
@login_required
def search_users():
    """API endpoint to search for users by username"""
    username = request.args.get('username', '')
    
    if not username or len(username) < 3:
        return jsonify({
            'success': False,
            'message': 'Please enter at least 3 characters for search'
        })
    
    # Search for users with similar usernames
    users = User.query.filter(
        User.id != current_user.id,
        User.username.ilike(f'%{username}%')
    ).limit(10).all()
    
    if not users:
        return jsonify({
            'success': False,
            'message': 'No users found with that username'
        })
    
    # Get current friends and pending requests
    friends = current_user.get_friends()
    friend_ids = [friend.id for friend in friends]
    
    # Get pending sent requests
    sent_requests = Friendship.query.filter_by(
        requester_id=current_user.id,
        status=FriendshipStatus.PENDING.value
    ).all()
    sent_request_ids = [req.addressee_id for req in sent_requests]
    
    # Format user data
    user_list = []
    for user in users:
        user_data = {
            'id': user.id,
            'username': user.username,
            'garden_score': user.garden_score,
            'is_friend': user.id in friend_ids,
            'has_pending_request': user.id in sent_request_ids
        }
        user_list.append(user_data)
    
    return jsonify({
        'success': True,
        'users': user_list
    })

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

# API route to cancel a friend request
@app.route('/api/friends/cancel/<int:request_id>', methods=['POST'])
@login_required
def cancel_friend_request(request_id):
    """API endpoint to cancel a pending friend request"""
    friendship = Friendship.query.get(request_id)
    
    if not friendship:
        return jsonify({'success': False, 'message': 'Friend request not found'})
    
    if friendship.requester_id != current_user.id:
        return jsonify({'success': False, 'message': 'You cannot cancel this request'})
    
    if friendship.status != FriendshipStatus.PENDING.value:
        return jsonify({'success': False, 'message': 'This request is no longer pending'})
    
    # Delete the friendship request
    db.session.delete(friendship)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Friend request cancelled'
    })

# API route to remove a friend
@app.route('/api/friends/remove/<user_id>', methods=['POST'])
@login_required
def remove_friend(user_id):
    """API endpoint to remove a friend"""
    # Find the friendship
    friendship = Friendship.query.filter(
        or_(
            and_(Friendship.requester_id == current_user.id, Friendship.addressee_id == user_id),
            and_(Friendship.requester_id == user_id, Friendship.addressee_id == current_user.id)
        ),
        Friendship.status == FriendshipStatus.ACCEPTED.value
    ).first()
    
    if not friendship:
        return jsonify({'success': False, 'message': 'Friendship not found'})
    
    # Delete the friendship
    db.session.delete(friendship)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Friend removed successfully'
    })

# API route to get all friends
@app.route('/api/friends', methods=['GET'])
@login_required
def get_friends():
    """API endpoint to get all friends"""
    friends = current_user.get_friends()
    
    friend_list = []
    for friend in friends:
        # Count plants
        plants_count = Plant.query.filter_by(user_id=friend.id).count()
        
        friend_list.append({
            'id': friend.id,
            'username': friend.username,
            'water_credits': friend.water_credits,
            'garden_score': friend.garden_score,
            'plants_count': plants_count,
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

# API route to get pending friend requests (sent by current user)
@app.route('/api/friends/pending', methods=['GET'])
@login_required
def get_pending_requests():
    """API endpoint to get all pending friend requests sent by the current user"""
    pending_requests = Friendship.query.filter_by(
        requester_id=current_user.id,
        status=FriendshipStatus.PENDING.value
    ).all()
    
    request_list = []
    for request in pending_requests:
        addressee = User.query.get(request.addressee_id)
        request_list.append({
            'id': request.id,
            'addressee_id': request.addressee_id,
            'addressee_username': addressee.username,
            'created_at': request.created_at.isoformat()
        })
    
    return jsonify({
        'success': True,
        'pending_requests': request_list
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