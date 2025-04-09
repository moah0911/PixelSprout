from datetime import datetime
from enum import Enum
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from typing import Optional, List
from app import db
from flask_login import UserMixin

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
class User(db.Model, UserMixin):
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(UUID, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    username: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    
    # Relationships
    plants: Mapped[List["Plant"]] = relationship("Plant", back_populates="user", cascade="all, delete-orphan")
    conditions: Mapped[List["Condition"]] = relationship("Condition", back_populates="user", cascade="all, delete-orphan")
    condition_types: Mapped[List["ConditionType"]] = relationship("ConditionType", back_populates="user", cascade="all, delete-orphan")
    
    def __init__(self, id, email, username, created_at=None):
        self.id = id
        self.email = email
        self.username = username
        self.created_at = created_at or datetime.now()
        
# Plant model representing a plant in the digital garden
class Plant(db.Model):
    __tablename__ = "plants"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(UUID, ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    plant_type: Mapped[str] = mapped_column(String(50), nullable=False)
    stage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    health: Mapped[float] = mapped_column(Float, default=100, nullable=False)
    progress: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    last_watered: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="plants")
    
    def __init__(self, id, user_id, name, plant_type, stage=PlantStage.SEED, 
                 health=100, created_at=None, last_watered=None, progress=0):
        self.id = id if id else None  # Allow auto-increment if None
        self.user_id = user_id
        self.name = name
        self.plant_type = plant_type.value if isinstance(plant_type, PlantType) else plant_type
        self.stage = stage.value if isinstance(stage, PlantStage) else stage
        self.health = health
        self.created_at = created_at or datetime.now()
        self.last_watered = last_watered or datetime.now()
        self.progress = progress
        
# Condition model for storing user-logged conditions
class Condition(db.Model):
    __tablename__ = "conditions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(UUID, ForeignKey("users.id"), nullable=False)
    type_name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    date_logged: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="conditions")
    
    def __init__(self, id, user_id, type_name, value, date_logged=None):
        self.id = id if id else None  # Allow auto-increment if None
        self.user_id = user_id
        self.type_name = type_name
        self.value = value
        self.date_logged = date_logged or datetime.now()

# ConditionType model for storing types of conditions users can log
class ConditionType(db.Model):
    __tablename__ = "condition_types"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    default_goal: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    user_id: Mapped[Optional[str]] = mapped_column(UUID, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    
    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="condition_types")
    
    def __init__(self, id, name, description, unit, default_goal=None, user_id=None):
        self.id = id if id else None  # Allow auto-increment if None
        self.name = name
        self.description = description
        self.unit = unit
        self.default_goal = default_goal
        self.user_id = user_id  # NULL for system-defined conditions
