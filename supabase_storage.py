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
        """Check if required storage buckets exist and are accessible"""
        if not supabase:
            raise Exception("Supabase client not initialized")
            
        try:
            # Define the required buckets
            required_buckets = [DEFAULT_BUCKET, "profile-pictures", "plant-images"]
            
            # Try to list existing buckets
            try:
                buckets = supabase.storage.list_buckets()
                bucket_names = [bucket["name"] for bucket in buckets]
                
                # Log which buckets exist
                for bucket in required_buckets:
                    if bucket in bucket_names:
                        logging.info(f"Storage bucket exists: {bucket}")
                    else:
                        logging.warning(f"Storage bucket does not exist: {bucket}")
                        
                # If we can list buckets but some are missing, try to create them
                for bucket in required_buckets:
                    if bucket not in bucket_names:
                        try:
                            supabase.storage.create_bucket(id=bucket, options={"public": True})
                            logging.info(f"Created storage bucket: {bucket}")
                        except Exception as bucket_error:
                            logging.warning(f"Could not create bucket {bucket}: {str(bucket_error)}")
                
            except Exception as list_error:
                # If we can't list buckets, try to access each required bucket directly
                logging.warning(f"Could not list buckets: {str(list_error)}")
                
                for bucket in required_buckets:
                    try:
                        # Try to list files in the bucket to check if it exists and is accessible
                        supabase.storage.from_(bucket).list()
                        logging.info(f"Storage bucket is accessible: {bucket}")
                    except Exception as access_error:
                        logging.warning(f"Storage bucket is not accessible: {bucket}. Error: {str(access_error)}")
            
            # Return success even if we couldn't create all buckets
            # The application will handle missing buckets gracefully
            return True
            
        except Exception as e:
            logging.error(f"Failed to initialize storage buckets: {str(e)}")
            # Return True anyway to allow the application to start
            # Individual upload operations will handle errors if buckets don't exist
            return True
    
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
            
            # Check if the bucket exists by trying to list files
            try:
                supabase.storage.from_(bucket_name).list()
            except Exception as bucket_error:
                logging.warning(f"Bucket {bucket_name} may not exist or is not accessible: {str(bucket_error)}")
                # Try to create the bucket
                try:
                    supabase.storage.create_bucket(id=bucket_name, options={"public": True})
                    logging.info(f"Created storage bucket: {bucket_name}")
                except Exception as create_error:
                    logging.error(f"Could not create bucket {bucket_name}: {str(create_error)}")
                    # If we can't create the bucket, use the default bucket as fallback
                    if bucket_name != DEFAULT_BUCKET:
                        logging.info(f"Falling back to default bucket: {DEFAULT_BUCKET}")
                        bucket_name = DEFAULT_BUCKET
                        file_path = f"fallback/{bucket_name}/{file_path}"
            
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
                "file_url": file_url,
                "bucket_name": bucket_name
            }
        except Exception as e:
            logging.error(f"File upload error: {str(e)}")
            # If upload fails, try to provide a helpful error message
            error_msg = str(e)
            if "not found" in error_msg.lower() or "does not exist" in error_msg.lower():
                error_msg = f"Storage bucket '{bucket_name}' does not exist or is not accessible. Please check your Supabase configuration."
            elif "unauthorized" in error_msg.lower() or "permission" in error_msg.lower():
                error_msg = f"Permission denied when accessing storage bucket '{bucket_name}'. Please check your Supabase RLS policies."
            
            return {
                "success": False,
                "error": error_msg,
                "original_error": str(e)
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