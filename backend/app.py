# backend/app.py (완전체 - 에러 핸들러 추가)

from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
import os
from dotenv import load_dotenv

# --- [DB 관련 라이브러리 추가] ---
from pymongo import MongoClient
import chromadb
from chromadb.utils import embedding_functions

# --- [기본 Blueprint import] ---
from backend.models import db
from backend.views.user import user_bp
from backend.views.notice import notice_bp
from backend.views.ai_detail import ai_detail_bp
from backend.views.main import main_bp
from backend.views.mypage import mypage_bp
from backend.views.chatlist import chatlist_bp

# --- [챗봇 Blueprint import] ---
from backend.views.Chatbot.wellness_views import bp as wellness_bp
from backend.views.Chatbot.career_views import bp as career_bp
from backend.views.Chatbot.daily_views import bp as daily_bp
from backend.views.Chatbot.finance_views import bp as finance_bp
from backend.views.Chatbot.health_views import bp as health_bp
from backend.views.Chatbot.learning_views import bp as learning_bp
from backend.views.Chatbot.legal_views import bp as legal_bp
from backend.views.Chatbot.tech_views import bp as tech_bp
from backend.views.Chatbot.history_views import bp as history_bp

def create_app():
    load_dotenv()
    app = Flask(__name__)

    # CORS 설정
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:5000"]}}, supports_credentials=True)

    # SQLAlchemy 설정
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///AI.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", "your-secret-key")

    # MongoDB 초기화
    try:
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
        mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        app.mongodb = mongo_client["chatbot_master"]
        mongo_client.server_info()
        print("[SUCCESS] MongoDB Connected: 'chatbot_master'")
    except Exception as e:
        print(f"[ERROR] MongoDB Connection Failed: {e}")
        app.mongodb = None

    # Vector DB 초기화
    try:
        persist_dir = os.path.join(os.getcwd(), "chroma_db")
        chroma_client = chromadb.PersistentClient(path=persist_dir)
        default_ef = embedding_functions.DefaultEmbeddingFunction()
        app.vector_db = chroma_client.get_or_create_collection(
            name="chatbot_history",
            embedding_function=default_ef
        )
        print("[SUCCESS] Vector DB Initialized")
    except Exception as e:
        print(f"[ERROR] Vector DB Failed: {e}")
        app.vector_db = None

    # DB 초기화
    db.init_app(app)
    Migrate(app, db)

    # 🔥 500 에러에도 CORS 헤더 추가 (핵심!)
    @app.errorhandler(500)
    def internal_error(error):
        response = jsonify({'error': 'Internal server error'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Authorization,Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        return response, 500

    # 모든 응답에 CORS 헤더
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Authorization,Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        return response

    # Blueprint 등록
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(notice_bp, url_prefix="/api")
    app.register_blueprint(ai_detail_bp, url_prefix="/api")
    app.register_blueprint(main_bp, url_prefix="/api")
    app.register_blueprint(mypage_bp, url_prefix="/api")
    app.register_blueprint(chatlist_bp, url_prefix="/api")

    app.register_blueprint(wellness_bp)
    app.register_blueprint(career_bp, url_prefix="/api")
    app.register_blueprint(daily_bp, url_prefix="/api")
    app.register_blueprint(finance_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(learning_bp)
    app.register_blueprint(legal_bp)
    app.register_blueprint(tech_bp)
    app.register_blueprint(history_bp)

    return app

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
