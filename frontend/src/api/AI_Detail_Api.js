// AI_Detail_Api.js
import { protectedApi, TokenManager } from './User_Api';

const API_BASE = '/api';

//ai정보 조회 Api
export const fetchAiDetail = async (aiId) => {
  const response = await protectedApi.get(`/ai/${aiId}`);
  return response.data;
};

//리뷰 생성 Api
export const createReview = async (aiId, reviewText) => {
  if (!TokenManager.isLoggedIn()) {
    throw new Error('로그인이 필요합니다.');
  }
  const response = await protectedApi.post(`/ai/${aiId}/review`, {
    review_write: reviewText
  });
  return response.data;
};

//리뷰삭제 Api
export const deleteReview = async (aiId, reviewId) => {
  if (!TokenManager.isLoggedIn()) {
    throw new Error('로그인이 필요합니다.');
  }
  const response = await protectedApi.delete(`/ai/${aiId}/review/${reviewId}`);
  return response.data;
};

