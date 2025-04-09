from datetime import datetime
from enum import Enum
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, Enum as SQLEnum, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from typing import Optional, List
from app import db
from flask_login import UserMixin

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
    
    id: Mapped[str] = mapped_column(UUID, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    username: Mapped[str] = mapped_column(String(100), nullable=False)
    water_credits: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    
    # Relationships
    plants: Mapped[List["Plant"]] = relationship("Plant", back_populates="user", cascade="all, delete-orphan")
    conditions: Mapped[List["Condition"]] = relationship("Condition", back_populates="user", cascade="all, delete-orphan")
    condition_types: Mapped[List["ConditionType"]] = relationship("ConditionType", back_populates="user", cascade="all, delete-orphan")
    
    # Friendship relationships
    sent_friend_requests = relationship(
        "Friendship",
        foreign_keys="Friendship.requester_id",
        backref="requester_user",
        lazy="dynamic"
    )
    
    received_friend_requests = relationship(
        "Friendship",
        foreign_keys="Friendship.addressee_id",
        backref="addressee_user",
        lazy="dynamic"
    )
    
    def __init__(self, id, email, username, water_credits=20, created_at=None):
        self.id = id
        self.email = email
        self.username = username
        self.water_credits = water_credits
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
            db.session.commit()
            return True, "Friend request accepted"
        else:
            friendship.status = FriendshipStatus.DECLINED.value
            db.session.commit()
            return True, "Friend request declined"
        
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

# Friendship model for managing connections between users
class Friendship(db.Model):
    __tablename__ = "friendships"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    requester_id: Mapped[str] = mapped_column(UUID, ForeignKey("users.id"), nullable=False)
    addressee_id: Mapped[str] = mapped_column(UUID, ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default=FriendshipStatus.PENDING.value)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    requester: Mapped["User"] = relationship("User", foreign_keys=[requester_id])
    addressee: Mapped["User"] = relationship("User", foreign_keys=[addressee_id])
    
    def __init__(self, requester_id, addressee_id, status=FriendshipStatus.PENDING, created_at=None):
        self.requester_id = requester_id
        self.addressee_id = addressee_id
        self.status = status.value if isinstance(status, FriendshipStatus) else status
        self.created_at = created_at or datetime.now()
        self.updated_at = self.created_at
