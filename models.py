from datetime import datetime
from enum import Enum

# Plant Growth Stages
class PlantStage(Enum):
    SEED = 0
    SPROUT = 1
    GROWING = 2
    MATURE = 3
    FLOWERING = 4
    WITHERING = 5
    DEAD = 6

# Plant Types
class PlantType(Enum):
    SUCCULENT = "succulent"
    FLOWER = "flower"
    TREE = "tree"
    HERB = "herb"
    VINE = "vine"

# User model for storing user data
class User:
    def __init__(self, id, email, username, created_at=None):
        self.id = id
        self.email = email
        self.username = username
        self.created_at = created_at or datetime.now()
        
# Plant model representing a plant in the digital garden
class Plant:
    def __init__(self, id, user_id, name, plant_type, stage=PlantStage.SEED, 
                 health=100, created_at=None, last_watered=None, progress=0):
        self.id = id
        self.user_id = user_id
        self.name = name
        self.plant_type = plant_type
        self.stage = stage
        self.health = health
        self.created_at = created_at or datetime.now()
        self.last_watered = last_watered or datetime.now()
        self.progress = progress  # Progress towards next stage (0-100)
        
# Condition model for storing user-logged conditions
class Condition:
    def __init__(self, id, user_id, type_name, value, date_logged=None):
        self.id = id
        self.user_id = user_id
        self.type_name = type_name
        self.value = value
        self.date_logged = date_logged or datetime.now()

# ConditionType model for storing types of conditions users can log
class ConditionType:
    def __init__(self, id, name, description, unit, default_goal=None, user_id=None):
        self.id = id
        self.name = name
        self.description = description
        self.unit = unit
        self.default_goal = default_goal
        self.user_id = user_id  # NULL for system-defined conditions
