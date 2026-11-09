import React, { useState, useContext, useEffect } from "react";
import { Card, Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaGraduationCap, FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { login, user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = (user.role || "").toUpperCase();
      if (role === "ADMIN") navigate("/admin");
      else if (role === "TEACHER") navigate("/teacher");
      else navigate("/student");
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      const role = (loggedUser?.role || "").toUpperCase();
      if (role === "ADMIN") navigate("/admin");
      else if (role === "TEACHER") navigate("/teacher");
      else navigate("/student");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (testEmail, testPass) => {
    setEmail(testEmail);
    setPassword(testPass);
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
          <Col xs={12} sm={10} md={7} lg={5}>
            <div className="text-center mb-4">
              <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-2">
                <div
                  className="rounded-4 p-3 d-flex align-items-center justify-content-center shadow-sm"
                  style={{ background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)" }}
                >
                  <FaGraduationCap size={32} color="#ffffff" />
                </div>
              </Link>
              <h2 className="fw-bold mt-2" style={{ color: "#0f172a" }}>EnglishQuiz</h2>
              <p className="text-muted small">Nền tảng kiểm tra, luyện thi và ghi nhớ từ vựng tiếng Anh</p>
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
                <h4 className="fw-bold text-center mb-4" style={{ color: "#1e293b" }}>
                  Đăng Nhập Tài Khoản
                </h4>

                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small text-muted">Email đăng nhập</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <FaEnvelope />
                      </span>
                      <Form.Control
                        type="email"
                        placeholder="ten@email.com"
                        className="border-start-0 py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold small text-muted">Mật khẩu</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <FaLock />
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="••••••••"
                        className="border-start-0 py-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 py-2 fw-bold border-0 shadow-sm rounded-3 d-flex align-items-center justify-content-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
                      color: "#ffffff",
                    }}
                    disabled={submitting}
                  >
                    <FaSignInAlt />
                    {submitting ? "Đang xử lý..." : "Đăng Nhập Ngay"}
                  </Button>
                </Form>

                <div className="mt-4 pt-3 border-top text-center">
                  <p className="small text-muted mb-2">Chưa có tài khoản?</p>
                  <Link to="/register" className="fw-bold" style={{ color: "#ea580c" }}>
                    Đăng Ký Tài Khoản Mới &rarr;
                  </Link>
                </div>

                <div className="mt-4 pt-3 bg-light p-3 rounded-3 small">
                  <span className="fw-bold text-dark d-block mb-1">Gợi ý tài khoản mẫu:</span>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => handleQuickFill("student@gmail.com", "123456")}
                    >
                      Học viên
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => handleQuickFill("teacher@gmail.com", "123456")}
                    >
                      Giáo viên
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => handleQuickFill("admin@gmail.com", "123456")}
                    >
                      Quản trị
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
