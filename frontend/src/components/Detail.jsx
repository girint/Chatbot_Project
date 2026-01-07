import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import "../css/Detail.css";
import * as Api from '../api/AI_Detail_Api.js';

export default function Detail() {  // props로 aiId 받기
    const { aiId } = useParams();
    const [aiData, setAiData] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewData, setReviewData] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [canWrite, setCanWrite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasReview, setHasReview] = useState(false);
    const [hasUsedAi, setHasUsedAi] = useState(false);
    const [aiDetail, setAiDetail] = useState(null);
    const [usageInfo, setUsageInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('🔍 useParams aiId:', aiId);
        fetchDetail();
        fetchReviewsFromJson();
    }, [aiId]);

    const fetchDetail = async () => {
        try {
            const data = await Api.fetchAiDetail(aiId);
            console.log('📦 API 응답:', data);
            setAiData(data.ai);
            setReviews(data.reviews);
            console.log('리뷰확인  ;', reviews);
            setCanWrite(data.can_write_review);

            setIsLoggedIn(data.is_logged_in);
            setHasReview(data.has_review);
            setHasUsedAi(data.has_used_ai);
            setUsageInfo(data.usage_info);

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
            await fetchDetail();
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

    const fetchReviewsFromJson = async () => {
        try {
            const res = await fetch("/data/reviews.json");
            const json = await res.json();

            // aiId에 해당하는 리뷰만 가져오기
            setReviewData(json[aiId] || []);
        } catch (e) {
            console.error("리뷰 JSON 로드 실패", e);
            setReviewData([]);
        }
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
                        <p className="wf-desc">{aiData.ai_display}</p>
                        <p className="wf-tags">{aiData.ai_hashtag}</p>
                    </div>
                </section>

                <div className="wf-line" />

                <section className="wf-reviews">
                    <span className="wf-label mb-5">Reviews {3+Number(reviews.length)}</span>

                    <div className="wf-list">
                        {reviewData.map((r) => (
                            <div className="wf-row" key={r.review_id}>
                                <div className="wf-avatarBox">
                                    <img className="wf-avatarImg" src="/img/detail-1.png" alt="아바타" />
                                </div>
                                <div className="wf-reviewText">
                                    <div className="wf-name">{r.user_nickname}</div>
                                    <div className="wf-comment">
                                        {r.review_write}
                                    </div>
                                </div>
                            </div>))}
                        {reviews.map((r) => (
                            <div className="wf-row" key={r.review_id}>
                                <div className="wf-avatarBox">
                                    <img className="wf-avatarImg" src={r?.user_image} alt="아바타" />
                                </div>
                                <div className="wf-reviewText">
                                    <div className="wf-name">{r.user_nickname}</div>
                                    <div className="wf-comment">
                                        {r.review_write}
                                        {r.user_nickname === localStorage.getItem("authToken") && (
                                            <button
                                                className="wf-CommentDelete"
                                                onClick={() => handleDeleteReview(r.review_id)}
                                            >
                                                리뷰 삭제
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {canWrite && (
                        <div className="wf-reviewWriteWrap mt-5">
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
                            {isLoggedIn && hasReview && '리뷰작성 완료했습니다.'}
                        </div>
                    )}
                </section>

                <section className="wf-bottom">
                    <div className="wf-wrap">
                        {hasUsedAi ? (
                            <button
                                className="write-btn"
                                onClick={() => {
                                    const token = localStorage.getItem("authToken");
                                    if (!token) {
                                        alert("로그인 후 이용 가능합니다.");
                                        navigate("/login");
                                        return;
                                    }
                                    navigate(`/${aiData.ai_content}`);  // 챗봇 페이지
                                }}
                            >
                                계속 대화하기
                            </button>
                        ) : usageInfo?.has_free_usage ? (
                            <button
                                className="write-btn"
                                onClick={() => {
                                    const token = localStorage.getItem("authToken");
                                    if (!token) {
                                        alert("로그인 후 무료 사용 가능합니다.");
                                        navigate("/login");
                                        return;
                                    }
                                    navigate(`/${aiData.ai_content}`);
                                }}
                            >
                                무료 사용 시작하기 ({3-usageInfo.used_count}/3)
                            </button>
                        ) : (
                            <button
                                className="write-btn"
                                onClick={() => navigate('/payment')}  // 결제 페이지
                            >
                                결제하기 (₩{aiData.ai_price})
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
