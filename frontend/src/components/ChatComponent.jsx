import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { TokenManager,protectedApi } from '../api/User_Api';

import "./ChatComponent.css";

const ChatComponent = () => {
    const { type } = useParams();
    const [msg, setMsg] = useState('');
    const [chat, setChat] = useState([]);
    const [intro, setIntro] = useState('');
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);

    // 1. 사용자 정보 및 닉네임 상태 관리
    const [userInfo, setUserInfo] = useState(null);
    const [nickname, setNickname] = useState('사용자');

    const chatEndRef = useRef(null);

    // 채팅박스만 스크롤될 수 있게, 상담 인트로 높이를 어느 정도 제한(숫자만 조절)
    // 인트로가 너무 길면 전송 버튼이 아래로 밀리는 문제 줄여줌
    const INTRO_MAX_HEIGHT = 220;

    // 2. 봇 설정 (nickname 상태에 따라 제목이 실시간으로 변합니다)
    const botConfigs = {
        wellness: { title: `🌿 ${nickname}님의 웰니스 코치`, color: '#4CAF50', placeholder: '마음 상태를 들려주세요...' },
        career: { title: `🚀 ${nickname}님의 커리어 멘토`, color: '#FF8C00', placeholder: '진로 고민을 함께 나눠보시죠...' },
        finance: { title: `💰 ${nickname}님의 금융 가이드`, color: '#1E88E5', placeholder: '자산 관리에 대해 궁금함을 알려주세요...' },
        health: { title: `🏥 ${nickname}님의 건강 매니저`, color: '#E53935', placeholder: '건강 상태를 알려주세요...' },
        daily: { title: `📅 ${nickname}님의 데일리 도우미`, color: '#9C27B0', placeholder: '오늘 하루는 어땠나요?' },
        learning: { title: `✍️ ${nickname}님의 학습 서포터`, color: '#795548', placeholder: '공부 계획을 세워볼까요?' },
        legal: { title: `⚖️ ${nickname}님의 법률 자문`, color: '#607D8B', placeholder: '상담이 필요한 법률 문제를 알려주세요...' },
        tech: { title: `💻 ${nickname}님의 테크 가이드`, color: '#263238', placeholder: '기술적 궁금증을 해결해드릴게요.' }
    };

    const currentBot = botConfigs[type] || { title: `🤖 ${nickname}님의 AI 어시스턴트`, color: '#333', placeholder: '메시지를 입력하세요...' };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat, isTyping]);

    useEffect(() => {
        // 페이지 이동 시 상태 초기화
        setChat([]);
        setReport('');
        setIntro('');
        setLoading(true);

        const initChatPage = async () => {
            if (TokenManager.isLoggedIn && !TokenManager.isLoggedIn()) {
                setLoading(false);
                return;
            }

            try {
                const token = TokenManager.getNickname();
                setNickname(token || '사용자');

                // C. 서버로부터 챗봇 인트로 정보 가져오기
                const res = await await protectedApi.get(`/${type}/`);
                const data = await res.data;

                if (data.status === "success") {
                    // [정석 로직] 서버가 주는 intro_html을 가공 없이 그대로 노출합니다.
                    // 이름 불일치 문제는 이제 백엔드 파이썬 코드에서 수정하게 됩니다.
                    setIntro(data.intro_html);

                    // --- [신규 추가 기능] 기존 대화 내역(history) 로드 ---
                    // 기존 코드를 삭제하지 않고 history 데이터가 있을 경우에만 추가 기능을 수행합니다.
                    if (data.history && Array.isArray(data.history)) {
                        const loadedHistory = [];
                        data.history.forEach(item => {
                            loadedHistory.push({ role: 'user', text: item.question });
                            loadedHistory.push({ role: 'ai', text: item.answer });
                        });
                        setChat(loadedHistory);
                    }
                }
            } catch (err) {
                console.error(`${type} 데이터 로드 실패:`, err);
            } finally {
                setLoading(false);
            }
        };

        initChatPage();
    }, [type]);

    const send = async () => {
        if (!msg.trim() || isTyping) return;
        const currentMsg = msg;
        setChat(prev => [...prev, { role: 'user', text: currentMsg }]);
        setMsg('');
        setIsTyping(true);

        try {
            const res = await fetch(`http://localhost:5000/api/${type}/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: currentMsg }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.status === "success" || data.response) {
                setChat(prev => [...prev, { role: 'ai', text: data.response }]);
            }
        } catch (error) {
            console.error("전송 에러:", error);
        } finally {
            setIsTyping(false);
        }
    };

    const generateReport = async () => {
        if (chat.length < 2) return alert("대화가 부족합니다.");
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/${type}/report`, { credentials: 'include' });
            const data = await res.json();
            if (data.report) setReport(data.report);
        } finally {
            setLoading(false);
        }
    };

    // 리포트 버튼 노출 조건 (원하는 기준으로 숫자만 변경// 추가)
    const canShowReport = chat.length >= 6;     // 예: 3번 황복(유저+AI 6개)이상 일때 노출

    // css에서 쓰는 변수(봇 컬러)
    const cssVars = {
        "--bot-color": currentBot.color
    };

    return (
        <div className='chat-Page' style={cssVars}>
            <h2 className='chat-title'>{currentBot.title}</h2>

            {/* 인트로 고정 */}
            {intro && <div className='chat-intro' dangerouslySetInnerHTML={{ __html: intro }} />}

            {/* 채팅 영역만 커졌다가 내부 스크롤 */}
            <div className='chat-panel'>
                {/* 대화창 영역만 max-height + overflow */}
                <div className='chat-messages'>
                    {chat.length === 0 ? (
                        <div className='chat-empty'>
                            <p className='chat-empty-emoji'>💬</p>
                            <p>{nickname}님, 무엇을 도와드릴까요?</p>
                        </div>
                    ) : (
                        chat.map((c, i) => (
                            <div key={i} className={`chat-row ${c.role === "user" ? "is-user" : "is-ai"}`}>
                                <div className={`chat-bubble ${c.role === "user" ? "user" : "ai"}`}>
                                    {c.role === "ai" ? <ReactMarkdown>{c.text}</ReactMarkdown> : c.text}
                                </div>
                            </div>
                        ))
                    )}

                    {isTyping && <div className='chat-typing'>답변 중...</div>}
                    <div ref={chatEndRef} />
                </div>

                {/* 입력창/전송 버튼은 카드 하단에 고정 */}
                <div className='chat-inputBar'>
                    <input className='chat-input' value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={currentBot.placeholder} />

                    <button className='chat-sendBtn' onClick={send} disabled={isTyping || !msg.trim()}>
                        전송
                    </button>
                </div>
            </div>

            {/* 리포트 버튼은 대화가 쌓일 때만 보이게 */}
            {canShowReport && (
                <button className='chat-reportBtn' onClick={generateReport}>
                    {loading ? "데이터 불러오는 중..." : "AI 분석 리포트 생성"}
                </button>
            )}

            {report && (
                <div className='chat-reportBox'>
                    <ReactMarkdown>{report}</ReactMarkdown>
                </div>
            )}
        </div>
    );
};

export default ChatComponent;