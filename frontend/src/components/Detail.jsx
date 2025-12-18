import { useMemo, useState } from "react";

export default function Detail() {
    // API에서 받아오기
    const product = useMemo(() => ({
        // 예시로 써둠
        AI_id: 1,
        AI_name: "직무 맞춤형 AI비서",
        AI_type: false,
        AI_content: '직무/전문분야에 맞게 설계되는 AI 비서입니다. 선택한 직무의 커리큘럼 및 가이드에 따라 실전형 지원을 제공합니다.',
        AI_hashtagL: ["직무맞춤형AI", "커리어비서", "추천/로드맵"],
        AI_price: 39900,
        // AI_image: "public/img/basic-ai.png",
        AI_prompt: "당신의 직무 맞춤형 AI 비서입니다. 사용자의 목표/경력/시간을 고려해 학습 로드맵과 실행 체크리스트를 제안하세요.",
        AI_use_count: 1240,
        benefits: ["직무별 로드맵 자동 설계", "실전 과제/포트폴리오 가이드", "면접/이력서 개선 피드백", "매주 목표 정검&리마인드",],
        options: ["1개월 이용권", "3개월 이용권", "1년 이용권"],
    }),
        [])


const [plan, setPlan] = useState(product.options[0]);
const [qty, setQty] = useState(1);

const price = useMemo(() => product.AI_price * qty, [product.AI_price, qty]);

const formatKRW = (n) => {
    try {
        return n.toLocaleString("ko-KR");
    } catch {
        return String(n);
    };
}

const onBuy = () => {
    // TODO: 결제/주문 생성 API 연결
    alert("구매하기\n상품: ${product.AI_name}\n옵션: ${plan}\n수량: ${qty}\n금액: ${formatKRW(price)}원");
};

const onStartChat = () => {
    // TODO: 대화 페이지로 이동 (react-router-dom navigate)
    alert('대화 시작하기로 이동(라우팅 연결 필요)')
}

return (
    <main className="pd">
        <div className="pd_container">
            {/* 상단 */}
            <section className="pd_hero">
                <div className="pd_media" aria-label="상품 이미지">
                    <img className="pd_img" src="/img/logo.png" alt="로고" />
                    
                </div>
            </section>
        </div>
    </main>
);
}