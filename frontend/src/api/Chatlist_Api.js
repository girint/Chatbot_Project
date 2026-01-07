// src/api/Chatlist_Api.js
import { protectedApi, TokenManager } from "./User_Api";

export const GetLastChat = async () => {
  try {
    const userId = await TokenManager.getUserId();
    console.log("🔍 GetLastChat - userId:", userId);  // 👈 디버깅 로그

    if (!userId) {
      console.warn("❌ 로그인 필요 - userId 없음");
      return { last_chats: [] };
    }

    console.log(`📡 API 호출: /${userId}/last-chats`);
    const response = await protectedApi.get(`/${userId}/last-chats`);
    console.log("✅ API 응답:", response.data);

    return response.data;
  } catch (error) {
    console.error("❌ 유저 마지막 채팅 로드 실패:", error);
    return { last_chats: [] };
  }
};

export const GetRoomMessages = async (useboxId) => {
  try {
    const userId = await TokenManager.getUserId();
    console.log("🔍 GetRoomMessages - userId:", userId, "useboxId:", useboxId);

    if (!userId) {
      return { success: false, messages: [] };
    }

    const response = await protectedApi.get(`/${userId}/chats/${useboxId}/messages`);
    console.log("✅ 방 메시지 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 방 메시지 로드 실패:", error);
    return { success: false, messages: [] };
  }
};
