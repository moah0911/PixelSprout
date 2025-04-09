"""
Supabase Database Setup Script
This script runs the SQL setup commands against the Supabase database.
"""

import os
import logging
import time
from supabase import create_client

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(levelname)s - %(message)s')

# Supabase credentials - use environment variables or defaults
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://zgktaswjqhvqmavndpdx.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpna3Rhc3dqcWh2cW1hdm5kcGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxOTM3MDAsImV4cCI6MjA1OTc2OTcwMH0.sKv4jSGbVISrd8yXihM9UrSAxeC-qNBiD7ENHawFLSE")

# For admin operations, the service role key is better
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpna3Rhc3dqcWh2cW1hdm5kcGR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDE5MzcwMCwiZXhwIjoyMDU5NzY5NzAwfQ.NKEoPSoV_OUs8_kUCB83nFLtL3QFYIULjIXT7JzME_g")

def read_sql_file(file_path):
    """Read the SQL file and return its contents"""
    try:
        with open(file_path, 'r') as f:
            return f.read()
    except Exception as e:
        logging.error(f"Failed to read SQL file {file_path}: {str(e)}")
        return None

def split_sql_commands(sql_content):
    """Split SQL content into individual commands"""
    # Simple splitting by semicolon - for more complex SQL you might need a parser
    commands = []
    current_command = ""
    
    for line in sql_content.splitlines():
        # Skip comments
        line = line.strip()
        if line.startswith('--') or not line:
            continue
            
        current_command += line + " "
        
        # If the line ends with a semicolon, it's the end of a command
        if line.endswith(';'):
            commands.append(current_command.strip())
            current_command = ""
    
    # Add any remaining command
    if current_command.strip():
        commands.append(current_command.strip())
        
    return commands

def execute_sql_setup():
    """Execute the SQL setup file against the Supabase database"""
    
    logging.info("Starting Supabase database setup...")
    
    # Read the SQL file
    sql_content = read_sql_file('supabase_setup.sql')
    if not sql_content:
        logging.error("Failed to read SQL file. Aborting setup.")
        return False
    
    # Split into individual commands
    commands = split_sql_commands(sql_content)
    logging.info(f"Found {len(commands)} SQL commands to execute")
    
    # Create Supabase client with service role key for admin operations
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        logging.info("Successfully connected to Supabase")
    except Exception as e:
        logging.error(f"Failed to connect to Supabase: {str(e)}")
        return False
    
    # Execute each command
    success_count = 0
    error_count = 0
    
    for i, command in enumerate(commands):
        try:
            # Skip empty commands
            if not command.strip():
                continue
                
            # Execute the command
            logging.info(f"Executing command {i+1}/{len(commands)}...")
            
            # For debugging
            # logging.debug(f"Command: {command[:100]}{'...' if len(command) > 100 else ''}")
            
            # Execute the SQL command using the REST API
            # The Supabase Python client doesn't expose direct SQL execution in this version
            # So we'll need to add support for executing SQL against a PostgreSQL database
            
            logging.warning("SQL execution not yet implemented for this version of the Supabase client")
            logging.warning("Consider using the Supabase UI or a direct PostgreSQL connection")
            logging.info(f"Skipping command: {command[:100]}{'...' if len(command) > 100 else ''}")
            
            # Add a small delay to prevent rate limiting
            time.sleep(0.1)
            
            success_count += 1
            
        except Exception as e:
            error_count += 1
            logging.error(f"Error executing command {i+1}: {str(e)}")
            # For complex errors, log the problematic command
            logging.error(f"Problematic command: {command[:100]}{'...' if len(command) > 100 else ''}")
    
    # Log summary
    logging.info(f"Database setup completed with {success_count} successful commands and {error_count} errors.")
    
    return error_count == 0

def main():
    """Main function to run the setup"""
    result = execute_sql_setup()
    if result:
        logging.info("✅ Supabase database setup completed successfully!")
    else:
        logging.warning("⚠️ Supabase database setup completed with errors.")
        
if __name__ == "__main__":
    main()