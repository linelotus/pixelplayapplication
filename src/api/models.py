from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, ForeignKey, Integer, DateTime, Text
from flask import Flask
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    # Also known as the child model

    __tablename__ = "User"

    user_id: Mapped[int] = mapped_column(primary_key=True)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    parent_email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)  # COPPA compliance
    google_id: Mapped[str] = mapped_column(String(120), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime())
    points: Mapped[int] = mapped_column(Integer, default=0) # points field for the user

    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    avatar_selection: Mapped[str] = mapped_column(String(200), nullable=True)

    rewards: Mapped[list["Reward"]] = relationship(
        "Reward", back_populates="user")


class Reward(db.Model):

    __tablename__ = "Reward"

    reward_id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("User.user_id"), nullable=False)

    reward_name: Mapped[str] = mapped_column(String(100), nullable=False)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean(), nullable=True)

    user: Mapped[list["User"]] = relationship("User", back_populates="rewards")

class UserReward(db.Model):

    __tablename__ = "UserReward"

    user_reward_id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("User.user_id"), nullable=False)
    reward_id: Mapped[int] = mapped_column(ForeignKey("Reward.reward_id"), nullable=False)
    purchased_at:  Mapped[datetime] = mapped_column(DateTime())
