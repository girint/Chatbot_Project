import certifi
import httpx
import os
from flask import Blueprint,request, jsonify, session, current_app
from openai import OpenAI
from dotenv import load_dotenv
from backend.models import db, ChatLog, UseBox,User,BasicAI
from datetime import datetime, timezone
from backend.views.database import save_chat_to_mongo, get_chat_from_mongo
from functools import wraps
import urllib

#------------------------------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization') or request.headers.get('authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': '토큰 필요'}), 401

        token = auth_header.split('Bearer ')[1].strip()
        token = urllib.parse.unquote(token)

        user = User.query.filter_by(user_nickname=token).first()
        if not user:
            return jsonify({'error': '유저 없음'}), 401

        session['user_id'] = user.user_id
        session['user_name'] = user.user_nickname
        return f(user=user, *args, **kwargs)

    return decorated
#------------------------------------------------

load_dotenv()
bp = Blueprint('ai_chat', __name__)

# OpenAI 클라이언트
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"),
                http_client=httpx.Client(verify=certifi.where())) if os.getenv("OPENAI_API_KEY") else None

AI_TYPE_MAP = {
        'wellness': 1, 'career': 2, 'finance': 3, 'health': 4,
        'daily': 5, 'learning': 6, 'legal': 7, 'tech': 8
    };


def get_ai_config(ai_type):
    """DB에서 AI 설정 동적 조회"""
    ai_idd = AI_TYPE_MAP.get(ai_type.lower(), 8)
    ai_data = BasicAI.query.filter_by(ai_id=ai_idd).first()
    if ai_data:
        return {
            'ai_id': ai_data.ai_id, 'title': ai_data.ai_name, 'tip': ai_data.ai_tip,
            'display': ai_data.ai_display, 'system_prompt': ai_data.ai_system_prompt or ai_data.ai_prompt,
            'system_intro': ai_data.ai_system_intro, 'model': ai_data.ai_model,
            'temperature': ai_data.ai_temperature or 0.1
        }
    return None


# 1. AI 초기화
@bp.route('/ai/aa/<ai_type>', methods=['GET'])
@token_required
def ai_init(ai_type):
    if not client: return jsonify({'error': 'OpenAI 오류'}), 500
    config = get_ai_config(ai_type)
    if not config: return jsonify({'error': 'AI 없음'}), 404

    user_name = session.get('user_nickname')or '사용자'
    user_id = session.get('user_id')or 1
    history = get_chat_from_mongo(user_id, ai_type) if user_id else []

    intro_html = config['system_intro'].replace('{user_name}', user_name)

    return jsonify({
        'status': 'success', 'ai_type': ai_type, 'ai_config': {
            'title': config['title'], 'tip': config['tip'], 'display': config['display']
        }, 'user_name': user_name, 'intro_html': intro_html, 'history': history
    })


# 2. AI 대화 (핵심)
@bp.route('/ai/aa/<ai_type>/ask', methods=['POST'])
def ai_ask(ai_type):
    if not client: return jsonify({'error': 'OpenAI 오류'}), 500

    data = request.get_json()
    message = data.get('message', '').strip()
    if not message: return jsonify({'response': '메시지 입력'}), 400

    config = get_ai_config(ai_type)
    if not config: return jsonify({'error': 'AI 없음'}), 404

    user_id = session.get('user_id', 1)
    user_name = session.get('user_name', '사용자')

    # GPT 호출
    system_prompt = config['system_prompt'].format(user_name=user_name)
    response = client.chat.completions.create(
        model=config['model'],
        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": message}],
        max_tokens=2048, temperature=config['temperature']
    )
    gpt_response = response.choices[0].message.content.strip()

    # 저장 (UseBox + ChatLog + MongoDB)
    ai_id = config['ai_id']
    try:
        usebox = UseBox.query.filter_by(user_id=user_id, ai_id=ai_id).first()
        if not usebox:
            usebox = UseBox(user_id=user_id, ai_id=ai_id)
            db.session.add(usebox)
            db.session.flush()

        log = ChatLog(usebox_id=usebox.use_id, question=message, answer=gpt_response,
                      created_at=datetime.now(timezone.utc))
        db.session.add(log)
        db.session.commit()

        save_chat_to_mongo(user_id, ai_type, message, gpt_response)
        print(f" [{ai_type}] 저장 완료")

    except Exception as e:
        db.session.rollback()
        print(f" 저장 실패: {e}")

    return jsonify({'status': 'success', 'response': gpt_response})


# 3. AI 목록
@bp.route('/ai/aa/list')
def ai_list():
    ais = BasicAI.query.filter_by(ai_type=False).all()
    return jsonify({
        'status': 'success',
        'ai_list': [{'ai_id': a.ai_id, 'ai_type': a.ai_content, 'title': a.ai_name,
                     'tip': a.ai_tip, 'price': a.ai_price, 'image': a.ai_image} for a in ais]
    })


# 4. 리포트
@bp.route('/ai/aa/<ai_type>/report')
def ai_report(ai_type):
    config = get_ai_config(ai_type)
    if not config: return jsonify({'error': 'AI 없음'}), 404

    user_id = session.get('user_id', 1)
    history = db.session.query(ChatLog).join(UseBox).filter(
        UseBox.user_id == user_id, UseBox.ai_id == config['ai_id']
    ).order_by(ChatLog.created_at.desc()).limit(10).all()

    if not history:
        return jsonify({'error': '내역 없음'}), 404

    chat_data = "\n".join([f"Q: {h.question}\nA: {h.answer[:200]}..." for h in reversed(history)])

    response = client.chat.completions.create(
        model=config['model'],
        messages=[{"role": "system", "content": config['system_prompt'][:500]},
                  {"role": "user", "content": f"{config['title']} 분석:\n{chat_data}"}]
    )

    return jsonify({'status': 'success', 'report': response.choices[0].message.content})
