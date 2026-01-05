// import { useMemo, useState } from "react";
// import '../../css/Pay.css'

// export default function Pay() {
//     // /예시 금액(props/라우팅 state로 받기)
//     const [amount] = useState(39900);
//     // card / naver / kakao / toss
//     const [method, setMethod] = useState("card")
//     const [agree, setAgree] = useState({
//         terms: false,
//         privacy: false,
//     });

//     const canPay = useMemo(() => {
//         return agree.terms && agree.privacy && !!method && amount > 0;
//     }, [agree, method, amount]);

//     const formatKRW = (n) => {
//         try {
//             return n.toLocaleString("ko-KR");
//         } catch {
//             return String(n);
//         }
//     };

//     const onSubmit = (e) => {
//         e.preventDefault();
//         if (!canPay) return;

//         // TODO: 백엔드로 결제 생성 요청
//         // pay_money: amount
//         // pay_choice: method (DB가 Boolean이면 서버에서 매핑 필요)
//         console.log({
//             pay_money: amount,
//             pay_choice: method,
//             agree,
//         });

//         alert("결제 요청");
//     };

//     return (
//         // <div className="pay-page">
//         //     <form className="pay-card" onSubmit={onSubmit}>
//         //         <h1 className="pay-title">결제하기</h1>

//         //         <section className="pay-section">
//         //             <h2 className="pay-section-title">결제 금액</h2>
//         //             <div className="pay-amount">
//         //                 <span className="pay-amount-currency">₩</span>
//         //                 <span className="pay-amount-number">{formatKRW(amount)}</span>
//         //             </div>
//         //         </section>

//         //         <div className="pay-divider" />

//         //         <section className="pay-section">
//         //             <h2 className="pay-section-title">결제 수단</h2>

//         //             <div className="pay-methods" role="radiogroup" aria-label="결제 수단">
//         //                 <button type="button" className={`pay-method pay-method--card is-img ${method === "card" ? "is-active" : ""}`} onClick={() => setMethod("card")}>
//         //                 카드 결제
//         //                 </button>

//         //                 <button type="button" className={`pay-method pay-method--naver is-img ${method === "naver" ? "is-active" : ""}`} onClick={() => setMethod("naver")}>
//         //                     네이버페이 결제
//         //                 </button>

//         //                 <button type="button" className={`pay-method pay-method--kakao is-img ${method === "kakao" ? "is-active" : ""}`} onClick={() => setMethod("kakao")}>
//         //                     카카오페이 결제
//         //                 </button>

//         //                 <button type="button" className={`pay-method pay-method--toss is-img ${method === "toss" ? "is-active" : ""}`} onClick={() => setMethod("toss")}>
//         //                     토스페이 결제
//         //                 </button>
//         //             </div>
//         //         </section>

//         //         <div className="pay-divider" />

//         //         <section className="pay-agree">
//         //             <label className="pay-check">
//         //                 <input type="checkbox" checked={agree.terms} onChange={(e) => setAgree((p) => ({ ...p, terms: e.target.checked}))} />
//         //                 <span>서비스 이용약관 동의</span>
//         //             </label>

//         //             <label className="pay-check">
//         //                 <input type="checkbox" checked={agree.privacy} onChange={(e) => setAgree((p) => ({ ...p, privacy: e.target.checked}))} />
//         //                 <span>개인정보 수집 및 이용 동의</span>
//         //             </label>
//         //         </section>

//         //         <button className="pay-submit" type="submit" disabled={!canPay}>결제하기</button>
//         //     </form>
//         // </div>
//     <div>
//         <div>
//             <h2>결제하기</h2>

//         </div>
//     </div>

//     )
// };

// PaymentMethodSelect.jsx

import { useId, useMemo, useState, useEffect } from "react";
import Form from 'react-bootstrap/Form';
import "../../css/Pay.css";

export default function PaymentMethodSelect({ value, onChange, defaultValue = "CARD" }) {
    const groupId = useId();

    // ✅ 부모에서 value를 안 주면 내부 상태로 동작(언컨트롤드)
    const isControlled = value !== undefined;
    const [innerValue, setInnerValue] = useState(defaultValue);

    // defaultValue가 바뀌는 케이스 대응(선택)
    useEffect(() => {
        if (!isControlled) setInnerValue(defaultValue);
    }, [defaultValue, isControlled]);

    const selected = isControlled ? value : innerValue;

    const options = useMemo(
        () => [
            { id: "BASIC", label: "신용/체크카드 결제", icon: "basicImg" },
            { id: "KAKAO", label: "카카오페이", icon: "kakaoImg" },
            { id: "NAVER", label: "네이버페이", icon: "naverImg" },
            { id: "TOSS", label: "토스페이", icon: "tossImg" },
        ],
        []
    );

    const setSelected = (id) => {
        // ✅ 내부 상태 업데이트
        if (!isControlled) setInnerValue(id);
        // ✅ 부모 콜백도 있으면 호출
        onChange?.(id);
    };


    //충전금액 확인
    const [currentCoin] = useState(2000); // 예시: 서버/props로 받으면 더 좋음
    const [chargeCoin, setChargeCoin] = useState(1000); // 기본 선택
    const totalCoin = currentCoin + chargeCoin;


    return (
        <div className="pay_all">
            <div className="pay-box">
                <div className="pay-title-box"><h3>결제하기</h3></div>
                
                <div className="pay-coin-pack">
                    <div className="pay-coin-pack-title">충전 금액 선택</div>

                    <div className="pay-coin-pack-grid">
                        {[3000, 5000, 10000, 20000].map((v) => (
                        <button
                            key={v}
                            type="button"
                            className={`pay-coin-pack-btn ${chargeCoin === v ? "active" : ""}`}
                            onClick={() => setChargeCoin(v)}
                        >
                            {v.toLocaleString()} 코인
                        </button>
                        ))}
                    </div>
                </div>

                <h4 className="pay-title">결제 수단을 선택해주세요.</h4>
                <div className="pay-grid-text">
                    <p>* 카카오페이, 네이버페이, 토스페이 클릭 시 해당 결제창으로 넘어갑니다.</p>
                </div>
                {/* grid - 화면을 바둑판처럼 나눠서 요소를 배치하는 방법 */}
                <div className="pay-grid" role="radiogroup" aria-label="결제 수단 선택">
                    {options.map((opt, idx) => {
                        const isActive = selected === opt.id;

                        return (
                            <div
                                key={opt.id}
                                className={`pay-card ${isActive ? "active" : ""}`}
                                role="radio"
                                aria-checked={isActive}
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => setSelected(opt.id)}
                            >
                                <div className={`pay-check ${isActive ? "active" : ""}`}><i className="fa-solid fa-check"></i></div>

                                <div className="pay-icon-box">
                                    <div className="pay-icon" aria-hidden="true">
                                        <img src={`/img/${opt.id.toLowerCase()}_paylogo.png`}
                                        alt={opt.label}
                                        className={`pay-icon-img pay-${opt.id.toLowerCase()}`} />
                                    </div>
                                </div>

                                <div className="pay-text">
                                    <div className="pay-label">{opt.label}</div>
                                </div>

                                <input
                                    type="radio"
                                    name={`payment_${groupId}`}
                                    value={opt.id}
                                    checked={isActive}
                                    onChange={() => setSelected(opt.id)}
                                    className="pm-hidden-radio"
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="pay-start">
                    <div className="pay-start-left">
                        <div  className="pay-left">
                            <div className="pay-guide">
                                <div className="pay-guide-title">결제 안내</div>
                                <ul className="pay-guide-list">
                                    <li>충전된 코인은 AI 챗봇 이용 시 자동으로 차감됩니다.</li>
                                    <li>코인은 충전 후 바로 사용하실 수 있습니다.</li>
                                    <li>결제 수단 또는 네트워크 환경에 따라 처리 시간이 소폭 다를 수 있습니다.</li>
                                    <li>결제 진행 전 충전 금액을 반드시 확인해주세요.</li>
                                    <li>충전된 코인은 현금으로 환불되지 않습니다.</li>
                                    <li>결제 완료 이후 충전 금액 변경은 어려울 수 있습니다.</li>
                                    <li>결제 도중 페이지를 벗어나면 처리가 정상적으로 완료되지 않을 수 있습니다.</li>
                                    <li>동일 결제의 중복 요청 시 결제가 중단될 수 있습니다.</li>
                                    <li>결제 오류 발생 시 잠시 후 다시 시도해주세요.</li>
                                    <li>안전한 결제 시스템을 통해 모든 결제가 처리됩니다.</li>
                                    <li>반드시 충전 금액을 확인하신 뒤 진행해주세요.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="pay-start-right">
                        <h3 className="pay-box-right-1">신용카드 정보</h3>
                        <div className="pay-box-right-2">
                            <p>소유자 이름</p>
                            <Form.Control size="sm" type="text" placeholder="Small text" className="pay-box-right-form" />
                        </div>
                        <div className="pay-box-right-3">
                            <p>카드 번호</p>
                            <Form.Control size="sm" type="text" placeholder="Small text" className="pay-box-right-form" />
                        </div>
                        <div className="pay-box-right-4">
                            <p>만료 월/년도</p>
                            <Form.Control size="sm" type="text" placeholder="Small text" className="pay-box-right-form" />
                        </div>
                        <div className="pay-box-right-5">
                            <p>CVC</p>
                            <Form.Control size="sm" type="text" placeholder="Small text" className="pay-box-right-form" />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="pay-coin-summary">
                        <div className="pay-coin-summary-title">충전 후 예상 코인</div>

                        <div className="pay-coin-summary-row">
                            <span>현재 보유 코인</span>
                            <b>{currentCoin.toLocaleString()}</b>
                        </div>

                        <div className="pay-coin-summary-row">
                            <span>충전 코인</span>
                            <b>+ {chargeCoin.toLocaleString()}</b>
                        </div>

                        <div className="pay-coin-summary-divider" />

                        <div className="pay-coin-summary-row total">
                            <span>총 코인</span>
                            <b>{totalCoin.toLocaleString()}</b>
                        </div>
                    </div>
                </div>
                        
                {/*<div className="payment mt-5">
                    <h4 className="pay-title-1">결제 금액</h4>
                </div> */}
            </div>
        </div>
    );
}
