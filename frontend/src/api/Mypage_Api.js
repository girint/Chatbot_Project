//frontend/src/api/Mypage_Api.js
import { protectedApi,TokenManager } from './User_Api';

//유저 정보 변경 Api
export async function updateProfile(updateData) {
  const formData = new FormData();
  if (updateData.nickname) formData.append('nickname', updateData.nickname);
  if (updateData.password) formData.append('password', updateData.password);
  if (updateData.image instanceof File) formData.append('image', updateData.image);

  const res = await protectedApi.patch('/users/mypage', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  // 닉네임 바뀔 때 토큰 갱신
  const newNick = res.data?.user?.user_nickname;
  if (newNick && newNick !== TokenManager.getNickname()) {
    TokenManager.save(newNick);
  }

  return res.data;
}


//정보 조회 Api
export async function getMyProfile() {
  const res = await protectedApi.get('/users/mypage');
  return res.data;
}


//회원탈퇴 Api
export const delete_user = async () => {
  const token = TokenManager.getNickname();
  if (!token) {
    throw new Error("로그인 토큰이 없습니다.");
  }

  try {
    const res = await protectedApi.delete("/users/delete");
    return res.data;
  } catch (err) {
    console.error("회원 탈퇴 실패:", err);
    throw err;
  }
};