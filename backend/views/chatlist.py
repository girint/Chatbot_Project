# chatlist.py (정리 버전 예시)
import os, certifi, httpx
from openai import OpenAI
from flask import Blueprint, jsonify, request
from functools import wraps
from urllib.parse import unquote
from sqlalchemy import func, and_, desc
from datetime import datetime
from backend.models import db, User, UseBox, BasicAI, ChatLog
from datetime import datetime, timezone

bp = Blueprint("ai_chat", __name__)
chatlist_bp = Blueprint('chatlist', __name__)


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "error": "토큰 필요"}), 401

        token = auth_header.split("Bearer ")[1].strip()
        token = unquote(token)

        user = User.query.filter_by(user_nickname=token, user_delete=False).first()
        if not user:
            return jsonify({"success": False, "error": "유저 없음"}), 401

        return f(user=user, *args, **kwargs)
    return decorated

client = None

api_key = os.environ.get("OPENAI_API_KEY")
if api_key:
    client = OpenAI(api_key=api_key, http_client=httpx.Client(verify=certifi.where()))

@bp.route("/ai/<int:ai_id>/ask", methods=["POST"])
@token_required
def ask_by_ai(ai_id: int, user):
    if not client:
        return jsonify({"success": False, "error": "OPENAI_API_KEY not set"}), 500

    data = request.get_json() or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"success": False, "error": "message required"}), 400

    ai = BasicAI.query.get(ai_id)
    if not ai:
        return jsonify({"success": False, "error": "AI not found"}), 404

    # ✅ 핵심: 성격은 ai_prompt를 system으로 사용
    system_prompt = (ai.ai_prompt or "").strip()
    if not system_prompt:
        # 최소 안전장치(없으면 소개글이라도)
        system_prompt = (ai.ai_content or "").strip()

    # ✅ 이 유저가 이 AI를 쓴 UseBox가 없으면 생성
    usebox = UseBox.query.filter_by(user_id=user.user_id, ai_id=ai_id).first()
    if not usebox:
        usebox = UseBox(user_id=user.user_id, ai_id=ai_id)
        db.session.add(usebox)
        db.session.commit()

    # ✅ (선택) 최근 대화 몇 개를 넣으면 품질 좋아짐
    recent = (
        ChatLog.query.filter_by(usebox_id=usebox.use_id)
        .order_by(ChatLog.created_at.desc())
        .limit(6)
        .all()
    )

    messages = [{"role": "system", "content": system_prompt}]
    for log in reversed(recent):
        messages.append({"role": "user", "content": log.question})
        messages.append({"role": "assistant", "content": log.answer})
    messages.append({"role": "user", "content": message})

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.2
        )
        answer = completion.choices[0].message.content.strip()
    except Exception as e:
        return jsonify({"success": False, "error": f"ai_error: {str(e)}"}), 500

    # ✅ 저장
    log = ChatLog(
        usebox_id=usebox.use_id,
        question=message,
        answer=answer,
        created_at=datetime.now(timezone.utc)
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        "success": True,
        "ai_id": ai_id,
        "usebox_id": usebox.use_id,     # 프론트가 저장/방 매핑할 때 쓸 수 있음
        "question": message,
        "answer": answer,
        "created_at": log.created_at.isoformat()
    })

@bp.route("/ai/<int:ai_id>", methods=["GET"])
@token_required
def get_ai(ai_id: int, user):
    ai = BasicAI.query.get(usebox.ai_id)
    system_prompt = (ai.ai_prompt or "").strip() if ai else ""

    if not system_prompt:
        system_prompt = (ai.ai_content or "").strip() if ai else ""

        messages = [
            {"role":"system","content": system_prompt},
            {"role":"user","content": message }
        ]

    if not ai:
        return jsonify({"success": False, "error": "AI not found"}), 404

    return jsonify({
        "success": True,
        "ai": ai.to_dict()
    })


# ------------------ auth ------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization') or request.headers.get('authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': '토큰 필요'}), 401

        token = auth_header.split('Bearer ')[1].strip()
        token = unquote(token)

        user = User.query.filter_by(user_nickname=token, user_delete=False).first()
        if not user:
            return jsonify({'success': False, 'error': '유저 없음'}), 401

        return f(user=user, *args, **kwargs)
    return decorated

# ------------------ openai client ------------------
client = None
api_key = os.environ.get("OPENAI_API_KEY")
if api_key:
    client = OpenAI(api_key=api_key, http_client=httpx.Client(verify=certifi.where()))

# ------------------ last chats ------------------
@chatlist_bp.route('/<int:user_id>/last-chats', methods=['GET'])
def get_user_last_chats(user_id: int):
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
            BasicAI.ai_id,
            BasicAI.ai_name,
            BasicAI.ai_image,
            BasicAI.ai_content,
            ChatLog.question,
            ChatLog.answer,
            ChatLog.created_at,
        )
        .join(User, User.user_id == UseBox.user_id)
        .join(BasicAI, BasicAI.ai_id == UseBox.ai_id)
        .join(last_chat, last_chat.c.usebox_id == UseBox.use_id)
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
    for use_id, ai_id, ai_name, ai_image, ai_content, question, answer, created_at in q.all():
        results.append({
            "use_id": use_id,
            "ai_id":ai_id,
            "ai_name": ai_name,
            "ai_image": ai_image,
            "ai_content": ai_content,
            "last_question": question,
            "last_answer": answer,
            "last_created_at": created_at.isoformat() if created_at else None,
        })

    return jsonify({"user_id": user_id, "total_useboxes": len(results), "last_chats": results})

# ------------------ messages (GET + POST) ------------------
@chatlist_bp.route('/<int:user_id>/chats/<int:usebox_id>/messages', methods=['GET', 'POST'])
@token_required
def usebox_messages(user_id: int, usebox_id: int, user):
    # 권한 체크
    if user.user_id != user_id:
        return jsonify({"success": False, "error": "권한 없음"}), 403

    # GET: 메시지 목록
    if request.method == "GET":
        messages = (
            db.session.query(ChatLog)
            .filter(ChatLog.usebox_id == usebox_id)
            .order_by(ChatLog.created_at.desc())
            .limit(100)
            .all()
        )

        result_messages = []
        for msg in reversed(messages):
            if msg.question:
                result_messages.append({
                    "id": f"q_{msg.id}",
                    "text": msg.question,
                    "sender": "user",
                    "created_at": msg.created_at.isoformat() if msg.created_at else None
                })
            if msg.answer:
                result_messages.append({
                    "id": f"a_{msg.id}",
                    "text": msg.answer,
                    "sender": "ai",
                    "created_at": msg.created_at.isoformat() if msg.created_at else None
                })

        return jsonify({"success": True, "usebox_id": usebox_id, "messages": result_messages})

    # POST: 새 메시지 전송 → OpenAI 호출 → DB 저장
    data = request.get_json() or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"success": False, "error": "message required"}), 400

    usebox = UseBox.query.filter_by(use_id=usebox_id, user_id=user_id).first()
    if not usebox:
        return jsonify({"success": False, "error": "room not found"}), 404

    ai = BasicAI.query.get(usebox.ai_id)
    system_prompt = (ai.ai_content or "") if ai else ""

    if not client:
        return jsonify({"success": False, "error": "OPENAI_API_KEY not set"}), 500

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
        )
        answer = completion.choices[0].message.content
    except Exception as e:
        return jsonify({"success": False, "error": f"ai_error: {str(e)}"}), 500

    log = ChatLog(
        usebox_id=usebox_id,
        question=message,
        answer=answer,
        created_at=datetime.utcnow(),
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        "success": True,
        "usebox_id": usebox_id,
        "question": message,
        "answer": answer,
        "created_at": log.created_at.isoformat() if log.created_at else None
    })

# ------------------ report (하나만 유지) ------------------
@chatlist_bp.route('/<int:user_id>/chats/<int:usebox_id>/report', methods=['GET'])
@token_required
def generate_usebox_report(user_id: int, usebox_id: int, user):
    if user.user_id != user_id:
        return jsonify({"success": False, "error": "권한 없음"}), 403

    usebox = UseBox.query.filter_by(use_id=usebox_id, user_id=user_id).first()
    if not usebox:
        return jsonify({"success": False, "error": "room not found"}), 404

    logs = (
        db.session.query(ChatLog)
        .filter(ChatLog.usebox_id == usebox_id)
        .order_by(ChatLog.created_at.asc())
        .limit(20)
        .all()
    )

    if len(logs) < 3:
        return jsonify({"success": False, "error": "대화 부족"}), 400

    ai = BasicAI.query.get(usebox.ai_id)
    ai_name = ai.ai_name if ai else "AI"
    ai_content = ai.ai_content if ai and ai.ai_content else ""

    conversation = []
    for log in logs:
        if log.question:
            conversation.append(f"사용자: {log.question}")
        if log.answer:
            conversation.append(f"AI: {log.answer}")

    prompt = f"""
너는 아래 AI 설명(페르소나)을 따르는 전문가 챗봇이며, 상담 기록을 분석해 리포트를 작성한다.

[AI 설명/페르소나]
{ai_content}

[리포트 작성 요구사항]
- 제목: 상담 내역 분석 보고서
- 섹션 1: 사용자 핵심 고민 요약
- 섹션 2: AI가 제시한 해결 전략 요약
- 섹션 3: 다음 액션(체크리스트)
- 섹션 4: 한 줄 코멘트

반드시 마크다운으로 작성해.

[대화]
{chr(10).join(conversation)}
"""

    if not client:
        return jsonify({"success": False, "error": "OPENAI_API_KEY not set"}), 500

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"당신은 {ai_name}의 상담 분석 리포트 작성자입니다."},
                {"role": "user", "content": prompt},
            ],
        )
        report = completion.choices[0].message.content
        return jsonify({"success": True, "report": report})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
