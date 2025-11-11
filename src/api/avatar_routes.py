# src/api/avatar_routes.py
"""
PixelPlay Avatar API Routes - UPDATED with Centralized Stat Tracking
Backend endpoints for managing avatars and items using the new system.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json
from api.models import db, User, UserAvatar, UnlockedItem, UserProgress, ItemCatalog, SavedAvatarPreset

# ===================================
# CREATE BLUEPRINTS
# ===================================

avatar_bp = Blueprint('avatar', __name__, url_prefix='/api/avatar')
items_bp = Blueprint('items', __name__, url_prefix='/api/items')
progress_bp = Blueprint('progress', __name__, url_prefix='/api/progress')
presets_bp = Blueprint('presets', __name__, url_prefix='/api/presets')


# ===================================
# 🎨 AVATAR ENDPOINTS
# ===================================

@avatar_bp.route('/current', methods=['GET'])
@jwt_required()
def get_current_avatar():
    """Get user's current avatar configuration."""
    try:
        user_id = get_jwt_identity()
        
        avatar = UserAvatar.query.filter_by(
            user_id=user_id,
            is_current=True
        ).first()
        
        if not avatar:
            return jsonify({
                'success': False,
                'message': 'No avatar found'
            }), 404
        
        return jsonify({
            'success': True,
            'avatar': {
                'style': avatar.avatar_style,
                'seed': avatar.avatar_seed,
                'options': json.loads(avatar.avatar_options)
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching avatar: {e}")
        return jsonify({
            'success': False,
            'message': 'Error fetching avatar'
        }), 500


@avatar_bp.route('/save', methods=['POST'])
@jwt_required()
def save_avatar():
    """
    Save/update user's avatar.
    Uses UserProgress.create_avatar() to track avatar creation.
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        style = data.get('style')
        seed = data.get('seed')
        options = data.get('options')
        
        # Validate input
        if not style or not seed or not options:
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
        
        # Mark all other avatars as not current
        UserAvatar.query.filter_by(user_id=user_id).update({'is_current': False})
        
        # Create new avatar
        new_avatar = UserAvatar(
            user_id=user_id,
            avatar_style=style,
            avatar_seed=seed,
            avatar_options=json.dumps(options),
            is_current=True
        )
        
        db.session.add(new_avatar)
        
        # 🎨 Update progress using centralized tracking
        progress = UserProgress.query.filter_by(user_id=user_id).first()
        if not progress:
            progress = UserProgress(user_id=user_id)
            db.session.add(progress)
        
        progress.create_avatar()  # Uses the helper method!
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '✅ Avatar saved successfully!',
            'avatar_id': new_avatar.id,
            'avatars_created': progress.avatars_created
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error saving avatar: {e}")
        return jsonify({
            'success': False,
            'message': 'Error saving avatar'
        }), 500


@avatar_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_avatar():
    """Update current avatar options."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        options = data.get('options')
        
        if not options:
            return jsonify({
                'success': False,
                'message': 'Missing options'
            }), 400
        
        avatar = UserAvatar.query.filter_by(
            user_id=user_id,
            is_current=True
        ).first()
        
        if not avatar:
            return jsonify({
                'success': False,
                'message': 'No current avatar found'
            }), 404
        
        avatar.avatar_options = json.dumps(options)
        avatar.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Avatar updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating avatar: {e}")
        return jsonify({
            'success': False,
            'message': 'Error updating avatar'
        }), 500


@avatar_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_avatars():
    """Get all avatars created by the user."""
    try:
        user_id = get_jwt_identity()
        
        avatars = UserAvatar.query.filter_by(
            user_id=user_id
        ).order_by(UserAvatar.created_at.desc()).all()
        
        formatted = [{
            'id': avatar.id,
            'style': avatar.avatar_style,
            'seed': avatar.avatar_seed,
            'options': json.loads(avatar.avatar_options),
            'is_current': avatar.is_current,
            'created_at': avatar.created_at.isoformat()
        } for avatar in avatars]
        
        return jsonify({
            'success': True,
            'avatars': formatted,
            'total': len(formatted)
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching avatars: {e}")
        return jsonify({
            'success': False,
            'message': 'Error fetching avatars'
        }), 500


# ===================================
# 📦 ITEMS ENDPOINTS
# ===================================

@items_bp.route('/unlocked', methods=['GET'])
@jwt_required()
def get_unlocked_items():
    """Get all items user has unlocked."""
    try:
        user_id = get_jwt_identity()
        style = request.args.get('style')
        
        query = UnlockedItem.query.filter_by(user_id=user_id)
        
        if style:
            query = query.filter_by(avatar_style=style)
        
        items = query.all()
        
        # Organize items by category
        organized = {}
        for item in items:
            if item.item_category not in organized:
                organized[item.item_category] = []
            
            # Get item details from catalog
            catalog_item = ItemCatalog.query.filter_by(
                avatar_style=item.avatar_style,
                item_category=item.item_category,
                item_value=item.item_value
            ).first()
            
            organized[item.item_category].append({
                'value': item.item_value,
                'name': catalog_item.item_name if catalog_item else item.item_value,
                'rarity': catalog_item.rarity if catalog_item else 'common',
                'unlocked_at': item.unlocked_at.isoformat(),
                'is_equipped': item.is_equipped
            })
        
        return jsonify({
            'success': True,
            'items': organized,
            'total_items': len(items)
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching unlocked items: {e}")
        return jsonify({
            'success': False,
            'message': 'Error fetching items'
        }), 500


@items_bp.route('/unlock', methods=['POST'])
@jwt_required()
def unlock_item():
    """
    Unlock a new item for user.
    Uses UserProgress.unlock_item() to track unlocked items.
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        data = request.get_json()
        
        style = data.get('style')
        category = data.get('category')
        value = data.get('value')
        unlock_method = data.get('unlockMethod', 'purchase')
        cost = data.get('cost', 0)
        
        # Validate input
        if not all([style, category, value]):
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
        
        # Check if item exists in catalog
        catalog_item = ItemCatalog.query.filter_by(
            avatar_style=style,
            item_category=category,
            item_value=value
        ).first()
        
        if not catalog_item:
            return jsonify({
                'success': False,
                'message': 'Item not found in catalog'
            }), 404
        
        # Check if already unlocked
        existing = UnlockedItem.query.filter_by(
            user_id=user_id,
            avatar_style=style,
            item_category=category,
            item_value=value
        ).first()
        
        if existing:
            return jsonify({
                'success': False,
                'message': 'Item already unlocked'
            }), 400
        
        # If purchasing, check coins and deduct
        if unlock_method == 'purchase' and cost > 0:
            if not user.can_afford(cost):
                return jsonify({
                    'success': False,
                    'message': f'Not enough coins. Need {cost}, have {user.coins}'
                }), 403
            
            user.spend_coins(cost)
        
        # Unlock the item
        new_item = UnlockedItem(
            user_id=user_id,
            item_catalog_id=catalog_item.id,
            avatar_style=style,
            item_category=category,
            item_value=value,
            unlock_method=unlock_method
        )
        
        db.session.add(new_item)
        
        # 📦 Track unlocked item count using centralized system
        progress = user.progress or UserProgress(user_id=user_id)
        if not progress.user_id:
            db.session.add(progress)
        
        progress.unlock_item()  # Uses the helper method!
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '✅ Item unlocked successfully!',
            'item': {
                'style': style,
                'category': category,
                'value': value,
                'name': catalog_item.item_name
            },
            'items_unlocked': progress.items_unlocked,
            'remaining_coins': user.coins
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error unlocking item: {e}")
        return jsonify({
            'success': False,
            'message': 'Error unlocking item'
        }), 500


@items_bp.route('/catalog', methods=['GET'])
@jwt_required()
def get_item_catalog():
    """Get available items from catalog based on user level."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        style = request.args.get('style')
        
        # Build query
        query = ItemCatalog.query.filter(
            ItemCatalog.unlock_level <= user.level  # Using User.level!
        )
        
        if style:
            query = query.filter_by(avatar_style=style)
        
        catalog_items = query.order_by(
            ItemCatalog.unlock_level,
            ItemCatalog.rarity,
            ItemCatalog.item_name
        ).all()
        
        # Get unlocked items
        unlocked = UnlockedItem.query.filter_by(user_id=user_id).all()
        unlocked_set = {
            (item.avatar_style, item.item_category, item.item_value)
            for item in unlocked
        }
        
        # Format response
        items = [{
            'id': item.id,
            'style': item.avatar_style,
            'category': item.item_category,
            'value': item.item_value,
            'name': item.item_name,
            'unlock_level': item.unlock_level,
            'unlock_cost': item.unlock_cost,
            'rarity': item.rarity,
            'is_default': bool(item.is_default),
            'is_unlocked': (item.avatar_style, item.item_category, item.item_value) in unlocked_set
        } for item in catalog_items]
        
        return jsonify({
            'success': True,
            'items': items,
            'user_level': user.level,
            'user_coins': user.coins
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching catalog: {e}")
        return jsonify({
            'success': False,
            'message': 'Error fetching catalog'
        }), 500


# ===================================
# 📊 PROGRESS ENDPOINTS
# ===================================

@progress_bp.route('/', methods=['GET'])
@jwt_required()
def get_progress():
    """
    Get user's progress and stats.
    Returns data from User and UserProgress models.
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        progress = user.progress or UserProgress(user_id=user_id)
        
        return jsonify({
            'success': True,
            'progress': {
                # From User model (PRIMARY SOURCE)
                'level': user.level,
                'xp': user.xp,
                'coins': user.coins,
                'streak_days': user.streak_days,
                
                # From UserProgress model
                'avatars_created': progress.avatars_created,
                'items_unlocked': progress.items_unlocked,
                'workouts_completed': progress.workouts_completed,
                'total_games_played': progress.total_games_played,
                
                # Daily rewards
                'can_claim_daily_reward': progress.can_claim_daily_reward(),
                'daily_reward_streak': progress.daily_reward_streak
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching progress: {e}")
        return jsonify({
            'success': False,
            'message': 'Error fetching progress'
        }), 500


@progress_bp.route('/points', methods=['POST'])
@jwt_required()
def add_points():
    """
    Add XP to user (alternative endpoint).
    Uses User.add_xp() from the centralized system.
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        data = request.get_json()
        
        points = data.get('points')
        reason = data.get('reason', 'manual_reward')
        
        if not points or points <= 0:
            return jsonify({
                'success': False,
                'message': 'Invalid points value'
            }), 400
        
        # 🎯 Use centralized XP system
        leveled_up, new_level, coins_earned = user.add_xp(points, source=reason)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Points added successfully',
            'xp_added': points,
            'total_xp': user.xp,
            'leveled_up': leveled_up,
            'new_level': new_level,
            'coins_earned': coins_earned,
            'total_coins': user.coins
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error adding points: {e}")
        return jsonify({
            'success': False,
            'message': 'Error adding points'
        }), 500


@progress_bp.route('/daily-reward', methods=['POST'])
@jwt_required()
def claim_daily_reward():
    """
    Claim daily reward.
    Uses UserProgress.claim_daily_reward() from the centralized system.
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
            'message': 'Error claiming daily reward'
        }), 500


# ===================================
# 💾 PRESETS ENDPOINTS
# ===================================

@presets_bp.route('/', methods=['GET'])
@jwt_required()
def get_presets():
    """Get user's saved avatar presets."""
    try:
        user_id = get_jwt_identity()
        
        presets = SavedAvatarPreset.query.filter_by(
            user_id=user_id
        ).order_by(SavedAvatarPreset.created_at.desc()).all()
        
        formatted = [{
            'id': preset.id,
            'name': preset.preset_name,
            'style': preset.avatar_style,
            'seed': preset.avatar_seed,
            'options': json.loads(preset.avatar_options),
            'created_at': preset.created_at.isoformat()
        } for preset in presets]
        
        return jsonify({
            'success': True,
            'presets': formatted
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching presets: {e}")
        return jsonify({
            'success': False,
            'message': 'Error fetching presets'
        }), 500


@presets_bp.route('/save', methods=['POST'])
@jwt_required()
def save_preset():
    """Save a new avatar preset."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        name = data.get('name')
        style = data.get('style')
        seed = data.get('seed')
        options = data.get('options')
        
        if not all([name, style, seed, options]):
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
        
        preset = SavedAvatarPreset(
            user_id=user_id,
            preset_name=name,
            avatar_style=style,
            avatar_seed=seed,
            avatar_options=json.dumps(options)
        )
        
        db.session.add(preset)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '💾 Preset saved successfully',
            'preset_id': preset.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error saving preset: {e}")
        return jsonify({
            'success': False,
            'message': 'Error saving preset'
        }), 500


@presets_bp.route('/<int:preset_id>', methods=['DELETE'])
@jwt_required()
def delete_preset(preset_id):
    """Delete a saved preset."""
    try:
        user_id = get_jwt_identity()
        
        preset = SavedAvatarPreset.query.filter_by(
            id=preset_id,
            user_id=user_id
        ).first()
        
        if not preset:
            return jsonify({
                'success': False,
                'message': 'Preset not found'
            }), 404
        
        db.session.delete(preset)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Preset deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting preset: {e}")
        return jsonify({
            'success': False,
            'message': 'Error deleting preset'
        }), 500