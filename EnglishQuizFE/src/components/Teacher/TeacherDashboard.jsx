import React, { useState, useEffect, useContext } from "react";
import { Card, Row, Col, Button, Badge, Form } from "react-bootstrap";
import {
  FaUsers,
  FaFileAlt,
  FaQuestionCircle,
  FaPlusCircle,
  FaChartLine,
  FaTrophy,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { AuthContext } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

const TeacherDashboard = ({ setActiveTab }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    users: [],
    questions: [],
    history: [],
    exams: [],
    topics: [],
  });

  const [selectedTopic, setSelectedTopic] = useState("All");

  useEffect(() => {
    fetchTeacherStats();
  }, []);

  const fetchTeacherStats = async () => {
    try {
      setLoading(true);
      const [usersRes, questionsRes, historyRes, topicsRes, examsRes] = await Promise.allSettled([
        axiosClient.get("/users"),
        axiosClient.get("/questions"),
        axiosClient.get("/history"),
        axiosClient.get("/topics"),
        axiosClient.get("/exams"),
      ]);

      const users = usersRes.status === "fulfilled" ? usersRes.value.data : [];
      const questions = questionsRes.status === "fulfilled" ? questionsRes.value.data : [];
      const history = historyRes.status === "fulfilled" ? historyRes.value.data : [];
      const topics = topicsRes.status === "fulfilled" ? topicsRes.value.data : [];
      const exams = examsRes.status === "fulfilled" ? examsRes.value.data : [];

      setData({
        users: users.filter((u) => (u.role || "").toUpperCase() === "STUDENT"),
        questions,
        history,
        topics,
        exams,
      });
    } catch (err) {
      console.error("Teacher dashboard stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = data.exams.filter((e) => {
    if (selectedTopic !== "All") {
      const eTopicId = e.topic?._id || e.topic;
      return eTopicId === selectedTopic;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status" />
        <p className="mt-2 text-muted">Đang tải số liệu giáo viên...</p>
      </div>
    );
  }

  // Chart data: exams and their average scores
  const chartData = filteredExams.slice(0, 7).map((e) => {
    const attempts = data.history.filter((h) => {
      const hExamId = h.examId?._id || h.examId;
      return String(hExamId) === String(e._id);
    });
    const avgScore =
      attempts.length > 0
        ? Math.round(
            (attempts.reduce((acc, cur) => acc + (cur.total > 0 ? (cur.score / cur.total) * 100 : 0), 0) /
              attempts.length) *
              10
          ) / 10
        : 0;

    return {
      title: e.title?.length > 15 ? e.title.substring(0, 15) + "..." : e.title,
      attempts: attempts.length,
      averageScore: avgScore,
    };
  });

  // Top performing students
  const studentRankMap = {};
  data.history.forEach((h) => {
    const sId = h.userId?._id || h.userId;
    const sName = h.userId?.name || "Học viên";
    if (!sId) return;

    if (!studentRankMap[sId]) {
      studentRankMap[sId] = { id: sId, name: sName, attempts: 0, totalScore: 0 };
    }
    studentRankMap[sId].attempts++;
    studentRankMap[sId].totalScore += h.score || 0;
  });

  const topStudents = Object.values(studentRankMap)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5);

  return (
    <div className="w-100">
      {/* Welcome Banner */}
      <Card
        className="border-0 shadow-sm rounded-4 text-white mb-4 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f97316 0%, #eab308 100%)",
          borderRadius: "20px",
        }}
      >
        <Card.Body className="p-4 p-md-5">
          <Row className="align-items-center">
            <Col md={8}>
              <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill fw-bold mb-2">
                Teacher Studio 2.0
              </Badge>
              <h2 className="fw-bold mb-2">Xin chào, Thầy/Cô {user?.name || ""}!</h2>
              <p className="mb-0 opacity-90 fs-6">
                Quản lý ngân hàng câu hỏi, biên soạn đề thi chuẩn ma trận và theo dõi tiến độ của học sinh.
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0 d-flex flex-column gap-2">
              <Button
                variant="light"
                className="fw-bold px-4 py-2 rounded-pill text-dark shadow-sm d-flex align-items-center justify-content-center gap-2"
                onClick={() => setActiveTab("questions")}
              >
                <FaPlusCircle className="text-warning" /> Soạn Câu Hỏi Mới
              </Button>
              <Button
                variant="outline-light"
                className="fw-bold px-4 py-2 rounded-pill d-flex align-items-center justify-content-center gap-2"
                onClick={() => setActiveTab("exams")}
              >
                <FaFileAlt /> Tạo Đề Thi Ma Trận
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 4 Stat Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Tổng số câu hỏi</span>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ background: "#ffedd5", color: "#ea580c" }}
              >
                <FaQuestionCircle size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{data.questions.length}</h3>
            <span className="small text-muted">Trong ngân hàng đề</span>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Bộ đề thi hiện có</span>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ background: "#e0f2fe", color: "#0284c7" }}
              >
                <FaFileAlt size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{data.exams.length}</h3>
            <span className="small text-muted">Quiz & Mini-test</span>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Học sinh đăng ký</span>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ background: "#ede9fe", color: "#7c3aed" }}
              >
                <FaUsers size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{data.users.length}</h3>
            <span className="small text-muted">Đang theo học</span>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Lượt nộp bài thi</span>
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center"
                style={{ background: "#dcfce7", color: "#16a34a" }}
              >
                <FaChartLine size={18} />
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-dark">{data.history.length}</h3>
            <span className="small text-muted">Đã được hệ thống chấm</span>
          </Card>
        </Col>
      </Row>

      {/* Chart & Top Performers */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark m-0">Hiệu Suất Làm Bài Theo Đề Thi</h5>
              <Form.Select
                size="sm"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                style={{ width: "160px" }}
              >
                <option value="All">Tất cả chủ đề</option>
                {data.topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </Form.Select>
            </div>

            {chartData.length === 0 ? (
              <div className="text-center py-5 text-muted small">Chưa có dữ liệu làm bài để hiển thị biểu đồ</div>
            ) : (
              <div style={{ width: "100%", height: "300px" }}>
                <ResponsiveContainer>
                  <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid stroke="#f1f5f9" />
                    <XAxis dataKey="title" scale="band" fontSize={11} stroke="#94a3b8" />
                    <YAxis yAxisId="left" stroke="#ea580c" fontSize={11} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="attempts" name="Lượt thi" fill="#ea580c" radius={[6, 6, 0, 0]} />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="averageScore"
                      name="Điểm TB (%)"
                      stroke="#10b981"
                      strokeWidth={3}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        {/* Top 5 Students */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaTrophy className="text-warning" /> Bảng Xếp Hạng Học Viên
            </h5>

            {topStudents.length === 0 ? (
              <div className="text-center py-5 text-muted small">Chưa có lượt thi nào ghi nhận</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {topStudents.map((s, idx) => (
                  <div key={s.id} className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light">
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                        style={{
                          width: "28px",
                          height: "28px",
                          background: idx === 0 ? "#fef08a" : idx === 1 ? "#e2e8f0" : idx === 2 ? "#fed7aa" : "#f1f5f9",
                          color: "#0f172a",
                          fontSize: "12px",
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <strong className="d-block text-dark small">{s.name}</strong>
                        <span className="text-muted" style={{ fontSize: "11px" }}>
                          {s.attempts} bài đã làm
                        </span>
                      </div>
                    </div>
                    <Badge bg="warning" text="dark" pill>
                      {s.totalScore} pts
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherDashboard;
