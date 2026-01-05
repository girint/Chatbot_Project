import "../../css/Notice.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useState, useRef, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Image, Alert, Modal } from 'react-bootstrap';
import { create_notice } from '../../api/Notice_Api';
import { TokenManager } from '../../api/User_Api';
import { useNavigate } from 'react-router-dom';

const NoticeWrite = () => {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  // 팝업 상태 추가!
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newNoticeId, setNewNoticeId] = useState(null);

  // 이미지 핸들러
  const handleImageChange = (e) => {
      const selectedFiles = Array.from(e.target.files || []);
       setFiles(selectedFiles);
        const urls = selectedFiles.map((file) => URL.createObjectURL(file));
        setPreviewImages(urls);
    };
  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url)); };
    }, [previewImages]);
  const removeImage = (indexToRemove) => {
    URL.revokeObjectURL(previewImages[indexToRemove]);
    const nextFiles = files.filter((_, i) => i !== indexToRemove);
    const nextPreviews = previewImages.filter((_, i) => i !== indexToRemove);

    setFiles(nextFiles);
    setPreviewImages(nextPreviews);

    const dt = new DataTransfer();
    nextFiles.forEach((f) => dt.items.add(f));
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
    }
  };

  //handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setSubmitMessage('제목과 내용을 입력해주세요!');
      setSubmitStatus('error');
      return;
    }

    //TokenManager
    if (!TokenManager.isLoggedIn()) {
      setSubmitMessage('로그인 후 이용해주세요!');
      setSubmitStatus('error');
      setTimeout(() => window.location.href = '/login', 1500);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('tags', tags);
      formData.append('price', price || 0);
      files.forEach((file) => formData.append('images', file));

      const result = await create_notice(formData);

      if (result.success) {
        //팝업 띄우기
        setNewNoticeId(result.notice_id || result.data?.notice_id);
        setShowSuccessModal(true);

        //입력값 초기화
        setTitle('');
        setContent('');
        setTags('');
        setPrice('');
        setFiles([]);
        setPreviewImages([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.error || '등록에 실패했습니다.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error.message || '등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성을 취소하시겠습니까?')) {
      setTitle('');
      setContent('');
      setTags('');
      setPrice('');
      setFiles([]);
      setPreviewImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSubmitMessage('');
      setSubmitStatus('');
    }
  };
  //팝업 핸들러 추가
  const handleMyPosts = () => {
    setShowSuccessModal(false);
    navigate(`/notice/${newNoticeId}`);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div>
      <Container className="post-write-container NoticeWrite_all" style={{ maxWidth: "900px", marginTop: "80px" }}>
        <div className="NW_title_box">
          <h4 className="NW_title">게시글 작성</h4>
        </div>

        {submitMessage && (
          <Alert
            variant={submitStatus === 'success' ? 'success' : 'danger'}
            onClose={() => {
              setSubmitMessage('');
              setSubmitStatus('');
            }}
            dismissible
          >
            {submitMessage}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* 제목 */}
          <Form.Group className="mb-3 NW-sub-title">
            <h6 className="NW-sub-h6">제 목</h6>
            <Form.Control type="text" placeholder="제목을 입력하세요." className="NW-title-text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting}/>
          </Form.Group>

          <Form.Group>
            <div className="mb-4 NW-sub-title">
            <h6 className="NW-sub-h6">사진 첨부</h6>
            <Form.Control
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="NW-title-text1"
              disabled={isSubmitting}
            />
            </div>

            <div className="image-preview-container">
              {previewImages.map((src, index) => (
                <div className="preview-wrapper" key={index}>
                  <button type="button"
                    className="preview-remove-btn NW_Del_button"
                    onClick={() => removeImage(index)}
                    aria-label="이미지 삭제"><i className="fa-solid fa-xmark"></i></button>

                  <Image src={src} thumbnail className="preview-image NW_preview_img" />
                </div>
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-4 NW-sub-title NW-content-row">
            <h6 className="NW-sub-h6 NW_content">내 용</h6>
            <Form.Control
              as="textarea"
              rows={10}
              placeholder="내용을 입력하세요."
              className="content-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </Form.Group>


          <div className="NW_tag_box">
            <Form.Group className="mb-3 NW-sub-title">
              <h6 className="NW-sub-h6">태그 입력</h6>
              <Form.Control
                type="text"
                placeholder="# 태그 입력"
                className="NW-title-text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-4 NW-sub-title">
              <h6 className="NW-sub-h6">가격 제시</h6>
              <Form.Control
                type="number"
                placeholder="₩ 가격 입력"
                className="NW-title-text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isSubmitting}
              />
            </Form.Group>
          </div>

          <Row className="justify-content-end">
            <Col xs="auto">
              <Button
                variant="success"
                className="NW_check_button"
                type="submit"
                disabled={isSubmitting}
              >
                <i className="fa-solid fa-check"></i>확인
              </Button>
            </Col>
            <Col xs="auto">
              <Button
                variant="secondary"
                className="NW_cancel_button"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                취소
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>

      {/*성공 팝업 추가! */}
      <Modal show={showSuccessModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>게시글 등록 완료!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          게시글이 성공적으로 등록되었습니다.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            닫기
          </Button>
          <Button
            variant="primary"
            onClick={handleMyPosts}
          >
            내 게시물로 이동
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NoticeWrite;
