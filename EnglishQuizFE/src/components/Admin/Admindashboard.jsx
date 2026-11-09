import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaClipboardList,
  FaFileAlt,
  FaQuestionCircle,
  FaUserShield,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaArrowRight,
  FaBell,
  FaCommentDots,
} from "react-icons/fa";
import { Row, Col, Card, ProgressBar, Button, Badge } from "react-bootstrap";
import axiosClient from "../../api/axiosClient";

const AdminDashboard = ({ onSelect }) => {
  const [data, setData] = useState({
    totalUsers: 0,
    adminCount: 0,
    teacherCount: 0,
    studentCount: 0,
    totalQuestions: 0,
    totalExams: 0,
    totalAttempts: 0,
    totalFeedbacks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, questionsRes, statsRes, feedRes] = await Promise.allSettled([
        axiosClient.get("/users"),
        axiosClient.get("/questions"),
        axiosClient.get("/exams/stats"),
        axiosClient.get("/feedbacks"),
      ]);

      const users = usersRes.status === "fulfilled" ? usersRes.value.data : [];
      const questions = questionsRes.status === "fulfilled" ? questionsRes.value.data : [];
      const stats = statsRes.status === "fulfilled" ? statsRes.value.data : {};
      const feedbacks = feedRes.status === "fulfilled" ? feedRes.value.data : [];

      const totalUsers = users.length;
      const adminCount = users.filter((u) => (u.role || "").toUpperCase() === "ADMIN").length;
      const teacherCount = users.filter((u) => (u.role || "").toUpperCase() === "TEACHER").length;
      const studentCount = users.filter((u) => (u.role || "").toUpperCase() === "STUDENT").length;

      setData({
        totalUsers,
        adminCount,
        teacherCount,
        studentCount,
        totalQuestions: questions.length,
        totalExams: stats.totalExams || 0,
        totalAttempts: stats.totalAttempts || 0,
        totalFeedbacks: feedbacks.length,
      });
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const studentPercent = data.totalUsers > 0 ? Math.round((data.studentCount / data.totalUsers) * 100) : 0;
  const teacherPercent = data.totalUsers > 0 ? Math.round((data.teacherCount / data.totalUsers) * 100) : 0;
  const adminPercent = data.totalUsers > 0 ? Math.round((data.adminCount / data.totalUsers) * 100) : 0;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status" />
        <p className="mt-2 text-muted">Đang tải số liệu quản trị...</p>
      </div>
    );
  }

  return (
    <div className="w-100">
      {/* Welcome Banner */}
      <Card
        className="border-0 shadow-sm rounded-4 text-white mb-4 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
          borderRadius: "20px",
        }}
      >
        <Card.Body className="p-4 p-md-5">
          <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill fw-bold mb-2">
            Admin Workspace &bull; Control Center
          </Badge>
          <h2 className="fw-bold mb-2">Bảng Điều Khiển Quản Trị Hệ Thống</h2>
          <p className="mb-0 opacity-80 fs-6">
            Giám sát người dùng, phân quyền bảo mật, kiểm tra báo cáo và phát thông báo toàn nền tảng.
          </p>
        </Card.Body>
      </Card>

      {/* 4 Stat Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Người dùng hệ thống</span>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ background: "#e0f2fe", color: "#0284c7" }}
              >
                <FaUsers size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{data.totalUsers}</h3>
            <span className="small text-muted">{data.studentCount} học viên &bull; {data.teacherCount} giáo viên</span>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Ngân hàng câu hỏi</span>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ background: "#ffedd5", color: "#ea580c" }}
              >
                <FaQuestionCircle size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{data.totalQuestions}</h3>
            <span className="small text-muted">Đa dạng 4 thể loại</span>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Tổng số đề thi</span>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ background: "#ede9fe", color: "#7c3aed" }}
              >
                <FaFileAlt size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{data.totalExams}</h3>
            <span className="small text-muted">Quiz & Mini-test</span>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Tổng lượt làm bài</span>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ background: "#dcfce7", color: "#16a34a" }}
              >
                <FaClipboardList size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{data.totalAttempts}</h3>
            <span className="small text-muted">Đã ghi nhận trong lịch sử</span>
          </Card>
        </Col>
      </Row>

      {/* Role Breakdown & Quick Action shortcuts */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-4">Phân Bổ Vai Trò Người Dùng</h5>

            <div className="mb-3">
              <div className="d-flex justify-content-between small fw-semibold mb-1">
                <span className="text-muted d-flex align-items-center gap-1">
                  <FaUserGraduate className="text-success" /> Học viên (Student)
                </span>
                <span className="text-dark">
                  {data.studentCount} ({studentPercent}%)
                </span>
              </div>
              <ProgressBar now={studentPercent} variant="success" style={{ height: "8px" }} className="rounded-pill" />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between small fw-semibold mb-1">
                <span className="text-muted d-flex align-items-center gap-1">
                  <FaChalkboardTeacher className="text-primary" /> Giáo viên (Teacher)
                </span>
                <span className="text-dark">
                  {data.teacherCount} ({teacherPercent}%)
                </span>
              </div>
              <ProgressBar now={teacherPercent} variant="primary" style={{ height: "8px" }} className="rounded-pill" />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between small fw-semibold mb-1">
                <span className="text-muted d-flex align-items-center gap-1">
                  <FaUserShield className="text-danger" /> Quản trị viên (Admin)
                </span>
                <span className="text-dark">
                  {data.adminCount} ({adminPercent}%)
                </span>
              </div>
              <ProgressBar now={adminPercent} variant="danger" style={{ height: "8px" }} className="rounded-pill" />
            </div>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3">Lối Tắt Tác Vụ Quản Trị</h5>

            <div className="d-flex flex-column gap-3">
              <Button
                variant="light"
                className="p-3 rounded-3 text-start border d-flex align-items-center justify-content-between hover-card"
                onClick={() => onSelect("users")}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle p-2 bg-primary bg-opacity-10 text-primary">
                    <FaUsers size={20} />
                  </div>
                  <div>
                    <strong className="d-block text-dark">Quản Trị Người Dùng</strong>
                    <span className="text-muted small">Phân quyền, vô hiệu hóa hoặc kích hoạt tài khoản</span>
                  </div>
                </div>
                <FaArrowRight className="text-muted" />
              </Button>

              <Button
                variant="light"
                className="p-3 rounded-3 text-start border d-flex align-items-center justify-content-between hover-card"
                onClick={() => onSelect("reports")}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle p-2 bg-success bg-opacity-10 text-success">
                    <FaClipboardList size={20} />
                  </div>
                  <div>
                    <strong className="d-block text-dark">Báo Cáo & Thống Kê</strong>
                    <span className="text-muted small">Biểu đồ ComposedChart phân tích hiệu suất học tập</span>
                  </div>
                </div>
                <FaArrowRight className="text-muted" />
              </Button>

              <Button
                variant="light"
                className="p-3 rounded-3 text-start border d-flex align-items-center justify-content-between hover-card"
                onClick={() => onSelect("system")}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle p-2 bg-warning bg-opacity-10 text-warning">
                    <FaBell size={20} />
                  </div>
                  <div>
                    <strong className="d-block text-dark">Thông Báo Hệ Thống</strong>
                    <span className="text-muted small">Phát thông báo đến học sinh và giáo viên</span>
                  </div>
                </div>
                <FaArrowRight className="text-muted" />
              </Button>

              <Button
                variant="light"
                className="p-3 rounded-3 text-start border d-flex align-items-center justify-content-between hover-card"
                onClick={() => onSelect("feedbacks")}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle p-2 bg-info bg-opacity-10 text-info">
                    <FaCommentDots size={20} />
                  </div>
                  <div>
                    <strong className="d-block text-dark">Hòm Thư Góp Ý ({data.totalFeedbacks})</strong>
                    <span className="text-muted small">Xem các phản hồi và đánh giá từ phía học viên</span>
                  </div>
                </div>
                <FaArrowRight className="text-muted" />
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
