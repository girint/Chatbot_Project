//frontend/src/api/Mypage_Api.js
import axios from 'axios';
import { AuthUtils,TokenManager } from './User_Api';


const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// AuthUtils 토큰 자동 추가 인터셉터
api.interceptors.request.use((config) => {
  const token = AuthUtils.getNickname();
  if (token) {
    const safeToken = encodeURIComponent(token);
    config.headers.Authorization = `Bearer ${safeToken}`;
  }
  return config;
});


//마이페이지 내에 유저 정보 변경 디버깅까지 완료
export async function updateProfile(updateData) {
  // 항상 FormData로 보내면 백엔드 request.form/request.files와 100% 매칭됨
  const formData = new FormData();
  if (updateData.nickname) formData.append('nickname', updateData.nickname);
  if (updateData.password) formData.append('password', updateData.password);
  if (updateData.image instanceof File) formData.append('image', updateData.image);

  const res = await api.patch('/users/mypage', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  // 닉네임 바뀌었으면 토큰 갱신
  const newNick = res.data?.user?.user_nickname;
  if (newNick && newNick !== AuthUtils.getNickname()) {
    AuthUtils.login(newNick);
  }

  return res.data;
}


// 내 정보 조회
export async function getMyProfile() {
  const res = await api.get('/users/mypage');
  return res.data;
}

////회원탈퇴 API
//export const delete_user = async () => {
//  const token = TokenManager.getToken();
//
//  const response = await fetch(`users/delete`, {
//    method: 'DELETE',
//    headers: {
//      'Authorization': `Bearer ${token}`,
//      'Content-Type': 'application/json'
//    }
//  });
//
//  if (!response.ok) {
//    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//  }
//
//  return await response.json();
//};

// Mypage_Api.js
export const delete_user = async () => {
  const token = TokenManager.getNickname();  // 👈 닉네임 = 토큰!

  if (!token) {
    throw new Error('로그인 토큰이 없습니다.');
  }

  const response = await fetch(`http://localhost:5000/api/users/delete`, {  // 👈 풀 URL!
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${encodeURIComponent(token)}`,  // 👈 User_Api와 동일!
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};