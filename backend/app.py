# backend/app.py

from flask import Flask, request
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
from backend.views.naver_auth import naver_bp
from backend.views.ai_chat import ai_chat_bp
from backend.views.history_views import history_bp


def create_app():
    load_dotenv()
    app = Flask(__name__)


    @app.after_request
    def after_request(response):
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Authorization,Content-Type'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS,PATCH'
        return response

    @app.before_request
    def before_request():
        if request.method == 'OPTIONS':
            return '', 200


    # SQLAlchemy 설정
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///AI.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("FLASK_SECRET_KEY", "your-secret-key")

    # MongoDB 초기화
    try:
        mongo_uri = os.getenv("MONGO_URI")
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



    # Blueprint 등록
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(notice_bp, url_prefix="/api")
    app.register_blueprint(ai_detail_bp, url_prefix="/api")
    app.register_blueprint(main_bp, url_prefix="/api")
    app.register_blueprint(mypage_bp, url_prefix="/api")
    app.register_blueprint(chatlist_bp, url_prefix="/api")
    app.register_blueprint(ai_chat_bp, url_prefix="/api")
    app.register_blueprint(naver_bp, url_prefix="/api")
    app.register_blueprint(history_bp, url_prefix="/api")

    return app

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
