//frontend/src/userbasic/Login.jsx
import '../../css/User.css'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, TokenManager } from "../../api/User_Api";
import { Form, Image } from 'react-bootstrap';

export default function Login() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate()


  const onKakaoLogin = () => {
        console.log("카카오 로그인 클릭");
    };

    const onNaverLogin = () => {
        console.log("네이버 로그인 클릭");
    };

    const onGoogleLogin = () => {
        console.log("구글 로그인 클릭");
    };

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

      <div className='login-title'><h4>로그인</h4></div>
      <div className='login-content'><div>안전한 이용 및 회원님의 정보 보호를 위해 <br /> 현재 보안서비스가 실행 중입니다.</div></div>

        <Form onSubmit={onSubmit} className="login-form">

          <Form.Group>
            <Form.Control
              id="email"
              name="email"
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              placeholder='아이디를 입력해주세요.'
            />
          </Form.Group>
          
          <Form.Group>
            <Form.Control
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              placeholder='비밀번호를 입력해주세요.'
            />
          </Form.Group>


           {/*에러메세지 출력 란*/}
           {error && (<div className="error-message" style={{ color: "red", fontSize: "14px", margin:"0" }}> {error} </div> )}

           <div className='login-forgot-box'>
            <button type='button' className='login-forgot' disabled={loading}>아이디 찾기</button>
            <div>|</div>
            <button type="button" className="login-forgot" disabled={loading}>비밀번호 찾기</button>
          </div>


            {/*로그인 버튼*/}
            <button type="submit" className="btn-login" disabled={loading || !email || !password}>{loading ? "로그인 중..." : "로그인"}</button>

            <button type="button" className="btn-signup" onClick={()=>{navigate('/Signup')}} disabled={loading}>회원가입</button>







          <div className='login-social-login'><h5>간편 로그인</h5></div>
          <div className="social-login">
                        <button type="button" className="social-btn kakao" onClick={onKakaoLogin}>
                            <Image src="/img/kakao_logo.png" alt="" className="social-icon" />
                            <span className="social-text">카카오로 계속하기</span>
                        </button>

                        <button type="button" className="social-btn naver" onClick={onNaverLogin}>
                            <Image src="/img/naver_logo.png" alt="" className="social-icon naver" />
                            <span className="social-text">네이버로 계속하기</span>
                        </button>

                        <button type="button" className="social-btn google" onClick={onGoogleLogin}>
                            <Image src="/img/google_logo.png" alt="" className="social-icon" />
                            <span className="social-text">구글로 계속하기</span>
                        </button>
                    </div>
        </Form>
      </div>
    </div>
  )
}