# src/api/routes.py
"""
Main API routes for PixelPlay application - UPDATED with Centralized Stat Tracking
General endpoints for stats, dashboard, and user data using the new system.
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from api.models import db, User, UserProgress, UserGameStats, GameSession, UserAchievement

# Create main API blueprint
api = Blueprint('api', __name__)


# ===============================
# 🏠 DASHBOARD / HOME ENDPOINTS
# ===============================

@api.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """
    🎯 MAIN DASHBOARD ENDPOINT
    Get all stats for displaying on dashboard/homepage.
    Returns comprehensive data from User, UserProgress, and UserGameStats.
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404

        # Get related stats
        progress = user.progress or UserProgress(user_id=user_id)
        game_stats = user.game_stats or UserGameStats(user_id=user_id)

        # Get recent game sessions
        recent_sessions = GameSession.query.filter_by(user_id=user_id)\
            .order_by(GameSession.played_at.desc())\
            .limit(5)\
            .all()

        return jsonify({
            'success': True,
            'stats': {
                # 👤 User stats (PRIMARY)
                'level': user.level,
                'xp': user.xp,
                'coins': user.coins,
                'streak_days': user.streak_days,
                'last_activity': user.last_activity.isoformat() if user.last_activity else None,
                'last_activity_date': user.last_activity_date.isoformat() if user.last_activity_date else None,

                # 📊 Activity counts
                'total_games_played': progress.total_games_played,
                'workouts_completed': progress.workouts_completed,
                'items_unlocked': progress.items_unlocked,
                'avatars_created': progress.avatars_created,

                # 🎮 Game-specific
                'completed_games': game_stats.completed_games or [],
                'favorite_games': game_stats.favorite_games or [],
                'unlocked_games': game_stats.unlocked_games or [],

                # 🎁 Daily rewards
                'can_claim_daily_reward': progress.can_claim_daily_reward(),
                'daily_reward_streak': progress.daily_reward_streak,

                # 📈 Recent activity
                'recent_sessions': [s.serialize() for s in recent_sessions]
            }
        }), 200

    except Exception as e:
        print(f"❌ Error fetching dashboard stats: {e}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


@api.route('/stats/summary', methods=['GET'])
@jwt_required()
def get_stats_summary():
    """
    Get a quick summary of user stats.
    Useful for displaying in headers/navbars.
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404

        # Use the helper method from User model
        stats = user.get_complete_stats()

        return jsonify({
            'success': True,
            'summary': stats
        }), 200

    except Exception as e:
        print(f"❌ Error fetching summary: {e}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


# ===============================
# 👤 USER PROFILE ENDPOINTS
# ===============================

@api.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user's complete profile."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404

        progress = user.progress or UserProgress(user_id=user_id)

        return jsonify({
            'success': True,
            'profile': {
                # Basic info
                'id': user.id,
                'username': user.username,
                'email': user.email,

                # Stats
                'level': user.level,
                'xp': user.xp,
                'coins': user.coins,
                'streak_days': user.streak_days,

                # Avatar
                'avatar_style': user.avatar_style,
                'avatar_seed': user.avatar_seed,
                'avatar_background_color': user.avatar_background_color,
                'avatar_theme': user.avatar_theme,
                'avatar_mood': user.avatar_mood,

                # Activity
                'workouts_completed': progress.workouts_completed,
                'total_games_played': progress.total_games_played,
                'items_unlocked': progress.items_unlocked,
                'avatars_created': progress.avatars_created,

                # Timestamps
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'last_activity': user.last_activity.isoformat() if user.last_activity else None
            }
        }), 200

    except Exception as e:
        print(f"❌ Error fetching profile: {e}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


@api.route('/profile/update', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile information."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404

        data = request.get_json()

        # Update allowed fields
        if 'username' in data:
            user.username = data['username']
        if 'avatar_style' in data:
            user.avatar_style = data['avatar_style']
        if 'avatar_seed' in data:
            user.avatar_seed = data['avatar_seed']
        if 'avatar_background_color' in data:
            user.avatar_background_color = data['avatar_background_color']
        if 'avatar_theme' in data:
            user.avatar_theme = data['avatar_theme']
        if 'avatar_mood' in data:
            user.avatar_mood = data['avatar_mood']

        user.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'profile': user.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating profile: {e}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


# ===============================
# 📊 LEADERBOARD ENDPOINTS
# ===============================

@api.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """
    Get leaderboard of top users.
    Public endpoint (no auth required).
    """
    try:
        # Get leaderboard type from query params
        leaderboard_type = request.args.get(
            'type', 'level')  # level, xp, streak, games
        limit = request.args.get('limit', 10, type=int)
        limit = min(limit, 100)  # Max 100 users

        # Query based on type
        if leaderboard_type == 'level':
            users = User.query.order_by(
                User.level.desc(), User.xp.desc()).limit(limit).all()
        elif leaderboard_type == 'xp':
            users = User.query.order_by(User.xp.desc()).limit(limit).all()
        elif leaderboard_type == 'streak':
            users = User.query.order_by(
                User.streak_days.desc()).limit(limit).all()
        elif leaderboard_type == 'games':
            # Join with UserProgress to get games played
            users = db.session.query(User).join(UserProgress)\
                .order_by(UserProgress.total_games_played.desc())\
                .limit(limit).all()
        else:
            users = User.query.order_by(User.level.desc()).limit(limit).all()

        # Format leaderboard
        leaderboard = []
        for rank, user in enumerate(users, start=1):
            progress = user.progress or UserProgress(user_id=user.id)
            leaderboard.append({
                'rank': rank,
                'username': user.username or f'User{user.id}',
                'level': user.level,
                'xp': user.xp,
                'streak_days': user.streak_days,
                'total_games_played': progress.total_games_played,
                'workouts_completed': progress.workouts_completed
            })

        return jsonify({
            'success': True,
            'leaderboard': leaderboard,
            'type': leaderboard_type,
            'total_users': len(leaderboard)
        }), 200

    except Exception as e:
        print(f"❌ Error fetching leaderboard: {e}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


# ===============================
# 🎁 REWARDS ENDPOINTS
# ===============================

@api.route('/rewards/daily', methods=['POST'])
@jwt_required()
def claim_daily_reward():
    """
    Claim daily login reward.
    Uses UserProgress.claim_daily_reward() from centralized system.
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        progress = user.progress or UserProgress(user_id=user_id)
        if not progress.user_id:
            db.session.add(progress)

        # 🎁 Use centralized daily reward system
        success, reward_coins, streak = progress.claim_daily_reward()

        if not success:
            return jsonify({
                'success': False,
                'message': 'Daily reward already claimed today'
            }), 400

        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'🎁 Daily reward claimed! +{reward_coins} coins',
            'reward': {
                'coins_earned': reward_coins,
                'daily_streak': streak,
                'total_coins': user.coins
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error claiming reward: {e}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


@api.route('/rewards/status', methods=['GET'])
@jwt_required()
def get_reward_status():
    """Check if daily reward can be claimed."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        progress = user.progress or UserProgress(user_id=user_id)

        return jsonify({
            'success': True,
            'can_claim': progress.can_claim_daily_reward(),
            'daily_streak': progress.daily_reward_streak,
            'last_claimed': progress.last_daily_reward.isoformat() if progress.last_daily_reward else None
        }), 200

    except Exception as e:
        print(f"❌ Error checking reward status: {e}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


# ===============================
# 📈 ANALYTICS ENDPOINTS
# ===============================

@api.route('/analytics/activity', methods=['GET'])
@jwt_required()
def get_activity_analytics():
    """Get user activity analytics."""
    try:
        user_id = get_jwt_identity()

        # Get sessions from last 30 days
        from datetime import timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)

        sessions = GameSession.query.filter(
            GameSession.user_id == user_id,
            GameSession.played_at >= thirty_days_ago
        ).order_by(GameSession.played_at.desc()).all()

        # Calculate stats
        total_sessions = len(sessions)
        total_xp = sum(s.xp_earned for s in sessions)
        total_minutes = sum(s.duration_minutes for s in sessions)
        avg_score = sum(s.score for s in sessions) / \
            total_sessions if total_sessions > 0 else 0

        # Group by date
        activity_by_date = {}
        for session in sessions:
            date_key = session.played_at.date().isoformat()
            if date_key not in activity_by_date:
                activity_by_date[date_key] = {
                    'sessions': 0,
                    'xp_earned': 0,
                    'minutes_played': 0
                }
            activity_by_date[date_key]['sessions'] += 1
            activity_by_date[date_key]['xp_earned'] += session.xp_earned
            activity_by_date[date_key]['minutes_played'] += session.duration_minutes

        return jsonify({
            'success': True,
            'analytics': {
                'total_sessions': total_sessions,
                'total_xp_earned': total_xp,
                'total_minutes_played': total_minutes,
                'average_score': round(avg_score, 2),
                'activity_by_date': activity_by_date
            }
        }), 200

    except Exception as e:
        print(f"❌ Error fetching analytics: {e}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


# ===============================
# ❤️ HEALTH CHECK
# ===============================

@api.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint - tells you if the API is working."""
    try:
        # Test database connection
        db.session.execute('SELECT 1')

        return jsonify({
            'status': 'healthy',
            'message': 'PixelPlay API is running!',
            'timestamp': datetime.utcnow().isoformat(),
            'features': {
                'games': True,
                'achievements': True,
                'inventory': True,
                'avatar': True,
                'stats_tracking': True
            }
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'message': f'Error: {str(e)}'
        }), 500


# ===============================
# 🔍 SEARCH / DISCOVERY
# ===============================

@api.route('/search/users', methods=['GET'])
@jwt_required()
def search_users():
    """Search for users by username."""
    try:
        query = request.args.get('q', '')
        limit = request.args.get('limit', 10, type=int)

        if not query or len(query) < 2:
            return jsonify({
                'success': False,
                'message': 'Query must be at least 2 characters'
            }), 400

        # Search users
        users = User.query.filter(
            User.username.ilike(f'%{query}%')
        ).limit(limit).all()

        results = [{
            'id': user.id,
            'username': user.username,
            'level': user.level,
            'avatar_seed': user.avatar_seed,
            'avatar_style': user.avatar_style
        } for user in users]

        return jsonify({
            'success': True,
            'results': results,
            'total': len(results)
        }), 200

    except Exception as e:
        print(f"❌ Error searching users: {e}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


# ===============================
# 📝 NOTES
# ===============================

"""
🎯 USAGE EXAMPLES:

1. Get dashboard stats:
   GET /api/dashboard/stats
   Returns: Complete stats for homepage/dashboard

2. Get quick summary:
   GET /api/stats/summary
   Returns: User stats for navbar/header

3. Get user profile:
   GET /api/profile
   Returns: Complete user profile data

4. Claim daily reward:
   POST /api/rewards/daily
   Returns: Coins earned + streak info

5. View leaderboard:
   GET /api/leaderboard?type=level&limit=10
   Returns: Top 10 users by level

6. Get activity analytics:
   GET /api/analytics/activity
   Returns: 30-day activity breakdown

All endpoints use the centralized stat tracking system from models_updated.py
"""
