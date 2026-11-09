import React, { useState, useEffect } from "react";
import { Card, Row, Col, Table, Badge } from "react-bootstrap";
import { FaTrophy } from "react-icons/fa";
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
import axiosClient from "../../api/axiosClient";

const Reports = () => {
  const [examStats, setExamStats] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [statsRes, histRes, usersRes] = await Promise.allSettled([
        axiosClient.get("/exams/stats"),
        axiosClient.get("/history"),
        axiosClient.get("/users"),
      ]);

      if (statsRes.status === "fulfilled") {
        setExamStats(statsRes.value.data?.examStats || []);
      }
      if (histRes.status === "fulfilled") {
        setHistoryList(histRes.value.data || []);
      }
      if (usersRes.status === "fulfilled") {
        setUsers(usersRes.value.data || []);
      }
    } catch (err) {
      console.error("Report data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const totalAttempts = historyList.length;
  const passedAttempts = historyList.filter((h) => h.status === "PASSED").length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  const avgSystemScore =
    totalAttempts > 0
      ? Math.round(
          (historyList.reduce(
            (acc, h) => acc + (h.total > 0 ? (h.score / h.total) * 100 : 0),
            0
          ) /
            totalAttempts) *
            10
        ) / 10
      : 0;

  // Chart data
  const chartData = examStats.map((item) => ({
    title: item.title?.length > 18 ? item.title.substring(0, 18) + "..." : item.title,
    attempts: item.attempts || 0,
    averageScore: item.averageScore || 0,
  }));

  // Top users from history
  const userMap = {};
  historyList.forEach((h) => {
    const uId = h.userId?._id || h.userId;
    const uName = h.userId?.name || "Học viên";
    if (!uId) return;

    if (!userMap[uId]) {
      userMap[uId] = { id: uId, name: uName, examsTaken: 0, totalScore: 0 };
    }
    userMap[uId].examsTaken++;
    userMap[uId].totalScore += h.score || 0;
  });

  const topStudents = Object.values(userMap)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5);

  return (
    <div className="w-100">
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Báo Cáo Phân Tích & Thống Kê</h4>
        <p className="text-muted small mb-0">
          Tổng hợp lượt thi, phổ điểm trung bình và xếp hạng thành tích học viên trên toàn hệ thống
        </p>
      </div>

      {/* 4 Stat Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span className="text-muted small fw-semibold">Tổng lượt làm bài</span>
            <h3 className="fw-bold my-1 text-dark">{totalAttempts}</h3>
            <span className="small text-muted">Trên toàn bộ đề thi</span>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span className="text-muted small fw-semibold">Tỷ lệ thi đạt (Passed)</span>
            <h3 className="fw-bold my-1 text-success">{passRate}%</h3>
            <span className="small text-muted">{passedAttempts} lượt đạt chuẩn</span>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span className="text-muted small fw-semibold">Điểm trung bình toàn sàn</span>
            <h3 className="fw-bold my-1 text-warning">{avgSystemScore}%</h3>
            <span className="small text-muted">Dựa trên thang 100%</span>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <span className="text-muted small fw-semibold">Tổng đề thi được kích hoạt</span>
            <h3 className="fw-bold my-1 text-primary">{examStats.length}</h3>
            <span className="small text-muted">{users.length} tài khoản thành viên</span>
          </Card>
        </Col>
      </Row>

      {/* Main Chart */}
      <Card className="border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <h5 className="fw-bold text-dark mb-3">Biểu Đồ Phân Tích Lượt Thi & Điểm Trung Bình</h5>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status" />
            <p className="mt-2 text-muted">Đang tổng hợp dữ liệu báo cáo...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-5 text-muted small">Chưa có dữ liệu thi để lập biểu đồ.</div>
        ) : (
          <div style={{ width: "100%", height: "350px" }}>
            <ResponsiveContainer>
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid stroke="#f1f5f9" />
                <XAxis dataKey="title" scale="band" fontSize={11} stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#ea580c" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="attempts"
                  name="Số lượt nộp bài"
                  fill="#ea580c"
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="averageScore"
                  name="Điểm trung bình (%)"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Top Students Table */}
      <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <FaTrophy className="text-warning" /> Top 5 Học Viên Có Thành Tích Cao Nhất
        </h5>

        {topStudents.length === 0 ? (
          <div className="text-center py-4 text-muted small">Chưa có dữ liệu thành tích học viên.</div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr className="text-muted small">
                  <th style={{ width: "40px" }}>Hạng</th>
                  <th>Học Viên</th>
                  <th>Số Lượt Tham Gia Thi</th>
                  <th>Tổng Điểm Tích Lũy</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((s, idx) => (
                  <tr key={s.id}>
                    <td>
                      <span
                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                        style={{
                          width: "28px",
                          height: "28px",
                          background:
                            idx === 0
                              ? "#fef08a"
                              : idx === 1
                              ? "#e2e8f0"
                              : idx === 2
                              ? "#fed7aa"
                              : "#f1f5f9",
                          color: "#0f172a",
                          fontSize: "12px",
                        }}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="fw-bold text-dark">{s.name}</td>
                    <td className="text-muted">{s.examsTaken} bài thi</td>
                    <td className="fw-bold text-warning">{s.totalScore} điểm</td>
                    <td>
                      <Badge bg="success" pill>
                        Xuất Sắc
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reports;
