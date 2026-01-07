import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ChatRoom from "./ChatRoom";
import { GetLastChat, GetRoomMessages } from "../../api/Chatlist_Api";
import "../../css/ChatList.css";

export default function ChatList() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [mobileView, setMobileView] = useState("list");
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      const data = await GetLastChat();
      if (data?.last_chats && Array.isArray(data.last_chats)) {
        setRooms(data.last_chats.map(chat => ({
          id: chat.use_id,
          title: chat.ai_name,
          preview: chat.last_question || chat.last_answer || "",
          img: chat.ai_image || "/img/default-ai.png",
          ai_content: chat.ai_content
        })));
      }
      setLoadingRooms(false);
    };
    fetchRooms();
  }, []);

  const activeRoom = useMemo(
    () => rooms.find(r => r.id === activeRoomId) || null,
    [rooms, activeRoomId]
  );

  const getLastPreview = useCallback((room) => {
    if (room.preview) return room.preview;
    const list = messagesByRoom?.[room.id] || [];
    return list[list.length - 1]?.text ?? "";
  }, [messagesByRoom]);

  const handleClickRoom = async (roomId) => {
    console.log("방 클릭:", roomId);
    setActiveRoomId(roomId);
    setMobileView("chat");

    if (!messagesByRoom[roomId]) {
      setLoadingMessages(true);
      try {
        const data = await GetRoomMessages(roomId);
        console.log("API 응답:", data);

        if (data?.success && Array.isArray(data.messages)) {
          const messages = data.messages
            .filter(msg => msg && msg.text)
            .map(msg => ({
              id: msg.id || `msg_${Date.now()}`,
              text: msg.text,
              me: msg.sender === 'user',
              createdAt: new Date(msg.created_at || Date.now()).getTime()
            }));

          console.log("메시지 변환:", messages.length, "개");
          setMessagesByRoom(prev => ({
            ...prev,
            [roomId]: messages
          }));
        }
      } catch (error) {
        console.error("로딩 에러:", error);
      } finally {
        setLoadingMessages(false);
      }
    }
  };

  const handleSendMessage = (roomId, text) => {
    const value = String(text || "").trim();
    if (!value) return;

    setMessagesByRoom(prev => {
      const next = { ...prev };
      const list = [...(next[roomId] || [])];
      list.push({
        id: Date.now(),
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
      <aside className="chatSide">
        <div className="chatTop">
          <div className="chatTopBar">
            <button
              type="button"
              className="chatHomeBtn"
              onClick={() => {
                navigate("/");
                setMobileView("list");
              }}
              title="메인으로"
            >
              ⟵
            </button>
            <div className="chatTopTitle">뒤로가기</div>
          </div>
        </div>

        <div className="chatListBody">
          {loadingRooms ? (
            <div className="chatLoading">대화 목록 불러오는 중...</div>
          ) : rooms.length === 0 ? (
            <div className="chatEmptyList">대화 기록이 없습니다.</div>
          ) : (
            rooms.map(room => (
              <button
                key={room.id}
                type="button"
                className={`chatRoomRow ${activeRoomId === room.id ? "active" : ""}`}
                onClick={() => handleClickRoom(room.id)}
              >
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
            ))
          )}
        </div>
      </aside>

      <main className="chatMain">
        {!activeRoom ? (
          <div className="chatEmpty">
            <div className="chatEmptyTitle">목록을 선택해주세요.</div>
            <div className="chatEmptyDesc">왼쪽 대화목록을 누르면 대화가 보여요.</div>
          </div>
        ) : loadingMessages ? (
          <div className="chatLoadingMsg">메시지 불러오는 중...</div>
        ) : (
          <ChatRoom
            room={activeRoom}
            messages={messagesByRoom?.[activeRoomId] || []}
            onSend={text => handleSendMessage(activeRoomId, text)}
          />
        )}
      </main>
    </div>
  );
}
