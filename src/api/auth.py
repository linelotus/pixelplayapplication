"""
🔐 Authentication Blueprint - The Security Checkpoint!

Think of this like the entrance gate at an amusement park:
- 🎫 Check tickets (login tokens)
- 📝 Create new accounts (registration)
- 🚪 Let people in or out (login/logout)
- 🔄 Give fresh tickets when old ones expire (token refresh)
- 🔑 Handle "Login with Google" (OAuth)
"""

import os
from datetime import datetime
from flask import Blueprint, request, jsonify, redirect, url_for, current_app
from flask_jwt_extended import (
    jwt_required, create_access_token,
    get_jwt_identity, create_refresh_token, get_jwt
)
from authlib.integrations.flask_client import OAuth
from api.models import db, User

# Create authentication blueprint (a section of the app)
auth = Blueprint('auth', __name__)

# OAuth setup (for "Login with Google")
oauth = OAuth()

# Token blacklist (canceled tickets go here)
blacklisted_tokens = set()


def init_oauth(app):
    """
    🔑 Initialize OAuth (Google Login)
    This sets up the "Login with Google" button
    """
    oauth.init_app(app)

    # Get Google credentials from environment variables
    client_id = os.getenv('GOOGLE_CLIENT_ID')
    client_secret = os.getenv('GOOGLE_CLIENT_SECRET')

    if not client_id or not client_secret:
        print("⚠️ WARNING: Google OAuth credentials not found")
        print("   The 'Login with Google' button won't work!")
        return None

    print(f"🔐 Setting up Google OAuth...")
    print(f"   Client ID: {client_id[:20]}...")

    # Register Google as an OAuth provider
    google = oauth.register(
        name='google',
        client_id=client_id,
        client_secret=client_secret,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile'
        }
    )

    print("✅ Google OAuth ready to go!")
    return google


# ===============================
# 📝 TRADITIONAL AUTHENTICATION
# ===============================

@auth.route('/register', methods=['POST'])
def register():
    """
    📝 Create a new account with email and password
    Like signing up for a library card!
    """
    try:
        data = request.get_json()

        # Check if email and password were provided
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email and password are required! 📧'
            }), 400

        email = data['email'].lower().strip()
        password = data['password']

        # ✅ Validate email format
        if '@' not in email or '.' not in email:
            return jsonify({
                'success': False,
                'message': 'Invalid email format! Please use a real email. 📧'
            }), 400

        # ✅ Validate password strength
        if len(password) < 8:
            return jsonify({
                'success': False,
                'message': 'Password must be at least 8 characters long! 🔒'
            }), 400

        # ❌ Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({
                'success': False,
                'message': 'Email already registered! Try logging in instead. 👤'
            }), 409

        # ✅ Create new user
        print(f"📝 Creating new account for: {email}")
        new_user = User(email=email, password=password)
        new_user.level = 1
        new_user.xp = 0
        new_user.coins = 100  # Starting bonus!
        new_user.is_active = True

        db.session.add(new_user)
        db.session.commit()

        # 🎫 Create login tokens (tickets)
        access_token = create_access_token(identity=new_user.id)
        refresh_token = create_refresh_token(identity=new_user.id)

        print(f"✅ Account created successfully!")

        return jsonify({
            'success': True,
            'message': 'Welcome to PixelPlay! 🎉',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': new_user.id,
                'email': new_user.email,
                'name': new_user.email.split('@')[0],
                'level': new_user.level,
                'xp': new_user.xp,
                'coins': new_user.coins
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ Registration error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Registration error: {str(e)}'
        }), 500


@auth.route('/login', methods=['POST'])
def login():
    """
    🔐 Login with email and password
    Like showing your ID card at the entrance!
    """
    try:
        data = request.get_json()

        # Check if email and password were provided
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email and password are required! 📧'
            }), 400

        email = data['email'].lower().strip()
        password = data['password']

        print(f"🔐 Login attempt for: {email}")

        # 🔍 Find user in database
        user = User.query.filter_by(email=email).first()

        # ❌ Check if email and password match
        if not user or not user.check_password(password):
            print(f"❌ Invalid credentials for: {email}")
            return jsonify({
                'success': False,
                'message': 'Invalid email or password! 🔒'
            }), 401

        # ❌ Check if account is active
        if not user.is_active:
            print(f"❌ Account disabled: {email}")
            return jsonify({
                'success': False,
                'message': 'This account is disabled. Contact support! 🚫'
            }), 401

        # ✅ Update last activity time
        user.last_activity = datetime.utcnow()
        db.session.commit()

        # 🎫 Create login tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)

        print(f"✅ Login successful for: {email}")

        return jsonify({
            'success': True,
            'message': 'Welcome back! 👋',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.email.split('@')[0],
                'level': user.level,
                'xp': user.xp,
                'coins': user.coins
            }
        }), 200

    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Login error: {str(e)}'
        }), 500


# ===============================
# 🔑 GOOGLE OAUTH
# ===============================

@auth.route('/google-login')
def google_login():
    """
    🔑 Start "Login with Google" process
    Like clicking the "Use Google" button!
    """
    try:
        # Check if Google OAuth is set up
        if not hasattr(oauth, 'google'):
            return jsonify({
                'success': False,
                'message': 'Google login is not configured. 🔧'
            }), 500

        # 🌐 Figure out where Google should send users back to
        codespace_name = os.getenv('CODESPACE_NAME', '')
        
        if codespace_name:
            # Running in GitHub Codespaces
            redirect_uri = f"https://{codespace_name}-3001.app.github.dev/api/auth/google-callback"
        else:
            # Running locally
            redirect_uri = url_for('auth.google_callback', _external=True)

        print(f"🔑 Google OAuth redirect URI: {redirect_uri}")
        print(f"⚠️  Make sure this URI is in your Google Cloud Console!")

        # Send user to Google's login page
        return oauth.google.authorize_redirect(redirect_uri)

    except AttributeError as e:
        print(f"❌ OAuth not initialized: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Google OAuth not set up properly. 🔧'
        }), 500
    except Exception as e:
        print(f"❌ OAuth error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'OAuth error: {str(e)}'
        }), 500


@auth.route('/google-callback')
def google_callback():
    """
    🔄 Handle response from Google
    This is where Google sends users back after they login!
    """
    try:
        print("🔄 Google callback received")

        # Check if OAuth is configured
        if not hasattr(oauth, 'google'):
            raise Exception('Google OAuth not configured')

        # 🎫 Get authentication token from Google
        token = oauth.google.authorize_access_token()
        print(f"✅ Token received from Google")

        # 👤 Get user information from Google
        user_info = token.get('userinfo')
        print(f"👤 User info: {user_info}")

        # Check if we got an email
        if not user_info or not user_info.get('email'):
            print("❌ No email from Google!")
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            return redirect(f"{frontend_url}/login?error=no_email")

        email = user_info.get('email')
        name = user_info.get('name', email.split('@')[0])

        print(f"🔍 Processing login for: {email}")

        # 🔍 Check if user already exists
        user = User.query.filter_by(email=email).first()

        if not user:
            # Create new user
            print(f"📝 Creating new user from Google: {email}")
            user = User(email=email, password=os.urandom(24).hex())
            user.level = 1
            user.xp = 0
            user.coins = 100
            user.is_active = True
            user.avatar_seed = name

            db.session.add(user)
            db.session.commit()
            print(f"✅ New user created!")

        # ✅ Update last activity
        user.last_activity = datetime.utcnow()
        db.session.commit()

        # 🎫 Create JWT tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)

        print(f"✅ Tokens created, sending user to frontend")

        # 🚀 Send user back to frontend with tokens
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        return redirect(f"{frontend_url}/auth/callback?access_token={access_token}&refresh_token={refresh_token}")

    except Exception as e:
        print(f"❌ Google callback error: {str(e)}")
        import traceback
        traceback.print_exc()

        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        return redirect(f"{frontend_url}/login?error={str(e)}")


# ===============================
# 🎫 TOKEN MANAGEMENT
# ===============================

@auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    🔄 Get a fresh token when yours expires
    Like exchanging an old ticket for a new one!
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_active:
            return jsonify({
                'success': False,
                'message': 'User not found or account disabled! 🚫'
            }), 404

        # ✅ Create new token
        new_token = create_access_token(identity=user_id)

        print(f"🔄 Token refreshed for user: {user_id}")

        return jsonify({
            'success': True,
            'access_token': new_token
        }), 200

    except Exception as e:
        print(f"❌ Token refresh error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Token refresh error: {str(e)}'
        }), 500


@auth.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    👋 Logout user and cancel their token
    Like turning in your ticket at the exit!
    """
    try:
        # Get token ID and add to blacklist
        jti = get_jwt()['jti']
        blacklisted_tokens.add(jti)

        print(f"👋 User logged out (token blacklisted)")

        return jsonify({
            'success': True,
            'message': 'Goodbye! Come back soon! 👋'
        }), 200
    except Exception as e:
        print(f"❌ Logout error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Logout error: {str(e)}'
        }), 500


@auth.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    """
    ✅ Check if a token is still valid
    Like checking if your ticket hasn't expired!
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_active:
            return jsonify({
                'success': False,
                'message': 'Invalid token or inactive user! 🚫'
            }), 401

        return jsonify({
            'success': True,
            'valid': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.email.split('@')[0],
                'level': user.level,
                'xp': user.xp,
                'coins': user.coins
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'valid': False,
            'message': str(e)
        }), 401


# ===============================
# 👤 PROFILE MANAGEMENT
# ===============================

@auth.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """
    👤 Get your profile information
    Like looking at your player card!
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found! 🔍'
            }), 404

        return jsonify({
            'success': True,
            'profile': user.serialize()
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


@auth.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    ✏️ Update your profile
    Like customizing your player character!
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found! 🔍'
            }), 404

        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided! 📝'
            }), 400

        # Update avatar-related fields
        avatar_fields = [
            'avatar_style', 
            'avatar_seed', 
            'avatar_background_color',
            'avatar_theme', 
            'avatar_mood'
        ]

        for field in avatar_fields:
            if field in data:
                setattr(user, field, data[field])
                print(f"✏️ Updated {field} for user {user_id}")

        user.updated_at = datetime.utcnow()
        db.session.commit()

        print(f"✅ Profile updated for user: {user_id}")

        return jsonify({
            'success': True,
            'message': 'Profile updated! ✨',
            'profile': user.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Profile update error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


@auth.route('/test-token', methods=['GET'])
@jwt_required()
def test_token():
    """
    🧪 Test if token authentication is working
    For debugging only!
    """
    user_id = get_jwt_identity()
    return jsonify({
        'success': True,
        'message': 'Your token works perfectly! ✅',
        'user_id': user_id
    }), 200


@auth.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """
    🔒 Change your password
    Like getting a new key for your locker!
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found! 🔍'
            }), 404

        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        # Check if both passwords provided
        if not current_password or not new_password:
            return jsonify({
                'success': False,
                'message': 'Both current and new password required! 🔒'
            }), 400

        # Verify current password
        if not user.check_password(current_password):
            return jsonify({
                'success': False,
                'message': 'Current password is wrong! 🔒'
            }), 401

        # Validate new password strength
        if len(new_password) < 8:
            return jsonify({
                'success': False,
                'message': 'New password must be at least 8 characters! 🔒'
            }), 400

        # Update password
        user.set_password(new_password)
        db.session.commit()

        print(f"🔒 Password changed for user: {user_id}")

        return jsonify({
            'success': True,
            'message': 'Password changed successfully! ✅'
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Password change error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500