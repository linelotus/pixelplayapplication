from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    # Avatar System Fields
    level: Mapped[int] = mapped_column(Integer(), default=1, nullable=False)
    avatar_style: Mapped[str] = mapped_column(
        String(50), default='pixel-art', nullable=False)
    avatar_seed: Mapped[str] = mapped_column(
        String(100), nullable=True)
    avatar_background_color: Mapped[str] = mapped_column(
        String(20), default='blue', nullable=False)
    avatar_theme: Mapped[str] = mapped_column(
        String(50), default='superhero', nullable=False)
    avatar_mood: Mapped[str] = mapped_column(
        String(20), default='happy', nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "level": self.level,
            # Extract username from email
            "username": self.email.split('@')[0],
            "avatarData": {
                "style": self.avatar_style,
                "seed": self.avatar_seed or self.email.split('@')[0],
                "backgroundColor": self.avatar_background_color,
                "theme": self.avatar_theme,
                "mood": self.avatar_mood
            }
            # do not serialize the password, its a security breach
        }
