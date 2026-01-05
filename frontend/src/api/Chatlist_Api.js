// src/api/Chatlist_Api.js
import { protectedApi, TokenManager } from "./User_Api";

export const GetLastChat = async () => {
  try {
    const userId = await TokenManager.getUserId();
    if (!userId) {
      console.warn("로그인 필요");
      return { success: false, total_useboxes: 0, last_chats: [] };
    }

    const response = await protectedApi.get(`/${userId}/last-chats`);
    return response.data;

  } catch (error) {
    console.error("유저 마지막 채팅 로드 실패:", error);
    return { success: false, total_useboxes: 0, last_chats: [] };
  }
};