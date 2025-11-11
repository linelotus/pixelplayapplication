# src/api/inventory_routes.py
"""
PixelPlay Inventory & Achievements API Routes - UPDATED with Centralized Stat Tracking
Backend endpoints for managing inventory items and achievements using the new system.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from datetime import datetime
import json
from api.models import db, User, UserProgress, UnlockedItem, ItemCatalog, UserAchievement

# Create Blueprint
inventory_bp = Blueprint('inventory', __name__)

# ===================================
# 📦 INVENTORY DATA (Catalog)
# ===================================

DEFAULT_ITEMS = [
    {'id': 1, 'name': 'Cool Sunglasses', 'category': 'accessories', 'icon': '🕶️', 'price': 100, 'levelRequired': 1, 'rarity': 'common'},
    {'id': 2, 'name': 'Red Cap', 'category': 'clothing', 'icon': '🧢', 'price': 50, 'levelRequired': 1, 'rarity': 'common'},
    {'id': 3, 'name': 'Blue T-Shirt', 'category': 'clothing', 'icon': '👕', 'price': 75, 'levelRequired': 1, 'rarity': 'common'},
    {'id': 4, 'name': 'Sneakers', 'category': 'clothing', 'icon': '👟', 'price': 150, 'levelRequired': 3, 'rarity': 'rare'},
    {'id': 5, 'name': 'Backpack', 'category': 'accessories', 'icon': '🎒', 'price': 200, 'levelRequired': 5, 'rarity': 'rare'},
    {'id': 6, 'name': 'Watch', 'category': 'accessories', 'icon': '⌚', 'price': 300, 'levelRequired': 7, 'rarity': 'epic'},
    {'id': 7, 'name': 'Hoodie', 'category': 'clothing', 'icon': '🧥', 'price': 125, 'levelRequired': 4, 'rarity': 'rare'},
    {'id': 8, 'name': 'Crown', 'category': 'accessories', 'icon': '👑', 'price': 500, 'levelRequired': 10, 'rarity': 'legendary'},
    {'id': 9, 'name': 'Headphones', 'category': 'accessories', 'icon': '🎧', 'price': 180, 'levelRequired': 6, 'rarity': 'rare'},
    {'id': 10, 'name': 'Gym Bag', 'category': 'accessories', 'icon': '👜', 'price': 220, 'levelRequired': 8, 'rarity': 'epic'}
]


# ===================================
# 📦 PUBLIC INVENTORY ENDPOINTS
# ===================================

@inventory_bp.route('/inventory', methods=['GET'])
def get_inventory():
    """
    Get inventory items - Returns all items with ownership status if logged in.
    NO AUTHENTICATION REQUIRED - Public endpoint.
    """
    try:
        # Try to get user ID if logged in (optional)
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            pass
        
        items = DEFAULT_ITEMS.copy()
        
        # If user is logged in, mark owned items
        if user_id:
            owned_items = UnlockedItem.query.filter_by(user_id=user_id).all()
            owned_ids = {item.item_catalog_id for item in owned_items if hasattr(item, 'item_catalog_id')}
            
            for item in items:
                item['owned'] = item['id'] in owned_ids
                item['equipped'] = False  # TODO: Track equipped status
        else:
            for item in items:
                item['owned'] = False
                item['equipped'] = False
        
        return jsonify({
            'success': True,
            'items': items,
            'total': len(items),
            'authenticated': user_id is not None
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching inventory: {e}")
        return jsonify({
            'success': False,
            'message': 'Error fetching inventory',
            'items': DEFAULT_ITEMS
        }), 500


# ===================================
# 🔐 AUTHENTICATED INVENTORY ENDPOINTS
# ===================================

@inventory_bp.route('/inventory/my-items', methods=['GET'])
@jwt_required()
def get_my_items():
    """Get all items owned by the current user."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        progress = user.progress or UserProgress(user_id=user_id)
        
        # Get owned items
        owned_items = UnlockedItem.query.filter_by(user_id=user_id).all()
        owned_ids = {item.item_catalog_id for item in owned_items}
        
        # Filter for owned items
        my_items = [item for item in DEFAULT_ITEMS if item['id'] in owned_ids]
        
        return jsonify({
            'success': True,
            'items': my_items,
            'total_owned': len(my_items),
            'user_stats': {
                'level': user.level,
                'coins': user.coins,
                'items_unlocked': progress.items_unlocked
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching my items: {e}")
        return jsonify({
            'success': False,
            'message': 'Error fetching your items'
        }), 500


@inventory_bp.route('/inventory/purchase/<int:item_id>', methods=['POST'])
@jwt_required()
def purchase_item(item_id):
    """
    Purchase an item from the shop.
    Uses User.coins and User.spend_coins() from the centralized system.
    """
    try:
        user_id = get_jwt_identity()
        
        # Find the item
        item = next((i for i in DEFAULT_ITEMS if i['id'] == item_id), None)
        if not item:
            return jsonify({
                'success': False,
                'message': 'Item not found'
            }), 404
        
        # Get user and progress
        user = User.query.get(user_id)
        progress = user.progress or UserProgress(user_id=user_id)
        if not progress.user_id:
            db.session.add(progress)
        
        # Check level requirement
        if user.level < item['levelRequired']:
            return jsonify({
                'success': False,
                'message': f"Level {item['levelRequired']} required"
            }), 403
        
        # Check if user has enough coins (using User.coins, not progress.total_points)
        if not user.can_afford(item['price']):
            return jsonify({
                'success': False,
                'message': f"Not enough coins. Need {item['price']}, have {user.coins}"
            }), 403
        
        # Check if already owned
        existing = UnlockedItem.query.filter_by(
            user_id=user_id,
            item_catalog_id=item_id
        ).first()
        
        if existing:
            return jsonify({
                'success': False,
                'message': 'Item already owned'
            }), 400
        
        # 💰 Purchase the item (using centralized coin system)
        if not user.spend_coins(item['price']):
            return jsonify({
                'success': False,
                'message': 'Transaction failed'
            }), 500
        
        # Track unlocked item
        progress.unlock_item()
        
        # Create unlocked item record
        new_item = UnlockedItem(
            user_id=user_id,
            item_catalog_id=item_id,
            unlock_method='purchase'
        )
        
        db.session.add(new_item)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f"✅ Successfully purchased {item['name']}!",
            'remaining_coins': user.coins,
            'items_unlocked': progress.items_unlocked,
            'item': item
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error purchasing item: {e}")
        return jsonify({
            'success': False,
            'message': 'Error purchasing item'
        }), 500


@inventory_bp.route('/inventory/equip/<int:item_id>', methods=['POST'])
@jwt_required()
def equip_item(item_id):
    """Equip an owned item."""
    try:
        user_id = get_jwt_identity()
        
        # Check if user owns the item
        unlocked = UnlockedItem.query.filter_by(
            user_id=user_id,
            item_catalog_id=item_id
        ).first()
        
        if not unlocked:
            return jsonify({
                'success': False,
                'message': 'You do not own this item'
            }), 404
        
        # Update equipped status
        unlocked.is_equipped = not unlocked.is_equipped
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Item equipped' if unlocked.is_equipped else 'Item unequipped',
            'is_equipped': unlocked.is_equipped
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error equipping item: {e}")
        return jsonify({
            'success': False,
            'message': 'Error equipping item'
        }), 500


# ===================================
# 🏆 ACHIEVEMENT ENDPOINTS
# ===================================

@inventory_bp.route('/achievements', methods=['GET'])
def get_achievements():
    """
    Get achievements - Returns user's achievements if logged in, demo otherwise.
    """
    try:
        # Try to get user ID if logged in (optional)
        user_id = None
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            pass
        
        if user_id:
            # Get user's real achievements
            user = User.query.get(user_id)
            progress = user.progress or UserProgress(user_id=user_id)
            achievements = UserAchievement.query.filter_by(user_id=user_id).all()
            
            # Also calculate potential achievements based on stats
            achievement_data = [
                {
                    'id': 'first_workout',
                    'name': 'First Steps',
                    'description': 'Complete your first workout',
                    'icon': '🏃',
                    'progress': min(progress.workouts_completed, 1),
                    'target': 1,
                    'unlocked': progress.workouts_completed >= 1,
                    'reward': 50
                },
                {
                    'id': 'week_warrior',
                    'name': 'Week Warrior',
                    'description': 'Maintain a 7-day streak',
                    'icon': '🔥',
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
                    'progress': min(progress.workouts_completed, 100),
                    'target': 100,
                    'unlocked': progress.workouts_completed >= 100,
                    'reward': 500
                },
                {
                    'id': 'avatar_creator',
                    'name': 'Avatar Creator',
                    'description': 'Create 5 unique avatars',
                    'icon': '🎨',
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
                    'progress': min(progress.items_unlocked, 10),
                    'target': 10,
                    'unlocked': progress.items_unlocked >= 10,
                    'reward': 200
                }
            ]
            
            return jsonify({
                'success': True,
                'achievements': achievement_data,
                'source': 'database',
                'user_authenticated': True
            }), 200
        else:
            # Return demo achievements
            demo_achievements = [
                {'id': 1, 'name': 'First Steps', 'description': 'Complete your first workout', 'icon': '🏃', 'unlocked': True, 'progress': 100},
                {'id': 2, 'name': 'Week Warrior', 'description': 'Work out 7 days in a row', 'icon': '🔥', 'unlocked': True, 'progress': 100},
                {'id': 3, 'name': 'Century Club', 'description': 'Complete 100 workouts', 'icon': '💯', 'unlocked': False, 'progress': 45},
                {'id': 4, 'name': 'Avatar Creator', 'description': 'Customize your avatar', 'icon': '🎨', 'unlocked': True, 'progress': 100},
                {'id': 5, 'name': 'Legend Status', 'description': 'Reach level 10', 'icon': '⭐', 'unlocked': False, 'progress': 30},
                {'id': 6, 'name': 'Fashionista', 'description': 'Collect 10 items', 'icon': '👗', 'unlocked': False, 'progress': 60}
            ]
            
            return jsonify({
                'success': True,
                'achievements': demo_achievements,
                'source': 'demo',
                'user_authenticated': False,
                'message': 'Showing demo data - login to track your achievements'
            }), 200
            
    except Exception as e:
        print(f"❌ Error fetching achievements: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@inventory_bp.route('/achievements/claim/<achievement_id>', methods=['POST'])
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
        
        # Achievement definitions with rewards
        achievements = {
            'first_workout': {'name': 'First Steps', 'reward': 50, 'check': lambda: progress.workouts_completed >= 1},
            'week_warrior': {'name': 'Week Warrior', 'reward': 100, 'check': lambda: user.streak_days >= 7},
            'century_club': {'name': 'Century Club', 'reward': 500, 'check': lambda: progress.workouts_completed >= 100},
            'avatar_creator': {'name': 'Avatar Creator', 'reward': 150, 'check': lambda: progress.avatars_created >= 5},
            'legend_status': {'name': 'Legend Status', 'reward': 1000, 'check': lambda: user.level >= 10},
            'fashionista': {'name': 'Fashionista', 'reward': 200, 'check': lambda: progress.items_unlocked >= 10}
        }
        
        achievement = achievements.get(achievement_id)
        if not achievement:
            return jsonify({
                'success': False,
                'message': 'Achievement not found'
            }), 404
        
        # Check if achievement is completed
        if not achievement['check']():
            return jsonify({
                'success': False,
                'message': 'Achievement not yet completed'
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
            existing.completed_date = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f"🎉 Claimed {reward_coins} coins!",
            'reward_coins': reward_coins,
            'total_coins': user.coins
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error claiming achievement: {e}")
        return jsonify({
            'success': False,
            'message': 'Error claiming achievement'
        }), 500


# ===================================
# 📊 STATS ENDPOINT
# ===================================

@inventory_bp.route('/inventory/stats', methods=['GET'])
@jwt_required()
def get_inventory_stats():
    """Get inventory statistics for the user."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        progress = user.progress or UserProgress(user_id=user_id)
        
        # Count owned items
        owned_count = UnlockedItem.query.filter_by(user_id=user_id).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'level': user.level,
                'xp': user.xp,
                'coins': user.coins,  # Using User.coins, not progress.total_points
                'items_owned': owned_count,
                'items_unlocked': progress.items_unlocked,
                'avatars_created': progress.avatars_created,
                'workouts_completed': progress.workouts_completed,
                'streak_days': user.streak_days
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching stats: {e}")
        return jsonify({
            'success': False,
            'message': 'Error fetching stats'
        }), 500