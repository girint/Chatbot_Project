import React from "react";
import { Navbar, Container } from "react-bootstrap";

const Footer = () => {
  return (
    <>
      <div className="customer-service">
        <div className="customer-service-box">
          <div className="customer-service_left">
            <h5>고객행복센터</h5>
            <p className="customer-service_left-p"><b>1231-1527</b> 월~금요일 오전 9시 - 오후 6시</p>
            <div>
              <div className="d-flex customer-service-div-1">
                <div>카카오톡 문의</div>
                <p>월~금요일 | 오전 9시 - 오후 6시 <br /> 일/공휴일 | 휴무</p>
              </div>
              <div className="d-flex customer-service-div-1">
                <div> 1:1 문의</div>
                <p>365일 <br /> 고객센터 운영시간에 순차적으로 답변드리겠습니다.</p>
              </div>
              <div className="d-flex customer-service-div-1">
                <div>챗봇 제작 문의</div>
                <p>월~금요일 | 오전 9시 - 오후 6시 <br /> 점심시간 | 낮 1시 - 2시</p>
              </div>
            </div>
          </div>
          <div className="customer-service_right d-none d-lg-block">
            <div className="d-flex customer-service_right_list">
              <p>회사소개</p><p>투자정보</p><p>챗봇정보</p><p>이용약관</p><p>개인정보처리방침</p><p>이용안내</p>
            </div>
            <div className="customer-service_right_bootom">
              <div className="d-flex">법인명 (상호) : 주식회사 왕두 | 사업자등록번호 : 226-12-29111 <span>사업자 정보 확인</span></div>
              <div>주소 : 경기 수원시 팔달구 권광로 146 벽산그랜드코아 404호</div>
              <div>챗봇문의 : <span>LSS@WMD.com</span></div>
              <div>팩스 : 031 - 272 - 4300</div>
              <div className="customer-service_right_bottom_img">
                <img src="/img/instagram_logo.png" alt="instagram" />
                <img src="/img/facebook_logo.png" alt="facebook" />
                <img src="/img/naverblog_logo.png" alt="naverblog" />
                <img src="/img/youtube_logo.png" alt="youtube" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="customer-service_bottom_1">
        <div className="customer-service_bottom_1_box  d-none  d-lg-block">
          <div className="customer-service_bottom-all">
            <div className="customer-service_bottom_1_left">
              <img src="/img/AI_Plus.png" alt="AI플러스인증마크" />
              <div>[인증범위] 인공지능 기술이 적용된 <br />모든 소프트웨어, 서비스 및 ICT제품 인증 <br /> [유효기간] 2025.12.31 - 2028.12.31 </div>
            </div>
            <div className="customer-service_bottom_1_right">
              <img src="/img/bank.jpg" alt="우리은행로고" />
              <div>고객님이 결제한 금액에 대해 우리은행과 <br /> 채무지급보증 계약을 체결하여 안전거래를 <br /> 보장하고 있습니다.</div>
            </div>
          </div>
        </div>
      </div>
      <div className="customer-service_bottom_2">
        © 2025. AI Service. Jumbo Mandu, inc.
      </div>
    </>
  );
};

export default Footer;