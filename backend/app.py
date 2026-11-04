"""Flask application factory."""

import logging

from flask import Flask
from flask_cors import CORS

from .config import Config
from .errors import register_error_handlers
from .routes.health import bp as health_bp
from .routes.market import bp as market_bp
from .routes.predict import bp as predict_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    app.json.sort_keys = False

    logging.basicConfig(level=logging.INFO)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": app.config["CORS_ORIGINS"]
            }
        }
    )

    app.register_blueprint(health_bp)
    app.register_blueprint(market_bp)
    app.register_blueprint(predict_bp)

    register_error_handlers(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(
        host=app.config["HOST"],
        port=app.config["PORT"],
        debug=app.config["DEBUG"]
    )
