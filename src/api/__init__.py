import os
import secrets
from flask import Flask


def create_app(config_object=None):
    app = Flask(__name__, instance_relative_config=True)

    # Default secret key for development:
    app.config.from_mapping(SECRET_KEY="dev")

    # Override from instance config file (instance/config.py)
    app.config.from_pyfile("config.py", silent=True)

    # Override from environment variable if present:
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", app.config["SECRET_KEY"])

    #  Ensure the instance folder exists (for instance configs, DB, etc.)
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError:
        pass

    # Register blueprints after config is set
    from .routes import routes
    from .auth import auth
    app.register_blueprint(routes, url_prefix="/")
    app.register_blueprint(auth, url_prefix="/")

    return app

