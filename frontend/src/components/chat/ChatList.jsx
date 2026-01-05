// ChatList.jsx (메인)
// - 왼쪽 목록 + 오른쪽 채팅 영역 레이아웃
// - activeRoomId / messages를 localStorage에 저장해서 새로고침해도 유지
// - 왼쪽 상단에 홈 버튼(메인 이동)

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatRoom from "./ChatRoom";
import "../../css/ChatList.css";

export default function ChatList() {
  const navigate = useNavigate();

  // rooms는 변하지 않는 더미데이터(필요하면 API로 교체)
  const rooms = useMemo(
    () => [
      { id: 1, title: "1번", preview: "이곳은 대화목록창입니다.", img: "/img/chatlist2.png" },
      { id: 2, title: "2번", preview: "이곳은 대화목록창입니다2.", img: "/img/chatlist2.png" },
      { id: 3, title: "3번", preview: "이곳은 대화목록창입니다3.", img: "/img/chatlist2.png" },
      { id: 4, title: "4번", preview: "이곳은 대화목록창입니다4.", img: "/img/chatlist2.png" },
      { id: 5, title: "5번", preview: "이곳은 대화목록창입니다5.", img: "/img/chatlist2.png" },
      { id: 6, title: "6번", preview: "이곳은 대화목록창입니다6.", img: "/img/chatlist2.png" },
    ],
    []
  );

  // 마지막 선택한 방 id 저장용 key
  const ACTIVE_KEY = "chat_active_room_id";
  // 메시지 저장용 key
  const MSG_KEY = "chat_messages_v1";

  // 현재 선택된 방 id (localStorage에서 복구)
  const [activeRoomId, setActiveRoomId] = useState(() => {
    const saved = localStorage.getItem(ACTIVE_KEY);
    return saved ? Number(saved) : null;
  });

  // 방별 메시지 저장 구조
  const [messagesByRoom, setMessagesByRoom] = useState(() => {
    try {
      const saved = localStorage.getItem(MSG_KEY);
      if (!saved) {
        // 초기 더미 메시지 (원하면 삭제 가능)
        return {
          1: [
            { id: 1, text: "안녕하세요, 여기는 대화창입니다.", me: false, createdAt: Date.now() - 60000 },
            { id: 2, text: "1번 누르면 오른쪽 고정으로 보여요.", me: true, createdAt: Date.now() - 30000 },
          ],
        };
      }
      return JSON.parse(saved);
    } catch (e) {
      return {};
    }
  });

  // activeRoomId가 바뀔 때마다 저장
  useEffect(() => {
    if (activeRoomId == null) localStorage.removeItem(ACTIVE_KEY);
    else localStorage.setItem(ACTIVE_KEY, String(activeRoomId));
  }, [activeRoomId]);

  // messagesByRoom 바뀔 때마다 저장
  useEffect(() => {
    localStorage.setItem(MSG_KEY, JSON.stringify(messagesByRoom));
  }, [messagesByRoom]);

  // 현재 선택된 room 객체
  const activeRoom = useMemo(() => rooms.find((r) => r.id === activeRoomId) || null, [rooms, activeRoomId]);

  // 목록에서 보여줄 "마지막 메시지" (인스타/디스코드 느낌)
  const getLastPreview = (room) => {
    const list = messagesByRoom?.[room.id] || [];
    const last = list[list.length - 1];
    return last?.text ?? room.preview ?? "";
  };

  // 메시지 전송(오른쪽 ChatRoom에서 호출)
  const handleSendMessage = (roomId, text) => {
    const value = String(text || "").trim();
    if (!value) return;

    setMessagesByRoom((prev) => {
      const next = { ...(prev || {}) };
      const list = next[roomId] ? [...next[roomId]] : [];
      list.push({
        id: Date.now(), // 간단 id
        text: value,
        me: true,
        createdAt: Date.now(),
      });
      next[roomId] = list;
      return next;
    });
  };

  return (
    <div className="chatApp">
      {/* 왼쪽 대화목록 */}
      <aside className="chatSide">
        <div className="chatTop">
          {/* 상단: 홈 버튼 + 타이틀 */}
          <div className="chatTopBar">
            <button
              type="button"
              className="chatHomeBtn"
              onClick={() => navigate("/")} // 메인 라우트로 이동 (너 프로젝트에 맞게 변경 가능)
              title="메인으로"
            >
              ⟵
            </button>
            <div className="chatTopTitle">메시지</div>
          </div>
        </div>

        {/* 목록 많아지면 여기만 스크롤 */}
        <div className="chatListBody">
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              className={`chatRoomRow ${activeRoomId === room.id ? "active" : ""}`}
              onClick={() => setActiveRoomId(room.id)}
            >
              {/* 사진(프로필) */}
              {room.img ? (
                <img className="chatAvatarImg" src={room.img} alt="" />
              ) : (
                <div className="chatAvatar" />
              )}

              <div className="chatRoomText">
                <div className="chatRoomTitle">{room.title}</div>
                <div className="chatRoomPreview">{getLastPreview(room)}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* 오른쪽 채팅 / 빈 화면 */}
      <main className="chatMain">
        {!activeRoom ? (
          <div className="chatEmpty">
            <div className="chatEmptyTitle">목록을 선택해주세요.</div>
            <div className="chatEmptyDesc">왼쪽 대화목록을 누르면 대화가 보여요.</div>
          </div>
        ) : (
          <ChatRoom
            room={activeRoom}
            messages={messagesByRoom?.[activeRoom.id] || []}
            onSend={(text) => handleSendMessage(activeRoom.id, text)}
          />
        )}
      </main>
    </div>
  );
}
