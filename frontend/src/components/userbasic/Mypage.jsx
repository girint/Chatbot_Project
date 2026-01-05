//frontend/src/compinents/userbasic/Mypage.jsx

import React,{ useEffect, useState } from 'react'
import { Container, Row, Col, Image, Form, InputGroup, Button } from 'react-bootstrap';
import { updateProfile } from '../../api/Mypage_Api';
import  { TokenManager }  from '../../api/User_Api';
import '../../css/User.css'
import { getMyProfile,delete_user } from '../../api/Mypage_Api';
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

  //GPT (유저정보 불러오기)
  useEffect(() => {
  if (!TokenManager.isLoggedIn()) {
    setLoading(false);
    return;
  }

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

  fetchProfile();
}, []);
//
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
                <Row>
                    <Col xs={6} md={4}>
                        <Image
                            src={userInfo?.image ? `http://localhost:5000${userInfo.image}` : '/img/default_profile.png'}
                            rounded
                            className='mypage-img'
                        />
                    </Col>

                    <Col xs={12} md={8}>
                        <h2 className='mb-4 mt-4'>마이페이지</h2>
                        <div className='mypage-box'></div>

                        
                        <div className='mypage-moneybox mb-5 mt-4'>
                            <div className='mypage-money'>현재 잔액 : {userInfo?.user_money}</div>
                            <Button variant="primary" onClick={() => navigate("/pay")}>충전하기</Button>
                        </div>

                    </Col>
                </Row>

                <Row className='mt-4'>
                    <Col xs={12} md={6}>
                        <div className='mypage-membership mb-3'>
                            <h3>개인비서</h3>
                            <Row>
                            <div className="membership_circle_div" style={{justifyContent:'space-around', paddingBottom:'0px'}}>
                                <Image src="/img/membership_img.png" roundedCircle className="w-25 mx-1" />
                                <Image src="/img/membership_img.png" roundedCircle className="w-25 mx-1" />
                            </div>
                            </Row>
                            <Row>
                            <div className="membership_circle_div" style={{justifyContent:'space-around', paddingBottom:'25px'}}>
                                <Image src="/img/membership_img.png" roundedCircle className="w-25 mx-1" />
                                <Image src="/img/membership_plus_img.png" roundedCircle className="w-25 mx-1" />
                            </div>
                            </Row>
                        </div>
                    </Col>

                    <Col xs={12} md={6}>
                    <div className='mypage-membership1'>
                        <h3 className='mb-2'>개인정보 변경</h3>
                        <Form.Label>닉네임 변경</Form.Label>
                        <InputGroup className="mb-1">
                                <Form.Control
                                    aria-describedby="basic-addon2"
                                    value={nickname}    //닉네임 입력받고 함수 굴리기
                                    onChange={(e) => setNickname(e.target.value)}
                                />
                                <Button variant="outline-secondary" id="button-addon2" onClick={handleChangeNickname}>
                                    변경
                                </Button>
                            </InputGroup>

                            <Form.Label>비밀번호 변경</Form.Label>
                            <InputGroup className="mb-1">
                                <Form.Control
                                    type='password'
                                    placeholder="비밀번호 변경"
                                    aria-describedby="basic-addon2"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Button
                                    variant="outline-secondary"
                                    id="button-addon2"
                                    onClick={handleChangePassword}>
                                    변경
                                </Button>
                            </InputGroup>

                            <Form.Label>프로필 이미지 변경</Form.Label>
                            <InputGroup className="mb-1">
                                <Form.Control
                                    type="file"
                                    onChange={(e) => setProfileFile(e.target.files[0])}/>
                                <Button variant="outline-secondary" id="button-addon2" onClick={handleChangeProfileImage}>
                                    변경
                                </Button>
                            </InputGroup>

                            <Button variant="danger" className="mt-2" onClick={handleDeleteUser}>회원탈퇴</Button>
                            <Button variant="danger" className="mx-3 mt-2" disabled>멤버십 해지하기</Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Mypage
