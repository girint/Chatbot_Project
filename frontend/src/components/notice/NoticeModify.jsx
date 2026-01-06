///////////////////////////////////////////////////////
/////////////////작업해야함(추후과제)///////////////////
//////////////////////////////////////////////////////

// import "../../css/Notice.css";
// import { Container, Form, Row, Col, Button, Image } from "react-bootstrap";
// import { useEffect, useRef, useState } from "react";
// import '@fortawesome/fontawesome-free/css/all.min.css';

// const NoticeWrite = () => {
//   // GPT
//   const [files, setFiles] = useState([]);
//   const [previewImages, setPreviewImages] = useState([]);
//   const fileInputRef = useRef(null);

//   const handleImageChange = (e) => {
//     const selectedFiles = Array.from(e.target.files || []);
//     setFiles(selectedFiles);

//     const urls = selectedFiles.map((file) => URL.createObjectURL(file));
//     setPreviewImages(urls);
//   };

//   // 메모리 누수 방지: URL 해제
//   useEffect(() => {
//     return () => {
//       previewImages.forEach((url) => URL.revokeObjectURL(url));
//     };
//   }, [previewImages]);

//   const removeImage = (indexToRemove) => {
//     // URL 해제
//     URL.revokeObjectURL(previewImages[indexToRemove]);

//     // state에서 제거
//     const nextFiles = files.filter((_, i) => i !== indexToRemove);
//     const nextPreviews = previewImages.filter((_, i) => i !== indexToRemove);

//     setFiles(nextFiles);
//     setPreviewImages(nextPreviews);

//     //input의 FileList 갱신
//     const dt = new DataTransfer();
//     nextFiles.forEach((f) => dt.items.add(f));
//     if (fileInputRef.current) {
//       fileInputRef.current.files = dt.files;
//     }
//   };
//   // GPT


//   return (
//     <div>
//       <Container
//         className="post-write-container NoticeWrite_all"
//         style={{ maxWidth: "900px", marginTop: "40px" }}
//       >
//         <div className="NW_title_box">
//           <h4 className="NW_title">게시글 수정</h4>
//         </div>

//         <Form>
//           <Form.Group className="mb-3 NW-sub-title">
//             <h6 className="NW-sub-h6">제 목</h6>
//             <Form.Control type="text" placeholder="제목을 입력하세요." className="NW-title-text" />
//           </Form.Group>

//           <Form.Group>
//             <div className="mb-4 NW-sub-title">
//             <h6 className="NW-sub-h6">사진 첨부</h6>
//             <Form.Control
//               ref={fileInputRef}
//               type="file"
//               multiple
//               accept="image/*"
//               onChange={handleImageChange} className="NW-title-text"
//             />
//             </div>

//             <div className="image-preview-container">
//               {previewImages.map((src, index) => (
//                 <div className="preview-wrapper" key={index}>
//                   <button type="button"
//                     className="preview-remove-btn NW_Del_button"
//                     onClick={() => removeImage(index)}
//                     aria-label="이미지 삭제"><i class="fa-solid fa-xmark"></i></button>

//                   <Image src={src} thumbnail className="preview-image NW_preview_img" />
//                 </div>
//               ))}
//             </div>
//           </Form.Group>

//           <Form.Group className="mb-4 NW-sub-title NW-content-row">
//             <h6 className="NW-sub-h6 NW_content">내 용</h6>
//             <Form.Control
//               as="textarea"
//               rows={10}
//               placeholder="내용을 입력하세요."
//               className="content-textarea"
//             />
//           </Form.Group>


//           <div className="NW_tag_box">
//             <Form.Group className="mb-3 NW-sub-title">
//               <h6 className="NW-sub-h6">태그 입력</h6>
//               <Form.Control type="text" placeholder="# 태그 입력" className="NW-title-text" />
//             </Form.Group>

//             <Form.Group className="mb-4 NW-sub-title">
//               <h6 className="NW-sub-h6">가격 제시</h6>
//               <Form.Control type="number" placeholder="₩ 가격 입력" className="NW-title-text" />
//             </Form.Group>
//           </div>

//           <Row className="justify-content-end">
//             <Col xs="auto">
//               <Button variant="success" className="NW_check_button"><i className="fa-solid fa-check"></i>확인</Button>
//             </Col>
//             <Col xs="auto">
//               <Button variant="secondary" className="NW_cancel_button">취소</Button>
//             </Col>
//           </Row>
//         </Form>
//       </Container>
//     </div>
//   );
// };

// export default NoticeWrite;
