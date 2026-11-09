import React, { useContext, useState, useEffect } from "react";
import { Navbar, Container, Dropdown, Badge, Modal, Button } from "react-bootstrap";
import { FaUserCircle, FaBell, FaSignOutAlt, FaInfoCircle, FaGraduationCap } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

const Header = ({ isExamLocked = false }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axiosClient.get("/notices");
        setNotices(res.data || []);
      } catch (err) {
        // Fallback silently if offline
      }
    };
    fetchNotices();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleBadgeColor = {
    ADMIN: "danger",
    TEACHER: "primary",
    STUDENT: "success",
  }[(user?.role || "").toUpperCase()] || "secondary";

  return (
    <>
      <Navbar bg="white" className="border-bottom py-2 px-3 sticky-top shadow-sm">
        <Container fluid className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
              <div
                className="rounded-3 p-2 d-flex align-items-center justify-content-center text-white"
                style={{ background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)" }}
              >
                <FaGraduationCap size={20} />
              </div>
              <span className="fw-bold fs-5 text-dark">EnglishQuiz</span>
            </Link>
          </div>

          {isExamLocked ? (
            <div className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-warning bg-opacity-10 border border-warning">
              <span className="small fw-bold text-warning-emphasis">
                🔒 Chế Độ Phòng Thi Bảo Mật &mdash; Phải nộp bài để quay lại Menu
              </span>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-3">
              {/* System Notices Bell */}
              <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                className="position-relative border-0 rounded-circle p-2 d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px" }}
              >
                <FaBell className="text-muted" size={18} />
                {notices.length > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: "10px" }}
                  >
                    {notices.length}
                  </Badge>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ width: "320px", maxHeight: "380px", overflowY: "auto" }}>
                <Dropdown.Header className="fw-bold text-dark border-bottom pb-2">
                  Thông Báo Hệ Thống ({notices.length})
                </Dropdown.Header>
                {notices.length === 0 ? (
                  <div className="p-3 text-center text-muted small">Không có thông báo mới</div>
                ) : (
                  notices.map((n) => (
                    <Dropdown.Item
                      key={n._id}
                      className="py-2 border-bottom text-wrap"
                      onClick={() => {
                        setSelectedNotice(n);
                        setShowNoticeModal(true);
                      }}
                    >
                      <div className="d-flex align-items-start gap-2">
                        <FaInfoCircle className="text-warning mt-1 flex-shrink-0" />
                        <div>
                          <strong className="d-block text-dark small">{n.title}</strong>
                          <span className="text-muted" style={{ fontSize: "12px" }}>
                            {n.content?.substring(0, 60)}...
                          </span>
                        </div>
                      </div>
                    </Dropdown.Item>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>

            {/* User Profile dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                className="d-flex align-items-center gap-2 border rounded-pill px-3 py-1 bg-white"
              >
                <FaUserCircle size={22} className="text-warning" />
                <div className="text-start d-none d-md-block">
                  <div className="fw-bold small text-dark">{user?.name || "Người dùng"}</div>
                </div>
                <Badge bg={roleBadgeColor} pill className="ms-1">
                  {user?.role || "Student"}
                </Badge>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Header>
                  <div className="fw-bold">{user?.name}</div>
                  <div className="text-muted small">{user?.email}</div>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger d-flex align-items-center gap-2">
                  <FaSignOutAlt /> Đăng Xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
      </Container>
    </Navbar>

    {/* Notice Detail Modal */}
    <Modal show={showNoticeModal} onHide={() => setShowNoticeModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fs-6 fw-bold">{selectedNotice?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-secondary">{selectedNotice?.content}</p>
        <div className="text-muted small">
          Đối tượng: <strong>{selectedNotice?.targetRole || "All"}</strong>
        </div>
      </Modal.Body>
      <Modal.Footer>
        {(selectedNotice?.title?.includes("Đề thi") ||
          selectedNotice?.title?.includes("Mini Test") ||
          selectedNotice?.title?.includes("Bài thi")) && (
          <Button
            variant="warning"
            size="sm"
            className="fw-bold text-dark rounded-pill px-3 shadow-sm"
            onClick={() => {
              setShowNoticeModal(false);
              navigate("/student/quiz");
            }}
          >
            🚀 Vào Phòng Thi Ngay
          </Button>
        )}
        <Button variant="secondary" size="sm" onClick={() => setShowNoticeModal(false)}>
          Đóng
        </Button>
      </Modal.Footer>
      </Modal>
    </>
  );
};

export default Header;
