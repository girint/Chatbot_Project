import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import "./Detail.css";
import * as Api from '../api/AI_Detail_Api.js';

export default function Detail() {  // props로 aiId 받기
    const { aiId } = useParams();
    const [aiData, setAiData] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [canWrite, setCanWrite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasReview, setHasReview] = useState(false);
    const [hasUsedAi, setHasUsedAi] = useState(false);
    const [aiDetail, setAiDetail] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('🔍 useParams aiId:', aiId);
        fetchDetail();
    }, [aiId]);

    const fetchDetail = async () => {
        try {
            const data = await Api.fetchAiDetail(aiId);
            console.log('📦 API 응답:', data);
            setAiData(data.ai);
            setReviews(data.reviews);
            setCanWrite(data.can_write_review);

            setIsLoggedIn(data.is_logged_in);
            setHasReview(data.has_review);
            setHasUsedAi(data.has_used_ai);

            setLoading(false);
        } catch (error) {
            console.error('AI 정보 로드 실패:', error);
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!newReview.trim() || !canWrite) return;

        try {
            const newReviewData = await Api.createReview(aiId, newReview);
            setReviews([newReviewData, ...reviews]);
            setNewReview('');
            setCanWrite(false);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('리뷰를 삭제하시겠습니까?')) return;

        await Api.deleteReview(aiId, reviewId);
        // UI 즉시 반영 (soft delete)
            setReviews(prev =>
                prev.filter(r => r.review_id !== reviewId)
            );

        // ✅ 삭제 후 즉시 상태 갱신
        await fetchDetail();
    };

    if (loading) return <div>로딩 중...</div>;
    if (!aiData) return <div>AI를 찾을 수 없습니다.</div>;

    return (
        <main className="wf">
            <div className="wf-wrap">
                <section className="wf-top">
                    <div className="wf-leftIcon">
                        <img className="wf-logo" src={aiData.ai_image || "/img/detail-2.png"} alt="AI 로고" />
                    </div>
                    <div className="wf-rightText">
                        <h1 className="wf-title">{aiData.ai_name}</h1>
                        <p className="wf-desc">{aiData.ai_prompt}</p>
                        <p className="wf-tags">{aiData.ai_hashtag}</p>
                    </div>
                </section>

                <div className="wf-line" />

                <section className="wf-reviews">
                    <span className="wf-label">Reviews ({reviews.length})</span>

                    <div className="wf-list">
                        {reviews.map((r) => (
                            <div className="wf-row" key={r.review_id}>
                                <div className="wf-avatarBox">
                                    <img className="wf-avatarImg" src="/img/detail-1.png" alt="아바타" />
                                </div>
                                <div className="wf-reviewText">
                                    <div className="wf-name">{r.user_nickname}</div>
                                    <div className="wf-comment">
                                        {r.review_write}
                                        <button className="wf-CommentDelete" onClick={() => handleDeleteReview(r.review_id)}>
                                            리뷰 삭제
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {canWrite && (
                        <div className="wf-reviewWriteWrap">
                            <form className="wf-reviewForm" onSubmit={handleSubmitReview}>
                                <textarea 
                                    className="wf-reviewTextarea" 
                                    placeholder="리뷰를 입력하세요"
                                    value={newReview}
                                    onChange={(e) => setNewReview(e.target.value)}
                                    maxLength={255}
                                />
                                <button className="wf-reviewSubmit" type="submit">등록</button>
                            </form>
                        </div>
                    )}
                    {!canWrite && (
                        <div className="review-box">
                            {!isLoggedIn && '리뷰 작성은 로그인 후 AI 사용 시 가능합니다.'}
                            {isLoggedIn && !hasUsedAi && 'AI를 사용한 후 리뷰를 작성할 수 있습니다.'}
                            {isLoggedIn && hasReview && '이미 리뷰를 작성하셨습니다.'}
                        </div>
                    )}
                </section>

                <section className="wf-bottom">
                    <div className="wf-wrap">
                        <button className="write-btn" onClick={() => {
                            const token = localStorage.getItem("authToken");
                            if (!token) {
                                alert("로그인 후 이용이 가능합니다.");
                                navigate("/login"); // 로그인 페이지로 이동
                                return;
                            }
                            navigate(`/${aiData.ai_content}`);
                        }}>
                            대화 시작하기 (₩{aiData.ai_price})
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}
