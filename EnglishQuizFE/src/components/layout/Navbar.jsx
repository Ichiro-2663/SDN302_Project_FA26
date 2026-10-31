import React, { useContext } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaGraduationCap, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";

const AppNavbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRoleRedirect = () => {
    if (!user) return;
    const role = (user.role || "").toUpperCase();
    if (role === "ADMIN") navigate("/admin");
    else if (role === "TEACHER") navigate("/teacher");
    else navigate("/student");
  };

  return (
    <Navbar expand="lg" className="bg-white py-3 shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <div className="bg-warning text-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm">
            <FaGraduationCap size={22} className="text-dark" />
          </div>
          <span className="brand-text fs-4 m-0">EnglishQuiz</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto fw-semibold gap-3">
            <Nav.Link as={Link} to="/" className="text-dark">Trang Chủ</Nav.Link>
            <Nav.Link as={Link} to="/student" className="text-muted">Luyện Tập</Nav.Link>
            <Nav.Link as={Link} to="/student" className="text-muted">Đề Thi Thử</Nav.Link>
            <Nav.Link as={Link} to="/student" className="text-muted">Flashcards</Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-3">
                <Button 
                  variant="outline-warning" 
                  className="rounded-pill d-flex align-items-center gap-2 text-dark fw-bold"
                  onClick={handleRoleRedirect}
                >
                  <FaUserCircle size={18} />
                  <span>{user.name} ({user.role})</span>
                </Button>
                <Button 
                  variant="light" 
                  className="rounded-circle p-2 text-danger" 
                  onClick={logout}
                  title="Đăng xuất"
                >
                  <FaSignOutAlt size={18} />
                </Button>
              </div>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline-custom">
                  Đăng Nhập
                </Button>
                <Button as={Link} to="/register" className="btn-primary-custom">
                  Đăng Ký Miễn Phí
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
