# src/api/game_routes.py
"""
Game routes for PixelPlay application - UPDATED with Centralized Stat Tracking
Handles ALL game-related functionality using the new stat tracking system.
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta, date
from api.models import db, User, Game, UserGameStats, GameSession, UserProgress

# Create blueprint
game_bp = Blueprint('games', __name__)


# ===============================
# 🎮 COMPLETE GAME SESSION (MAIN METHOD)
# ===============================

@game_bp.route('/api/games/complete-session', methods=['POST'])
@jwt_required()
def complete_game_session():
    """
    🎯 MAIN ENDPOINT: Record a completed game session.
    This automatically updates ALL stats using the centralized tracking system.
    
    Request Body:
        - game_id: Game identifier (e.g., "memory-match")
        - score: Score achieved
        - duration_minutes: Time played
        - completed: Whether game was finished
        - base_xp: Base XP to award (default: 10)
    
    Returns:
        Complete session data + updated user stats
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Extract data
        game_id = data.get('game_id')
        score = data.get('score', 0)
        duration_minutes = data.get('duration_minutes', 0)
        completed = data.get('completed', False)
        base_xp = data.get('base_xp', 10)
        
        if not game_id:
            return jsonify({
                'success': False,
                'message': 'game_id is required'
            }), 400
        
        # Calculate XP (base + bonus based on score)
        bonus_xp = min(score // 10, 50)  # Max 50 bonus XP
        total_xp = base_xp + bonus_xp
        
        # 🎯 USE THE MAGIC METHOD - Updates EVERYTHING automatically!
        result = GameSession.record_session(
            user_id=user_id,
            game_id=game_id,
            score=score,
            duration_minutes=duration_minutes,
            xp_earned=total_xp,
            completed=completed
        )
        
        # Get updated user data
        user = User.query.get(user_id)
        progress = user.progress
        
        return jsonify({
            'success': True,
            'message': '🎮 Game session recorded!',
            'session': result,
            'user_stats': {
                'level': user.level,
                'xp': user.xp,
                'coins': user.coins,
                'streak_days': user.streak_days,
                'total_games_played': progress.total_games_played if progress else 0
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error recording session: {e}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


# ===============================
# USER GAME STATS ENDPOINTS
# ===============================

@game_bp.route('/api/users/<int:user_id>/stats', methods=['GET'])
@jwt_required()
def get_user_stats(user_id):
    """
    Get user's complete game statistics.
    Returns data from User, UserProgress, and UserGameStats models.
    """
    try:
        current_user_id = get_jwt_identity()
        
        if str(current_user_id) != str(user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get or create related stats
        progress = user.progress or UserProgress(user_id=user_id)
        game_stats = user.game_stats or UserGameStats(user_id=user_id)
        
        return jsonify({
            'success': True,
            'stats': {
                # From User model
                'level': user.level,
                'xp': user.xp,
                'coins': user.coins,
                'streak_days': user.streak_days,
                'last_activity': user.last_activity.isoformat() if user.last_activity else None,
                
                # From UserProgress model
                'total_games_played': progress.total_games_played,
                'workouts_completed': progress.workouts_completed,
                
                # From UserGameStats model
                'unlocked_games': game_stats.unlocked_games or [],
                'completed_games': game_stats.completed_games or [],
                'favorite_games': game_stats.favorite_games or []
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching stats: {e}")
        return jsonify({'error': str(e)}), 500


@game_bp.route('/api/users/<int:user_id>/stats/favorite', methods=['POST'])
@jwt_required()
def toggle_favorite_game(user_id):
    """Toggle favorite status for a game."""
    try:
        current_user_id = get_jwt_identity()
        
        if str(current_user_id) != str(user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.json
        game_id = data.get('game_id')
        
        if not game_id:
            return jsonify({'error': 'game_id required'}), 400
        
        # Get or create game stats
        game_stats = UserGameStats.query.filter_by(user_id=user_id).first()
        if not game_stats:
            game_stats = UserGameStats(user_id=user_id)
            db.session.add(game_stats)
        
        # Toggle favorite
        is_favorite = game_stats.toggle_favorite(game_id)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'is_favorite': is_favorite,
            'favorite_games': game_stats.favorite_games
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error toggling favorite: {e}")
        return jsonify({'error': str(e)}), 500


# ===============================
# GAMEHUB ENDPOINTS
# ===============================

@game_bp.route('/api/gamehub/games', methods=['GET'])
@jwt_required()
def get_gamehub_games():
    """
    Get all available games for GameHub with user's progress.
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Game catalog (you can move this to database later)
        available_games = [
            {
                'id': 'memory-match',
                'name': 'Memory Match',
                'description': 'Test your memory!',
                'category': 'Puzzle',
                'icon': '🧠',
                'min_level': 1,
                'xp_reward': '10-50'
            },
            {
                'id': 'word-search',
                'name': 'Word Search',
                'description': 'Find hidden words',
                'category': 'Puzzle',
                'icon': '📝',
                'min_level': 1,
                'xp_reward': '15-40'
            },
            {
                'id': 'ninja',
                'name': 'Ninja Runner',
                'description': 'Jump and dodge!',
                'category': 'Action',
                'icon': '🥷',
                'min_level': 3,
                'xp_reward': '20-60'
            },
            {
                'id': 'rhythm',
                'name': 'Rhythm Master',
                'description': 'Hit the beat!',
                'category': 'Music',
                'icon': '🎵',
                'min_level': 4,
                'xp_reward': '15-45'
            },
            {
                'id': 'magic',
                'name': 'Magic Quest',
                'description': 'Cast spells!',
                'category': 'Adventure',
                'icon': '🔮',
                'min_level': 5,
                'xp_reward': '25-70'
            }
        ]
        
        # Get user's game stats
        game_stats = user.game_stats or UserGameStats(user_id=user_id)
        
        # Get user's individual game records
        user_games = {g.name: g for g in Game.query.filter_by(user_id=user_id).all()}
        
        # Enrich games with user data
        for game in available_games:
            game_id = game['id']
            user_game = user_games.get(game_id)
            
            game['locked'] = user.level < game['min_level']
            game['completed'] = game_id in (game_stats.completed_games or [])
            game['is_favorite'] = game_id in (game_stats.favorite_games or [])
            game['times_played'] = user_game.times_played if user_game else 0
            game['personal_best'] = user_game.personal_best if user_game else 0
            game['last_played'] = user_game.last_played.isoformat() if user_game and user_game.last_played else None
        
        return jsonify({
            'success': True,
            'games': available_games,
            'user_level': user.level
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching games: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@game_bp.route('/api/gamehub/games/<game_id>', methods=['GET'])
@jwt_required()
def get_game_details(game_id):
    """Get detailed information about a specific game."""
    try:
        user_id = get_jwt_identity()
        
        # Get or create game record
        game = Game.query.filter_by(user_id=user_id, name=game_id).first()
        
        if not game:
            game = Game(user_id=user_id, name=game_id)
            db.session.add(game)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'game': game.serialize()
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching game: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@game_bp.route('/api/gamehub/games/<game_id>/play', methods=['POST'])
@jwt_required()
def record_game_play(game_id):
    """
    Alternative endpoint for recording game play.
    Redirects to the main complete_game_session method.
    """
    try:
        user_id = get_jwt_identity()
        data = request.json
        
        score = data.get('score', 0)
        time_played = data.get('time_played', 0)
        completed = data.get('completed', False)
        xp_earned = data.get('xp_earned', 10)
        
        # Use the centralized recording method
        result = GameSession.record_session(
            user_id=user_id,
            game_id=game_id,
            score=score,
            duration_minutes=time_played,
            xp_earned=xp_earned,
            completed=completed
        )
        
        user = User.query.get(user_id)
        
        return jsonify({
            'success': True,
            'message': 'Game session recorded!',
            'result': result,
            'user_stats': {
                'level': user.level,
                'xp': user.xp,
                'coins': user.coins,
                'streak_days': user.streak_days
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error recording play: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@game_bp.route('/api/gamehub/games/<game_id>/favorite', methods=['POST'])
@jwt_required()
def toggle_game_favorite(game_id):
    """Toggle favorite status for a game."""
    try:
        user_id = get_jwt_identity()
        
        # Get or create game stats
        game_stats = UserGameStats.query.filter_by(user_id=user_id).first()
        if not game_stats:
            game_stats = UserGameStats(user_id=user_id)
            db.session.add(game_stats)
        
        # Toggle favorite
        is_favorite = game_stats.toggle_favorite(game_id)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'is_favorite': is_favorite
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error toggling favorite: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


# ===============================
# HABIT TRACKER ENDPOINTS
# ===============================

@game_bp.route('/api/users/<int:user_id>/habits/complete', methods=['POST'])
@jwt_required()
def complete_habit_task(user_id):
    """
    Mark a habit task as complete.
    This counts as a "workout" and updates streak.
    """
    try:
        current_user_id = get_jwt_identity()
        
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.json
        routine_id = data.get('routine_id')
        points_earned = data.get('points_earned', 10)
        
        if not routine_id:
            return jsonify({'error': 'routine_id required'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get or create progress
        progress = user.progress or UserProgress(user_id=user_id)
        if not progress.user_id:
            db.session.add(progress)
        
        # Initialize fields if needed
        if not hasattr(user, 'habit_completed_tasks') or user.habit_completed_tasks is None:
            user.habit_completed_tasks = []
        
        # Check if already completed
        completed_tasks = user.habit_completed_tasks or []
        if routine_id in completed_tasks:
            return jsonify({'error': 'Task already completed'}), 400
        
        # Update completed tasks
        completed_tasks.append(routine_id)
        user.habit_completed_tasks = completed_tasks
        
        # Record as workout (updates XP, level, streak automatically)
        workout_result = progress.record_workout(xp_earned=points_earned)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'workout_result': workout_result,
            'completed_tasks': user.habit_completed_tasks,
            'user_stats': {
                'level': user.level,
                'xp': user.xp,
                'coins': user.coins,
                'streak_days': user.streak_days,
                'workouts_completed': progress.workouts_completed
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error completing habit: {e}")
        return jsonify({'error': str(e)}), 500


@game_bp.route('/api/users/<int:user_id>/habits/stats', methods=['GET'])
@jwt_required()
def get_habit_stats(user_id):
    """Get habit tracker statistics."""
    try:
        current_user_id = get_jwt_identity()
        
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        progress = user.progress or UserProgress(user_id=user_id)
        
        # Check if active today
        today = date.today()
        is_active_today = user.last_activity_date == today if user.last_activity_date else False
        
        return jsonify({
            'success': True,
            'stats': {
                'streak_days': user.streak_days,
                'is_active_today': is_active_today,
                'last_activity_date': user.last_activity_date.isoformat() if user.last_activity_date else None,
                'workouts_completed': progress.workouts_completed,
                'total_games_played': progress.total_games_played,
                'habit_daily_points': user.habit_daily_points or 0,
                'habit_completed_tasks': user.habit_completed_tasks or []
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching habit stats: {e}")
        return jsonify({'error': str(e)}), 500


@game_bp.route('/api/users/<int:user_id>/habits/reset', methods=['POST'])
@jwt_required()
def reset_daily_habits(user_id):
    """Reset daily habit tasks (call this at midnight)."""
    try:
        current_user_id = get_jwt_identity()
        
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Reset daily fields
        user.habit_completed_tasks = []
        user.habit_daily_points = 0
        user.habit_last_reset = date.today().isoformat()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Daily habits reset'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error resetting habits: {e}")
        return jsonify({'error': str(e)}), 500


# ===============================
# RECENT SESSIONS
# ===============================

@game_bp.route('/api/users/<int:user_id>/sessions/recent', methods=['GET'])
@jwt_required()
def get_recent_sessions(user_id):
    """Get recent game sessions for a user."""
    try:
        current_user_id = get_jwt_identity()
        
        if str(current_user_id) != str(user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        limit = request.args.get('limit', 10, type=int)
        
        sessions = GameSession.query.filter_by(user_id=user_id)\
            .order_by(GameSession.played_at.desc())\
            .limit(limit)\
            .all()
        
        return jsonify({
            'success': True,
            'sessions': [s.serialize() for s in sessions]
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching sessions: {e}")
        return jsonify({'error': str(e)}), 500