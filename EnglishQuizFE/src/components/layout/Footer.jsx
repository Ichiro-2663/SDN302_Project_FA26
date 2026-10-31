import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaGraduationCap, FaHeart } from "react-icons/fa";

const AppFooter = () => {
  return (
    <footer className="bg-white border-top py-5 mt-auto">
      <Container>
        <Row className="gy-4">
          <Col lg={4} md={6}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-warning text-dark rounded-3 p-2 d-flex align-items-center justify-content-center">
                <FaGraduationCap size={20} />
              </div>
              <span className="brand-text fs-4 m-0">EnglishQuiz</span>
            </div>
            <p className="text-muted small">
              Hệ thống ôn luyện thi tiếng Anh thông minh với thuật toán lặp lại ngắt quãng (Leitner Spaced Repetition), ngân hàng câu hỏi chuẩn hóa và trợ lý AI thông minh.
            </p>
          </Col>
          <Col lg={2} md={3} xs={6}>
            <h6 className="fw-bold mb-3">Tính Năng</h6>
            <ul className="list-unstyled text-muted small d-flex flex-column gap-2">
              <li>Luyện tập tức thì</li>
              <li>Thi thử trực tuyến</li>
              <li>Flashcards 5 hộp</li>
              <li>Sổ tay câu sai</li>
            </ul>
          </Col>
          <Col lg={2} md={3} xs={6}>
            <h6 className="fw-bold mb-3">Chứng Chỉ</h6>
            <ul className="list-unstyled text-muted small d-flex flex-column gap-2">
              <li>TOEIC 450 - 990</li>
              <li>IELTS Academic</li>
              <li>Khung CEFR (A1-C2)</li>
              <li>Tiếng Anh THPT QG</li>
            </ul>
          </Col>
          <Col lg={4} md={6}>
            <h6 className="fw-bold mb-3">Dự Án SDN302 - FA26</h6>
            <p className="text-muted small mb-2">
              Được phát triển với React, Node.js, Express & MongoDB.
            </p>
            <div className="d-flex align-items-center gap-2 text-muted small">
              <span>Được xây dựng với</span>
              <FaHeart className="text-danger" />
              <span>bởi Nhóm Sinh Viên SDN302</span>
            </div>
          </Col>
        </Row>
        <div className="border-top mt-4 pt-3 text-center text-muted small">
          © {new Date().getFullYear()} EnglishQuiz Platform. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default AppFooter;
