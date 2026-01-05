// frrontend/src/api/user_Api.js
import axios from 'axios';

export const protectedApi = axios.create({ baseURL: 'http://localhost:5000/api' });
export const publicApi = axios.create({ baseURL: 'http://localhost:5000/api' });


// 토큰 매니저를 통해서 유저 아이디 빨리 불러올수 있게 하기
export const TokenManager = {
  save: (nickname) => {
    localStorage.setItem("authToken", nickname);
    localStorage.setItem("userNickname", nickname);
    window.dispatchEvent(new Event("auth-change"));
  },
  clear: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userNickname");
    localStorage.removeItem("userId");
    window.dispatchEvent(new Event("auth-change"));
  },
  //닉네임불러오기 함수
  getNickname: () => localStorage.getItem("authToken") || null,
  isLoggedIn: () => !!localStorage.getItem("authToken"),
  //프로필 전부 불러오기 함수
  getUserProfile: async () => {
    const token = TokenManager.getNickname();
    if (!token) return null;
    try {
      return (await protectedApi.get('/users/mypage')).data;
    } catch {
      return null;
    }
  },
  //아이디 불러오기 함수
  getUserId: async () => {
    const profile = await TokenManager.getUserProfile();
    return profile?.user_id;
  }
};

// 인터셉터 실제 구헌 함수
protectedApi.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${encodeURIComponent(token)}`;
  }
  return config;
});

// 실제 토큰매니저 활성화 시키기
export const AuthUtils = {
  login: TokenManager.save,
  logout: TokenManager.clear,
  isLoggedIn: TokenManager.isLoggedIn,
  getNickname: TokenManager.getNickname
};


// 1. 닉네임 이메일 중복 체크 API
export async function Id_Check(type, value) {
  const res = await publicApi.get(`/users/check/${type}`, {
    params: { value }
  });
  return res.data;  // 데이터형식  예시 { 가능여부: true/false, 에러메세지 : "..." }
}


// 2. 회원가입 API
export async function New_User(formData) {
  const res = await publicApi.post('/users', formData);
  return res.data;  // 데이터형식  예시 {성공여부 :메세지}
}


// 3. 로그인 API
export const loginUser = async (email, password) => {
    const response = await publicApi.post("/users/login", {email,password});
    return response.data;      // 데이터 형식 { success, message }
}
//=============================================================================



