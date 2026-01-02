# routes/user_routes.py
from flask import Blueprint, jsonify, current_app
from sqlalchemy import func, and_
from backend.models import db, User, UseBox, BasicAI, ChatLog

chatlist_bp = Blueprint('chatlist', __name__)


@chatlist_bp.route('/<int:user_id>/last-chats')
def get_user_last_chats(user_id: int):
    """DB에서 userbox_id 별 마지막 기록 가져오기 """
    last_chat = (
        db.session.query(
            ChatLog.usebox_id.label("usebox_id"),
            func.max(ChatLog.created_at).label("last_created_at"),
        )
        .group_by(ChatLog.usebox_id)
        .subquery()
    )

    q = (
        db.session.query(
            UseBox.use_id,
            BasicAI.ai_name,
            BasicAI.ai_image,
            BasicAI.ai_content,
            ChatLog.question,
            ChatLog.answer,
            ChatLog.created_at,
        )
        .join(User, User.user_id == UseBox.user_id)
        .join(BasicAI, BasicAI.ai_id == UseBox.ai_id)
        .join(
            last_chat,
            last_chat.c.usebox_id == UseBox.use_id,
        )
        .join(
            ChatLog,
            and_(
                ChatLog.usebox_id == last_chat.c.usebox_id,
                ChatLog.created_at == last_chat.c.last_created_at,
            ),
        )
        .filter(User.user_id == user_id)
        .order_by(UseBox.use_start.desc())
    )

    results = []
    for use_id, ai_name, ai_image,ai_content, question, answer, created_at in q.all():
        results.append({
            "use_id": use_id,
            "ai_name": ai_name,
            "ai_image": ai_image,
            "ai_content":ai_content,
            "last_question": question,
            "last_answer": answer,
            "last_created_at": created_at.isoformat() if created_at else None,
        })

    return jsonify({
        "user_id": user_id,
        "total_useboxes": len(results),
        "last_chats": results
    })