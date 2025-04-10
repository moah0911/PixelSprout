from flask import Blueprint, request, jsonify, session, g
from supabase_storage import SupabaseStorage
import logging
import base64

storage_bp = Blueprint('storage', __name__)

@storage_bp.route('/api/storage/upload', methods=['POST'])
def upload_file():
    """Upload a file to Supabase Storage"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401
    
    # Get file data from request
    data = request.json
    file_data_base64 = data.get('file_data')
    file_name = data.get('file_name')
    bucket_name = data.get('bucket_name')
    
    if not file_data_base64:
        return jsonify({
            'success': False,
            'message': 'File data is required'
        }), 400
    
    try:
        # Decode base64 file data
        file_data = base64.b64decode(file_data_base64.split(',')[1] if ',' in file_data_base64 else file_data_base64)
        
        # Upload file to Supabase Storage
        result = SupabaseStorage.upload_file(
            file_data=file_data,
            file_name=file_name,
            bucket_name=bucket_name,
            user_id=session['user_id']
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'File uploaded successfully',
                'file_url': result['file_url']
            })
        else:
            return jsonify({
                'success': False,
                'message': f"Failed to upload file: {result.get('error', 'Unknown error')}"
            }), 400
    except Exception as e:
        logging.error(f"File upload error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Failed to upload file: {str(e)}"
        }), 400

@storage_bp.route('/api/storage/profile-picture', methods=['POST'])
def upload_profile_picture():
    """Upload a profile picture"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401
    
    # Get file data from request
    data = request.json
    file_data_base64 = data.get('file_data')
    
    if not file_data_base64:
        return jsonify({
            'success': False,
            'message': 'File data is required'
        }), 400
    
    try:
        # Decode base64 file data
        file_data = base64.b64decode(file_data_base64.split(',')[1] if ',' in file_data_base64 else file_data_base64)
        
        # Upload profile picture to Supabase Storage
        result = SupabaseStorage.upload_profile_picture(
            file_data=file_data,
            user_id=session['user_id']
        )
        
        if result['success']:
            # Update user profile with profile picture URL
            from supabase_auth import SupabaseAuth
            profile_update = SupabaseAuth.update_user_profile(
                user_id=session['user_id'],
                profile_picture_url=result['file_url']
            )
            
            if profile_update['success']:
                return jsonify({
                    'success': True,
                    'message': 'Profile picture uploaded successfully',
                    'file_url': result['file_url']
                })
            else:
                return jsonify({
                    'success': True,
                    'message': 'Profile picture uploaded but profile not updated',
                    'file_url': result['file_url'],
                    'update_error': profile_update.get('error')
                })
        else:
            return jsonify({
                'success': False,
                'message': f"Failed to upload profile picture: {result.get('error', 'Unknown error')}"
            }), 400
    except Exception as e:
        logging.error(f"Profile picture upload error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Failed to upload profile picture: {str(e)}"
        }), 400

@storage_bp.route('/api/storage/plant-image/<int:plant_id>', methods=['POST'])
def upload_plant_image(plant_id):
    """Upload an image for a plant"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401
    
    # Get file data from request
    data = request.json
    file_data_base64 = data.get('file_data')
    
    if not file_data_base64:
        return jsonify({
            'success': False,
            'message': 'File data is required'
        }), 400
    
    try:
        # Decode base64 file data
        file_data = base64.b64decode(file_data_base64.split(',')[1] if ',' in file_data_base64 else file_data_base64)
        
        # Upload plant image to Supabase Storage
        result = SupabaseStorage.upload_plant_image(
            file_data=file_data,
            plant_id=plant_id,
            user_id=session['user_id']
        )
        
        if result['success']:
            # Update plant with image URL in Supabase
            from supabase import create_client
            import os
            
            supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
            
            # Update plant in Supabase
            supabase.table('plants').update({
                'image_url': result['file_url']
            }).eq('id', plant_id).eq('user_id', session['user_id']).execute()
            
            return jsonify({
                'success': True,
                'message': 'Plant image uploaded successfully',
                'file_url': result['file_url']
            })
        else:
            return jsonify({
                'success': False,
                'message': f"Failed to upload plant image: {result.get('error', 'Unknown error')}"
            }), 400
    except Exception as e:
        logging.error(f"Plant image upload error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Failed to upload plant image: {str(e)}"
        }), 400

@storage_bp.route('/api/storage/delete', methods=['POST'])
def delete_file():
    """Delete a file from Supabase Storage"""
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'message': 'Not authenticated'
        }), 401
    
    # Get file path from request
    data = request.json
    file_path = data.get('file_path')
    bucket_name = data.get('bucket_name')
    
    if not file_path:
        return jsonify({
            'success': False,
            'message': 'File path is required'
        }), 400
    
    # Ensure the file path includes the user ID to prevent unauthorized deletion
    if not file_path.startswith(f"{session['user_id']}/"):
        return jsonify({
            'success': False,
            'message': 'Unauthorized to delete this file'
        }), 403
    
    # Delete file from Supabase Storage
    result = SupabaseStorage.delete_file(
        file_path=file_path,
        bucket_name=bucket_name
    )
    
    if result['success']:
        return jsonify({
            'success': True,
            'message': 'File deleted successfully'
        })
    else:
        return jsonify({
            'success': False,
            'message': f"Failed to delete file: {result.get('error', 'Unknown error')}"
        }), 400