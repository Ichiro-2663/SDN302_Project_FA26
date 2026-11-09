import React, { useState, useEffect, useContext } from "react";
import { Row, Col, Card, Button, ProgressBar, Badge, Table } from "react-bootstrap";
import {
  FaFileAlt,
  FaBookOpen,
  FaLayerGroup,
  FaBookmark,
  FaChartLine,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

const UserDashboard = ({ setActiveTab }) => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = user?._id || localStorage.getItem("id");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const [histRes, fcRes, bmRes] = await Promise.allSettled([
          axiosClient.get(`/history/${userId}`),
          axiosClient.get(`/flashcards/user/${userId}`),
          axiosClient.get(`/bookmarks/user/${userId}`),
        ]);

        if (histRes.status === "fulfilled") setHistory(histRes.value.data || []);
        if (fcRes.status === "fulfilled") setFlashcards(fcRes.value.data || []);
        if (bmRes.status === "fulfilled") setBookmarks(bmRes.value.data || []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  // Computed metrics
  const totalAttempts = history.length;
  const passedAttempts = history.filter((h) => h.status === "PASSED").length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  const averageScore =
    totalAttempts > 0
      ? Math.round(
          (history.reduce((acc, h) => acc + (h.total > 0 ? (h.score / h.total) * 100 : 0), 0) /
            totalAttempts) *
            10
        ) / 10
      : 0;

  const box5Cards = flashcards.filter((f) => f.box === 5).length;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status" />
        <p className="mt-2 text-muted">Đang tải bảng điều khiển học viên...</p>
      </div>
    );
  }

  return (
    <div className="w-100">
      {/* Welcome Banner */}
      <Card
        className="border-0 text-white rounded-4 mb-4 shadow-sm overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
          borderRadius: "20px",
        }}
      >
        <Card.Body className="p-4 p-md-5">
          <Row className="align-items-center">
            <Col md={8}>
              <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill fw-bold mb-2">
                🌟 Chào mừng quay trở lại
              </Badge>
              <h2 className="fw-bold mb-2">Xin chào, {user?.name || "Học viên"}!</h2>
              <p className="mb-0 opacity-90 fs-6">
                Mục tiêu của bạn:{" "}
                <strong>{user?.studentProfile?.targetCertificate || "TOEIC / IELTS"}</strong>
                {user?.studentProfile?.targetScore && ` - Điểm mục tiêu: ${user.studentProfile.targetScore}`}.
                Hôm nay bạn đã sẵn sàng nâng cao kỹ năng chưa?
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Button
                variant="light"
                className="fw-bold px-4 py-2 rounded-pill text-warning shadow-sm"
                onClick={() => setActiveTab("quiz")}
              >
                Làm Bài Thi Ngay &rarr;
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 4 Stat Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Bài thi hoàn thành</span>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ background: "#ffedd5", color: "#c2410c" }}
              >
                <FaFileAlt size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{totalAttempts}</h3>
            <span className="small text-success d-flex align-items-center gap-1">
              <FaCheckCircle size={12} /> {passedAttempts} lượt ĐẠT ({passRate}%)
            </span>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Điểm trung bình</span>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ background: "#e0f2fe", color: "#0369a1" }}
              >
                <FaChartLine size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{averageScore}%</h3>
            <ProgressBar
              now={averageScore}
              variant={averageScore >= 50 ? "success" : "warning"}
              style={{ height: "6px" }}
              className="mt-2 rounded-pill"
            />
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Từ vựng Flashcard</span>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ background: "#ede9fe", color: "#6d28d9" }}
              >
                <FaLayerGroup size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{flashcards.length}</h3>
            <span className="small text-muted">
              {box5Cards} từ thuần thục (Hộp 5)
            </span>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold">Câu hỏi lưu trữ</span>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ background: "#ffe4e6", color: "#be123c" }}
              >
                <FaBookmark size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{bookmarks.length}</h3>
            <span className="small text-muted">Cần xem lại & củng cố</span>
          </Card>
        </Col>
      </Row>

      {/* Quick Launch Cards */}
      <h5 className="fw-bold text-dark mb-3">Chế Độ Học Tập Nhanh</h5>
      <Row className="g-3 mb-4">
        <Col xs={12} md={6} lg={3}>
          <Card
            className="border-0 shadow-sm rounded-4 p-3 h-100 text-center hover-card"
            style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onClick={() => setActiveTab("practice")}
          >
            <div
              className="rounded-circle p-3 d-inline-flex mx-auto mb-3"
              style={{ background: "#ffedd5", color: "#ea580c" }}
            >
              <FaBookOpen size={28} />
            </div>
            <h6 className="fw-bold mb-1 text-dark">Luyện Tập Tự Do</h6>
            <p className="text-muted small mb-3">Luyện theo kỹ năng và chủ đề với giải thích tức thì</p>
            <Button size="sm" variant="outline-warning" className="w-100 rounded-pill fw-bold text-dark">
              Vào Luyện Tập &rarr;
            </Button>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card
            className="border-0 shadow-sm rounded-4 p-3 h-100 text-center hover-card"
            style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onClick={() => setActiveTab("quiz")}
          >
            <div
              className="rounded-circle p-3 d-inline-flex mx-auto mb-3"
              style={{ background: "#e0f2fe", color: "#0284c7" }}
            >
              <FaClock size={28} />
            </div>
            <h6 className="fw-bold mb-1 text-dark">Thi Thử Bấm Giờ</h6>
            <p className="text-muted small mb-3">Kiểm tra thời gian thực, tự động nộp bài và chống gian lận</p>
            <Button size="sm" variant="outline-primary" className="w-100 rounded-pill fw-bold">
              Vào Phòng Thi &rarr;
            </Button>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card
            className="border-0 shadow-sm rounded-4 p-3 h-100 text-center hover-card"
            style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onClick={() => setActiveTab("flashcards")}
          >
            <div
              className="rounded-circle p-3 d-inline-flex mx-auto mb-3"
              style={{ background: "#ede9fe", color: "#7c3aed" }}
            >
              <FaLayerGroup size={28} />
            </div>
            <h6 className="fw-bold mb-1 text-dark">Flashcards Leitner</h6>
            <p className="text-muted small mb-3">Ôn tập lặp lại ngắt quãng khoa học qua 5 hộp ghi nhớ</p>
            <Button size="sm" variant="outline-secondary" className="w-100 rounded-pill fw-bold">
              Ôn Từ Vựng &rarr;
            </Button>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <Card
            className="border-0 shadow-sm rounded-4 p-3 h-100 text-center hover-card"
            style={{ cursor: "pointer", transition: "transform 0.2s" }}
            onClick={() => setActiveTab("bookmarks")}
          >
            <div
              className="rounded-circle p-3 d-inline-flex mx-auto mb-3"
              style={{ background: "#ffe4e6", color: "#e11d48" }}
            >
              <FaBookmark size={28} />
            </div>
            <h6 className="fw-bold mb-1 text-dark">Sổ Tay Đánh Dấu</h6>
            <p className="text-muted small mb-3">Xem lại những câu hỏi quan trọng bạn đã lưu lại khi làm đề</p>
            <Button size="sm" variant="outline-danger" className="w-100 rounded-pill fw-bold">
              Mở Sổ Tay &rarr;
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Recent History Preview */}
      <Card className="border-0 shadow-sm rounded-4 bg-white mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark m-0">Lịch Sử Làm Bài Gần Đây</h5>
            <Button
              variant="link"
              className="text-warning fw-bold p-0 text-decoration-none"
              onClick={() => setActiveTab("history")}
            >
              Xem tất cả &rarr;
            </Button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-4 text-muted small">
              Bạn chưa làm bài thi nào. Hãy thử sức với một bài thi thử ngay nhé!
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr className="text-muted small">
                    <th>Đề Thi</th>
                    <th>Thời Gian</th>
                    <th>Điểm Số</th>
                    <th>Tỷ Lệ</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((h) => {
                    const percent = h.total > 0 ? Math.round((h.score / h.total) * 100) : 0;
                    return (
                      <tr key={h._id}>
                        <td className="fw-bold text-dark">
                          {h.examId?.title || "Bài kiểm tra tổng hợp"}
                        </td>
                        <td className="text-muted small">
                          {new Date(h.createdAt).toLocaleDateString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="fw-semibold">
                          {h.score} / {h.total}
                        </td>
                        <td className="fw-semibold">{percent}%</td>
                        <td>
                          <Badge bg={h.status === "PASSED" ? "success" : "danger"} pill>
                            {h.status === "PASSED" ? "ĐẠT (Passed)" : "CHƯA ĐẠT"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserDashboard;
