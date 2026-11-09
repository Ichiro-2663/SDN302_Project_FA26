import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Alert } from "react-bootstrap";
import {
  Sparkles,
  Sliders,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import "./ExamComposer.css";

const ExamComposer = ({ onSuccess, onCancel }) => {
  const [topics, setTopics] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    duration: 30,
    type: "quiz",
    level: "Mixed",
    topic: "",
    skill: "",
    certificate: "",
    easyCount: 10,
    mediumCount: 6,
    hardCount: 4,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [topRes, skRes, certRes] = await Promise.allSettled([
          axiosClient.get("/topics"),
          axiosClient.get("/skills"),
          axiosClient.get("/certificates"),
        ]);
        if (topRes.status === "fulfilled") setTopics(topRes.value.data || []);
        if (skRes.status === "fulfilled") setSkills(skRes.value.data || []);
        if (certRes.status === "fulfilled") setCertificates(certRes.value.data || []);
      } catch (err) {
        console.error("Metadata load error:", err);
      }
    };
    fetchMetadata();
  }, []);

  const totalQuestions =
    Number(formData.easyCount || 0) +
    Number(formData.mediumCount || 0) +
    Number(formData.hardCount || 0);

  const easyPercent = totalQuestions > 0 ? Math.round((formData.easyCount / totalQuestions) * 100) : 0;
  const mediumPercent = totalQuestions > 0 ? Math.round((formData.mediumCount / totalQuestions) * 100) : 0;
  const hardPercent = totalQuestions > 0 ? 100 - easyPercent - mediumPercent : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!formData.title.trim()) {
      setError("Vui lòng nhập tiêu đề cho đề thi!");
      return;
    }

    if (totalQuestions <= 0) {
      setError("Tổng số câu hỏi phải lớn hơn 0!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        duration: Number(formData.duration),
        type: formData.type,
        level: formData.level,
        topic: formData.topic || undefined,
        skill: formData.skill || undefined,
        certificate: formData.certificate || undefined,
        easyCount: Number(formData.easyCount),
        mediumCount: Number(formData.mediumCount),
        hardCount: Number(formData.hardCount),
      };

      const res = await axiosClient.post("/exams/matrix/generate", payload);
      setSuccessMsg(`Tạo đề thi thành công với ${res.data?.questions?.length || totalQuestions} câu hỏi!`);
      if (onSuccess) {
        setTimeout(() => onSuccess(res.data), 800);
      }
    } catch (err) {
      console.error("Matrix generation error:", err);
      setError(err.response?.data?.message || "Lỗi khi tự động sinh đề theo ma trận!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="exam-composer-card p-4 p-md-5 bg-white">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
        <div className="composer-icon-badge">
          <Sparkles size={24} />
        </div>
        <div>
          <h5 className="fw-bold text-dark mb-1">Soạn Đề Thi Theo Ma Trận Độ Khó</h5>
          <p className="text-muted small mb-0">
            Hệ thống tự động cân đối và rút trích câu hỏi từ ngân hàng đề theo tỷ lệ Dễ / Trung bình / Khó.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="d-flex align-items-center gap-2 rounded-3 py-2">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="small">{error}</span>
        </Alert>
      )}

      {successMsg && (
        <Alert variant="success" className="d-flex align-items-center gap-2 rounded-3 py-2">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span className="small">{successMsg}</span>
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Step 1: General Info */}
        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <Layers size={18} className="text-orange" />
          1. Thông Tin Chung Đề Thi
        </h6>

        <Row className="g-3 mb-4">
          <Col md={8}>
            <Form.Group>
              <Form.Label className="composer-label">Tiêu Đề Đề Thi *</Form.Label>
              <Form.Control
                type="text"
                placeholder="VD: TOEIC Reading - Mini Test 5 (Cấp Tốc)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="composer-input"
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="composer-label">Thời Gian Làm Bài (Phút)</Form.Label>
              <div className="input-with-icon">
                <Clock size={16} className="input-icon" />
                <Form.Control
                  type="number"
                  min="5"
                  max="180"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="composer-input ps-5"
                  required
                />
              </div>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="composer-label">Chứng Chỉ Mục Tiêu</Form.Label>
              <Form.Select
                value={formData.certificate}
                onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                className="composer-input"
              >
                <option value="">-- Mặc định (Tất cả) --</option>
                {certificates.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="composer-label">Chủ Đề (Topic)</Form.Label>
              <Form.Select
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="composer-input"
              >
                <option value="">-- Tất cả chủ đề --</option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="composer-label">Kỹ Năng (Skill)</Form.Label>
              <Form.Select
                value={formData.skill}
                onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                className="composer-input"
              >
                <option value="">-- Tất cả kỹ năng --</option>
                {skills.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Step 2: Difficulty Matrix Configurator */}
        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <Sliders size={18} className="text-orange" />
          2. Cấu Hình Tỷ Lệ Ma Trận Độ Khó
        </h6>

        <div className="matrix-config-box p-4 mb-4">
          <Row className="g-3 mb-4">
            {/* Easy */}
            <Col md={4}>
              <div className="matrix-tier-card easy">
                <div className="tier-header d-flex justify-content-between align-items-center mb-2">
                  <span className="tier-name fw-bold text-success">DỄ (Easy / A1-A2)</span>
                  <span className="tier-percent-badge bg-success text-white">{easyPercent}%</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    value={formData.easyCount}
                    onChange={(e) =>
                      setFormData({ ...formData, easyCount: Math.max(0, Number(e.target.value)) })
                    }
                    className="tier-count-input"
                  />
                  <span className="text-muted small">câu</span>
                </div>
              </div>
            </Col>

            {/* Medium */}
            <Col md={4}>
              <div className="matrix-tier-card medium">
                <div className="tier-header d-flex justify-content-between align-items-center mb-2">
                  <span className="tier-name fw-bold text-warning">TRUNG BÌNH (B1-B2)</span>
                  <span className="tier-percent-badge bg-warning text-dark">{mediumPercent}%</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    value={formData.mediumCount}
                    onChange={(e) =>
                      setFormData({ ...formData, mediumCount: Math.max(0, Number(e.target.value)) })
                    }
                    className="tier-count-input"
                  />
                  <span className="text-muted small">câu</span>
                </div>
              </div>
            </Col>

            {/* Hard */}
            <Col md={4}>
              <div className="matrix-tier-card hard">
                <div className="tier-header d-flex justify-content-between align-items-center mb-2">
                  <span className="tier-name fw-bold text-danger">KHÓ (Hard / C1-C2)</span>
                  <span className="tier-percent-badge bg-danger text-white">{hardPercent}%</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    value={formData.hardCount}
                    onChange={(e) =>
                      setFormData({ ...formData, hardCount: Math.max(0, Number(e.target.value)) })
                    }
                    className="tier-count-input"
                  />
                  <span className="text-muted small">câu</span>
                </div>
              </div>
            </Col>
          </Row>

          {/* Visual Distribution Bar */}
          <div className="distribution-bar-container mb-2">
            <div
              className="dist-segment bg-success"
              style={{ width: `${easyPercent}%` }}
              title={`Dễ: ${formData.easyCount} câu (${easyPercent}%)`}
            />
            <div
              className="dist-segment bg-warning"
              style={{ width: `${mediumPercent}%` }}
              title={`Trung bình: ${formData.mediumCount} câu (${mediumPercent}%)`}
            />
            <div
              className="dist-segment bg-danger"
              style={{ width: `${hardPercent}%` }}
              title={`Khó: ${formData.hardCount} câu (${hardPercent}%)`}
            />
          </div>

          <div className="d-flex justify-content-between align-items-center text-muted small mt-2">
            <span>
              Phân bổ hiện tại: <strong>{easyPercent}% Dễ</strong> &bull;{" "}
              <strong>{mediumPercent}% TB</strong> &bull; <strong>{hardPercent}% Khó</strong>
            </span>
            <span className="fw-bold text-dark">
              Tổng số: <span className="fs-6 text-orange">{totalQuestions}</span> câu hỏi
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-3 pt-3 border-top">
          {onCancel && (
            <button
              type="button"
              className="btn-composer-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              Hủy
            </button>
          )}

          <button
            type="submit"
            className="btn-composer-submit"
            disabled={loading || totalQuestions === 0}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Đang Tự Động Sinh Đề...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>⚡ Tự Động Sinh Đề Theo Ma Trận</span>
              </>
            )}
          </button>
        </div>
      </Form>
    </Card>
  );
};

export default ExamComposer;
