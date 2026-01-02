// src/components/.../ChatList.jsx
import '../../css/ChatList.css'
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetLastChat } from '../../api/Chatlist_Api';
import { TokenManager } from '../../api/User_Api';

export default function ChatList() {
    const topProfiles = [
        { id:1, name: "커스텀1", img:"/img/chatlist2.png"},
        { id:2, name: "커스텀2", img:"/img/chatlist2.png"},
        { id:3, name: "커스텀3", img:"/img/chatlist2.png"},
        { id:4, name: "커스텀4", img:"/img/chatlist2.png"},
    ];

    // ★ API에서 받을 데이터
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLastChats = async () => {
            try {
                setLoading(true);
                 const userId = await TokenManager.getUserId();
                    if (!userId) {
                      setError("로그인 후 이용해주세요.");
                      setLoading(false);
                      return;
                    }

                const data = await GetLastChat(userId);

                setRooms(data.last_chats || []);
            } catch (err) {
                console.error(err);
                setError("채팅 목록을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchLastChats();
    }, []);

    const handleChatClick = (room) => {
        const token = TokenManager.getNickname();;
        if (!token) {
            alert("로그인 후 이용이 가능합니다.");
            navigate("/login");
            return;
        }
        navigate(`/${room}`);
    };

    if (loading) {
        // 로딩 UI (생략)
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (loading) {
        return (
            <div className='chatListPage'>
                <div className='chatListShell'>
                    <div className='chatTop'>
                        <div className='topIcons'>
                            {topProfiles.map((p) => (
                                <button key={p.id} className='iconCircleBtn' type='button' title={p.name}>
                                    <img className='iconCircleImg' src={p.img} alt={p.name} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className='chatListBody'>
                        <div className='chatRoomRow'>로딩 중...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='chatListPage'>
                <div className='chatListShell'>
                    <div className='chatTop'>
                        <div className='topIcons'>
                            {topProfiles.map((p) => (
                                <button key={p.id} className='iconCircleBtn' type='button' title={p.name}>
                                    <img className='iconCircleImg' src={p.img} alt={p.name} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className='chatListBody'>
                        <div className='chatRoomRow'>{error}</div>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className='chatListPage'>
            <div className='chatListShell'>
                {/* 상단 프로필 고정 */}
                <div className='chatTop'>
                    <div className='topIcons'>
                        {topProfiles.map((p) => (
                            <button key={p.id} className='iconCircleBtn' type='button' title={p.name}>
                                <img className='iconCircleImg' src={p.img} alt={p.name} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 목록 영역만 스크롤 */}
                <div className='chatListBody'>
                    {rooms.length === 0 && (
                        <div className='chatRoomRow'>최근 대화가 없습니다.</div>
                    )}

                    {rooms.map((r) => (
                        <div key={r.use_id} className='chatRoomRow' onClick={() => handleChatClick(r.ai_content)} style={{ cursor: 'pointer' }}>
                            <div className='chatAvatar'>
                                {/* AI 프로필 이미지 */}
                                {r.ai_image && ( <img src={r.ai_image} alt={r.ai_name} className='chatAvatarImg' /> )}
                            </div>
                            <div className='chatRoomText'>
                                {/* AI 이름 */}
                                <div className='chatRoomTitle'>{r.ai_name}</div>
                                {/* 마지막 대화(프리뷰) */}
                                <div className='chatRoomPreview'>
                                    {r.last_question || r.last_answer || '대화 내용 없음'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
