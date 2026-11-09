import React, { useState } from "react";
import { Card, Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaGraduationCap, FaUser, FaEnvelope, FaLock, FaUserPlus, FaSchool } from "react-icons/fa";
import axiosClient from "../api/axiosClient";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
    school: "",
    age: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        school: formData.school,
        age: formData.age ? parseInt(formData.age) : undefined,
      };

      await axiosClient.post("/auth/register", payload);
      setSuccess("Đăng ký tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #f9fafb 100%)",
        display: "flex",
        alignItems: "center",
        padding: "40px 16px",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6}>
            <div className="text-center mb-4">
              <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-2">
                <div
                  className="rounded-4 p-3 d-flex align-items-center justify-content-center shadow-sm"
                  style={{ background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)" }}
                >
                  <FaGraduationCap size={32} color="#ffffff" />
                </div>
              </Link>
              <h2 className="fw-bold mt-2" style={{ color: "#0f172a" }}>Tạo Tài Khoản Mới</h2>
              <p className="text-muted small">Tham gia cộng đồng học tập tiếng Anh toàn diện</p>
            </div>

            <Card
              className="border-0 shadow-lg rounded-4 overflow-hidden"
              style={{ background: "#ffffff", borderRadius: "24px" }}
            >
              <div
                style={{
                  height: "6px",
                  background: "linear-gradient(90deg, #ea580c, #f59e0b)",
                }}
              />
              <Card.Body className="p-4 p-md-5">
                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                {success && <Alert variant="success" className="py-2 small">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-muted">Họ và tên</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted">
                            <FaUser />
                          </span>
                          <Form.Control
                            type="text"
                            name="name"
                            placeholder="Nguyễn Văn A"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-muted">Email</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted">
                            <FaEnvelope />
                          </span>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="ten@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-muted">Mật khẩu</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted">
                            <FaLock />
                          </span>
                          <Form.Control
                            type="password"
                            name="password"
                            placeholder="Ít nhất 6 ký tự"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-muted">Xác nhận mật khẩu</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted">
                            <FaLock />
                          </span>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            placeholder="Nhập lại mật khẩu"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-muted">Vai trò</Form.Label>
                        <Form.Select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                        >
                          <option value="Student">Học viên (Student)</option>
                          <option value="Teacher">Giáo viên (Teacher)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-muted">Tuổi</Form.Label>
                        <Form.Control
                          type="number"
                          name="age"
                          placeholder="Ví dụ: 20"
                          value={formData.age}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold small text-muted">Trường học / Đơn vị</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted">
                            <FaSchool />
                          </span>
                          <Form.Control
                            type="text"
                            name="school"
                            placeholder="Đại học FPT, ..."
                            value={formData.school}
                            onChange={handleChange}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    type="submit"
                    className="w-100 py-2 fw-bold border-0 shadow-sm rounded-3 d-flex align-items-center justify-content-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
                      color: "#ffffff",
                    }}
                    disabled={submitting}
                  >
                    <FaUserPlus />
                    {submitting ? "Đang tạo tài khoản..." : "Hoàn Tất Đăng Ký"}
                  </Button>
                </Form>

                <div className="mt-4 pt-3 border-top text-center">
                  <p className="small text-muted mb-2">Đã có tài khoản?</p>
                  <Link to="/login" className="fw-bold" style={{ color: "#ea580c" }}>
                    &larr; Đăng Nhập Ngay
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
