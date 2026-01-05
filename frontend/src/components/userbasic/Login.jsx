//frontend/src/userbasic/Login.jsx
import '../../css/User.css'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, TokenManager } from "../../api/User_Api";
import { Form } from 'react-bootstrap';

export default function Login() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate()


  //실제 폼 저장라인
  const onSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

     try {
      const data = await loginUser(email, password);

       if (data.success) {
           console.log("✅ 로그인 성공 응답:", data);
           console.log("🎉 로그인 완료! 메인으로 이동합니다.");

           //로그인값 저장 및 토큰 생성해주기 여기서 닉네임으로 설정
           TokenManager.save(data.nickname);
           console.log("✅ AuthUtils.login 완료 - 닉네임 토큰:", data.nickname);

            navigate("/");
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
          <img src="/img/Login_logo.png" alt="avatar" />
        </div>

        <Form onSubmit={onSubmit} className="login-form">

          <Form.Group>
            <Form.Label className="login-label">
              이메일
            </Form.Label>

            <Form.Control
              id="email"
              name="email"
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </Form.Group>
          
          <Form.Group>
            <Form.Label className="login-label">
              비밀번호
            </Form.Label>

            <Form.Control
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </Form.Group>

           {/*에러메세지 출력 란*/}
           {error && (<div className="error-message" style={{ color: "red", fontSize: "14px", margin:"0" }}> {error} </div> )}

            {/*로그인 버튼*/}
            <button type="submit" className="btn-login" disabled={loading || !email || !password}>{loading ? "로그인 중..." : "로그인"}</button>

            <button type="button" className="btn-signup" onClick={()=>{navigate('/Signup')}} disabled={loading}>회원가입</button>

            <button type="button" className="login-forgot" disabled={loading}>비밀번호를 잊으셨나요?</button>





          <div className="social-row">
            <button type="button" className="social N">N</button>
            <button type="button" className="social K">K</button>
            <button type="button" className="social G">G</button>
          </div>
        </Form>
      </div>
    </div>
  )
}