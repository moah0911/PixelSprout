from datetime import datetime
from enum import Enum
import os
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Enum as SQLEnum, Table, Column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from typing import Optional, List
from app import db
from flask_login import UserMixin

# Check if we're using SQLite (which doesn't support UUID)
# If DATABASE_URL is not set or doesn't contain postgresql, we're using SQLite
using_sqlite = not os.environ.get("DATABASE_URL") or "postgresql" not in os.environ.get("DATABASE_URL", "")

# Helper function to generate UUID that is compatible with both SQLite and PostgreSQL
def generate_uuid():
    """Generate a UUID that works with both SQLite and PostgreSQL"""
    return str(uuid.uuid4())

# Define the friendship status enum
class FriendshipStatus(Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    BLOCKED = "blocked"

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
    BONSAI = "bonsai"
    FERN = "fern"
    CACTUS = "cactus"
    PALM = "palm"
    FRUIT = "fruit"
    BAMBOO = "bamboo"
    CARNIVOROUS = "carnivorous"
    AQUATIC = "aquatic"
    MOSS = "moss"

# User model for storing user data
class User(db.Model, UserMixin):
    __tablename__ = "users"
    
    # Use different column type based on database
    if using_sqlite:
        id = Column(String(36), primary_key=True)
    else:
        id = Column(UUID, primary_key=True)
        
    email = Column(String(255), nullable=False, unique=True)
    username = Column(String(100), nullable=False)
    water_credits = Column(Integer, default=20, nullable=False)
    garden_score = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relationships
    plants = relationship("Plant", back_populates="user", cascade="all, delete-orphan")
    conditions = relationship("Condition", back_populates="user", cascade="all, delete-orphan")
    condition_types = relationship("ConditionType", back_populates="user", cascade="all, delete-orphan")
    
    # Friendship relationships
    sent_friend_requests = relationship(
        "Friendship",
        foreign_keys="Friendship.requester_id",
        lazy="dynamic",
        overlaps="requester"
    )
    
    received_friend_requests = relationship(
        "Friendship",
        foreign_keys="Friendship.addressee_id",
        lazy="dynamic",
        overlaps="addressee"
    )
    
    def __init__(self, id, email, username, water_credits=20, garden_score=0, created_at=None):
        self.id = id
        self.email = email
        self.username = username
        self.water_credits = water_credits
        self.garden_score = garden_score
        self.created_at = created_at or datetime.now()
        
    # Friendship methods
    def send_friend_request(self, user):
        if user.id == self.id:
            return False, "You cannot send a friend request to yourself"
            
        # Check if a friendship already exists
        existing_friendship = Friendship.query.filter(
            ((Friendship.requester_id == self.id) & (Friendship.addressee_id == user.id)) |
            ((Friendship.requester_id == user.id) & (Friendship.addressee_id == self.id))
        ).first()
        
        if existing_friendship:
            return False, "A friendship with this user already exists"
        
        friendship = Friendship(requester_id=self.id, addressee_id=user.id)
        db.session.add(friendship)
        db.session.commit()
        return True, "Friend request sent"
    
    def get_friends(self):
        """Get all accepted friends of the user"""
        accepted_sent = Friendship.query.filter_by(
            requester_id=self.id,
            status=FriendshipStatus.ACCEPTED.value
        ).all()
        
        accepted_received = Friendship.query.filter_by(
            addressee_id=self.id,
            status=FriendshipStatus.ACCEPTED.value
        ).all()
        
        friends = []
        for friendship in accepted_sent:
            friends.append(User.query.get(friendship.addressee_id))
        
        for friendship in accepted_received:
            friends.append(User.query.get(friendship.requester_id))
            
        return friends
    
    def get_friend_requests(self):
        """Get all pending friend requests sent to this user"""
        return Friendship.query.filter_by(
            addressee_id=self.id,
            status=FriendshipStatus.PENDING.value
        ).all()
    
    def handle_friend_request(self, friendship_id, accept=True):
        """Accept or decline a friend request"""
        friendship = Friendship.query.get(friendship_id)
        
        if not friendship or friendship.addressee_id != self.id:
            return False, "Invalid friend request"
        
        if accept:
            friendship.status = FriendshipStatus.ACCEPTED.value
            
            # Increase garden score for both users when accepting a friend request
            requester = User.query.get(friendship.requester_id)
            if requester:
                requester.increase_garden_score(50, "Added a new friend")
            self.increase_garden_score(50, "Added a new friend")
            
            db.session.commit()
            return True, "Friend request accepted"
        else:
            friendship.status = FriendshipStatus.DECLINED.value
            db.session.commit()
            return True, "Friend request declined"
            
    def increase_garden_score(self, points, reason=""):
        """Increase the user's garden score
        
        Args:
            points: Number of points to add
            reason: The reason for the point increase (for tracking purposes)
        """
        self.garden_score += points
        db.session.add(self)
        db.session.commit()
        
        # Log the score change (could be expanded to store in a table)
        print(f"Garden score increased by {points} for user {self.username} ({reason}). New score: {self.garden_score}")
        
        return self.garden_score
        
    def get_garden_score(self):
        """Get the user's garden score with formatted label
        
        Returns:
            Dict with score and label
        """
        # Get score level based on score
        levels = {
            0: "Seed Starter",
            100: "Sprout Nurturer",
            500: "Growth Enthusiast",
            1000: "Plant Master",
            2500: "Garden Sage",
            5000: "Nature Whisperer",
            10000: "Botanical Legend",
            25000: "Garden God"
        }
        
        # Find appropriate level
        level_label = "Seed Starter"  # Default
        for threshold in sorted(levels.keys(), reverse=True):
            if self.garden_score >= threshold:
                level_label = levels[threshold]
                break
                
        return {
            "score": self.garden_score,
            "label": level_label
        }
        
# Plant model representing a plant in the digital garden
class Plant(db.Model):
    __tablename__ = "plants"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    # Use different column type based on database
    if using_sqlite:
        user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    else:
        user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    plant_type = Column(String(50), nullable=False)
    stage = Column(Integer, default=0, nullable=False)
    health = Column(Float, default=100, nullable=False)
    progress = Column(Float, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    last_watered = Column(DateTime, default=datetime.now)
    
    # Relationships
    user = relationship("User", back_populates="plants")
    
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
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    # Use different column type based on database
    if using_sqlite:
        user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    else:
        user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    type_name = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    date_logged = Column(DateTime, default=datetime.now)
    
    # Relationships
    user = relationship("User", back_populates="conditions")
    
    def __init__(self, id, user_id, type_name, value, date_logged=None):
        self.id = id if id else None  # Allow auto-increment if None
        self.user_id = user_id
        self.type_name = type_name
        self.value = value
        self.date_logged = date_logged or datetime.now()

# ConditionType model for storing types of conditions users can log
class ConditionType(db.Model):
    __tablename__ = "condition_types"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    unit = Column(String(50), nullable=False)
    default_goal = Column(Float, nullable=True)
    # Use different column type based on database
    if using_sqlite:
        user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    else:
        user_id = Column(UUID, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relationships
    user = relationship("User", back_populates="condition_types")
    
    def __init__(self, id, name, description, unit, default_goal=None, user_id=None):
        self.id = id if id else None  # Allow auto-increment if None
        self.name = name
        self.description = description
        self.unit = unit
        self.default_goal = default_goal
        self.user_id = user_id  # NULL for system-defined conditions

# Friendship model for managing connections between users
class Friendship(db.Model):
    __tablename__ = "friendships"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    # Use different column type based on database
    if using_sqlite:
        requester_id = Column(String(36), ForeignKey("users.id"), nullable=False)
        addressee_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    else:
        requester_id = Column(UUID, ForeignKey("users.id"), nullable=False)
        addressee_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), nullable=False, default=FriendshipStatus.PENDING.value)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    # Using back_populates instead of backref for more explicit relationship management
    requester = relationship(
        "User", 
        foreign_keys=[requester_id], 
        back_populates="sent_friend_requests",
        overlaps="requester_user,sent_friend_requests"
    )
    addressee = relationship(
        "User", 
        foreign_keys=[addressee_id], 
        back_populates="received_friend_requests",
        overlaps="addressee_user,received_friend_requests"
    )
    
    def __init__(self, requester_id, addressee_id, status=FriendshipStatus.PENDING, created_at=None):
        self.requester_id = requester_id
        self.addressee_id = addressee_id
        self.status = status.value if isinstance(status, FriendshipStatus) else status
        self.created_at = created_at or datetime.now()
        self.updated_at = self.created_at
