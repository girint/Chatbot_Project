import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./NoticeDetail.css";
import { fetchNoticeDetail, likeNotice, createComment, deleteNotice, deleteComment } from "../../api/Notice_Api";
import { AuthUtils } from '../../api/User_Api';

export default function NoticeDetail() {
  const { noticeId } = useParams();
  const navigate = useNavigate();

  // 상태 통합
  const [state, setState] = useState({
    noticeData: null,
    comments: [],
    newComment: "",
    loading: true,
    likeLoading: false,
    commentLoading: false,
    error: null
  });

  // 데이터 로드
  useEffect(() => {
    const loadDetail = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await fetchNoticeDetail(noticeId);
        setState(prev => ({
          ...prev,
          noticeData: data.notice,
          comments: data.comments || [],
          loading: false
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err.message || "공지 정보를 불러오지 못했습니다.",
          loading: false
        }));
      }
    };
    if (noticeId) loadDetail();
  }, [noticeId]);

  // 줄바꿈 처리
  const formattedBody = useMemo(() => {
    return state.noticeData?.notice_write?.split("\n") || [];
  }, [state.noticeData?.notice_write]);

  // 좋아요
  const onClickLike = async () => {
    if (!state.noticeData || state.likeLoading) return;
    try {
      setState(prev => ({ ...prev, likeLoading: true }));
      const res = await likeNotice(state.noticeData.notice_id);
      setState(prev => ({
        ...prev,
        noticeData: { ...prev.noticeData, notice_like: res.notice_like }
      }));
    } catch (err) {
      alert(err.message || "좋아요 처리 중 오류");
    } finally {
      setState(prev => ({ ...prev, likeLoading: false }));
    }
  };

  // 삭제
  const onClickDelete = async () => {
    if (!state.noticeData || !window.confirm("정말 삭제할까요?")) return;
    try {
      await deleteNotice(state.noticeData.notice_id);
      alert("공지가 삭제되었습니다.");
      navigate("/");
    } catch (err) {
      alert(err.message || "삭제 중 오류");
    }
  };

  // 댓글 등록
  const onSubmitComment = async (e) => {
    e.preventDefault();
    const text = state.newComment.trim();
    if (!text || !state.noticeData || state.commentLoading || !AuthUtils.isLoggedIn()) {
      if (!AuthUtils.isLoggedIn()) alert("로그인 후 댓글을 작성할 수 있습니다.");
      return;
    }
    try {
      setState(prev => ({ ...prev, commentLoading: true }));
      const created = await createComment(state.noticeData.notice_id, { comment_write: text });
      setState(prev => ({
        ...prev,
        comments: [created, ...prev.comments],
        newComment: ""
      }));
    } catch (err) {
      alert(err.message || "댓글 등록 중 오류");
    } finally {
      setState(prev => ({ ...prev, commentLoading: false }));
    }
  };

  //댓글 삭제
  const onDeleteComment = async (commentId) => {
    if (!window.confirm("정말 삭제할까요?")) return;
    try {
      await deleteComment(state.noticeData.notice_id, commentId);
      setState(prev => ({
        ...prev,
        comments: prev.comments.map(c =>
          c.comment_id === commentId
            ? { ...c, comment_delete: true }
            : c
        )
      }));
    } catch (err) {
      alert(err.message || "댓글 삭제 중 오류");
    }
  };

  // 상태 체크
  if (state.loading) return <div className="nd-page"><div className="nd-card"><h2>로딩 중...</h2></div></div>;
  if (state.error || !state.noticeData) return (
    <div className="nd-page">
      <div className="nd-card">
        <h2>공지 정보를 불러올 수 없습니다.</h2>
        {state.error && <p>{state.error}</p>}
      </div>
    </div>
  );
  if (state.noticeData.notice_delete) return (
    <div className="nd-page"><div className="nd-card"><h2>삭제된 공지 입니다.</h2></div></div>
  );

  return (
    <div className="nd-page">
      <div className="nd-card">
        {/* 헤더 */}
        <div className="nd-header">
          <h1 className="nd-title">{state.noticeData.notice_title}</h1>
          <div className="nd-metaRow">
            <div className="nd-metaLeft">
              <span className="nd-author">{state.noticeData.author_name}</span>
              <span className="nd-date">{state.noticeData.notice_new}</span>
              <span className="nd-views">조회수 {state.noticeData.notice_view_count ?? 0}</span>
            </div>
            <button className="nd-likeBtn" onClick={onClickLike} disabled={state.likeLoading}>
              좋아요 <b>{state.noticeData.notice_like ?? 0}</b>
            </button>
          </div>
        </div>

        <div className="nd-divider" />

        {/* 본문 */}
        <div className="nd-body">
          {formattedBody.map((line, idx) => (
            <p key={idx} className="nd-bodyLine">{line}</p>
          ))}
          {state.noticeData.notice_image && (
            <div className="nd-imageWrap">
              <img className="nd-image" src={state.noticeData.notice_image} alt="공지 이미지" />
            </div>
          )}
        </div>

        {/* 네비 + 액션 */}
        <div className="nd-navRow">
          <div className="nd-prevNext">
            <button className="nd-navBtn" disabled={!state.noticeData.prev_notice_id}
              onClick={() => navigate(`/notice/${state.noticeData.prev_notice_id}`)}>
              ← 이전글
            </button>
            <button className="nd-navBtn" disabled={!state.noticeData.next_notice_id}
              onClick={() => navigate(`/notice/${state.noticeData.next_notice_id}`)}>
              다음글 →
            </button>
          </div>
          <div className="nd-actions">
            <button className="nd-actionBtn nd-edit" onClick={() => navigate(`/notice/edit/${state.noticeData.notice_id}`)}>
              수정
            </button>
            <button className="nd-actionBtn nd-del" onClick={onClickDelete}>삭제</button>
          </div>
        </div>

        <div className="nd-divider" />

        {/* 댓글 */}
        <div className="nd-comments">
          <div className="nd-commentsHeader">
            댓글 {state.comments.filter(c => !c.comment_delete).length}
          </div>
          <ul className="nd-commentList">
            {state.comments.filter(c => !c.comment_delete).map(c => (
              <li key={c.comment_id} className="nd-commentItem">
                <div className="nd-commentTop">
                  <div className="nd-commentMeta">
                    <span className="nd-commentAuthor">{c.user_nickname}</span>
                    <span className="nd-commentDate">{c.comment_new}</span>
                  </div>
                  <button className={`nd-heartBtn ${c.ui_liked ? "is-liked" : ""}`}
                    onClick={() => setState(prev => ({
                      ...prev,
                      comments: prev.comments.map(item =>
                        item.comment_id === c.comment_id
                          ? { ...item, ui_liked: !item.ui_liked }
                          : item
                      )
                    }))}>
                    {c.ui_liked ? "♥" : "♡"}
                  </button>
                </div>
                <div className="nd-commentBody">{c.comment_write}
                  <button
                  className="nd-commentDelete"
                  onClick={() => onDeleteComment(c.comment_id)}
                >
                  댓글 삭제
                </button>
                </div>
              </li>
            ))}
          </ul>

          <form className="nd-commentForm" onSubmit={onSubmitComment}>
            <div className="nd-commentBox">
              <textarea
                className="nd-commentInput"
                value={state.newComment}
                onChange={e => setState(prev => ({ ...prev, newComment: e.target.value }))}
                onKeyDown={e => {
                  if (e.isComposing || e.shiftKey || e.key !== "Enter") return;
                  e.preventDefault();
                  onSubmitComment(e);
                }}
                placeholder="댓글을 입력하세요"
                disabled={state.commentLoading}
              />
              <div className="nd-commentAction">
                <button className="nd-commentSubmit" type="submit"
                  disabled={state.commentLoading || !state.newComment.trim()}>
                  {state.commentLoading ? "등록중..." : "등록"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
