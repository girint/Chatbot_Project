import React, { useEffect, useState, useMemo, useRef } from "react";
import { MainSummary } from "../api/Main_Api";
import { Container, Row, Col, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AIIntroduce = () => {
    const [noticeData, setNoticeData] = useState([]);
    const [basicAI_Data, setBasicAI_Data] = useState([]);
    const [Loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // StrictMode에서 useEffext 2번 실행 방지용
    const fetchedRef = useRef(false);

    // 페이지네이션 상태 설정
    const [page, setPage] = useState(1);
    const pageSize = 5;   //한 페이지에 보여줄 게시글 수

    // 모바일 감지 (480ox 기준)
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth <= 480 : false);

    // resize 이벤트로 모바일 여부 갱신
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 480);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // API 데이터 불러오기
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        const fetchAllData = async () => {
            try {
                // MainSummary() 한 번만 호출!
                const data = await MainSummary();
                console.log("✅ 메인 데이터 불러오기 성공!", data);
                // BasicAI 데이터 처리 (같은 response에서)
                if (data?.success && Array.isArray(data.basic_ai)) {
                    const mappedBasicAIData = data.basic_ai.map((item) => ({
                        id: item.ai_id,
                        name: item.ai_name,
                        tip: item.ai_tip,
                        image: item.ai_image,
                    }));
                    setBasicAI_Data(mappedBasicAIData);
                } else {
                    console.warn("⚠️ BasicAI 데이터 없음:", data?.basic_ai);
                    setBasicAI_Data([]);
                }

                // 게시판 데이터 처리
                if (data?.success && Array.isArray(data.notice)) {
                    const mappedNoticeData = data.notice.map((item) => ({
                        id: item.notice_id,
                        title: item.notice_title,
                        writer: item.user_nickname,
                        views: item.notice_view_count
                    }));
                    setNoticeData(mappedNoticeData);
                } else {
                    console.warn("⚠️ 게시판 데이터 없음:", data?.notice);
                    setNoticeData([]);
                }



            } catch (error) {
                console.error("❌ 메인 데이터 불러오기 실패:", error);
                setNoticeData([]);
                setBasicAI_Data([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);


    // 🔔 공지글 (1~3번)
    const noticePosts = useMemo(() => {
        return noticeData.filter(item => item.id >= 1 && item.id <= 3);
    }, [noticeData]);

    // 📄 일반 게시글
    const normalPosts = useMemo(() => {
        return noticeData.filter(item => item.id > 3);
    }, [noticeData]);

    const noticeCount = noticePosts.length;

    // 총 페이지 수
    const totalPages = useMemo(() => {
        if (normalPosts.length <= pageSize - noticeCount) return 1;

        return (
            1 +
            Math.ceil(
                (normalPosts.length - (pageSize - noticeCount)) / pageSize
            )
        );
    }, [normalPosts.length, pageSize, noticeCount]);

    // 페이지 게시글 번호 재지정
    const normalStartNumber = useMemo(() => {
        if (page === 1) return 1;
        return (page - 2) * pageSize + (pageSize - noticeCount) + 1;
    }, [page, pageSize, noticeCount]);

    // 현재 페이지가 범위를 벗어나면 보정
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
        if (page < 1) setPage(1);
    }, [page, totalPages]);

    // 현재 페이지에 보여줄 데이터만 slice
    const pagedNormalPosts = useMemo(() => {
        const effectivePageSize =
            page === 1 ? pageSize - noticeCount : pageSize;

        const start =
            page === 1
                ? 0
                : (page - 2) * pageSize + (pageSize - noticeCount);

        return normalPosts.slice(start, start + effectivePageSize);
    }, [normalPosts, page, pageSize, noticeCount]);

    // 페이지 버튼 개수 (pc 5 / 모바일 3)
    const visibleCount = isMobile ? 3 : 5;

    // 페이지 번호 범위 계산 (6페이지는 6~10 느낌)
    const { startPage, endPage } = useMemo(() => {
        let start = page - Math.floor(visibleCount / 2);
        let end = start + visibleCount - 1;

        if (start < 1) {
            start = 1;
            end = Math.min(totalPages, start + visibleCount - 1);
        }
        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - visibleCount + 1);
        }
        return { startPage: start, endPage: end };
    }, [page, totalPages, visibleCount]);

    // 페이지 번호 배열
    const pageNumbers = useMemo(() => {
        const arr = [];
        for (let p = startPage; p <= endPage; p++) arr.push(p);
        return arr;
    }, [startPage, endPage]);

    // 이동 함수
    const goPage = (p) => setPage(p);

    // 페이지 slice랑 분리
    const isEmpty = !Loading && noticeData.length === 0;


    return (
        <section>
            <div className="Introduce">
                <Image src='/img/main_slider_img.png' alt="웹사이트_설명" className="AI_introduce_img" fluid />
            </div>

            <div className="service_section">
                <div className="membership_img">
                    <Container className="membership_text">
                        <Row>
                            <Col xs={6} md={4}>
                                <Image src='/img/Membership.gif' alt="멤버십_가입_소개_gif파일" className="membership_gif" roundedCircle />
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>

            <div className="AICategoty_all">
                <Container className="AiCategory_container">
                    <Row className="circle_Row">
                        <h1>Basic Category</h1>
                        {Loading ? (
                            <div style={{ padding: 20, textAlign: "center", width: "100%" }}>
                                카테고리 불러오는 중...
                            </div>
                        ) :
                            basicAI_Data.slice(0, 8).map((item, index) => (
                                <Col key={item.name || index} xs={6} md={6} className="AICategory_circle" onClick={() => navigate(`/ai/${item.id}`)}>
                                    <div className="circle_div">
                                        <Image
                                            src={item.image || `/img/default-category-${index + 1}.png`}
                                            roundedCircle
                                        />
                                        <div className="circle_text d-none d-lg-block">
                                            <h2>{item.name}</h2>
                                            <p>{item.tip}</p>
                                        </div>
                                    </div>
                                </Col>
                            ))}

                    </Row>
                </Container>
            </div>

            <div className="membership_all">
                <Container className="membership_container">
                    <Row className="membership_Row">
                        <h1>Membership Category</h1>
                        <Col xs={6} md={3} className="membership_circle">
                            <div className="membership_circle_div">
                                <Image src="/img/membership_img.png" roundedCircle />
                            </div>
                        </Col>
                        <Col xs={6} md={3} className="membership_circle">
                            <div className="membership_circle_div">
                                <Image src="/img/membership_img.png" roundedCircle />
                            </div>
                        </Col>
                        <Col xs={6} md={3} className="membership_circle">
                            <div className="membership_circle_div">
                                <Image src="/img/membership_img.png" roundedCircle />
                            </div>
                        </Col>
                        <Col xs={6} md={3} className="membership_circle">
                            <div className="membership_circle_div">
                                <Image src="/img/membership_plus_img.png" roundedCircle />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <div className="notice">
                <div className="notice-header">
                    <h2>게시판</h2>
                    <div className="notice-actions">
                        <button className="my-board-btn"
                        // onClick={() => navigate("/NoticeMy")}
                        >
                            내 게시글
                        </button>

                        <button
                            className="write-btn"
                            onClick={() => {
                                const token = localStorage.getItem("authToken");
                                if (!token) {
                                    alert("로그인 후 게시글 작성이 가능합니다.");
                                    navigate("/login"); // 로그인 페이지로 이동
                                    return;
                                }
                                navigate("/NoticeWrite");
                            }}
                        >작성</button>
                    </div>
                </div>

                <div className="notice-table">
                    <div className="notice-head">
                        <span>번호</span>
                        <span>제목</span>
                        <span>작성자</span>
                        <span>조회수</span>
                    </div>

                    {/* 🔔 공지글 (1페이지에서만) */}
                    {page === 1 && noticePosts.map(item => (
                        <div
                            key={`notice-${item.id}`}
                            className="notice-row fixed"
                            onClick={() => navigate(`/notice/${item.id}`)}
                        >
                            <span>공지</span>
                            <span className="title">{item.title}</span>
                            <span>{item.writer}</span>
                            <span>{item.views}</span>
                        </div>
                    ))}

                    {/* 📄 일반 게시글 */}
                    {pagedNormalPosts.length > 0 ? (
                        pagedNormalPosts.map((item, i) => (
                            <div
                                key={item.id}
                                className="notice-row"
                                onClick={() => navigate(`/notice/${item.id}`)}
                            >
                                <span>{normalStartNumber + i}</span>
                                <span className="title">{item.title}</span>
                                <span>{item.writer}</span>
                                <span>{item.views}</span>
                            </div>
                        ))
                    ) : !Loading ? (
                        <div style={{ padding: 16, textAlign: "center" }}>
                            게시글이 없습니다.
                        </div>
                    ) : null}
                </div>

                {/* 페이지네이션 */}
                <div className="pagination_all">
                    <div className="pagination">
                        {/* ◀ */}
                        <button className="page-arrow" onClick={() => goPage(page - 1)} disabled={page === 1} aria-label="이전 페이지">◀</button>

                        {/* 숫자 버튼 */}
                        {pageNumbers.map((p) => (
                            <button key={p} className={`page-num ${page === p ? "active" : ""}`} onClick={() => goPage(p)} aria-current={page === p ? "page" : undefined}>{p}</button>
                        ))}

                        {/* ▶ */}
                        <button className="page-arrow" onClick={() => goPage(page + 1)} disabled={page === totalPages} aria-label="다음 페이지">▶</button>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AIIntroduce;