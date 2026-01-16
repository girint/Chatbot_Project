![메인페이지](./docs/images/wmd_main2.png)


## 💫 AI Web App Team Project
생성형 AI Web App 기획 및 개발 - 개인 맞춤형 AI 플랫폼

## 🕒 개발 시간
2025/12/08 ~ 2025/01/09 (약 4주간)

## 🤝 같이 개발한 팀원들
🐧 이상수 : 팀장(바지)<br>
🐣 김태연 : 프론트엔드<br>
🦒 백기림 : 백엔드, DB, AI<br>
🐶 이기화 : 챗봇 <br>
🐸 지수정 : 프론트엔드

<br>

## 📜 프로젝트 소개
**특정 파트에 최적화 된 AI를 제공하는 플랫폼**<br>
역할별로 분리된 AI 설계를 통해, 각 기능 영역에서 일관된 응답 품질을 유지합니다.<br>
사용자는 목적에 맞는 AI와 상호작용하며, 단순한 질의응답을 넘어 지속적인 AI 경험을 제공합니다.

<br>

## 🌞프로젝트 구조
<details><summary>AI 챗봇 프로젝트</summary>
<br>

![AI챗봇프로젝트구조](./docs/images/pj_structure.png)

</details>
<br>


## 📢 기획 의도
개인비서 AI는 단순한 기능 구현보다,<br>
서비스 구조와 사용자 흐름에 대한 설계가 중요하다고 판단했습니다.
<br><br>
이에 따라 본 프로젝트는<br>
AI 채팅을 중심으로 한 기본 서비스 흐름을 먼저 구현하고,<br>
개인비서 기능은 향후 확장이 가능하도록 구조를 설계하는데 중점을 두었습니다.
<br><br>
이를 통해 실제 서비스로 발전시킬 수 있는 기반을 마련하고자 했습니다.

<br>

## 📚 개발환경
| Layer | Stack |
|-------|--------|
| Frontend | React · JavaScript · React-Bootstrap |
| Backend | Flask · Python · SQLAlchemy |
| AI | OpenAI API|   
| DB | SQLite |  
| Infrastructire | Docker · Nginx |  
| Tools | VS Code · PyCharm · Figma · Notion · GitHub |  


<br>

## 📚목차📚
01. 📌 [Diagram](#-diagram)
02. 📌 [UI 구현](#-화면구현)
03. 📌 [주요기능](#-주요-기능)
04. 📌 [기능 실행화면](#-기능-실행화면)
05. 📌 [프로젝트 보고서](#-프로젝트-보고서)
06. 📌 [향후 개선 및 추가 기능](#-향후-개선-및-추가-기능)
07. 📌 [프로젝트 회고](#-프로젝트-회고)
08. 📌 [참고 자료](#️-참고-자료)

<br>

## 📐 Diagram
<details><summary>ERD (Entity-Relationship Diagram)</summary>
<br>

![ERD](/docs/images/ERD.png)

</details>

<details><summary>UseCase</summary>
<br>

![usecase](./docs/images/usecase.png)

</details>

<details><summary>Navigation</summary>
<br>

![navigation](./docs/images/navigation.png)

</details>

<br>

## 🖥 UI 구현
<details><summary>메인페이지</summary>
<br>

![mainpage](/docs/images/main.png)

</details>

<details><summary>회원가입</summary>
<br>

![signup](/docs/images/signup.png)

</details>

<details><summary>로그인</summary>
<br>

![login](/docs/images/login.png)

</details>

<details><summary>마이페이지</summary>
<br>

![mypage](/docs/images/myPage.png)

</details>

<details><summary>결제페이지</summary>
<br>

![pay](/docs/images/pay.png)

</details>

<details><summary>대화 목록</summary>
<br>

![chatlist](/docs/images/chatlist.png)

</details>

<details><summary>대화 리뷰</summary>
<br>

![review-ai8](/docs/images/ai_8.png)

</details>

<details><summary>AI 대화창</summary>
<br>

![aichat](/docs/images/aichat_tech.png)

</details>

<details><summary>게시판</summary>
<br>

![notice](/docs/images/notice.png)

</details>

<details><summary>게시판 작성</summary>
<br>

![noticeWrite](/docs/images/noticeWrite.png)

</details>

<br>

## 🔎 주요 기능
<details><summary>메인 페이지</summary>
<br>

![main](/docs/images/main.png)
<p>
1. 서비스 소개 및 컨셉 전달<br>
2. 멤버십 핵심 혜택 안내<br>
3. AI 카테고리 진입 허브 (Basic Category)<br>
4. 멤버십 전용 개인비서 슬롯 제공<br>
5. 공지 및 커뮤니티 접근
</p>
</details>

<details><summary>로그인/회원가입</summary>
<br>
![login](/docs/images/login_singup.png)
<p>
1. 아이디/비밀번호 로그인 및 로그인 상태 유지(토큰/세션 기반)<br>
2. 카카오/네이버/구글 간편 로그인 UI 제공<br>
3. 회원가입 폼 + 닉네임/이메일 중복확인<br>
4. 필수/선택 약관 동의로 가입 플로우 완성
</p>

</details>

<details><summary>AI 플랫폼 대화</summary>
<br>

![ai](/docs/images/aichat_tech.png)
<p>
1. 사용자 닉네임을 반영한 개인화된 AI 가이드 제공<br>
2. 기술/프로그래밍 질문에 특화된 대화 흐름 설계<br>
3. 실시간 채팅 UI를 통한 연속 대화 지원<br>
4. JWT 토큰 인증 기반 사용자 접근 제어
</p>

</details>

<details><summary>대화 목록</summary>
<br>

![chat](/docs/images/chatlist.png)
<p>
1. 로그인 사용자 기준 AI 대화 목록 조회<br>
2. 대화 선택 시 우측 영역에 대화 내용 표시<br>
3. 대화 미선택/기록 없음 상태에 대한 안내 UI 제공<br>
4. 좌/우 분할 레이아웃으로 채팅 앱 형태 UX 구현
</p>

</details>

<details><summary>마이페이지</summary>
<br>

![mypage](/docs/images/myPage.png)
<p>
1. 사용자 닉네임 및 잔액 정보 표시<br>
2. 개인비서 슬롯 관리 및 멤버십 전용 기능 제공<br>
3. 닉네암/비밀번호/프로필 이미지 변경<br>
4. 멤버십 상태 확인 및 해지 기능<br>
5. 회원 탈퇴 등 계정 관리 기능 제공
</p>

</details>

<details><summary>결제 및 멤버십</summary>
<br>

![pay](/docs/images/pay.png)
<p>
1. 충전 금액 선택을 통한 코인 충전 기능<br>
2. 카드/카카오페이/네이버페이/토스페이 결제 수단 제공<br>
3. 결제 전 유의사항 및 충전 후 예상 코인 표시<br>
4. 결제 완료 후 잔액 반영 흐름 구성
</p>

</details>

<details><summary>게시판</summary>
<br>

![detail&notice](/docs/images/detail_notice.png)
<p>
1. 게시글 목록 조회 및 공지글 메인페이지 하단 고정<br>
2. 페이지네이션을 통한 게시글 탐색<br>
3. 이미지 첨부, 태그, 가격 입력을 포함한 게시글 작성<br>
4. 로그인 사용자 기준 게시글 작성 및 관리 
</p>
</details>

## 🎬 기능 실행화면
<details><summary>🔐 인증 & 계정 관리</summary>
- 회원가입 / 로그인 (JWT 기반 인증)<br>
- 마이페이지 정보 수정 및 멤버십 관리

[로그인&회원가입](./videos/회원가입,로그인.mp4) <br>
[마이페이지](./videos/마이페이지%20구현.mp4)

</details>

<details><summary>🤖 AI 플랫폼 대화</summary>
- 역할별 AI 비서와 실시간 대화 <br>
- 사용 제한 및 예외 상황 처리

[AI챗봇대화실행](./videos/챗봇%20답변.mp4)

※ 예외처리 시나리오 <br>
[챗봇답변거절멘트](./videos/챗봇%20답변%20거절멘트.mp4) <br>
[사용횟수초과시처리](./videos/챗봇%20사용횟수%20초과시.mp4)

</details>

<details><summary>📂 대화 기록 관리</summary>
- 이전 AI 대화 목록 조회 <br>
- 대화 선택 기반 화면 전환

[이전대화목록확인](./videos/이전%20대화목록%20확인.mp4)

</details>

<details><summary>💳 결제 & 멤버십</summary>
- 코인 충전 및 결제 수단 선택 <br>
- 결제 결과에 따른 잔액 반영

[결제페이지실행](./videos/결제페이지.mp4)

</details>

<details><summary>🎥 게시판 & 리뷰</summary>
- 게시글 조회, 작성, 삭제 <br>
- 리뷰 작성 및 관리

[게시판기능실행](./videos/게시판%20상세.mp4)

![NoticeWrite](/docs/화면구현/게시판작성.mp4)
- [게시글삭제](./videos/게시판%20삭제.mp4)
- [리뷰작성및삭제](./videos/리뷰%20작성,%20삭제.mp4)

</details>

<br>

## 📂 프로젝트 보고서

<br>


## 🚧 향후 개선 및 추가 기능
- **결제-챗봇 사용 흐름 개선**<br>
결제 완료 후 즉시 챗봇을 사용할 수 있도록 활성화 및 접근 흐름을 개선할 예정입니다.

- **API 응답 최적화**<br>
API 제공 시 불필요한 데이터를 제한하여 응답 속도와 전반적인 성능을 개선할 계획입니다.

- **커스텀 챗봇 페이지 기능 확장**<br>
커스텀 챗봇 생성 페이지에서 프롬포트를 직접 작성·수정할 수 있도록 기능을 확장할 예정입니다.

- **기본 챗봇 프롬포트 구조 개선**<br>
제약이 큰 기존 프롬포트 구조를 개선하여, 보다 유연하고 목적에 맞는 챗봇 동작을 지원할 계획입니다.

<br>

## 🚀 프로젝트 회고
- 🐧: 팀장으로서 React 기반 프론트엔드, 백엔드 AP, 데이터베이스, AI 기능 전반을 총괄하며 기획부터 구현, 배포까지 전 과정을 주도했습니다.<br>프론트엔드-백엔드-AI 간 데이터 흐름을 고려한 구조 설계를 통해 서비스의 일관성과 확장성을 확보했으며, 초기 설계의 중요성을 실무적으로 경험할 수 있었습니다.<br>또한 팀원 간 기술 이해도를 조율하며 공통된 개발 방향을 유지하는데 집중했고, 단순 기능 구현을 넘어 설계 의도와 구조를 공유하는 협업 환경을 구축하고자 했습니다.<br>AI 기능을 서비스 흐름에 자연스럽게 통합하며, 기술 중심이 아닌 사용자 경험을 고려한 개발 관점을 프로젝트 전반에 반영했습니다.

- 🐣: React와 Bootstrap을 활용해 페이지 레이아웃과 화면 구성을 진행하며, 서비스 전반의 디자인 톤과 시각적 일관성을 유지하는데 집중했습니다.<br>단순한 화면 구현을 넘어 사용자가 서비스를 자연스럽게 이해하고 이용할 수 있도록 화면 흐름, 배치, 여백, 시각적 강조 요소를 고려해 UI를 설계했습니다.<br>디자인 시안과 실제 구현 간의 차이를 최소화하기 위해 반복적인 수정과 보완을 진행했으며, 이 과정에서 디테일한 표현이 사용자 경험에 미치는 영향을 직접 체감할 수 있었습니다.<br>이번 프로젝트를 통해 React 환경에서 디자인을 코드로 구현하는 경험을 쌓았고, UI 완성도와 사용성을 함께 고려하는 디자인 중심의 프론트엔드 역량을 강화했습니다.

- 🦒: 서비스 전반에서 발생하는 요청과 응답 흐름을 기준으로 API 역할을 정의하고, 데이터베이스 스키마와 AI 처리 흐름이 유기적으로 연결되도록 구조를 설계했습니다.<br>특히 프론트엔드-백엔드-AI 간 데이터 전달 과정에서 중복과 불필요한 의존성을 줄이기 위해 책임 범위를 명확히 분리하고, 확장과 유지보수를 고려한 흐름을 구성했습니다.<br>데이터 생성, 저장, 조회, AI 처리 결과 반환까지의 전체 사이클을 설계하며, 기능 단위가 아닌 서비스 흐름 단위로 구조를 바라보는 경험을 할 수 있었습니다.<br>이번 프로젝트를 통해 단순한 기능 구현을 넘어, 백엔드 시스템 전반의 구조와 데이터 흐름을 설계하는 역할의 중요성을 더 깊게 알게되었으며, 안정성과 확장성을 고려한 설계 경험을 쌓을 수 있었습니다.

- 🐶: 사용자 입력을 기반으로 AI 응답을 생성하고, 서비스 흐름에 맞게 챗봇이 동작할 수 있도록 기본적인 로직 구조를 구성했습니다.<br>챗봇 기능을 단순한 응답 출력이 아닌 서비스의 한 기능으로 활용하기 위해, 대화 흐름과 응답 방식에 집중해 구현을 진행했습니다.<br>이를 통해 이후 기능 확장이나 개선이 가능하도록 챗봇 동작의 기본 틀을 마련했습니다.<br>이번 작업을 통해 ChatGPT 기반 챗봇을 프로젝트에 적용하는 경험을 쌓았으며, AI 기능을 서비스 구조 안에서 활용하는 기초적인 이해를 높일 수 있었습니다.

- 🐸: 초기 개발 단계에서 실제 데이터 연동 전 화면 구조와 사용자 흐름을 확인하기 위해 더미데이터를 직접 작성하여 UI를 구성했습니다.<br>더미데이터를 기반으로 컴포넌트 구조와 화면 배치를 검증하며, 화면 단위가 아닌 컴포넌트 단위로 UI를 설계하는 경험을 할 수 있었습니다.<br>이 과정에서 화면 구현 시 데이터 구조를 함께 고려하는 것이 이후 실제 API 연동 시 수정 비용을 줄이는데 도움이 된다는 점을 체감했습니다. <br>이번 프로젝트를 통해 React 환경에서의 화면 구현 흐름과 초기 단계에서 UI 완성도를 높이기 위한 프론트엔드 역할의 중요성을 이해하게 되었습니다.
<br>

## ⚙️ 참고 자료
- [마켓컬리](https://event.kurly.com/lego/event/2023/0911/join/coupon?%243p=a_custom_1311603463982995667&~agency_id=284&%24deeplink_path=open%3Furl%3Dhttps%253A%252F%252Fevent.kurly.com%252Flego%252Fevent%252F2023%252F0911%252Fjoin%252Fcoupon&%24android_passive_deepview=false&%24ios_passive_deepview=false&~tags=1055&~campaign=21533696829&~ad_set_name=189689558144&~keyword=%EB%A7%88%EC%BC%93%EC%BB%AC%EB%A6%AC&gad_source=1&gad_campaignid=21533696829&gbraid=0AAAAADM2qzIwvvbh32WXMA6YPDBHllFdC&gclid=CjwKCAiAvaLLBhBFEiwAYCNTf2n8O7DtvreyUWjT4o8T3_wFd_eW8i9S6kMhI9RLexajLcUTqBlGCBoCjYYQAvD_BwE&_branch_match_id=1491949500452214886&_branch_referrer=H4sIAAAAAAAAA32R246bMBCGn8ZcJmADgUpWxSG0qyY9ZpXmynLAAXOwWUNg0wuevYZN1EqV6ovR7xnP%2FJ%2FGRd%2B33bv1urqq%2BraibbuquajW7wG0UYspSa9dLxtiIctyTWS7yPeg7zuuuzEmmjOR3gjPMPRsQ3dkjLVzO2lpX2DZMgFQogcDFBezD4AOCnSAyRLYwES%2FenNOZbPkapbLP8VFQROiRZi%2BZS2ilFwsIpXXVorZmopMSZ5p567jAyMzysDZiC%2B07tj8gsvuP1Ut6jNNK6Jp8BvsjKpB%2F8W8Qz4Q74B3vDvcA23qad5hy3QcY0pp01KeCwwtByHXd%2FUq9RYz0rGeCNowbHk66TuOZ9m2MVXsNkqVYbANQbABnge2EQgj4KNF6GS0lFwtjHyeI68q1VOWy8Nt%2Fp6%2F%2FPKzojplBvOJ9%2FDl19M4DOcCwePPfeCevsbhx7pOMj0xrfXDqBw%2FRQEPBrrbhUWYbPkYnKLPhwsU3pdN3A%2BK3Z6P5cGW3gGRMckIO3rc%2F%2BFW%2B%2BLJ%2F75jr7Tcpc%2BHl7D%2BEIUyKk%2Bnb8EQk3DcGpNiF6YUFzk5Kzl2TOGoULJhvwHjHvfBlgIAAA%3D%3D) <br>
- [ChatGPT](https://chatgpt.com/?utm_source=google&utm_medium=paidsearch_brand&utm_campaign=GOOG_C_SEM_GBR_Core_CHT_BAU_ACQ_PER_MIX_ALL_APAC_KR_KO_120624&utm_term=%EC%B1%97%20gpt%20%EC%B1%97%EB%B4%87&utm_content=183521101147&utm_ad=756128607757&utm_match=p&gad_source=1&gad_campaignid=21990694068&gbraid=0AAAAA-IW-UV6gwZey_2ZG2tIndrVp-ve_&gclid=Cj0KCQjwuKnGBhD5ARIsAD19RsYg1bc8H7KJPSNXjdtRlqtaMcDz_eHbzmnWWot_9tRWTJl5dlWU_9YaAgXMEALw_wcB)


