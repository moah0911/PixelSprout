#!/usr/bin/env python3
"""
Setup script for Supabase Storage buckets.
This script creates the necessary storage buckets in Supabase.
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()

# Check if Supabase credentials are set
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("Supabase credentials not found in environment variables")
    logging.error("Please set SUPABASE_URL and SUPABASE_KEY in your .env file")
    sys.exit(1)

try:
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except ImportError:
    logging.error("Supabase Python client not installed")
    logging.error("Please install it with: pip install supabase")
    sys.exit(1)
except Exception as e:
    logging.error(f"Failed to initialize Supabase client: {str(e)}")
    sys.exit(1)

def create_bucket(bucket_name, public=True):
    """Create a storage bucket if it doesn't exist"""
    try:
        # Check if bucket exists
        buckets = supabase.storage.list_buckets()
        bucket_names = [bucket["name"] for bucket in buckets]
        
        if bucket_name in bucket_names:
            logging.info(f"Bucket '{bucket_name}' already exists")
            return True
        
        # Create bucket
        supabase.storage.create_bucket(bucket_name, {"public": public})
        logging.info(f"Created bucket '{bucket_name}'")
        return True
    except Exception as e:
        logging.error(f"Failed to create bucket '{bucket_name}': {str(e)}")
        return False

def setup_bucket_policies(bucket_name):
    """Set up bucket policies for public access"""
    try:
        # Set up policy for public read access
        policy_name = f"{bucket_name}_public_read"
        policy = {
            "name": policy_name,
            "definition": {
                "type": "storage",
                "resources": [f"bucket:{bucket_name}"],
                "statements": [
                    {
                        "effect": "allow",
                        "action": "storage.objects:read",
                        "principal": "*"
                    }
                ]
            }
        }
        
        # Note: The Python client doesn't have a direct method to create policies
        # This would typically be done through the Supabase dashboard or REST API
        logging.info(f"Please set up the following policy for bucket '{bucket_name}' in the Supabase dashboard:")
        logging.info(f"Policy name: {policy_name}")
        logging.info("Allow public read access to all objects")
        
        return True
    except Exception as e:
        logging.error(f"Failed to set up policies for bucket '{bucket_name}': {str(e)}")
        return False

def main():
    """Main setup function"""
    logging.info("Setting up Supabase Storage buckets")
    
    # Define buckets to create
    buckets = [
        {"name": "pixelsprout-uploads", "public": True},
        {"name": "profile-pictures", "public": True},
        {"name": "plant-images", "public": True}
    ]
    
    # Create buckets
    for bucket in buckets:
        success = create_bucket(bucket["name"], bucket["public"])
        if success:
            setup_bucket_policies(bucket["name"])
    
    logging.info("Supabase Storage setup completed")
    logging.info("Note: You may need to configure additional permissions in the Supabase dashboard")

if __name__ == "__main__":
    main()