"""
Database models for PixelPlay application.
This module contains all database table definitions using SQLAlchemy ORM.
Includes User, Task, Game, Inventory, and Achievement systems.

STAT TRACKING ORGANIZATION:
- User model: Overall account stats (level, xp, coins, overall streak)
- UserProgress model: Activity tracking (workouts, games played, daily rewards)
- UserGameStats model: Game-specific stats (game progress, favorites)
- GameSession model: Individual play sessions (scores, duration)
"""

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date, timedelta
import json

# Initialize SQLAlchemy instance
db = SQLAlchemy()


# ===================================
# USER MODEL - PRIMARY STATS
# ===================================
class User(db.Model):
    """
    User model for authentication and profile management.
    PRIMARY SOURCE for: Level, XP, Coins, Overall Streak
    """
    __tablename__ = 'users'

    # Primary key
    id = db.Column(db.Integer, primary_key=True)

    # Authentication fields
    username = db.Column(db.String(100), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean(), default=True, nullable=False)

    # 🎮 GAMIFICATION FIELDS (PRIMARY STATS)
    level = db.Column(db.Integer(), default=1, nullable=False)
    xp = db.Column(db.Integer, default=0, nullable=False)
    coins = db.Column(db.Integer, default=100, nullable=False)

    # 🔥 STREAK TRACKING (OVERALL ACTIVITY STREAK)
    streak_days = db.Column(db.Integer, default=0, nullable=False)
    last_activity_date = db.Column(
        db.Date, nullable=True)  # Track last active day

    # Avatar System Fields
    avatar_style = db.Column(
        db.String(50), default="pixel-art", nullable=False)
    avatar_seed = db.Column(db.String(100), nullable=True)
    avatar_background_color = db.Column(
        db.String(20), default="blue", nullable=False)
    avatar_theme = db.Column(
        db.String(50), default="superhero", nullable=False)
    avatar_mood = db.Column(db.String(20), default="happy", nullable=False)

    # 📊 LEGACY HABIT TRACKER FIELDS (can be deprecated if not used)
    habit_daily_points = db.Column(db.Integer, default=0)
    habit_completed_tasks = db.Column(JSON, default=list)
    habit_last_reset = db.Column(db.String(10))
    habit_streak_days = db.Column(db.Integer, default=0)
    habit_game_states = db.Column(JSON, default=dict)

    # Legacy fields
    total_playtime = db.Column(db.Integer, default=0, nullable=False)
    favorite_games = db.Column(db.Text, nullable=True)
    last_activity = db.Column(db.DateTime, nullable=True)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)

    # Timestamps
    created_at = db.Column(
        db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                           onupdate=datetime.utcnow, nullable=False)

    # Relationships
    tasks = db.relationship('Task', backref='user',
                            lazy=True, cascade='all, delete-orphan')
    games = db.relationship('Game', backref='user',
                            lazy=True, cascade='all, delete-orphan')
    inventory = db.relationship(
        'UserInventory', backref='user', lazy=True, cascade='all, delete-orphan')
    achievements = db.relationship(
        'UserAchievement', backref='user', lazy=True, cascade='all, delete-orphan')
    avatars = db.relationship(
        'UserAvatar', backref='user', lazy=True, cascade='all, delete-orphan')
    unlocked_items = db.relationship(
        'UnlockedItem', backref='user', lazy=True, cascade='all, delete-orphan')
    progress = db.relationship(
        'UserProgress', backref='user', uselist=False, cascade='all, delete-orphan')
    game_sessions_data = db.relationship(
        'GameSession', backref='user', lazy=True)
    game_stats = db.relationship(
        'UserGameStats', backref='user', uselist=False, cascade='all, delete-orphan')

    def __init__(self, email, password, username=None):
        self.email = email
        self.username = username or email.split('@')[0]
        self.set_password(password)
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.last_activity_date = date.today()  # Initialize activity tracking

    def set_password(self, password):
        """Hash and store password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check if provided password matches hash."""
        return check_password_hash(self.password_hash, password)

    # 🎯 CENTRALIZED XP AND LEVELING
    def add_xp(self, amount, source="game"):
        """
        Add XP and check for level up.
        Returns: (leveled_up: bool, new_level: int, coins_earned: int)
        """
        self.xp += amount
        old_level = self.level
        new_level = (self.xp // 100) + 1

        coins_earned = 0
        if new_level > old_level:
            self.level = new_level
            coins_earned = (new_level - old_level) * 50
            self.coins += coins_earned
            leveled_up = True
        else:
            leveled_up = False

        # Update activity tracking
        self.update_activity()

        return leveled_up, new_level, coins_earned

    # 🔥 CENTRALIZED STREAK TRACKING
    def update_streak(self):
        """
        Update streak based on last activity date.
        Call this whenever user completes an activity.
        Returns: (streak_continued: bool, new_streak: int)
        """
        today = date.today()

        if self.last_activity_date is None:
            # First activity ever
            self.streak_days = 1
            self.last_activity_date = today
            return True, 1

        days_since_activity = (today - self.last_activity_date).days

        if days_since_activity == 0:
            # Already active today, no change
            return False, self.streak_days
        elif days_since_activity == 1:
            # Active yesterday, continue streak
            self.streak_days += 1
            self.last_activity_date = today
            return True, self.streak_days
        else:
            # Streak broken (missed a day)
            self.streak_days = 1
            self.last_activity_date = today
            return False, 1

    def update_activity(self):
        """Update last activity timestamp and date."""
        self.last_activity = datetime.utcnow()
        # This will trigger streak check
        self.update_streak()

    # 💰 COIN MANAGEMENT
    def can_afford(self, cost):
        """Check if user can afford an item."""
        return self.coins >= cost

    def spend_coins(self, amount):
        """Spend coins if user has enough. Returns True if successful."""
        if self.can_afford(amount):
            self.coins -= amount
            return True
        return False

    def add_coins(self, amount, source="reward"):
        """Add coins to user account."""
        self.coins += amount
        return self.coins

    # 📊 GET COMPLETE STATS
    def get_complete_stats(self):
        """Get all user stats from across tables."""
        # Get progress data
        progress = self.progress or UserProgress(user_id=self.id)
        game_stats = self.game_stats or UserGameStats(user_id=self.id)

        return {
            'level': self.level,
            'xp': self.xp,
            'coins': self.coins,
            'streak_days': self.streak_days,
            'total_games_played': game_stats.total_games_played,
            'workouts_completed': progress.workouts_completed,
            'items_unlocked': progress.items_unlocked,
            'last_activity': self.last_activity.isoformat() if self.last_activity else None
        }

    def serialize(self):
        """Convert user to dictionary for JSON responses"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'level': self.level,
            'xp': self.xp,
            'coins': self.coins,
            'streak_days': self.streak_days,
            'last_activity_date': self.last_activity_date.isoformat() if self.last_activity_date else None,
            'avatar_style': self.avatar_style,
            'avatar_seed': self.avatar_seed,
            'avatar_background_color': self.avatar_background_color,
            'avatar_theme': self.avatar_theme,
            'avatar_mood': self.avatar_mood,
            'total_playtime': self.total_playtime,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<User {self.email}>'


# ===================================
# USER PROGRESS MODEL - ACTIVITY TRACKING
# ===================================
class UserProgress(db.Model):
    """
    Tracks user activity and achievements.
    PRIMARY SOURCE for: Workouts Completed, Games Played Count, Items Unlocked
    """
    __tablename__ = 'user_progress'

    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.id'), primary_key=True)

    # 🏃 ACTIVITY TRACKING
    workouts_completed = db.Column(db.Integer, default=0, nullable=False)
    total_games_played = db.Column(
        db.Integer, default=0, nullable=False)  # Total across all games

    # 🎨 CUSTOMIZATION TRACKING
    avatars_created = db.Column(db.Integer, default=0, nullable=False)
    items_unlocked = db.Column(db.Integer, default=0, nullable=False)

    # 🎁 DAILY REWARDS
    last_daily_reward = db.Column(db.Date, nullable=True)
    daily_reward_streak = db.Column(db.Integer, default=0)

    # Legacy fields (mirror from User for backwards compatibility)
    total_points = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    experience_points = db.Column(db.Integer, default=0)
    streak_days = db.Column(db.Integer, default=0)
    last_activity_date = db.Column(db.Date, nullable=True)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 🎮 ACTIVITY TRACKING METHODS
    def record_game_played(self, xp_earned=0):
        """
        Record that a game was played.
        Returns: dict with updated stats
        """
        self.total_games_played += 1
        self.updated_at = datetime.utcnow()

        # Also update user's XP if provided
        if xp_earned > 0 and self.user:
            leveled_up, new_level, coins = self.user.add_xp(
                xp_earned, source="game")
            return {
                'games_played': self.total_games_played,
                'xp_earned': xp_earned,
                'leveled_up': leveled_up,
                'new_level': new_level,
                'coins_earned': coins
            }

        return {
            'games_played': self.total_games_played,
            'xp_earned': 0
        }

    def record_workout(self, xp_earned=10):
        """
        Record a completed workout.
        Returns: dict with updated stats
        """
        self.workouts_completed += 1
        self.updated_at = datetime.utcnow()

        # Update user's XP
        if self.user:
            leveled_up, new_level, coins = self.user.add_xp(
                xp_earned, source="workout")
            return {
                'workouts_completed': self.workouts_completed,
                'xp_earned': xp_earned,
                'leveled_up': leveled_up,
                'new_level': new_level,
                'coins_earned': coins
            }

        return {
            'workouts_completed': self.workouts_completed,
            'xp_earned': xp_earned
        }

    def unlock_item(self):
        """Track that an item was unlocked."""
        self.items_unlocked += 1
        self.updated_at = datetime.utcnow()

    def create_avatar(self):
        """Track that an avatar was created."""
        self.avatars_created += 1
        self.updated_at = datetime.utcnow()

    # 🎁 DAILY REWARD SYSTEM
    def can_claim_daily_reward(self):
        """Check if user can claim today's daily reward."""
        if self.last_daily_reward is None:
            return True
        return date.today() > self.last_daily_reward

    def claim_daily_reward(self):
        """
        Claim daily reward.
        Returns: (success: bool, reward_coins: int, streak: int)
        """
        if not self.can_claim_daily_reward():
            return False, 0, self.daily_reward_streak

        today = date.today()

        # Check if streak continues
        if self.last_daily_reward:
            days_since = (today - self.last_daily_reward).days
            if days_since == 1:
                # Streak continues
                self.daily_reward_streak += 1
            else:
                # Streak broken
                self.daily_reward_streak = 1
        else:
            # First reward
            self.daily_reward_streak = 1

        self.last_daily_reward = today

        # Calculate reward (base 10 + streak bonus)
        reward_coins = 10 + (self.daily_reward_streak * 2)

        # Give coins to user
        if self.user:
            self.user.add_coins(reward_coins, source="daily_reward")

        return True, reward_coins, self.daily_reward_streak

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'workouts_completed': self.workouts_completed,
            'total_games_played': self.total_games_played,
            'avatars_created': self.avatars_created,
            'items_unlocked': self.items_unlocked,
            'daily_reward_streak': self.daily_reward_streak,
            'can_claim_daily_reward': self.can_claim_daily_reward(),
            'last_daily_reward': self.last_daily_reward.isoformat() if self.last_daily_reward else None
        }

    def __repr__(self):
        return f'<UserProgress user={self.user_id} games={self.total_games_played} workouts={self.workouts_completed}>'


# ===================================
# USER GAME STATS MODEL - GAME-SPECIFIC DATA
# ===================================
class UserGameStats(db.Model):
    """
    Tracks game-specific statistics.
    PRIMARY SOURCE for: Game unlocks, Favorites, Completions
    """
    __tablename__ = 'user_game_stats'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.id'), nullable=False, unique=True)

    # Lists stored as JSON
    unlocked_games = db.Column(JSON, default=list, nullable=False)
    completed_games = db.Column(JSON, default=list, nullable=False)
    favorite_games = db.Column(JSON, default=list, nullable=False)

    # Legacy fields (use UserProgress.total_games_played instead)
    total_games_played = db.Column(db.Integer, default=0, nullable=False)
    weekly_streak = db.Column(db.Integer, default=0, nullable=False)

    # Legacy XP tracking (use User.xp instead)
    level = db.Column(db.Integer, default=1, nullable=False)
    xp = db.Column(db.Integer, default=0, nullable=False)

    # Timestamps
    created_at = db.Column(
        db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                           onupdate=datetime.utcnow, nullable=False)

    def unlock_game(self, game_id):
        """Unlock a game if not already unlocked."""
        if not self.unlocked_games:
            self.unlocked_games = []
        if game_id not in self.unlocked_games:
            self.unlocked_games = self.unlocked_games + [game_id]
            return True
        return False

    def complete_game(self, game_id):
        """Mark a game as completed."""
        if not self.completed_games:
            self.completed_games = []
        if game_id not in self.completed_games:
            self.completed_games = self.completed_games + [game_id]
            return True
        return False

    def toggle_favorite(self, game_id):
        """Toggle favorite status for a game. Returns new favorite state."""
        if not self.favorite_games:
            self.favorite_games = []

        if game_id in self.favorite_games:
            self.favorite_games = [
                g for g in self.favorite_games if g != game_id]
            return False
        else:
            self.favorite_games = self.favorite_games + [game_id]
            return True

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'unlocked_games': self.unlocked_games or [],
            'completed_games': self.completed_games or [],
            'favorite_games': self.favorite_games or [],
            'total_games_played': self.total_games_played,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def __repr__(self):
        return f'<UserGameStats user={self.user_id}>'


# ===================================
# GAME SESSION MODEL - INDIVIDUAL PLAYS
# ===================================
class GameSession(db.Model):
    """
    Tracks individual game play sessions.
    Use this to record each time a game is played with score/duration.
    """
    __tablename__ = 'game_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    game_id = db.Column(db.String(100), nullable=False)

    # Session data
    score = db.Column(db.Integer, default=0)
    duration_minutes = db.Column(db.Integer, default=0)
    xp_earned = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False)
    played_at = db.Column(db.DateTime, default=datetime.utcnow)

    @staticmethod
    def record_session(user_id, game_id, score=0, duration_minutes=0, xp_earned=10, completed=False):
        """
        Helper method to record a game session and update all related stats.

        Args:
            user_id: User ID
            game_id: Game identifier
            score: Score achieved
            duration_minutes: How long they played
            xp_earned: XP to award
            completed: Whether they finished the game

        Returns:
            dict with session data and updated stats
        """
        from api.models import User, UserProgress, UserGameStats, Game

        # Create session record
        session = GameSession(
            user_id=user_id,
            game_id=game_id,
            score=score,
            duration_minutes=duration_minutes,
            xp_earned=xp_earned,
            completed=completed
        )
        db.session.add(session)

        # Update user stats
        user = User.query.get(user_id)
        if user:
            leveled_up, new_level, coins = user.add_xp(
                xp_earned, source="game")
        else:
            leveled_up, new_level, coins = False, 1, 0

        # Update progress
        progress = UserProgress.query.filter_by(user_id=user_id).first()
        if not progress:
            progress = UserProgress(user_id=user_id)
            db.session.add(progress)
        progress.record_game_played(xp_earned)

        # Update game stats
        game_stats = UserGameStats.query.filter_by(user_id=user_id).first()
        if not game_stats:
            game_stats = UserGameStats(user_id=user_id)
            db.session.add(game_stats)
        game_stats.total_games_played += 1

        # Mark as completed if needed
        if completed:
            game_stats.complete_game(game_id)

        # Update Game model if it exists
        game = Game.query.filter_by(user_id=user_id, name=game_id).first()
        if game:
            game.times_played += 1
            game.last_played = datetime.utcnow()
            if score > game.personal_best:
                game.personal_best = score

        db.session.commit()

        return {
            'session_id': session.id,
            'score': score,
            'xp_earned': xp_earned,
            'leveled_up': leveled_up,
            'new_level': new_level,
            'coins_earned': coins,
            'total_games_played': progress.total_games_played,
            'streak_days': user.streak_days if user else 0
        }

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'game_id': self.game_id,
            'score': self.score,
            'duration_minutes': self.duration_minutes,
            'xp_earned': self.xp_earned,
            'completed': self.completed,
            'played_at': self.played_at.isoformat() if self.played_at else None
        }

    def __repr__(self):
        return f'<GameSession {self.game_id} by user {self.user_id}>'


# ===================================
# TASK MODEL
# ===================================
class Task(db.Model):
    """Task model for managing user tasks/todos."""
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(200), nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __init__(self, task_name, user_id, is_completed=False):
        self.task_name = task_name
        self.user_id = user_id
        self.is_completed = is_completed
        self.date = datetime.utcnow()

    def serialize(self):
        return {
            'id': self.id,
            'taskName': self.task_name,
            'isCompleted': self.is_completed,
            'date': self.date.isoformat() if self.date else None,
            'userId': self.user_id
        }

    def toggle_completion(self):
        self.is_completed = not self.is_completed
        return self.is_completed

    def __repr__(self):
        return f'<Task {self.id}: {self.task_name[:30]}>'


# ===================================
# GAME MODEL
# ===================================
class Game(db.Model):
    """Game model for tracking user progress in games."""
    __tablename__ = 'games'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    progress = db.Column(db.Integer, default=0, nullable=False)
    personal_best = db.Column(db.Integer, default=0, nullable=False)
    times_played = db.Column(db.Integer, default=0, nullable=False)
    total_time = db.Column(db.Integer, default=0, nullable=False)
    is_favorite = db.Column(db.Boolean, default=False, nullable=False)
    last_played = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(
        db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow,
                           onupdate=datetime.utcnow, nullable=False)

    def __init__(self, name, user_id, progress=0):
        self.name = name
        self.user_id = user_id
        self.progress = progress
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'progress': self.progress,
            'personalBest': self.personal_best,
            'timesPlayed': self.times_played,
            'totalTime': self.total_time,
            'isFavorite': self.is_favorite,
            'lastPlayed': self.last_played.isoformat() if self.last_played else None,
            'userId': self.user_id,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Game {self.name} for user {self.user_id}>'


# ===================================
# USER INVENTORY MODEL
# ===================================

class UserInventory(db.Model):
    """Tracks user's inventory items (legacy - being phased out)."""
    __tablename__ = 'user_inventory'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    item_id = db.Column(db.Integer, nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    item_type = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    acquired_date = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'item_id': self.item_id,
            'item_name': self.item_name,
            'item_type': self.item_type,
            'quantity': self.quantity,
            'acquired_date': self.acquired_date.isoformat() if self.acquired_date else None
        }

    def __repr__(self):
        return f'<UserInventory {self.item_name} for user {self.user_id}>'


# ===================================
# USER ACHIEVEMENT MODEL
# ===================================
class UserAchievement(db.Model):
    """Tracks user achievements."""
    __tablename__ = 'user_achievements'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    achievement_name = db.Column(db.String(100), nullable=False)
    achievement_description = db.Column(db.String(255))
    progress = db.Column(db.Integer, default=0)
    target = db.Column(db.Integer, default=100)
    is_completed = db.Column(db.Boolean, default=False)
    completed_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.achievement_name,
            'description': self.achievement_description,
            'progress': self.progress,
            'target': self.target,
            'is_completed': self.is_completed,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    def update_progress(self, amount):
        """Update progress and check if completed."""
        self.progress += amount
        if self.progress >= self.target and not self.is_completed:
            self.is_completed = True
            self.completed_date = datetime.utcnow()
            return True
        return False

    def __repr__(self):
        return f'<UserAchievement {self.achievement_name} for user {self.user_id}>'


# ===================================
# USER AVATAR MODEL
# ===================================
class UserAvatar(db.Model):
    """Stores user avatar configurations."""
    __tablename__ = 'user_avatars'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    avatar_style = db.Column(db.String(50), nullable=False)
    avatar_seed = db.Column(db.String(255), nullable=False)
    avatar_options = db.Column(db.Text, nullable=False)
    is_current = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'style': self.avatar_style,
            'seed': self.avatar_seed,
            'options': json.loads(self.avatar_options),
            'is_current': self.is_current,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<UserAvatar {self.avatar_style} for {self.user_id}>'


# ===================================
# UNLOCKED ITEM MODEL (UPDATED)
# ===================================
class UnlockedItem(db.Model):
    """Tracks unlocked customization items."""
    __tablename__ = 'unlocked_items'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    item_catalog_id = db.Column(db.Integer, nullable=True)
    item_category = db.Column(db.String(50), nullable=True)
    item_value = db.Column(db.String(100), nullable=True)
    avatar_style = db.Column(db.String(50), nullable=True)
    unlock_method = db.Column(db.String(50), default='purchase')
    unlocked_at = db.Column(db.DateTime, default=datetime.utcnow)
    unlocked_by = db.Column(db.String(50), nullable=True)
    is_equipped = db.Column(db.Boolean, default=False)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'item_category', 'item_value', 'avatar_style',
                            name='unique_user_unlocked_item'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'item_catalog_id': self.item_catalog_id,
            'category': self.item_category,
            'value': self.item_value,
            'style': self.avatar_style,
            'unlock_method': self.unlock_method,
            'unlocked_at': self.unlocked_at.isoformat(),
            'unlocked_by': self.unlocked_by,
            'is_equipped': self.is_equipped
        }

    def __repr__(self):
        return f'<UnlockedItem {self.item_category}:{self.item_value} for {self.user_id}>'


# ===================================
# ITEM CATALOG MODEL
# ===================================
class ItemCatalog(db.Model):
    """Master catalog of all available items."""
    __tablename__ = 'item_catalog'

    id = db.Column(db.Integer, primary_key=True)
    avatar_style = db.Column(db.String(50), nullable=False)
    item_category = db.Column(db.String(50), nullable=False)
    item_value = db.Column(db.String(100), nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    unlock_level = db.Column(db.Integer, default=1)
    unlock_cost = db.Column(db.Integer, default=0)
    is_default = db.Column(db.Boolean, default=False)
    rarity = db.Column(db.String(20), default='common')

    __table_args__ = (
        db.UniqueConstraint('avatar_style', 'item_category', 'item_value',
                            name='unique_catalog_item'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'style': self.avatar_style,
            'category': self.item_category,
            'value': self.item_value,
            'name': self.item_name,
            'unlock_level': self.unlock_level,
            'unlock_cost': self.unlock_cost,
            'is_default': self.is_default,
            'rarity': self.rarity
        }

    def __repr__(self):
        return f'<ItemCatalog {self.item_name}>'


# ===================================
# SAVED AVATAR PRESET MODEL
# ===================================
class SavedAvatarPreset(db.Model):
    """Saved avatar configurations."""
    __tablename__ = 'saved_avatar_presets'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    preset_name = db.Column(db.String(100), nullable=False)
    avatar_style = db.Column(db.String(50), nullable=False)
    avatar_seed = db.Column(db.String(255), nullable=False)
    avatar_options = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.preset_name,
            'style': self.avatar_style,
            'seed': self.avatar_seed,
            'options': json.loads(self.avatar_options),
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<SavedAvatarPreset {self.preset_name} for {self.user_id}>'


# ===================================
# HELPER FUNCTIONS
# ===================================

def init_user_data(user_id):
    """
    Initialize all necessary data for a new user.
    Call this after creating a new user account.
    """
    # Create UserProgress
    progress = UserProgress(user_id=user_id)
    db.session.add(progress)

    # Create UserGameStats
    game_stats = UserGameStats(user_id=user_id)
    db.session.add(game_stats)

    # Unlock default items
    default_items = ItemCatalog.query.filter_by(is_default=True).all()
    for item in default_items:
        unlocked = UnlockedItem(
            user_id=user_id,
            item_catalog_id=item.id,
            item_category=item.item_category,
            item_value=item.item_value,
            avatar_style=item.avatar_style,
            unlock_method='default',
            unlocked_by='system'
        )
        db.session.add(unlocked)

    progress.items_unlocked = len(default_items)

    # Create default avatar
    default_options = {
        'topType': 'ShortHairShortFlat',
        'hairColor': 'Brown',
        'skinColor': 'Light',
        'clothesType': 'Hoodie',
        'eyeType': 'Default',
        'mouthType': 'Smile'
    }
    avatar = UserAvatar(
        user_id=user_id,
        avatar_style='avataaars',
        avatar_seed=f'{user_id}-default-{int(datetime.utcnow().timestamp())}',
        avatar_options=json.dumps(default_options),
        is_current=True
    )
    db.session.add(avatar)
    progress.create_avatar()

    db.session.commit()

    return {
        'progress': progress,
        'game_stats': game_stats,
        'default_items_unlocked': len(default_items),
        'avatar_created': True
    }


# Legacy helper functions for backwards compatibility
def init_default_items_for_user(user_id):
    """Legacy function - use init_user_data instead."""
    return init_user_data(user_id)


def init_user_progress(user_id):
    """Legacy function - use init_user_data instead."""
    progress = UserProgress(user_id=user_id)
    db.session.add(progress)
    db.session.commit()
    return progress


def create_default_avatar_for_user(user_id, style='avataaars'):
    """Legacy function - use init_user_data instead."""
    default_options = {
        'topType': 'ShortHairShortFlat',
        'hairColor': 'Brown',
        'skinColor': 'Light',
        'clothesType': 'Hoodie',
        'eyeType': 'Default',
        'mouthType': 'Smile'
    }
    avatar = UserAvatar(
        user_id=user_id,
        avatar_style=style,
        avatar_seed=f'{user_id}-default-{int(datetime.utcnow().timestamp())}',
        avatar_options=json.dumps(default_options),
        is_current=True
    )
    db.session.add(avatar)
    db.session.commit()
    return avatar
