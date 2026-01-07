//frontend/src/compinents/userbasic/Mypage.jsx

import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Image, Form, InputGroup, Button } from 'react-bootstrap';
import { TokenManager } from '../../api/User_Api';
import '../../css/User.css'
import { getMyProfile, delete_user, updateProfile } from '../../api/Mypage_Api';
import { useNavigate } from 'react-router-dom';


const Mypage = () => {

  const navigate = useNavigate();

  //불러올 정보들
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();
      setUserInfo(data);
      setNickname(data.user_nickname || '');
    } catch (err) {
      console.error(err);
      alert('유저 정보를 불러오지 못했습니다.');
      TokenManager.logout();
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNickname = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }
    const currentNick = userInfo?.user_nickname || '';
    if (nickname.trim() === currentNick) {
      alert('기존 닉네임과 동일합니다.');
      return;
    }

    try {
      const res = await updateProfile({ nickname: nickname.trim() });
      alert(res.message || '닉네임이 변경되었습니다.');
      setNickname('');
    } catch (err) {
      alert(err.response?.data?.message || '닉네임 변경 실패');
    }
  };

  const handleChangePassword = async () => {
    if (!password.trim()) {
      alert('비밀번호를 입력하세요.');
      return;
    }
    try {
      const res = await updateProfile({ password: password.trim() });
      alert(res.message || '비밀번호가 변경되었습니다.');
      setPassword('');
    } catch (err) {
      alert(err.response?.data?.message || '비밀번호 변경 실패');
    }
  };

  const handleChangeProfileImage = async () => {
    if (!profileFile) {
      alert('이미지 파일을 선택하세요.');
      return;
    }

    try {
      const res = await updateProfile({ image: profileFile });
      alert(res.message || '프로필 이미지가 변경되었습니다.');
      setProfileFile(null);
    } catch (err) {
      alert(err.response?.data?.message || '프로필 이미지 변경 실패');
    }

    await fetchProfile();
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('정말 회원탈퇴 하시겠습니까?')) return;

    try {
      setIsSubmitting(true);

      //Mypage_Api 사용
      const result = await delete_user();

      if (result.success) {
        TokenManager.clear();
        alert('회원탈퇴가 완료되었습니다! 🙏');
        navigate('/');
      }
    } catch (error) {
      alert(`회원탈퇴 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
  if (!TokenManager.isLoggedIn()) {
    setLoading(false);
    return;
  }
  fetchProfile();
}, []);


  if (loading) {
    return (
      <Container className="text-center mt-5">
        <p>로딩 중...</p>
      </Container>
    );
  }
  if (!TokenManager.isLoggedIn()) {
    return (
      <div className='mypage-content'>
        <Container>
          <h2>로그인 필요</h2>
          <p>마이페이지를 이용하려면 로그인하세요.</p>
        </Container>
      </div>
    );
  }
  return (
    <div className='mypage-content'>
      <Container>
        {/* 상단 프로필 카드 */}
        <div className="mypage-topCard">
          <div className="mypage-profileArea">
            <img
              src={userInfo?.image ? `http://localhost:5000${userInfo.image}` : "/img/default_profile.png"}
              className="mypage-img"
              alt="profile"
            />

            <div className="mypage-profileText">
              <div className="mypage-titleRow">
                <h2 className="mypage-title">마이페이지</h2>
                <span className="mypage-chip">
                  {userInfo?.user_nickname || "사용자"}
                </span>
              </div>

              <div className="mypage-moneybox">
                <div className="mypage-money">
                  현재 잔액 : <b className="ms-1">{userInfo?.user_money}</b>
                </div>
                <Button className="mypage-primaryBtn" onClick={() => navigate("/pay")}>
                  충전하기
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 2컬럼 카드 */}
        <Row className='g-4 mypage-bottomRow align-items-stretch'>
          <Col xs={12} md={6} className='d-flex'>
            <div className='mypage-card mypage-cardAccent h-100 w-100'>
              <div className='mypage-cardHead'>
                <h3 className='mypage-cardTitle'>개인비서</h3>
                <span className='mypage-badge'>Membership</span>
              </div>

              <div className='mypage-grid4'>
                <div className='mypage-imgClick' onClick={() => alert("개인비서 1 클릭")}>
                  <Image src="/img/membership_img.png" roundedCircle className="mypage-circleImg" />
                </div>

                <div className='mypage-imgClick' onClick={() => alert("개인비서 2 클릭")}>
                  <Image src="/img/membership_img.png" roundedCircle className="mypage-circleImg" />
                </div>

                <div className='mypage-imgClick' onClick={() => alert("개인비서 3 클릭")}>
                  <Image src="/img/membership_img.png" roundedCircle className="mypage-circleImg" />
                </div>

                <div className='mypage-imgClick' onClick={() => alert("개인비서 4 클릭")}>
                  <Image src="/img/membership_plus_img.png" roundedCircle className="mypage-circleImg" />
                </div>
              </div>
            </div>
          </Col>

          <Col xs={12} md={6} className='d-flex'>
            <div className='mypage-card h-100 w-100'>
              <div className='mypage-cardHead'>
                <h3 className='mypage-cardTitle'>개인정보 변경</h3>
                <span className='mypage-badgeOutline'>Edit</span>
              </div>

              <div className='mypage-formBlock'>
                <Form.Label className='mypage-label'>닉네임 변경</Form.Label>
                <InputGroup className='mypage-inputGroup'>
                  <Form.Control value={nickname} onChange={(e) => setNickname(e.target.value)} />
                  <Button className='mypage-outlineBtn' onClick={handleChangeNickname}>
                    변경
                  </Button>
                </InputGroup>

                <Form.Label className='mypage-label'>비밀번호 변경</Form.Label>
                <InputGroup className='mypage-inputGroup'>
                  <Form.Control type='password' placeholder='비밀번호 변경' value={password} onChange={(e) => setPassword(e.target.value)} />
                  <Button className='mypage-outlineBtn' onClick={handleChangePassword}>
                    변경
                  </Button>
                </InputGroup>

                <Form.Label className='mypage-label'>프로필 이미지 변경</Form.Label>
                <InputGroup className='mypage-inputGroup'>
                  <Form.Control type='file' onChange={(e) => setProfileFile(e.target.files[0])} />
                  <Button className='mypage-outlineBtn' onClick={handleChangeProfileImage}>
                    변경
                  </Button>
                </InputGroup>

                <div className='mypage-dangerRow'>
                  <Button variant='danger' onClick={handleDeleteUser} disabled={isSubmitting}>
                    회원탈퇴
                  </Button>
                  <Button variant='danger' disabled>
                    멤버십 해지하기
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Mypage
