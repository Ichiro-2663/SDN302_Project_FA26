import React, { useState, useEffect, useContext, useCallback } from "react";
import { Card, Form, Button, Alert, Row, Col, Badge } from "react-bootstrap";
import { FaCommentDots, FaPaperPlane, FaHistory } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

const UserFeedback = () => {
  const { user } = useContext(AuthContext);
  const userId = user?._id || localStorage.getItem("id");

  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    category: "Exam",
    rating: 5,
    content: "",
  });

  const [msg, setMsg] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserFeedbacks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axiosClient.get(`/feedbacks/user/${userId}`);
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error("Feedbacks fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserFeedbacks();
  }, [fetchUserFeedbacks]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setSubmitting(true);
    setMsg({ type: "", text: "" });

    try {
      await axiosClient.post("/feedbacks", {
        userId,
        userName: user?.name || "Học viên",
        userEmail: user?.email || "",
        title: formData.title,
        category: formData.category,
        rating: Number(formData.rating),
        content: formData.content,
      });

      setMsg({
        type: "success",
        text: "Cảm ơn bạn! Ý kiến đóng góp đã được gửi đến ban quản trị hệ thống.",
      });
      setFormData({ title: "", category: "Exam", rating: 5, content: "" });
      fetchUserFeedbacks();
    } catch (err) {
      setMsg({
        type: "danger",
        text: err.response?.data?.message || err.message || "Gửi góp ý thất bại",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (st) => {
    switch (st) {
      case "Resolved":
        return <Badge bg="success" pill>Đã xử lý</Badge>;
      case "Reviewed":
        return <Badge bg="info" pill>Đã tiếp nhận</Badge>;
      case "Pending":
      default:
        return <Badge bg="warning" text="dark" pill>Đang chờ duyệt</Badge>;
    }
  };

  return (
    <div className="w-100">
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Góp Ý & Phản Hồi Hệ Thống</h4>
        <p className="text-muted small mb-0">
          Hãy chia sẻ phản hồi của bạn để đội ngũ phát triển không ngừng cải thiện chất lượng nền tảng
        </p>
      </div>

      <Row className="g-4">
        {/* Feedback Input Form */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaCommentDots className="text-warning" /> Gửi Phản Hồi Mới
            </h5>

            {msg.text && (
              <Alert variant={msg.type} className="py-2 small">
                {msg.text}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-muted">Tiêu đề góp ý</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  placeholder="Ví dụ: Đề nghị bổ sung thêm dạng câu hỏi Matching cho TOEIC..."
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Phân loại góp ý</Form.Label>
                    <Form.Select name="category" value={formData.category} onChange={handleChange}>
                      <option value="Exam">Đề thi & Chấm điểm</option>
                      <option value="Practice">Luyện tập câu hỏi</option>
                      <option value="System">Hệ thống & Giao diện</option>
                      <option value="Other">Khác</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Đánh giá trải nghiệm</Form.Label>
                    <Form.Select name="rating" value={formData.rating} onChange={handleChange}>
                      <option value="5">⭐⭐⭐⭐⭐ (Rất hài lòng)</option>
                      <option value="4">⭐⭐⭐⭐ (Hài lòng)</option>
                      <option value="3">⭐⭐⭐ (Bình thường)</option>
                      <option value="2">⭐⭐ (Cần cải thiện)</option>
                      <option value="1">⭐ (Kém)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold text-muted">Nội dung chi tiết</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="content"
                  placeholder="Mô tả cụ thể vấn đề hoặc đóng góp của bạn..."
                  value={formData.content}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button
                variant="warning"
                type="submit"
                className="w-100 fw-bold py-2 rounded-pill text-dark shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={submitting}
              >
                <FaPaperPlane /> {submitting ? "Đang gửi..." : "Gửi Đóng Góp"}
              </Button>
            </Form>
          </Card>
        </Col>

        {/* History of feedbacks */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaHistory className="text-warning" /> Lịch Sử Phản Hồi Của Bạn
            </h5>

            {loading ? (
              <div className="text-center py-4 text-muted small">Đang tải...</div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                Bạn chưa gửi phản hồi nào. Mọi đóng góp của bạn đều rất quý giá đối với chúng tôi!
              </div>
            ) : (
              <div className="d-flex flex-column gap-3" style={{ maxHeight: "420px", overflowY: "auto" }}>
                {feedbacks.map((f) => (
                  <div key={f._id} className="p-3 border rounded-3 bg-light">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong className="text-dark small">{f.title}</strong>
                      {statusBadge(f.status)}
                    </div>
                    <div className="text-muted small mb-2">{f.content}</div>
                    <div className="d-flex justify-content-between align-items-center small text-secondary">
                      <span>Loại: <strong>{f.category}</strong> &bull; {f.rating} ⭐</span>
                      <span>{new Date(f.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
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

export default UserFeedback;
