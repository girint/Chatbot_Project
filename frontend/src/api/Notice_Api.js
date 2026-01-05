// src/api/Notice_Api.js
import { protectedApi, TokenManager } from './User_Api';

// ===== 1. 게시글 등록 =====
export const create_notice = async (noticeData) => {
  try {
    if (!TokenManager.isLoggedIn()) {
      return { success: false, error: '로그인 후 이용해주세요.' };
    }

    let formData;
    if (noticeData instanceof FormData) {
      formData = noticeData;
    } else {
      formData = new FormData();
      if (noticeData.title) formData.append('title', noticeData.title);
      if (noticeData.content) formData.append('content', noticeData.content);
      if (noticeData.tags) formData.append('tags', noticeData.tags);
      if (noticeData.price) formData.append('price', noticeData.price || 0);
      if (noticeData.images?.length) {
        noticeData.images.forEach(img => formData.append('images', img));
      }
    }

    const response = await protectedApi.post('/notices', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    console.log('✅ 게시글 등록 성공:');
    return response.data;

  } catch (error) {
    console.error("❌ notice 등록 실패:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message || '등록 실패'
    };
  }
};

// ===== 2. 공지 상세 + 댓글 =====
export const fetchNoticeDetail = async (noticeId) => {
  try {
    const response = await protectedApi.get(`/notice/${noticeId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || '공지 정보를 불러올 수 없습니다.');
    }
    console.log(`✅ 공지 ${noticeId} 조회 성공`);
    return response.data;
  } catch (error) {
    console.error(`❌ 공지 ${noticeId} 조회 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ===== 3. 공지 좋아요 =====
export const likeNotice = async (noticeId) => {
  try {
    const response = await protectedApi.post(`/notice/${noticeId}/like`);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    console.log(`✅ 공지 ${noticeId} 좋아요 성공: ${response.data.notice_like}`);
    return response.data;
  } catch (error) {
    console.error(`❌ 공지 ${noticeId} 좋아요 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ===== 4. 댓글 등록 =====
export const createComment = async (noticeId, commentData) => {
  try {
    const response = await protectedApi.post(`/notice/${noticeId}/comments`, commentData);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    console.log(`✅ 댓글 등록 성공: ${noticeId}`);
    return response.data.comment;
  } catch (error) {
    console.error(`❌ 댓글 등록 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ===== 5. 공지 삭제 =====
export const deleteNotice = async (noticeId) => {
  try {
    const response = await protectedApi.delete(`/notice/${noticeId}`);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    console.log(`✅ 공지 ${noticeId} 삭제 성공`);
    return response.data;
  } catch (error) {
    console.error(`❌ 공지 ${noticeId} 삭제 실패:`, error.response?.data || error.message);
    throw error;
  }
};

// ===== 6. 댓글 삭제 =====
export const deleteComment = async (noticeId, commentId) => {
  try {
    const response = await protectedApi.delete(`/notice/${noticeId}/comments/${commentId}`);
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    console.log(`✅ 댓글 삭제 성공: ${commentId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ 댓글 삭제 실패:`, error.response?.data || error.message);
    throw error;
  }
};