import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/User_Api"; // 로그인 API

export default function Login() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate()

  // 클라이언트에서 간단한 토큰 생성 (Base64 인코딩)-> 이 부분은 공부가 더 필요함 토큰 생성
  // 원하고자 하는 구현 기능 로그인시 토큰 생성 및 토큰 발행 시간도 생성 1시간 지나면 자동 삭제
  // 5분남았을떄 갱신할꺼냐 물어볼꺼임

  //실제 폼 저장라인
  const onSubmit = async(e) => {
    e.preventDefault();        // 폼 기본 제출 막기
    setLoading(true);
    setError("");

     try {
      const data = await loginUser(email, password);  // User_Api.js에 정의한 loginUser 호출

       if (data.success) {
           console.log("✅ 로그인 성공 응답:", data); // 백엔드 응답 전체 나중에 추가할 부분

        const userSession = {
          ...data.user,                    // nickname, email
          timestamp: Date.now(),
          expiresAt: Date.now() + 60 * 60 * 1000, // 1시간 후 만료
        };

        console.log("✅ 세션 객체 생성:", userSession); // 세션 객체 확인 나중에 삭제할꺼임
        console.log("🎉 로그인 완료! 메인으로 이동합니다."); // 이거 뜨면 로그인 되는거임

        localStorage.setItem("userSession", JSON.stringify(userSession));
        console.log("✅ localStorage 저장 완료"); // 저장 완료 나중에 삭제할꺼임
        navigate("/ ");
      } else {
          console.error("❌ 로그인 실패:", data.message);
          setError(data.message);
      }
    } catch (err) {
        console.error("💥 로그인 에러:", err.message);
        setError(err.message);
    } finally {

      setLoading(false);
    }
  };



  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-avatar">
          {/* 아이콘 이미지 public에 넣고 아래 src만 바꾸기 */}
          <img src="/img/Login_logo.png" alt="avatar" />
        </div>

        <form onSubmit={ onSubmit } className="login-form">
          <label className="login-label">이메일</label>
          <input className="login-input" type="email" value={ email } onChange={(e) => setemail(e.target.value)} placeholder="" disabled={loading} autoComplete="email"/>

          <label className="login-label">비밀번호</label>
          <input className="login-input" type="password" value={ password } onChange={(e) => setPassword(e.target.value)} placeholder="" disabled={loading} autoComplete="current-password" />

           {/*에러메세지 출력 란*/}
           {error && (<div className="error-message" style={{ color: "red", fontSize: "14px", margin: "10px 0" }}> {error} </div> )}

            {/*로그인 버튼*/}
            <button type="submit" className="btn-login" disabled={loading || !email || !password}>{loading ? "로그인 중..." : "로그인"}</button>

            <button type="button" className="btn-signup" onClick={()=>{navigate('/Signup')}} disabled={loading}>회원가입</button>

            <button type="button" className="login-forgot" disabled={loading}>비밀번호를 잊으셨나요?</button>





          <div className="social-row">
            <button type="button" className="social N">N</button>
            <button type="button" className="social K">K</button>
            <button type="button" className="social G">G</button>
          </div>
        </form>
      </div>
    </div>
  )
}