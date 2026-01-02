import certifi
import httpx
import os
import json
from flask import Blueprint, render_template, request, jsonify, session, current_app
from openai import OpenAI
from dotenv import load_dotenv
from backend.models import db, ChatLog, UseBox  # UseBox 모델 임포트 추가
from datetime import datetime, timezone
# --- [신규 추가] database.py의 함수 임포트 ---
try:
    # 1. 최상위(Chatbot_Project) 폴더 기준 경로
    from backend.models import db, ChatLog, UseBox
    from backend.database import save_chat_to_mongo, get_chat_from_mongo
except ImportError:
    # 2. backend 폴더가 소스 루트이거나 경로가 꼬였을 때 (이곳이 실행되면 밑줄이 사라집니다)
    try:
        from models import db, ChatLog, UseBox
        from database import save_chat_to_mongo, get_chat_from_mongo
    except ImportError:
        # 3. 최후의 수단: 절대 경로 추가 (필요시)
        import sys
        sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../..")
        from backend.models import db, ChatLog, UseBox
        from backend.views.database import save_chat_to_mongo, get_chat_from_mongo

load_dotenv()

# 블루프린트 생성
bp = Blueprint('finance_chat', __name__, url_prefix='/finance')

# --- 챗봇 환경 설정 ---
USER_NAME = "자유로움"
CHAT_TITLE = "재테크 및 금융 컨설팅 챗봇"

# 시스템 페르소나 설정 (기존 내용 100% 유지)
SYSTEM_PROMPT = """
당신은 사용자의 재산을 효율적으로 관리하고 증식하기 위한 맞춤형 컨설팅과 정보를 제공하는 '현명하고 신뢰할 수 있는 금융 멘토' 챗봇입니다.
사용자 이름: {user_name}

[범위 제한 및 거절 지침 - 최우선 순위]

당신의 답변 권한은 오직 '경제 용어 설명 및 금융 상식 정보' 제공에만 엄격히 국한됩니다.

위 전문 분야와 직접적인 관련이 없는 모든 주제(의료, 기술 수리, 법률 분쟁, 음식 등)에 대해서는 단 한 문장의 정보도 제공하지 마십시오.

특히 특정 종목 추천이나 투자 지시 등 범위를 벗어난 요청 시 즉시 아래 **[거절 템플릿]**만을 출력하십시오.

[거절 템플릿] "죄송합니다, {user_name}님. 저는 금융 및 경제 지식 챗봇으로서 [사용자가 요청한 주제]와 같은 구체적인 투자 종목 추천이나 전문적인 자산 운용 상담, 혹은 비금융 분야에 대해서는 도움을 드릴 수 없습니다. 대신 일반적인 금융 용어나 경제 상식에 대해 궁금한 점이 있으시다면 기꺼이 설명해 드리겠습니다."

[페르소나 & 역할]
1. 성격: 복잡한 금융 정보를 쉽고 명확하게 설명하며, 사용자가 합리적인 재정 결정을 내리도록 돕는 신뢰감 있는 멘토입니다.
2. 어조: 객관적이고 정확한 정보를 기반으로, 사용자 상황에 맞는 실용적인 조언을 제시하는 전문적인 대화체를 사용합니다.
3. 주요 역할: 주식, 부동산, 가상자산 등 투자 정보, 은행 상품 비교, 대출, 세금, 연금, 절약 노하우 등 재정 목표 달성에 필요한 정보를 제공합니다. 리스크 관리를 강조하여 재정 건전성 유지에 기여합니다.
4. 답변 Role: 답변은 반드시 [공감 & 목표 확인] → [핵심 원리에 리스크] → [단계별 실천 가이드] → [추가 정보 & 전문가 제안] 순서로 구성되어야 합니다.

[답변 가이드라인]
1. 출력 형식: 답변 내용은 마크다운 형식(헤딩, 볼드, 목록)을 사용하여 가독성 높게 작성하며, 단계별 실천 가이드는 명확한 목록으로 제시합니다.

[면책 조항]
7. 면책 조항: 답변의 마지막에 "⭐ 중요: 모든 투자에는 위험이 따르며, 챗봇의 정보는 참고용일 뿐입니다. 최종 투자 결정은 반드시 사용자 본인의 신중한 판단과 책임 하에 이루어져야 합니다."라는 면책 조항을 포함합니다.
"""

# OpenAI 클라이언트 초기화 (기존 유지)
client = None
try:
    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key:
        client = OpenAI(
            api_key=api_key,
            http_client=httpx.Client(verify=certifi.where())
        )
except Exception as e:
    print(f"[Finance] OpenAI Init Error: {e}")


# --- 1. 초기 안내 데이터 제공 (/finance/) ---
@bp.route('/')
def chat_usage():
    user_name = session.get('user_name', USER_NAME)
    user_id = session.get('user_id')

    # [수정 부분] 기존 금융 상담 내역이 있는지 확인하여 가져옴
    history = []
    if user_id:
        # 카테고리를 'finance'로 지정하여 MongoDB 기록 조회
        history = get_chat_from_mongo(user_id, "finance")

    # 기존 금융 안내 문구 유지
    chat_intro_html = f"""
    <div class="initial-text" style="margin-top: 5px;">
        <b>환영합니다!</b> {user_name}님!</b> {user_name}님의 현명한 자산 관리를 돕는 '재테크 및 금융 컨설팅' 챗봇입니다!
    </div>
    <div class="initial-text" style="margin-top: 10px; margin-bottom: 10px;">
        투자의 첫 걸음부터 복잡한 금융 상품 이해, 절세 전략, 노후 준비까지! {user_name}님의 재정 목표에 맞춰 필요한 금융 정보와 실질적인 조언을 드릴 준비가 되어 있습니다. <br>어려운 금융, 이제 저와 함께 쉽게 접근해보세요!
    </div>
    <div class="initial-text" style="margin-top: 10px; margin-bottom: 10px;">
        <b>어떤 질문을 해야 할까요?</b>
        <ul>
            <li>"사회 초년생인데 월급 관리와 투자를 어떻게 시작해야 할까요?"</li>
            <li>"내집 마련을 위해 종잣돈을 모으고 싶은데, 효율적인 방법이 있을까요?"</li>
            <li>"ISA 계좌가 무엇이고 어떻게 활용할 수 있나요?"</li>
            <li>"요즘 유망하다는 산업 분야에 투자하고 싶은데, 관련 정보가 궁금해요."</li>
        </ul>
    </div>
    <div class="initial-text" style="margin-top: 10px; margin-bottom: 10px;">
        <span style="color: red; font-weight: bold;">꼭 기억해주세요!</span>
        <p>이 챗봇은 금융 정보와 조언을 제공하지만, 개별 투자 결정이나 법적 효력을 가진 금융 상품 가입을 직접 권유하지 않습니다. 모든 투자에는 위험이 따르며, <br>최종 결정은 사용자 본인의 판단에 따라야 합니다.</p>
    </div><p>자, 이제 {user_name}님의 금융 고민을 들려주세요. 제가 해결책을 찾아볼게요!</p>
    """

    return jsonify({
        "status": "success",
        "user_name": user_name,
        "is_logged_in": bool(user_id),
        "chat_title": CHAT_TITLE,
        "intro_html": chat_intro_html,
        "history": history  # [신규 추가] 기존 대화 내역 전달
    })


# --- 2. API 호출 및 하이브리드 저장 (/finance/ask) ---
@bp.route('/ask', methods=['POST'])
def ask():
    if client is None:
        return jsonify({'response': 'Error: OpenAI API Key missing.'}), 500

    current_user_id = session.get('user_id', 1)
    print(f"[Finance/Ask] Processing for User ID: {current_user_id}")

    try:
        data = request.get_json()
        user_message = data.get('message', '')
        user_name = session.get('user_name', USER_NAME)

        if not user_message:
            return jsonify({'response': '메시지를 입력해주세요.'}), 400

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT.format(user_name=user_name)},
            {"role": "user", "content": user_message}
        ]

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.1
        )

        ai_response = response.choices[0].message.content.strip()

        # --- 하이브리드 저장 로직 수정 (SQL + MongoDB + Vector DB) ---
        try:
            # 1. UseBox 권한 확인 및 생성 (금융 가이드 ai_id = 3)
            FINANCE_AI_ID = 3
            usebox = UseBox.query.filter_by(user_id=current_user_id, ai_id=FINANCE_AI_ID).first()

            if not usebox:
                usebox = UseBox(user_id=current_user_id, ai_id=FINANCE_AI_ID)
                db.session.add(usebox)
                db.session.commit()

            # 2. SQL 저장 (usebox_id 필드 사용)
            new_log = ChatLog(
                usebox_id=usebox.use_id,
                question=user_message,
                answer=ai_response,
                created_at=datetime.now(timezone.utc)
            )
            db.session.add(new_log)
            db.session.commit()
            sql_id = new_log.id

            # 3. MongoDB 저장 (Atlas) - 기존 코드 유지
            mongodb = getattr(current_app, 'mongodb', None)
            if mongodb is not None:
                try:
                    mongodb.chat_history.insert_one({
                        "sql_id": sql_id,
                        "usebox_id": usebox.use_id,
                        "user_id": current_user_id,
                        "category": "finance",
                        "question": user_message,
                        "answer": ai_response,
                        "timestamp": datetime.now(timezone.utc)
                    })
                    print(">>> [SUCCESS] Finance data saved to MongoDB Atlas!")
                except Exception as mongo_err:
                    print(f"[Finance Mongo Error] {mongo_err}")

            # [신규 추가] 히스토리 유지를 위한 MongoDB 공통 함수 호출
            save_chat_to_mongo(current_user_id, "finance", user_message, ai_response)

            # 4. Vector DB 저장 (기존 유지)
            vector_db = getattr(current_app, 'vector_db', None)
            if vector_db is not None:
                try:
                    vector_db.add(
                        documents=[user_message],
                        ids=[f"finance_{sql_id}"],
                        metadatas=[{"user_id": current_user_id, "category": "finance"}]
                    )
                except Exception as vec_err:
                    print(f"[Finance Vector Error] {vec_err}")

        except Exception as db_err:
            db.session.rollback()
            print(f"[Finance Storage Error] {db_err}")

        return jsonify({'status': 'success', 'response': ai_response})

    except Exception as e:
        print(f"[Finance API Error] {e}")
        return jsonify({'response': '서버 통신 오류가 발생했습니다.'}), 500


# --- 3. 리포트 생성 함수 (/finance/report) --- (기존 유지)
@bp.route('/report', methods=['GET'])
def generate_report():
    user_id = session.get('user_id', 1)

    try:
        # UseBox 조인을 통해 금융(ai_id=3) 기록만 필터링
        history = ChatLog.query.join(UseBox).filter(
            UseBox.user_id == user_id,
            UseBox.ai_id == 3
        ).order_by(ChatLog.created_at.desc()).limit(5).all()

        if not history:
            return jsonify({'error': '분석할 상담 내역이 부족합니다.'}), 404

        chat_data = "\n".join([f"Q: {h.question}\nA: {h.answer}" for h in reversed(history)])

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system",
                 "content": "당신은 전문 자산 관리사입니다. 사용자의 상담 내용을 분석하여 재정 상태 진단과 맞춤형 투자 방향을 요약한 보고서를 마크다운 형식으로 작성하세요."},
                {"role": "user", "content": f"금융 상담 분석 보고서 작성:\n\n{chat_data}"}
            ]
        )

        return jsonify({'status': 'success', 'report': response.choices[0].message.content})

    except Exception as e:
        print(f"[Finance Report Error] {e}")
        return jsonify({'error': '리포트 생성 중 오류가 발생했습니다.'}), 500