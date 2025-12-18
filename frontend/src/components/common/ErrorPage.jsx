import '../../css/ErrorPage.css'
import { Col, Container, Image, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
    const navigate = useNavigate();
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div className="ErrorPage_all">
        <Container className="ErrorPage_container">
          <div>
            <Row className="justify-content-center ErrorPage_Row">
              <Col className='ErrorPage_Col'>
                <Image
                  src="/img/ErrorPage_w.png"
                  className="img-fluid d-none d-md-block ErrorPage_banner"
                  alt="가로 배너" />
                <Image
                  src="/img/ErrorPage_h.png"
                  className="img-fluid d-block d-md-none ErrorPage_banner"
                  alt="세로 배너" />
              </Col>
            </Row>
          </div>

          <div className="button_all">
            <button className="button" type="button" 
            onClick={() => navigate('/')}>메인으로</button>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default ErrorPage;