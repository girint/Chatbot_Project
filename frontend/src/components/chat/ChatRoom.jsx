// - room, messages를 props로 받음
// - 전송 버튼/엔터로 onSend 호출
import { useEffect, useRef, useState } from "react";
import "../../css/ChatRoom.css";

export default function ChatRoom({ room, messages = [], onSend }) {
  const [msg, setMsg] = useState("");
  const endRef = useRef(null);

  // 메시지 추가되면 맨 아래로 자동 스크롤
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = () => {
    const value = msg.trim();
    if (!value) return;
    onSend?.(value);
    setMsg("");
  };

  return (
    <div className="chatRoom">
      {/* 상단 해더 */}
      <div className="chatRoomHeader">{room.title}</div>

      {/* 메시지 영역 */}
      <div className="chatRoomBody">
        {messages.map((m) => (
          <div key={m.id} className={`chatBubble ${m.me ? "me" : ""}`}>
            {m.text}
            <div className="chatBubbleTime">
              {new Date(m.createdAt).toLocaleTimeString("ko-KR", {hour: "2-digit", minute: "2-digit",})}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="chatRoomInput">
        <input
          className="chatInput"
          placeholder="메시지 입력"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
        <button className="chatSendBtn" type="button" onClick={handleSubmit}>
          전송
        </button>
      </div>
    </div>
  );
}
