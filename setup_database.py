import os
import logging
from supabase import create_client

logging.basicConfig(level=logging.INFO)

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logging.error("Supabase credentials not found in environment variables")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_tables():
    """Create all necessary tables for the digital garden application"""
    logging.info("Creating tables in Supabase...")
    
    # SQL commands to create tables
    create_users_table = """
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        username VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    create_plants_table = """
    CREATE TABLE IF NOT EXISTS plants (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id),
        name VARCHAR(100) NOT NULL,
        plant_type VARCHAR(50) NOT NULL,
        stage INTEGER DEFAULT 0,
        health NUMERIC DEFAULT 100,
        progress NUMERIC DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_watered TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    create_condition_types_table = """
    CREATE TABLE IF NOT EXISTS condition_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        unit VARCHAR(50) NOT NULL,
        default_goal NUMERIC,
        user_id UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    create_conditions_table = """
    CREATE TABLE IF NOT EXISTS conditions (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id),
        type_name VARCHAR(100) NOT NULL,
        value NUMERIC NOT NULL,
        date_logged TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # Execute SQL commands
    try:
        # Using the REST API to execute SQL (requires appropriate permissions)
        response = supabase.rpc('exec_sql', {'sql_query': create_users_table}).execute()
        logging.info("Created users table")
        
        response = supabase.rpc('exec_sql', {'sql_query': create_plants_table}).execute()
        logging.info("Created plants table")
        
        response = supabase.rpc('exec_sql', {'sql_query': create_condition_types_table}).execute()
        logging.info("Created condition_types table")
        
        response = supabase.rpc('exec_sql', {'sql_query': create_conditions_table}).execute()
        logging.info("Created conditions table")
        
        logging.info("All tables created successfully!")
        return True
    except Exception as e:
        logging.error(f"Error creating tables: {str(e)}")
        logging.error("Make sure you have a stored procedure named 'exec_sql' in your Supabase database")
        logging.error("Or create the tables manually using the Supabase SQL editor")
        return False

def print_manual_setup_instructions():
    """Print instructions for manual setup if the automatic setup fails"""
    logging.info("\n==== MANUAL SETUP INSTRUCTIONS ====")
    logging.info("If the automatic setup fails, you'll need to create these tables manually in your Supabase SQL editor:")
    
    logging.info("\n-- Users Table:")
    logging.info("""
    CREATE TABLE public.users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        username VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    logging.info("\n-- Plants Table:")
    logging.info("""
    CREATE TABLE public.plants (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES public.users(id),
        name VARCHAR(100) NOT NULL,
        plant_type VARCHAR(50) NOT NULL,
        stage INTEGER DEFAULT 0,
        health NUMERIC DEFAULT 100,
        progress NUMERIC DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_watered TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    logging.info("\n-- Condition Types Table:")
    logging.info("""
    CREATE TABLE public.condition_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        unit VARCHAR(50) NOT NULL,
        default_goal NUMERIC,
        user_id UUID REFERENCES public.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    logging.info("\n-- Conditions Table:")
    logging.info("""
    CREATE TABLE public.conditions (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES public.users(id),
        type_name VARCHAR(100) NOT NULL,
        value NUMERIC NOT NULL,
        date_logged TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    logging.info("\n====================================")
    
    logging.info("\nNow you can try running the application again.")

if __name__ == "__main__":
    success = create_tables()
    
    if not success:
        print_manual_setup_instructions()