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
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    avatar_selection: Mapped[str] = mapped_column(String(200), nullable=True)
