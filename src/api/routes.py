from flask import request, jsonify, Blueprint
from api.models import db, User
from api.utils import APIException
from flask_cors import CORS

api = Blueprint('api', __name__)
CORS(api)

# Health check endpoint


@api.route('/hello', methods=['GET', 'POST'])
def handle_hello():
    """Simple health check endpoint"""
    response_body = {
        "message": "Avatar API is running",
        "status": "healthy"
    }
    return jsonify(response_body), 200

# User Management Endpoints


@api.route('/users', methods=['GET'])
def get_all_users():
    """Get all users with their avatar data"""
    try:
        users = User.query.all()
        users_data = [user.serialize() for user in users]
        return jsonify(users_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user with avatar data"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/users', methods=['POST'])
def create_user():
    """Create a new user with default avatar settings"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        if 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"error": "User with this email already exists"}), 409

        # Create new user with default avatar settings
        new_user = User(
            email=data['email'],
            password=data['password'],  # In production, hash this password
            is_active=True,
            level=data.get('level', 1),
            avatar_style=data.get('avatar_style', 'pixel-art'),
            avatar_seed=data.get('avatar_seed') or data['email'].split('@')[0],
            avatar_background_color=data.get(
                'avatar_background_color', 'blue'),
            avatar_theme=data.get('avatar_theme', 'superhero'),
            avatar_mood=data.get('avatar_mood', 'happy')
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "User created successfully",
            "user": new_user.serialize()
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Avatar Customization Endpoints


@api.route('/avatar', methods=['PUT'])
def update_avatar():
    """
    Update avatar settings for a user
    Body: {
        "user_id": 1,
        "style": "pixel-art",
        "backgroundColor": "blue",
        "theme": "superhero",
        "mood": "happy"
    }
    """
    try:
        data = request.get_json()
        if not data or 'user_id' not in data:
            return jsonify({"error": "user_id is required"}), 400

        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Validation lists
        allowed_styles = [
            'pixel-art', 'bottts', 'identicon', 'shapes',
            'adventurer', 'big-ears', 'croodles', 'personas', 'miniavs'
        ]
        allowed_colors = [
            'red', 'blue', 'green', 'purple', 'orange',
            'pink', 'yellow', 'black', 'transparent'
        ]
        allowed_themes = [
            'superhero', 'space', 'nature', 'princess', 'ninja', 'pirate'
        ]
        allowed_moods = ['happy', 'sad', 'surprised', 'angry', 'neutral']

        # Update fields with validation
        if 'style' in data:
            if data['style'] in allowed_styles:
                user.avatar_style = data['style']
            else:
                return jsonify({"error": f"Invalid style. Allowed: {allowed_styles}"}), 400

        if 'backgroundColor' in data:
            if data['backgroundColor'] in allowed_colors:
                user.avatar_background_color = data['backgroundColor']
            else:
                return jsonify({"error": f"Invalid backgroundColor. Allowed: {allowed_colors}"}), 400

        if 'theme' in data:
            if data['theme'] in allowed_themes:
                user.avatar_theme = data['theme']
            else:
                return jsonify({"error": f"Invalid theme. Allowed: {allowed_themes}"}), 400

        if 'mood' in data:
            if data['mood'] in allowed_moods:
                user.avatar_mood = data['mood']
            else:
                return jsonify({"error": f"Invalid mood. Allowed: {allowed_moods}"}), 400

        if 'seed' in data:
            user.avatar_seed = data['seed']
        elif not user.avatar_seed:
            user.avatar_seed = user.email.split('@')[0]

        db.session.commit()

        return jsonify({
            "message": "Avatar updated successfully",
            "user": user.serialize()
        }), 200

    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@api.route('/users/<int:user_id>/avatar', methods=['PUT'])
def update_user_avatar(user_id):
    """Alternative endpoint: Update avatar by user ID in URL"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        avatar_data = request.get_json()
        if not avatar_data:
            return jsonify({"error": "No avatar data provided"}), 400

        # Simple update without validation (add validation if needed)
        if 'style' in avatar_data:
            user.avatar_style = avatar_data['style']
        if 'backgroundColor' in avatar_data:
            user.avatar_background_color = avatar_data['backgroundColor']
        if 'theme' in avatar_data:
            user.avatar_theme = avatar_data['theme']
        if 'mood' in avatar_data:
            user.avatar_mood = avatar_data['mood']

        db.session.commit()

        return jsonify({
            "message": "Avatar updated successfully",
            "user": user.serialize()
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Level Management Endpoints


@api.route('/users/<int:user_id>/level-up', methods=['POST'])
def level_up_user(user_id):
    """Increase user's level by 1"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        user.level += 1
        db.session.commit()

        return jsonify({
            "message": f"User leveled up to level {user.level}",
            "user": user.serialize(),
            "newLevel": user.level
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/users/<int:user_id>/level', methods=['PUT'])
def set_user_level(user_id):
    """Set user's level to a specific value"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()
        if not data or 'level' not in data:
            return jsonify({"error": "Level not provided"}), 400

        new_level = data['level']
        if not isinstance(new_level, int) or new_level < 1:
            return jsonify({"error": "Level must be a positive integer"}), 400

        user.level = new_level
        db.session.commit()

        return jsonify({
            "message": f"User level set to {new_level}",
            "user": user.serialize()
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Configuration Endpoints


@api.route('/avatar-styles', methods=['GET'])
def get_avatar_styles():
    """Get all available avatar styles and their level requirements"""
    try:
        styles = {
            'pixel-art': {'name': 'Pixel Art', 'requiredLevel': 1},
            'bottts': {'name': 'Robots', 'requiredLevel': 5},
            'identicon': {'name': 'Geometric', 'requiredLevel': 3},
            'shapes': {'name': 'Abstract', 'requiredLevel': 8},
            'adventurer': {'name': 'Adventurer', 'requiredLevel': 10},
            'big-ears': {'name': 'Big Ears', 'requiredLevel': 12},
            'croodles': {'name': 'Croodles', 'requiredLevel': 15},
            'personas': {'name': 'Personas', 'requiredLevel': 18},
            'miniavs': {'name': 'Mini Avatars', 'requiredLevel': 20}
        }
        return jsonify(styles), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/avatar-themes', methods=['GET'])
def get_avatar_themes():
    """Get all available avatar themes"""
    try:
        themes = {
            'superhero': {'colors': ['red', 'blue', 'yellow'], 'mood': 'happy'},
            'space': {'colors': ['purple', 'blue', 'silver'], 'mood': 'surprised'},
            'nature': {'colors': ['green', 'brown', 'blue'], 'mood': 'happy'},
            'princess': {'colors': ['pink', 'purple', 'gold'], 'mood': 'happy'},
            'ninja': {'colors': ['black', 'gray', 'red'], 'mood': 'neutral'},
            'pirate': {'colors': ['brown', 'red', 'black'], 'mood': 'angry'}
        }
        return jsonify(themes), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Utility Endpoints


@api.route('/users/<int:user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    """Get user statistics and unlocked features"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Calculate unlocked styles based on level
        styles = {
            'pixel-art': 1, 'identicon': 3, 'bottts': 5, 'shapes': 8,
            'adventurer': 10, 'big-ears': 12, 'croodles': 15, 'personas': 18, 'miniavs': 20
        }

        unlocked_styles = [style for style, required_level in styles.items(
        ) if user.level >= required_level]
        next_unlock = next((style for style, required_level in styles.items(
        ) if user.level < required_level), None)

        return jsonify({
            "user": user.serialize(),
            "unlockedStyles": unlocked_styles,
            "nextUnlock": next_unlock,
            "totalStyles": len(styles),
            "unlockedCount": len(unlocked_styles)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
