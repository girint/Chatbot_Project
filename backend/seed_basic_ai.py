# seed_basic_ai.py
'''
초기 basicAI 데이터 세팅 하기 위한 공간
실행방법
cd backend
python seed_basic_ai.py
끝
추후에 기본 데이터 세팅이 필요할때도 이방법으로 진행하면 됌
'''

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from models import BasicAI

# DB 설정
BASE_DIR = Path(__file__).parent.absolute()
DB_PATH = BASE_DIR / "instance" / "AI.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH.as_posix()}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


def seed_basic_ai():
    """BasicAI 8개 데이터 세팅"""
    with app.app_context():
        # 기존 데이터 초기화
        db.session.query(BasicAI).delete()
        db.session.commit()

        # 8개 기본 AI
        configs = {
            'wellness': ('웰니스 코치', '#웰니스#멘탈케어',"마음과 몸의 균형을 찾아드립니다", "웰니스 코치 챗봇은 건강한 삶을 위한 일상 관리 파트너입니다. 운동, 식습관, 수면 스트레스 관리 등 다양한 웰니스 정보를 바탕으로 복잡한 계획 없이도, 대화를 통해 하루의 컨디션을 점검하고 작은 습관부터 꾸준히 개선할 수 있도록 도와주는 당신만의 스마트 웰니스 코치입니다."),
            'career': ('커리어 멘토', '#커리어 #진로'," 꿈의 직업으로 안내합니다.", "직무 탐색, 목표 설정, 이력서·자기소개서 방향 잡기부터 현재 역량에 맞는 성장 로드맵까지 대화를 통해 명확하게 안내합니다. 혼자 고민하던 커리어 선택을 보다 현실적이고 전략적으로 도와줍니다. 지금의 나를 분석하고, 다음 단계를 설계하는 당신만의 스마트 커리어 멘토입니다."),
            'finance': ('금융 가이드', '#재테크 #투자',"부의 성장을 도와드립니다", "소비 패턴 점검, 예산 관리, 저축과 투자 기초, 금융 상품 이해까지 복잡하게 느껴지는 금융 고민을 대화를 통해 단계적으로 안내합니다. 현실적인 조언으로, 금융 결정을 스스로 내릴 수 있도록 돕습니다. 지금의 선택이 내일의 안정이 되도록 함께하는 당신만의 스마트 금융 가이드입니다."),
            'health': ('건강 매니저', '#건강 #다이어트',"건강한 생활을 관리합니다", "생활 습관 점검, 컨디션 체크, 운동·식단 관리, 스트레스 관리까지 사용자의 현재 상태에 맞춘 실천 가능한 가이드를 제공합니다. 이해하기 쉬운 조언으로 건강한 습관 형성을 돕습니다. 매일의 작은 관리가 평생의 건강이 되도록 함께하는 당신만의 스마트 건강 매니저입니다."),
            'daily': ('데일리 도우미', '#일상 #생산성', "효율적인 하루를 만들어드립니다", "일정 관리, 할 일 정리, 간단한 정보 안내부터 하루 컨디션에 맞는 작은 제안까지 대화를 통해 자연스럽게 지원합니다. 복잡한 하루를 가볍게 정리하고, 중요한 일에 집중할 수 있도록 도와줍니다. 바쁜 일상 속에서 항상 곁에 있는 당신만의 스마트 데일리 도우미입니다."),
            'learning': ('학습 서포터', '#공부 #학습', "쉽고 빠른 학습을 지원합니다", "공부 계획 수립, 개념 정리, 복습 가이드, 학습 습관 관리까지 사용자의 수준과 속도에 맞춰 단계적으로 지원합니다. 막히는 부분은 쉽게 풀어주고, 꾸준히 학습할 수 있도록 동기를 제공합니다. 혼자 공부하는 시간을 더 효과적으로 만들어주는 당신만의 스마트 학습 서포터입니다."),
            'legal': ('법률 자문', '#법률 #상담',"법적 고민을 해결합니다", "복잡하고 어렵게 느껴지는 법률 정보를 쉽고 이해하기 쉬운 언어로 대화를 통해 단계적으로 설명합니다. 기본적인 법적 판단 기준을 제공하여 합리적인 선택을 할 수 있도록 돕습니다. 법이 낯설 때 가장 먼저 찾을 수 있는 당신만의 스마트 법률 자문 파트너입니다."),
            'tech': ('테크 가이드', '#프로그래밍 #개발',"최신 기술을 쉽게 배웁니다", "스마트폰·PC 활용, 소프트웨어 사용법, 최신 기술 트렌드, 간단한 문제 해결까지 단계별로 친절하게 안내합니다. 전문 용어 대신 일상적인 설명으로 누구나 기술을 부담 없이 활용할 수 있도록 돕습니다. 기술이 어려울 때 가장 먼저 떠오르는 당신만의 스마트 테크 가이드입니다.")
        }

        # 데이터 생성 & 저장
        for key, (title, hashtags,tip, prompt) in configs.items():
            ai = BasicAI(
                ai_name=title,
                ai_type=False,
                ai_tip=tip,
                ai_content=key,
                ai_hashtag=hashtags,
                ai_price=5000,
                ai_image=f"/static/images/ai/{key}.png",
                ai_prompt=prompt,
                ai_use_count=0
            )
            db.session.add(ai)

        db.session.commit()
        print(f"✅ 8개 BasicAI 세팅 완료! ({DB_PATH})")


if __name__ == "__main__":
    seed_basic_ai()

