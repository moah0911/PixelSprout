from app import app, db
import routes
import models

# Initialize the database and create tables
with app.app_context():
    db.create_all()

# Add default condition types if they don't exist
from models import ConditionType
with app.app_context():
    # Check if any condition types exist
    if not ConditionType.query.first():
        # Create default condition types
        default_conditions = [
            {
                'name': 'water_intake',
                'description': 'Daily water intake in glasses',
                'unit': 'glasses',
                'default_goal': 8
            },
            {
                'name': 'focus_time',
                'description': 'Time spent focusing on tasks',
                'unit': 'minutes',
                'default_goal': 120
            },
            {
                'name': 'sunlight',
                'description': 'Time spent outside in sunlight',
                'unit': 'minutes',
                'default_goal': 30
            },
            {
                'name': 'exercise',
                'description': 'Physical activity time',
                'unit': 'minutes',
                'default_goal': 30
            },
            {
                'name': 'sleep',
                'description': 'Hours of sleep',
                'unit': 'hours',
                'default_goal': 8
            }
        ]
        
        for condition in default_conditions:
            condition_type = ConditionType(
                id=None,
                name=condition['name'],
                description=condition['description'],
                unit=condition['unit'],
                default_goal=condition['default_goal']
            )
            db.session.add(condition_type)
        
        db.session.commit()  # noqa: F401

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
