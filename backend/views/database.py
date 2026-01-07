import sqlite3
from pymongo import MongoClient
import os
from datetime import datetime
from flask import current_app

# --- [1] SQL 설정 (기본 정보 관리) ---
def get_sql_conn():
    db_path = os.path.join(os.getcwd(), 'project.db')
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

# --- [2] MongoDB 설정 (긴 보고서 & 대화 전문 저장) ---
def get_mongo_db():
    if current_app and hasattr(current_app, 'mongodb') and current_app.mongodb is not None:
        return current_app.mongodb
    print(" [System] MongoDB 연결 없음")
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
        print(f" [System] Vector DB 연결 실패 (건너뜀): {e}")
        return None


def save_chat_to_mongo(user_id, category, user_msg, bot_msg):
    db = get_mongo_db()
    if not db:
        print("[System] MongoDB 저장 스킵")
        return

    chat_collection = db['chat_history']
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
        upsert=True
    )
    print(f" MongoDB 저장: {user_id}/{category}")


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