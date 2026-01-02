// AI_Detail_Api.js
import { TokenManager } from './User_Api';

const API_BASE = '/api';

//ai정보 제공
export const fetchAiDetail = async (aiId) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = TokenManager.getNickname();
  if (token) {
    headers.Authorization = `Bearer ${encodeURIComponent(token)}`;
  }

  const response = await fetch(`${API_BASE}/ai/${aiId}`, { headers });

  if (!response.ok) {
    throw new Error('AI 정보를 가져오지 못했습니다.');
  }
  return response.json();
};

//리뷰 생성
export const createReview = async (aiId, reviewText) => {
  if (!TokenManager.isLoggedIn()) {
    throw new Error('로그인이 필요합니다.');
  }

  const headers = TokenManager.getNickname() ? {
    'Authorization': `Bearer ${encodeURIComponent(TokenManager.getNickname())}`,
    'Content-Type': 'application/json'
  } : { 'Content-Type': 'application/json' };

  const response = await fetch(`${API_BASE}/ai/${aiId}/review`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ review_write: reviewText })
  });

  if (!response.ok) {
    throw new Error('리뷰 작성에 실패했습니다.');
  }
  return response.json();
};

//리뷰삭제
export const deleteReview = async (aiId, reviewId) => {
  if (!TokenManager.isLoggedIn()) {
    throw new Error('로그인이 필요합니다.');
  }

  const headers = {
    'Authorization': `Bearer ${encodeURIComponent(TokenManager.getNickname())}`
  };

  const response = await fetch(`${API_BASE}/ai/${aiId}/review/${reviewId}`, {
    method: 'DELETE',
    headers
  });

  if (!response.ok) {
    throw new Error('리뷰 삭제에 실패했습니다.');
  }
  return response.json();
};

