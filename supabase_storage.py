import os
import logging
import uuid
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.warning("Supabase credentials not found in environment variables")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# Default bucket name
DEFAULT_BUCKET = "pixelsprout-uploads"

class SupabaseStorage:
    """Supabase storage wrapper for file uploads"""
    
    @staticmethod
    def initialize_buckets():
        """Initialize storage buckets if they don't exist"""
        if not supabase:
            raise Exception("Supabase client not initialized")
            
        try:
            # Check if the default bucket exists
            buckets = supabase.storage.list_buckets()
            bucket_names = [bucket["name"] for bucket in buckets]
            
            # Create default bucket if it doesn't exist
            if DEFAULT_BUCKET not in bucket_names:
                supabase.storage.create_bucket(DEFAULT_BUCKET, {"public": True})
                logging.info(f"Created storage bucket: {DEFAULT_BUCKET}")
                
            # Create other buckets as needed
            profile_bucket = "profile-pictures"
            if profile_bucket not in bucket_names:
                supabase.storage.create_bucket(profile_bucket, {"public": True})
                logging.info(f"Created storage bucket: {profile_bucket}")
                
            plant_bucket = "plant-images"
            if plant_bucket not in bucket_names:
                supabase.storage.create_bucket(plant_bucket, {"public": True})
                logging.info(f"Created storage bucket: {plant_bucket}")
                
            return True
        except Exception as e:
            logging.error(f"Failed to initialize storage buckets: {str(e)}")
            return False
    
    @staticmethod
    def upload_file(file_data, file_name=None, bucket_name=DEFAULT_BUCKET, user_id=None):
        """Upload a file to Supabase Storage
        
        Args:
            file_data: The file data (bytes)
            file_name: Optional file name (if not provided, a UUID will be generated)
            bucket_name: The bucket to upload to (default: pixelsprout-uploads)
            user_id: Optional user ID to include in the file path
            
        Returns:
            Dictionary with success status and file URL or error message
        """
        if not supabase:
            return {"success": False, "error": "Supabase client not initialized"}
            
        try:
            # Generate a unique file name if not provided
            if not file_name:
                # Generate a UUID for the file name
                unique_id = str(uuid.uuid4())
                file_extension = "jpg"  # Default extension
                file_name = f"{unique_id}.{file_extension}"
            
            # Create a path that includes the user ID if provided
            file_path = f"{user_id}/{file_name}" if user_id else file_name
            
            # Upload the file
            result = supabase.storage.from_(bucket_name).upload(
                file_path,
                file_data,
                {"content-type": "image/jpeg", "upsert": True}
            )
            
            # Get the public URL
            file_url = supabase.storage.from_(bucket_name).get_public_url(file_path)
            
            return {
                "success": True,
                "file_name": file_name,
                "file_path": file_path,
                "file_url": file_url
            }
        except Exception as e:
            logging.error(f"File upload error: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def upload_profile_picture(file_data, user_id):
        """Upload a profile picture for a user
        
        Args:
            file_data: The file data (bytes)
            user_id: The user ID
            
        Returns:
            Dictionary with success status and file URL or error message
        """
        if not user_id:
            return {"success": False, "error": "User ID is required"}
            
        # Use a consistent file name for profile pictures
        file_name = f"profile.jpg"
        
        return SupabaseStorage.upload_file(
            file_data=file_data,
            file_name=file_name,
            bucket_name="profile-pictures",
            user_id=user_id
        )
    
    @staticmethod
    def upload_plant_image(file_data, plant_id, user_id):
        """Upload an image for a plant
        
        Args:
            file_data: The file data (bytes)
            plant_id: The plant ID
            user_id: The user ID
            
        Returns:
            Dictionary with success status and file URL or error message
        """
        if not plant_id or not user_id:
            return {"success": False, "error": "Plant ID and User ID are required"}
            
        # Use a consistent file name for plant images
        file_name = f"plant_{plant_id}.jpg"
        
        return SupabaseStorage.upload_file(
            file_data=file_data,
            file_name=file_name,
            bucket_name="plant-images",
            user_id=user_id
        )
    
    @staticmethod
    def delete_file(file_path, bucket_name=DEFAULT_BUCKET):
        """Delete a file from Supabase Storage
        
        Args:
            file_path: The file path
            bucket_name: The bucket name
            
        Returns:
            Dictionary with success status or error message
        """
        if not supabase:
            return {"success": False, "error": "Supabase client not initialized"}
            
        try:
            supabase.storage.from_(bucket_name).remove([file_path])
            
            return {
                "success": True,
                "message": f"File {file_path} deleted successfully"
            }
        except Exception as e:
            logging.error(f"File deletion error: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def get_file_url(file_path, bucket_name=DEFAULT_BUCKET):
        """Get the public URL for a file
        
        Args:
            file_path: The file path
            bucket_name: The bucket name
            
        Returns:
            Dictionary with success status and file URL or error message
        """
        if not supabase:
            return {"success": False, "error": "Supabase client not initialized"}
            
        try:
            file_url = supabase.storage.from_(bucket_name).get_public_url(file_path)
            
            return {
                "success": True,
                "file_url": file_url
            }
        except Exception as e:
            logging.error(f"Get file URL error: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }