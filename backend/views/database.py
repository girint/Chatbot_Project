import sqlite3
from pymongo import MongoClient
import os
from datetime import datetime # [신규 추가] 시간 저장을 위해 추가

# --- [1] SQL 설정 (기본 정보 관리) ---
def get_sql_conn():
    db_path = os.path.join(os.getcwd(), 'project.db')
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

# --- [2] MongoDB 설정 (긴 보고서 & 대화 전문 저장) ---
def get_mongo_db():
    try:
        # 타임아웃 설정을 추가하여 엔진이 없을 때 서버가 무한 대기하는 것을 방지합니다.
        client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)
        client.admin.command('ping')
        return client['chatbot_master']
    except Exception as e:
        print(f"⚠️ [System] MongoDB 연결 실패: {e}")
        return None

# --- [3] Vector DB 설정 (ChromaDB) ---
def get_vector_collection():
    try:
        import chromadb
        from chromadb.utils import embedding_functions

        # 'vector_storage' 폴더에 데이터를 영구 저장
        client = chromadb.PersistentClient(path="./vector_storage")

        # 임베딩 모델 설정
        ef = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="jhgan/ko-sroberta-multitask"
        )

        return client.get_or_create_collection(name="user_chats", embedding_function=ef)
    except Exception as e:
        # 패키지가 없거나 모델 로드 실패 시 None 반환
        print(f"⚠️ [System] Vector DB 연결 실패 (건너뜀): {e}")
        return None


def save_chat_to_mongo(user_id, category, user_msg, bot_msg):
    """
    사용자의 질문과 봇의 답변을 MongoDB에 카테고리별로 저장합니다.
    """
    db = get_mongo_db()
    if db is None: return

    chat_collection = db['chat_history']

    # 해당 유저의 카테고리별 문서에 대화 내용 추가 ($push)
    chat_collection.update_one(
        {"user_id": user_id, "category": category},
        {
            "$push": {
                "messages": {
                    "$each": [
                        {"role": "user", "content": user_msg, "timestamp": datetime.now()},
                        {"role": "bot", "content": bot_msg, "timestamp": datetime.now()}
                    ]
                }
            }
        },
        upsert=True  # 데이터가 없으면 새로 생성
    )


def get_chat_from_mongo(user_id, category):
    """
    MongoDB에서 특정 유저의 카테고리별 이전 대화 내역을 가져옵니다.
    """
    db = get_mongo_db()
    if db is None: return []

    chat_collection = db['chat_history']
    history = chat_collection.find_one({"user_id": user_id, "category": category})

    if history and "messages" in history:
        return history["messages"]
    return []