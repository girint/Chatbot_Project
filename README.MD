## 프로젝트 실행 준비
[Flask]
pip install -r requirements.txt  # 확장프로그램 설치
python seed_basic_ai.py          # 초기 basic AI 세팅

[Front]
cd frontend                     # 프론트엔드 폴더 이동
npm install                     # package내 확장프로그램 설치

## 🌞프로젝트 구조

```
AI 챗봇 프로젝트/
├── backend/
├── frontend/
│ ├── public/                   
│ │ └── img/                    # 프론트용 이미지
│ └── src/
│   ├── api/                    # 플라스크 연동
│   └── components/             # 웹페이지 세분화 정리
│     ├── chat/                 # 채팅 페이지 (대화목록, 채팅창)
│     ├── common/               # 반복사용 페이지 (헤더, 푸터)
│     ├── notice/               # 게시판 페이지 (게시판 작성, 수정, 상세)
│     ├── userbasic/            # 사용자 페이지 (마이페이지, 로그인, 회원가입, 결제, 개인비서 생성)
│     ├── ChatComponent         # 챗봇 대화창 페이지
│     ├── Detail                # 상세정보 페이지
│     └── Main                  # 메인 페이지
│
└──  README.md                   #readme

```

---
