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
    bucket_name = data.get('bucket_name', 'pixelsprout-uploads')  # Default bucket if none specified
    
    if not file_data_base64:
        return jsonify({
            'success': False,
            'message': 'File data is required'
        }), 400
    
    # Log upload attempt
    logging.info(f"Attempting to upload file to bucket: {bucket_name}")
    
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
            logging.info(f"File uploaded successfully to {result.get('bucket_name', bucket_name)}")
            return jsonify({
                'success': True,
                'message': 'File uploaded successfully',
                'file_url': result['file_url'],
                'file_path': result.get('file_path', ''),
                'bucket_name': result.get('bucket_name', bucket_name)
            })
        else:
            error_msg = result.get('error', 'Unknown error')
            logging.error(f"Upload failed: {error_msg}")
            
            # Return a more user-friendly error message
            return jsonify({
                'success': False,
                'message': f"Failed to upload file: {error_msg}",
                'details': result.get('original_error', '')
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
    
    # Log upload attempt
    logging.info(f"Attempting to upload profile picture for user: {session['user_id']}")
    
    try:
        # Decode base64 file data
        file_data = base64.b64decode(file_data_base64.split(',')[1] if ',' in file_data_base64 else file_data_base64)
        
        # Try to upload directly to the profile-pictures bucket
        try:
            # Upload profile picture to Supabase Storage
            result = SupabaseStorage.upload_profile_picture(
                file_data=file_data,
                user_id=session['user_id']
            )
        except Exception as bucket_error:
            # If the profile-pictures bucket fails, try the default bucket as fallback
            logging.warning(f"Failed to upload to profile-pictures bucket: {str(bucket_error)}. Trying default bucket.")
            result = SupabaseStorage.upload_file(
                file_data=file_data,
                file_name="profile.jpg",
                bucket_name="pixelsprout-uploads",
                user_id=f"{session['user_id']}/profile"
            )
        
        if result['success']:
            # Update user profile with profile picture URL
            try:
                from supabase_auth import SupabaseAuth
                profile_update = SupabaseAuth.update_user_profile(
                    user_id=session['user_id'],
                    profile_picture_url=result['file_url']
                )
                
                if profile_update['success']:
                    logging.info(f"Profile picture uploaded and profile updated for user: {session['user_id']}")
                    return jsonify({
                        'success': True,
                        'message': 'Profile picture uploaded successfully',
                        'file_url': result['file_url']
                    })
                else:
                    logging.warning(f"Profile picture uploaded but profile not updated: {profile_update.get('error')}")
                    return jsonify({
                        'success': True,
                        'message': 'Profile picture uploaded but profile not updated',
                        'file_url': result['file_url'],
                        'update_error': profile_update.get('error')
                    })
            except Exception as profile_error:
                logging.error(f"Error updating user profile: {str(profile_error)}")
                return jsonify({
                    'success': True,
                    'message': 'Profile picture uploaded but profile update failed',
                    'file_url': result['file_url'],
                    'update_error': str(profile_error)
                })
        else:
            error_msg = result.get('error', 'Unknown error')
            logging.error(f"Profile picture upload failed: {error_msg}")
            return jsonify({
                'success': False,
                'message': f"Failed to upload profile picture: {error_msg}",
                'details': result.get('original_error', '')
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
    
    # Log upload attempt
    logging.info(f"Attempting to upload plant image for plant ID: {plant_id}, user: {session['user_id']}")
    
    try:
        # Decode base64 file data
        file_data = base64.b64decode(file_data_base64.split(',')[1] if ',' in file_data_base64 else file_data_base64)
        
        # Try to upload to the plant-images bucket
        try:
            # Upload plant image to Supabase Storage
            result = SupabaseStorage.upload_plant_image(
                file_data=file_data,
                plant_id=plant_id,
                user_id=session['user_id']
            )
        except Exception as bucket_error:
            # If the plant-images bucket fails, try the default bucket as fallback
            logging.warning(f"Failed to upload to plant-images bucket: {str(bucket_error)}. Trying default bucket.")
            result = SupabaseStorage.upload_file(
                file_data=file_data,
                file_name=f"plant_{plant_id}.jpg",
                bucket_name="pixelsprout-uploads",
                user_id=f"{session['user_id']}/plants"
            )
        
        if result['success']:
            # Try to update plant with image URL in Supabase
            try:
                from supabase import create_client
                import os
                
                supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
                
                # Update plant in Supabase
                update_result = supabase.table('plants').update({
                    'image_url': result['file_url']
                }).eq('id', plant_id).eq('user_id', session['user_id']).execute()
                
                logging.info(f"Plant image uploaded and database updated for plant ID: {plant_id}")
                return jsonify({
                    'success': True,
                    'message': 'Plant image uploaded successfully',
                    'file_url': result['file_url']
                })
            except Exception as db_error:
                logging.error(f"Error updating plant record: {str(db_error)}")
                return jsonify({
                    'success': True,
                    'message': 'Plant image uploaded but database not updated',
                    'file_url': result['file_url'],
                    'update_error': str(db_error)
                })
        else:
            error_msg = result.get('error', 'Unknown error')
            logging.error(f"Plant image upload failed: {error_msg}")
            return jsonify({
                'success': False,
                'message': f"Failed to upload plant image: {error_msg}",
                'details': result.get('original_error', '')
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
    bucket_name = data.get('bucket_name', 'pixelsprout-uploads')  # Default bucket if none specified
    
    if not file_path:
        return jsonify({
            'success': False,
            'message': 'File path is required'
        }), 400
    
    # Log deletion attempt
    logging.info(f"Attempting to delete file: {file_path} from bucket: {bucket_name}")
    
    # Ensure the file path includes the user ID to prevent unauthorized deletion
    # Skip this check for admin users if needed
    if not file_path.startswith(f"{session['user_id']}/") and session.get('role') != 'admin':
        logging.warning(f"Unauthorized deletion attempt for file: {file_path} by user: {session['user_id']}")
        return jsonify({
            'success': False,
            'message': 'Unauthorized to delete this file'
        }), 403
    
    try:
        # Delete file from Supabase Storage
        result = SupabaseStorage.delete_file(
            file_path=file_path,
            bucket_name=bucket_name
        )
        
        if result['success']:
            logging.info(f"File deleted successfully: {file_path} from bucket: {bucket_name}")
            return jsonify({
                'success': True,
                'message': 'File deleted successfully'
            })
        else:
            error_msg = result.get('error', 'Unknown error')
            logging.error(f"File deletion failed: {error_msg}")
            
            # Check for common errors and provide more helpful messages
            if "not found" in str(error_msg).lower():
                return jsonify({
                    'success': True,  # Return success even if file doesn't exist
                    'message': 'File does not exist or was already deleted'
                })
            
            return jsonify({
                'success': False,
                'message': f"Failed to delete file: {error_msg}",
                'details': result.get('original_error', '')
            }), 400
    except Exception as e:
        logging.error(f"File deletion error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f"Failed to delete file: {str(e)}"
        }), 400