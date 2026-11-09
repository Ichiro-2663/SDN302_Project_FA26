import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Badge, Alert } from "react-bootstrap";
import { FaBullhorn, FaPlus, FaTrash } from "react-icons/fa";
import axiosClient from "../../api/axiosClient";

const SystemNotice = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
    targetRole: "All",
  });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/notices");
      setNotices(res.data || []);
    } catch (err) {
      console.error("Notices fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setSubmitting(true);
    setMsg({ type: "", text: "" });

    try {
      await axiosClient.post("/notices", formData);
      setMsg({ type: "success", text: "Đã phát thông báo thành công lên toàn hệ thống!" });
      setFormData({ title: "", content: "", type: "info", targetRole: "All" });
      fetchNotices();
    } catch (err) {
      setMsg({
        type: "danger",
        text: err.response?.data?.message || err.message || "Lỗi tạo thông báo",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ thông báo này khỏi hệ thống?")) return;
    try {
      await axiosClient.delete(`/notices/${id}`);
      fetchNotices();
    } catch (err) {
      console.error("Delete notice error:", err);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "danger":
        return <Badge bg="danger" pill>Khẩn cấp</Badge>;
      case "warning":
        return <Badge bg="warning" text="dark" pill>Cảnh báo</Badge>;
      case "success":
        return <Badge bg="success" pill>Thành công</Badge>;
      case "info":
      default:
        return <Badge bg="info" pill>Thông tin</Badge>;
    }
  };

  return (
    <div className="w-100">
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Thông Báo Hệ Thống (System Notices)</h4>
        <p className="text-muted small mb-0">
          Phát thông báo đẩy đến tất cả học viên hoặc giáo viên trong thời gian thực
        </p>
      </div>

      <Row className="g-4">
        {/* Form create notice */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaBullhorn className="text-warning" /> Tạo Thông Báo Mới
            </h5>

            {msg.text && (
              <Alert variant={msg.type} className="py-2 small">
                {msg.text}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <Form.Group>
                <Form.Label className="small fw-semibold text-muted">Tiêu đề thông báo</Form.Label>
                <Form.Control
                  placeholder="Ví dụ: Lịch bảo trì hệ thống hoặc Ra mắt bộ đề thi mới..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-muted">Mức độ ưu tiên</Form.Label>
                    <Form.Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="info">Thông tin (Info)</option>
                      <option value="success">Thành công (Success)</option>
                      <option value="warning">Cảnh báo (Warning)</option>
                      <option value="danger">Khẩn cấp (Danger)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-muted">Đối tượng nhận</Form.Label>
                    <Form.Select
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    >
                      <option value="All">Tất cả người dùng</option>
                      <option value="Student">Chỉ Học viên</option>
                      <option value="Teacher">Chỉ Giáo viên</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group>
                <Form.Label className="small fw-semibold text-muted">Nội dung chi tiết</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Nhập nội dung đầy đủ của thông báo..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </Form.Group>

              <Button
                variant="warning"
                type="submit"
                className="w-100 fw-bold py-2 rounded-pill text-dark shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={submitting}
              >
                <FaPlus /> {submitting ? "Đang gửi..." : "Đăng Thông Báo"}
              </Button>
            </Form>
          </Card>
        </Col>

        {/* List of active notices */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">
              Các Thông Báo Đang Hoạt Động ({notices.length})
            </h5>

            {loading ? (
              <div className="text-center py-4 text-muted small">Đang tải thông báo...</div>
            ) : notices.length === 0 ? (
              <div className="text-center py-4 text-muted small">Chưa có thông báo nào được đăng.</div>
            ) : (
              <div className="d-flex flex-column gap-3" style={{ maxHeight: "480px", overflowY: "auto" }}>
                {notices.map((n) => (
                  <div key={n._id} className="p-3 border rounded-3 bg-light">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        {getTypeBadge(n.type)}
                        <strong className="text-dark fs-6">{n.title}</strong>
                      </div>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="rounded-circle p-1"
                        title="Xóa thông báo"
                        onClick={() => handleDelete(n._id)}
                      >
                        <FaTrash size={12} />
                      </Button>
                    </div>

                    <p className="text-muted small mb-2 lh-base">{n.content}</p>

                    <div className="d-flex justify-content-between align-items-center small text-secondary">
                      <span>Đối tượng: <strong>{n.targetRole}</strong></span>
                      <span>{new Date(n.createdAt).toLocaleDateString("vi-VN")}</span>
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

export default SystemNotice;
