from app import app, db
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def create_tables():
    """Create all database tables if they don't exist"""
    try:
        with app.app_context():
            # Import all models to ensure they're registered with SQLAlchemy
            from models import User, Plant, PlantType, Condition, ConditionType, Friendship
            
            # Create tables
            db.create_all()
            logging.info("Database tables created successfully")
            
            # Initialize plant types
            from routes_plants import initialize_plant_types
            initialize_plant_types()
            logging.info("Plant types initialized")
            
            # Create a test user if none exists
            if User.query.count() == 0:
                try:
                    test_user = User(
                        id="test-user-1",
                        email="test@example.com",
                        username="TestUser",
                        water_credits=50,
                        garden_score=100
                    )
                    db.session.add(test_user)
                    db.session.commit()
                    logging.info("Test user created")
                    
                    # Create a test session
                    with open('test_session.txt', 'w') as f:
                        f.write(f"Test user ID: {test_user.id}")
                    
                    # Add a test plant for the user
                    test_plant = Plant(
                        user_id=test_user.id,
                        name="Test Fern",
                        plant_type_id="fern",
                        stage=1,
                        health=90,
                        progress=30
                    )
                    db.session.add(test_plant)
                    db.session.commit()
                    logging.info("Test plant created")
                except Exception as user_error:
                    db.session.rollback()
                    logging.error(f"Error creating test user: {str(user_error)}")
            
            return True
    except Exception as e:
        logging.error(f"Error creating database tables: {str(e)}")
        return False

if __name__ == "__main__":
    # Make sure the instance folder exists
    os.makedirs('instance', exist_ok=True)
    
    # Create tables
    success = create_tables()
    
    if success:
        print("Database setup completed successfully!")
    else:
        print("Database setup failed. Check the logs for details.")