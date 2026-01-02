// src/api/Notice_Api.js
import axios from 'axios';
import { TokenManager } from './User_Api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios 인스턴스 생성 (인터셉터 포함)
const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

//토큰 처리 인터셉터
client.interceptors.request.use((config) => {
  const token = TokenManager.getNickname();

  if (token) {
    const encodedToken = encodeURIComponent(token);
    config.headers.Authorization = `Bearer ${encodedToken}`;
    console.log(`🔐 NoticeApi 토큰: ${token} → ${encodedToken}`);
  } else {
    console.log('🔓 NoticeApi 토큰 없음');
  }

  return config;
});

// ===== 1. 게시글 등록 =====
export const create_notice = async (noticeData) => {
  try {
    //로그인 체크
    if (!TokenManager.isLoggedIn()) {
      return {
        success: false,
        error: '로그인 후 이용해주세요.'
      };
    }

    // FormData 자동 변환
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

    const response = await client.post('/notices', formData, {
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
    const response = await client.get(`/notice/${noticeId}`);
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
    const response = await client.post(`/notice/${noticeId}/like`);
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
    const response = await client.post(`/notice/${noticeId}/comments`, commentData);
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
    const response = await client.delete(`/notice/${noticeId}`);
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
    const response = await client.delete(`/notice/${noticeId}/comments/${commentId}`);
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