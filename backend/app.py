# backend/app.py
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate

from backend.models import db
from backend.views.user import user_bp
from backend.views.custom_ai import custom_ai_bp
from backend.views.basic_ai import ai_bp
from backend.views.comment import comment_bp
from backend.views.notice import notice_bp
from backend.views.pay import pay_bp
from backend.views.review import review_bp
from backend.views.social import social_bp
from backend.views.usebox import usebox_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    # DB 설정
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///AI.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    Migrate(app, db)

    # 블루프린트 등록
    # 각 Blueprint 파일에서 url_prefix="/api"를 안 줬다고 가정하고, 여기서 한 번만 통일
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(social_bp, url_prefix="/api")
    app.register_blueprint(pay_bp, url_prefix="/api")
    app.register_blueprint(ai_bp, url_prefix="/api")
    app.register_blueprint(custom_ai_bp, url_prefix="/api")
    app.register_blueprint(usebox_bp, url_prefix="/api")
    app.register_blueprint(review_bp, url_prefix="/api")
    app.register_blueprint(notice_bp, url_prefix="/api")
    app.register_blueprint(comment_bp, url_prefix="/api")

    return app


app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(port=5000, debug=True)