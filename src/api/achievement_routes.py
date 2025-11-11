# src/api/achievement_routes.py
"""
Achievement routes for PixelPlay application - UPDATED with Centralized Stat Tracking
Handles all achievement-related endpoints using the new system.
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from datetime import datetime
from api.models import db, User, UserAchievement, UserProgress

# Create blueprint
achievement_bp = Blueprint('achievements', __name__)


# ⭐ Helper function to check if user is authenticated (optional)
def get_current_user_optional():
    """Get current user if authenticated, otherwise return None"""
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            return User.query.get(user_id)
        return None
    except:
        return None


# ===============================
# ACHIEVEMENT ENDPOINTS
# ===============================

@achievement_bp.route('/achievements', methods=['GET'])
def get_achievements():
    """
    Get achievements based on user's actual stats.
    - If authenticated: returns user's achievements calculated from their progress
    - If not authenticated: returns demo achievements
    """
    try:
        user = get_current_user_optional()
        
        if user:
            # Get user's progress
            progress = user.progress or UserProgress(user_id=user.id)
            
            # Calculate achievements based on actual stats
            achievements = [
                {
                    'id': 'first_steps',
                    'name': 'First Steps',
                    'description': 'Complete your first workout',
                    'icon': '🏃',
                    'category': 'workouts',
                    'progress': min(progress.workouts_completed, 1),
                    'target': 1,
                    'unlocked': progress.workouts_completed >= 1,
                    'reward': 50
                },
                {
                    'id': 'week_warrior',
                    'name': 'Week Warrior',
                    'description': 'Work out 7 days in a row',
                    'icon': '🔥',
                    'category': 'streak',
                    'progress': min(user.streak_days, 7),
                    'target': 7,
                    'unlocked': user.streak_days >= 7,
                    'reward': 100
                },
                {
                    'id': 'century_club',
                    'name': 'Century Club',
                    'description': 'Complete 100 workouts',
                    'icon': '💯',
                    'category': 'workouts',
                    'progress': min(progress.workouts_completed, 100),
                    'target': 100,
                    'unlocked': progress.workouts_completed >= 100,
                    'reward': 500
                },
                {
                    'id': 'marathon_master',
                    'name': 'Marathon Master',
                    'description': 'Play 50 games total',
                    'icon': '🏅',
                    'category': 'games',
                    'progress': min(progress.total_games_played, 50),
                    'target': 50,
                    'unlocked': progress.total_games_played >= 50,
                    'reward': 300
                },
                {
                    'id': 'strength_supreme',
                    'name': 'Strength Supreme',
                    'description': 'Complete 50 workouts',
                    'icon': '💪',
                    'category': 'workouts',
                    'progress': min(progress.workouts_completed, 50),
                    'target': 50,
                    'unlocked': progress.workouts_completed >= 50,
                    'reward': 250
                },
                {
                    'id': 'avatar_creator',
                    'name': 'Avatar Creator',
                    'description': 'Create 5 unique avatars',
                    'icon': '🎨',
                    'category': 'avatars',
                    'progress': min(progress.avatars_created, 5),
                    'target': 5,
                    'unlocked': progress.avatars_created >= 5,
                    'reward': 150
                },
                {
                    'id': 'legend_status',
                    'name': 'Legend Status',
                    'description': 'Reach level 10',
                    'icon': '⭐',
                    'category': 'level',
                    'progress': min(user.level, 10),
                    'target': 10,
                    'unlocked': user.level >= 10,
                    'reward': 1000
                },
                {
                    'id': 'fashionista',
                    'name': 'Fashionista',
                    'description': 'Unlock 10 items',
                    'icon': '👗',
                    'category': 'items',
                    'progress': min(progress.items_unlocked, 10),
                    'target': 10,
                    'unlocked': progress.items_unlocked >= 10,
                    'reward': 200
                }
            ]
            
            # Get claimed achievements from database
            claimed = UserAchievement.query.filter_by(user_id=user.id).all()
            claimed_names = {ach.achievement_name for ach in claimed if ach.is_completed}
            
            # Mark which ones have been claimed
            for achievement in achievements:
                achievement['claimed'] = achievement['id'] in claimed_names
            
            return jsonify({
                'success': True,
                'achievements': achievements,
                'source': 'database',
                'user_authenticated': True,
                'user_stats': {
                    'level': user.level,
                    'xp': user.xp,
                    'coins': user.coins,
                    'streak_days': user.streak_days,
                    'workouts_completed': progress.workouts_completed,
                    'games_played': progress.total_games_played
                }
            }), 200
        else:
            # Return demo achievements for non-authenticated users
            demo_achievements = [
                {'id': 1, 'name': 'First Steps', 'description': 'Complete your first workout', 'icon': '🏃', 'unlocked': True, 'progress': 100, 'target': 100},
                {'id': 2, 'name': 'Week Warrior', 'description': 'Work out 7 days in a row', 'icon': '🔥', 'unlocked': True, 'progress': 100, 'target': 100},
                {'id': 3, 'name': 'Century Club', 'description': 'Complete 100 workouts', 'icon': '💯', 'unlocked': False, 'progress': 45, 'target': 100},
                {'id': 4, 'name': 'Marathon Master', 'description': 'Play 50 games', 'icon': '🏅', 'unlocked': False, 'progress': 30, 'target': 50},
                {'id': 5, 'name': 'Strength Supreme', 'description': 'Complete 50 strength workouts', 'icon': '💪', 'unlocked': False, 'progress': 30, 'target': 50},
                {'id': 6, 'name': 'Avatar Creator', 'description': 'Customize your avatar', 'icon': '🎨', 'unlocked': True, 'progress': 100, 'target': 100},
                {'id': 7, 'name': 'Legend Status', 'description': 'Reach level 10', 'icon': '⭐', 'unlocked': False, 'progress': 50, 'target': 100},
                {'id': 8, 'name': 'Fashionista', 'description': 'Collect 10 items', 'icon': '👗', 'unlocked': False, 'progress': 60, 'target': 100}
            ]
            
            return jsonify({
                'success': True,
                'achievements': demo_achievements,
                'source': 'demo',
                'user_authenticated': False,
                'message': 'Showing demo data - login to track your achievements'
            }), 200
            
    except Exception as e:
        print(f"❌ Error fetching achievements: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


@achievement_bp.route('/achievements/<achievement_id>', methods=['GET'])
@jwt_required()
def get_achievement(achievement_id):
    """Get a specific achievement with current progress."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        progress = user.progress or UserProgress(user_id=user_id)
        
        # Check if achievement exists in database
        achievement = UserAchievement.query.filter_by(
            user_id=user_id,
            achievement_name=achievement_id
        ).first()
        
        if not achievement:
            return jsonify({
                'success': False,
                'message': 'Achievement not found'
            }), 404
        
        return jsonify({
            'success': True,
            'achievement': achievement.serialize()
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching achievement: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


@achievement_bp.route('/achievements/claim/<achievement_id>', methods=['POST'])
@jwt_required()
def claim_achievement(achievement_id):
    """
    Claim reward for a completed achievement.
    Awards coins using the centralized User.add_coins() method.
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        progress = user.progress or UserProgress(user_id=user_id)
        
        # Achievement definitions with completion checks
        achievements = {
            'first_steps': {
                'name': 'First Steps',
                'reward': 50,
                'check': lambda: progress.workouts_completed >= 1
            },
            'week_warrior': {
                'name': 'Week Warrior',
                'reward': 100,
                'check': lambda: user.streak_days >= 7
            },
            'century_club': {
                'name': 'Century Club',
                'reward': 500,
                'check': lambda: progress.workouts_completed >= 100
            },
            'marathon_master': {
                'name': 'Marathon Master',
                'reward': 300,
                'check': lambda: progress.total_games_played >= 50
            },
            'strength_supreme': {
                'name': 'Strength Supreme',
                'reward': 250,
                'check': lambda: progress.workouts_completed >= 50
            },
            'avatar_creator': {
                'name': 'Avatar Creator',
                'reward': 150,
                'check': lambda: progress.avatars_created >= 5
            },
            'legend_status': {
                'name': 'Legend Status',
                'reward': 1000,
                'check': lambda: user.level >= 10
            },
            'fashionista': {
                'name': 'Fashionista',
                'reward': 200,
                'check': lambda: progress.items_unlocked >= 10
            }
        }
        
        achievement = achievements.get(achievement_id)
        if not achievement:
            return jsonify({
                'success': False,
                'message': 'Achievement not found'
            }), 404
        
        # Check if achievement requirements are met
        if not achievement['check']():
            return jsonify({
                'success': False,
                'message': 'Achievement requirements not yet met'
            }), 400
        
        # Check if already claimed
        existing = UserAchievement.query.filter_by(
            user_id=user_id,
            achievement_name=achievement_id
        ).first()
        
        if existing and existing.is_completed:
            return jsonify({
                'success': False,
                'message': 'Achievement already claimed'
            }), 400
        
        # 💰 Award coins using centralized system
        reward_coins = achievement['reward']
        user.add_coins(reward_coins, source='achievement')
        
        # Create or update achievement record
        if not existing:
            new_achievement = UserAchievement(
                user_id=user_id,
                achievement_name=achievement_id,
                achievement_description=achievement['name'],
                progress=100,
                target=100,
                is_completed=True,
                completed_date=datetime.utcnow()
            )
            db.session.add(new_achievement)
        else:
            existing.is_completed = True
            existing.progress = 100
            existing.completed_date = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f"🎉 Achievement unlocked! +{reward_coins} coins!",
            'achievement': {
                'id': achievement_id,
                'name': achievement['name'],
                'reward': reward_coins
            },
            'user_stats': {
                'coins': user.coins,
                'level': user.level,
                'xp': user.xp
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error claiming achievement: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


@achievement_bp.route('/achievements/unlock', methods=['POST'])
@jwt_required()
def unlock_achievement():
    """
    Manually unlock an achievement (for admin/testing).
    Generally, use claim_achievement instead.
    """
    try:
        user_id = get_jwt_identity()
        data = request.json
        
        achievement_name = data.get('name')
        if not achievement_name:
            return jsonify({
                'success': False,
                'message': 'Achievement name is required'
            }), 400
        
        # Check if already exists
        existing = UserAchievement.query.filter_by(
            user_id=user_id,
            achievement_name=achievement_name
        ).first()
        
        if existing:
            return jsonify({
                'success': False,
                'message': 'Achievement already unlocked'
            }), 400
        
        # Create new achievement
        achievement = UserAchievement(
            user_id=user_id,
            achievement_name=achievement_name,
            achievement_description=data.get('description', ''),
            progress=100,
            target=100,
            is_completed=True,
            completed_date=datetime.utcnow()
        )
        
        db.session.add(achievement)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Achievement unlocked!',
            'achievement': achievement.serialize()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error unlocking achievement: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


@achievement_bp.route('/achievements/<int:achievement_id>/progress', methods=['PUT'])
@jwt_required()
def update_achievement_progress(achievement_id):
    """
    Update progress for an achievement.
    Note: Progress is usually calculated automatically from user stats.
    """
    try:
        user_id = get_jwt_identity()
        data = request.json
        
        achievement = UserAchievement.query.filter_by(
            id=achievement_id,
            user_id=user_id
        ).first()
        
        if not achievement:
            return jsonify({
                'success': False,
                'message': 'Achievement not found'
            }), 404
        
        progress = data.get('progress', 0)
        # Clamp between 0 and target
        achievement.progress = max(0, min(achievement.target, progress))
        
        # Auto-complete if progress reaches target
        if achievement.progress >= achievement.target and not achievement.is_completed:
            achievement.is_completed = True
            achievement.completed_date = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'achievement': achievement.serialize()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating progress: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


@achievement_bp.route('/achievements/stats', methods=['GET'])
@jwt_required()
def get_achievement_stats():
    """Get achievement statistics for the user."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        progress = user.progress or UserProgress(user_id=user_id)
        
        # Count completed achievements
        total_achievements = 8  # Total number of achievements
        completed_achievements = UserAchievement.query.filter_by(
            user_id=user_id,
            is_completed=True
        ).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_achievements': total_achievements,
                'completed': completed_achievements,
                'remaining': total_achievements - completed_achievements,
                'completion_rate': round((completed_achievements / total_achievements) * 100, 1),
                'user_level': user.level,
                'user_coins': user.coins
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching stats: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500