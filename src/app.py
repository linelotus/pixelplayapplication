"""
🎮 PixelPlay Fitness App - Main Application File

Think of this file as the CONTROL CENTER of your app!
It's like the main office at an amusement park that:
- Opens the gates (starts the server)
- Checks tickets (authentication)
- Gives directions (routes)
- Makes sure everything is safe (CORS, security)
"""

import os
from datetime import timedelta
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Import database
from api.models import db

# Import custom modules
from api.utils import APIException, generate_sitemap
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from api.auth import auth, init_oauth

# Import all blueprints (different sections of your app)
from api.game_routes import game_bp
from api.achievement_routes import achievement_bp
from api.inventory_routes import inventory_bp
from api.avatar_routes import avatar_bp, items_bp, progress_bp, presets_bp


# ===============================
# 🔧 CONFIGURATION
# ===============================

# Are we in development (testing) or production (live)?
ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"

# Where are our frontend files stored?
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')


# ===============================
# 🏗️ APPLICATION FACTORY
# ===============================

def create_app():
    """
    🏭 This creates and sets up the Flask application
    Like building a house: foundation, walls, roof, furniture!
    """

    # ===============================
    # 🏠 CREATE FLASK APP (The Foundation)
    # ===============================

    app = Flask(__name__)
    app.url_map.strict_slashes = False

    # 🔑 Secret key for keeping sessions safe
    app.config['SECRET_KEY'] = os.getenv(
        'SECRET_KEY', 'change-this-in-production')

    # ===============================
    # 🌐 CORS SETUP (The Security Guard)
    # ===============================
    # CORS decides: "Who is allowed to talk to my backend?"

    print("\n" + "=" * 70)
    print("🔍 SETTING UP CORS (Security Guard)")
    print("=" * 70)

    # Get Codespaces information from environment
    CODESPACE_NAME = os.getenv('CODESPACE_NAME', '')
    GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN = os.getenv(
        'GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN', 'app.github.dev')

    # 📋 Build list of allowed origins (websites that can talk to us)
    allowed_origins = [
        # Local development URLs
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ]

    # 🌐 Add GitHub Codespaces URLs if running in Codespaces
    if CODESPACE_NAME:
        print(f"📡 GitHub Codespaces detected: {CODESPACE_NAME}")
        
        # GitHub Codespaces URL format: https://CODESPACE_NAME-PORT.DOMAIN
        codespace_origins = [
            # Frontend URLs (port 3000)
            f"https://{CODESPACE_NAME}-3000.{GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}",
            # Backend URLs (port 3001) 
            f"https://{CODESPACE_NAME}-3001.{GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}",
            # Vite dev server (port 5173)
            f"https://{CODESPACE_NAME}-5173.{GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}",
            # Alternative format with port at the end (just in case)
            f"https://{CODESPACE_NAME}.{GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}",
        ]
        allowed_origins.extend(codespace_origins)
        
        print("\n✅ Codespaces URLs added:")
        for origin in codespace_origins:
            print(f"   • {origin}")
    else:
        print("💻 Running on local machine (no Codespaces detected)")

    # ===============================
    # 🔧 FORCE ADD: Your Specific Frontend URL
    # ===============================
    # This is a backup in case automatic detection fails
    
    # ⚠️ CRITICAL FIX: Use the CORRECT URL format!
    # ❌ WRONG: "https://name.app.github.dev:3000" (port with colon at end)
    # ✅ RIGHT: "https://name-3000.app.github.dev" (port with dash in middle)
    
    specific_frontend_urls = [
        "https://stunning-palm-tree-g4p7v5x9wwqj2wqvr-3000.app.github.dev",  # ✅ Correct format!
        "https://stunning-palm-tree-g4p7v5x9wwqj2wqvr-5173.app.github.dev",  # Vite dev server
    ]
    
    for url in specific_frontend_urls:
        if url not in allowed_origins:
            allowed_origins.append(url)
            print(f"\n🔧 Force-added specific URL: {url}")

    # ===============================
    # 📊 DEBUG: Show all allowed origins
    # ===============================
    print("\n" + "=" * 70)
    print(f"📋 ALL ALLOWED ORIGINS ({len(allowed_origins)} total):")
    print("=" * 70)
    for i, origin in enumerate(allowed_origins, 1):
        print(f"   {i:2d}. {origin}")
    print("=" * 70 + "\n")

    # ===============================
    # 🛡️ Configure CORS - Let the frontend talk to us!
    # ===============================
    CORS(app,
         resources={
             r"/*": {  # Apply to ALL routes
                 "origins": allowed_origins,
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                 "allow_headers": [
                     "Content-Type", 
                     "Authorization", 
                     "Accept", 
                     "X-Requested-With",
                     "X-CSRF-Token"
                 ],
                 "supports_credentials": True,
                 "expose_headers": ["Content-Type", "Authorization"],
                 "max_age": 3600,  # Cache preflight requests for 1 hour
                 "send_wildcard": False,
                 "always_send": True
             }
         },
         supports_credentials=True)

    print("✅ CORS Configuration Applied:")
    print(f"   • Environment: {ENV}")
    print(f"   • Pattern: ALL routes (/*)")
    print(f"   • Allowed origins: {len(allowed_origins)} URLs")
    print(f"   • Credentials: Enabled")
    print(f"   • Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH")
    print("")

    # ===============================
    # 🗄️ DATABASE CONFIGURATION
    # ===============================

    # Get database URL from environment variable
    db_url = os.getenv("DATABASE_URL")

    if db_url:
        # Fix for Heroku/Railway postgres URL
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://")
        app.config['SQLALCHEMY_DATABASE_URI'] = db_url
        print(f"🗄️  Using production database: {db_url[:50]}...")
    else:
        # Use SQLite for local development
        app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///pixelplay.db"
        print("🗄️  Using local SQLite database")

    # Don't track modifications (saves memory)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # ===============================
    # 🎫 JWT CONFIGURATION (Login Tokens)
    # ===============================
    # JWT = JSON Web Tokens (like digital tickets for entry!)

    app.config['JWT_SECRET_KEY'] = os.getenv(
        'JWT_SECRET_KEY', app.config['SECRET_KEY'])
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)  # Ticket lasts 24 hours
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)  # Backup ticket lasts 30 days

    # ===============================
    # ⚡ INITIALIZE EXTENSIONS
    # ===============================

    # Initialize database
    db.init_app(app)
    print("✅ Database initialized")

    # Initialize database migrations (for updating database structure)
    migrate = Migrate(app, db, compare_type=True)
    print("✅ Database migrations ready")

    # Initialize JWT (for login tokens)
    jwt = JWTManager(app)
    print("✅ JWT authentication configured")

    # Initialize Google OAuth (for "Login with Google")
    with app.app_context():
        init_oauth(app)
        # Create database tables if they don't exist
        db.create_all()
        print("✅ Database tables created/verified")

    # Setup admin panel and custom commands
    setup_admin(app)
    setup_commands(app)
    print("✅ Admin panel and commands ready")

    # ===============================
    # 🗺️ REGISTER BLUEPRINTS (Routes/Pages)
    # ===============================
    # Blueprints are like different sections of an amusement park!

    # Register authentication routes (login/logout area)
    app.register_blueprint(auth, url_prefix='/api/auth')
    print("✅ Authentication routes registered")

    # Register main API routes
    app.register_blueprint(api, url_prefix='/api')
    print("✅ Main API routes registered")

    # Register game-related routes (the fun stuff!)
    app.register_blueprint(game_bp, url_prefix='/api')
    print("✅ Game routes registered")

    # Register achievement routes (badges and rewards!)
    app.register_blueprint(achievement_bp, url_prefix='/api')
    print("✅ Achievement routes registered")

    # Register inventory routes (your items!)
    app.register_blueprint(inventory_bp, url_prefix='/api')
    print("✅ Inventory routes registered")

    # Register avatar-related routes (character customization!)
    app.register_blueprint(avatar_bp)
    app.register_blueprint(items_bp)
    app.register_blueprint(progress_bp)
    app.register_blueprint(presets_bp)
    print("✅ Avatar routes registered")

    # ===============================
    # 🎫 JWT ERROR HANDLERS
    # ===============================
    # What to do when something goes wrong with tickets (tokens)

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        """🕐 What to do when the ticket expires"""
        return jsonify({
            'success': False,
            'message': 'Your session expired. Please login again! ⏰',
            'error': 'token_expired'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        """🎫 What to do when someone has a fake ticket"""
        return jsonify({
            'success': False,
            'message': 'Invalid ticket! Please login again. 🎫',
            'error': 'invalid_token'
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        """🚫 What to do when someone tries to enter without a ticket"""
        return jsonify({
            'success': False,
            'message': 'You need to login first! 🔐',
            'error': 'authorization_required'
        }), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        """❌ What to do when ticket has been canceled"""
        return jsonify({
            'success': False,
            'message': 'Your ticket was canceled. Please login again. ❌',
            'error': 'token_revoked'
        }), 401

    # ===============================
    # ⚠️ ERROR HANDLERS
    # ===============================

    @app.errorhandler(APIException)
    def handle_invalid_usage(error):
        """Handle custom API errors"""
        return jsonify(error.to_dict()), error.status_code

    @app.errorhandler(404)
    def not_found(error):
        """🔍 Handle 404 - Page not found"""
        return jsonify({
            'success': False,
            'message': 'Oops! We could not find that page. 🔍',
            'error': 'not_found'
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        """💥 Handle 500 - Server error"""
        return jsonify({
            'success': False,
            'message': 'Something went wrong! We are fixing it! 🔧',
            'error': 'internal_server_error'
        }), 500

    # ===============================
    # 🏠 MAIN ROUTES
    # ===============================

    @app.route('/')
    def index():
        """
        🏠 Home page:
        - Development: Show all available routes
        - Production: Serve React app or welcome message
        """
        if ENV == "development":
            return generate_sitemap(app)

        # Try to serve the React app
        if os.path.isfile(os.path.join(static_file_dir, 'index.html')):
            return send_from_directory(static_file_dir, 'index.html')
        else:
            return jsonify({
                'message': '🎮 Welcome to PixelPlay Fitness API!',
                'version': '1.0.0',
                'status': 'healthy',
                'endpoints': {
                    'auth': '/api/auth',
                    'games': '/api/gamehub/games',
                    'stats': '/api/users/<id>/stats',
                    'achievements': '/api/achievements',
                    'inventory': '/api/inventory',
                    'avatar': '/api/avatar',
                    'items': '/api/items',
                    'progress': '/api/progress',
                    'presets': '/api/presets',
                    'health': '/api/health'
                }
            })

    @app.route('/api/health', methods=['GET'])
    def health_check():
        """❤️ Health check - Is the API alive and well?"""
        return jsonify({
            'status': 'healthy',
            'message': '✅ PixelPlay API is running great!',
            'environment': ENV,
            'database': 'connected',
            'features': {
                'games': True,
                'achievements': True,
                'inventory': True,
                'avatar': True
            }
        }), 200

    @app.route('/<path:path>', methods=['GET'])
    def serve_any_other_file(path):
        """
        📁 Serve frontend files (React app)
        This lets React Router handle the URLs
        """
        # Don't serve /api/* routes here
        if path.startswith('api/'):
            return jsonify({
                'success': False,
                'message': 'API endpoint not found 🔍',
                'error': 'not_found'
            }), 404

        # Serve static files or React app
        if not os.path.isfile(os.path.join(static_file_dir, path)):
            path = 'index.html'

        if os.path.isfile(os.path.join(static_file_dir, path)):
            response = send_from_directory(static_file_dir, path)
            response.cache_control.max_age = 0
            return response
        else:
            return jsonify({
                'success': False,
                'message': 'File not found 📁',
                'error': 'not_found'
            }), 404

    return app


# ===============================
# 🏭 CREATE APP INSTANCE FOR FLASK CLI
# ===============================

app = create_app()


# ===============================
# 🚀 RUN THE APP
# ===============================

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))

    print("\n" + "=" * 70)
    print("🎮 PixelPlay Fitness App Starting!")
    print("=" * 70)
    print(f"📍 Running on: http://localhost:{PORT}")
    print(f"🔧 Environment: {ENV}")
    print(f"🗄️  Database: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")
    print(f"🔐 Google OAuth: {'✅ Configured' if os.getenv('GOOGLE_CLIENT_ID') else '❌ Not configured'}")
    print("=" * 70)
    print("\n📦 Registered Features:")
    print("   ✅ Authentication")
    print("   ✅ Games & GameHub")
    print("   ✅ Achievements")
    print("   ✅ Inventory")
    print("   ✅ Avatar System")
    print("   ✅ CORS (Frontend can talk to us!)")
    print("=" * 70 + "\n")

    # 🚀 Start the server!
    app.run(host='0.0.0.0', port=PORT, debug=(ENV == "development"))