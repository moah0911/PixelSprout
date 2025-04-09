import os
import logging
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(levelname)s - %(message)s')

def create_tables():
    """Create all necessary tables for the digital garden application"""
    # Get database connection string from environment variable
    DATABASE_URL = os.environ.get("DATABASE_URL")
    
    if not DATABASE_URL:
        logging.error("DATABASE_URL environment variable is not set")
        print_manual_setup_instructions()
        return False
    
    try:
        # Connect to the database
        logging.info("Connecting to PostgreSQL database...")
        conn = psycopg2.connect(DATABASE_URL)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        logging.info("Successfully connected to the database")
        
        # Create tables
        logging.info("Creating tables...")
        
        # Users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            username VARCHAR(100) NOT NULL,
            water_credits INTEGER NOT NULL DEFAULT 20,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        logging.info("Users table created or already exists")
        
        # Plants table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS plants (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES users(id) NOT NULL,
            name VARCHAR(100) NOT NULL,
            plant_type VARCHAR(50) NOT NULL,
            stage INTEGER DEFAULT 0 NOT NULL,
            health FLOAT DEFAULT 100 NOT NULL,
            progress FLOAT DEFAULT 0 NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_watered TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        logging.info("Plants table created or already exists")
        
        # Condition Types table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS condition_types (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            unit VARCHAR(50) NOT NULL,
            default_goal FLOAT,
            user_id UUID REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        logging.info("Condition Types table created or already exists")
        
        # Conditions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS conditions (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES users(id) NOT NULL,
            type_name VARCHAR(100) NOT NULL,
            value FLOAT NOT NULL,
            date_logged TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        logging.info("Conditions table created or already exists")
        
        # Create indexes for better performance
        cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id);
        CREATE INDEX IF NOT EXISTS idx_conditions_user_id ON conditions(user_id);
        CREATE INDEX IF NOT EXISTS idx_condition_types_user_id ON condition_types(user_id);
        """)
        logging.info("Indexes created or already exist")
        
        # Insert default condition types if they don't exist
        cursor.execute("""
        INSERT INTO condition_types (name, description, unit, default_goal)
        SELECT 'Water Intake', 'Amount of water consumed', 'glasses', 8
        WHERE NOT EXISTS (SELECT 1 FROM condition_types WHERE name = 'Water Intake');
        
        INSERT INTO condition_types (name, description, unit, default_goal)
        SELECT 'Sleep', 'Hours of sleep', 'hours', 8
        WHERE NOT EXISTS (SELECT 1 FROM condition_types WHERE name = 'Sleep');
        
        INSERT INTO condition_types (name, description, unit, default_goal)
        SELECT 'Exercise', 'Time spent exercising', 'minutes', 30
        WHERE NOT EXISTS (SELECT 1 FROM condition_types WHERE name = 'Exercise');
        
        INSERT INTO condition_types (name, description, unit, default_goal)
        SELECT 'Meditation', 'Time spent meditating', 'minutes', 15
        WHERE NOT EXISTS (SELECT 1 FROM condition_types WHERE name = 'Meditation');
        
        INSERT INTO condition_types (name, description, unit, default_goal)
        SELECT 'Reading', 'Time spent reading', 'minutes', 30
        WHERE NOT EXISTS (SELECT 1 FROM condition_types WHERE name = 'Reading');
        
        INSERT INTO condition_types (name, description, unit, default_goal)
        SELECT 'Sunlight', 'Time spent outdoors in natural light', 'minutes', 20
        WHERE NOT EXISTS (SELECT 1 FROM condition_types WHERE name = 'Sunlight');
        
        INSERT INTO condition_types (name, description, unit, default_goal)
        SELECT 'Deep Work', 'Time spent in focused, deep work', 'minutes', 120
        WHERE NOT EXISTS (SELECT 1 FROM condition_types WHERE name = 'Deep Work');
        """)
        logging.info("Default condition types added (if they didn't exist)")
        
        # Create views for convenience
        cursor.execute("""
        CREATE OR REPLACE VIEW plant_details AS
        SELECT 
            p.*,
            u.username,
            u.email
        FROM 
            plants p
        JOIN 
            users u ON p.user_id = u.id;
        """)
        
        cursor.execute("""
        CREATE OR REPLACE VIEW condition_details AS
        SELECT 
            c.*,
            u.username,
            ct.description AS condition_description,
            ct.unit
        FROM 
            conditions c
        JOIN 
            users u ON c.user_id = u.id
        LEFT JOIN
            condition_types ct ON c.type_name = ct.name;
        """)
        logging.info("Views created or replaced")
        
        # Close the connection
        cursor.close()
        conn.close()
        
        logging.info("✅ Database setup completed successfully!")
        return True
        
    except Exception as e:
        logging.error(f"Error setting up database: {str(e)}")
        print_manual_setup_instructions()
        return False

def print_manual_setup_instructions():
    """Print instructions for manual setup if the automatic setup fails"""
    logging.info("\n" + "="*80)
    logging.info("MANUAL SETUP INSTRUCTIONS")
    logging.info("="*80)
    logging.info("If you need to manually set up the database, follow these steps:")
    logging.info("1. Connect to your PostgreSQL database")
    logging.info("2. Run the SQL commands found in the setup_database.sql file")
    logging.info("="*80 + "\n")

if __name__ == "__main__":
    create_tables()