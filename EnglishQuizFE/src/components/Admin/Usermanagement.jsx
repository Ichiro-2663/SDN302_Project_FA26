import React, { useState, useEffect, useContext } from "react";
import { Table, Button, Badge, Form, Row, Col, Card, InputGroup, Modal } from "react-bootstrap";
import { FaSearch, FaUserShield, FaUserGraduate, FaChalkboardTeacher, FaEdit } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

const UserManagement = () => {
  const { user: currentUser } = useContext(AuthContext);
  const currentUserId = currentUser?._id || localStorage.getItem("id");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Role Modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetRole, setTargetRole] = useState("Student");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Users fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const isSelf = String(user._id) === String(currentUserId);
    if (isSelf) {
      alert("Bạn không thể tự khóa tài khoản của chính mình!");
      return;
    }

    const nextStatus = user.status === "Disabled" ? "Active" : "Disabled";
    const action = nextStatus === "Disabled" ? "vô hiệu hóa" : "kích hoạt lại";

    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản "${user.name}"?`)) {
      try {
        if (nextStatus === "Disabled") {
          await axiosClient.delete(`/users/${user._id}`);
        } else {
          await axiosClient.put(`/users/${user._id}`, { status: "Active" });
        }
        fetchUsers();
      } catch (err) {
        console.error("Toggle status error:", err);
        alert(err.response?.data?.message || "Lỗi cập nhật trạng thái người dùng");
      }
    }
  };

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setTargetRole(user.role || "Student");
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    const isSelf = String(selectedUser._id) === String(currentUserId);
    if (isSelf && targetRole !== "Admin") {
      alert("Bạn không thể tự hạ quyền Admin của chính mình!");
      return;
    }
    try {
      await axiosClient.put(`/users/${selectedUser._id}`, { role: targetRole });
      setShowRoleModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Update role error:", err);
      alert(err.response?.data?.message || "Lỗi cập nhật vai trò người dùng");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "All" && (u.role || "").toUpperCase() !== roleFilter.toUpperCase()) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (u.name || "").toLowerCase().includes(term);
      const matchEmail = (u.email || "").toLowerCase().includes(term);
      if (!matchName && !matchEmail) return false;
    }
    return true;
  });

  const getRoleBadge = (role) => {
    const r = (role || "").toUpperCase();
    if (r === "ADMIN") {
      return (
        <Badge bg="danger" pill className="d-inline-flex align-items-center gap-1">
          <FaUserShield size={10} /> Admin
        </Badge>
      );
    }
    if (r === "TEACHER") {
      return (
        <Badge bg="primary" pill className="d-inline-flex align-items-center gap-1">
          <FaChalkboardTeacher size={10} /> Teacher
        </Badge>
      );
    }
    return (
      <Badge bg="success" pill className="d-inline-flex align-items-center gap-1">
        <FaUserGraduate size={10} /> Student
      </Badge>
    );
  };

  return (
    <div className="w-100">
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Quản Lý Người Dùng & Phân Quyền</h4>
        <p className="text-muted small mb-0">
          Danh sách toàn bộ tài khoản, cập nhật vai trò truy cập và kiểm soát trạng thái hoạt động
        </p>
      </div>

      {/* Filter toolbar */}
      <Card className="border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <Row className="g-2 align-items-center">
          <Col md={4}>
            <InputGroup size="sm">
              <InputGroup.Text className="bg-light border-end-0">
                <FaSearch className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Tìm tên hoặc email..."
                className="border-start-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>

          <Col md={3}>
            <Form.Select
              size="sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">Tất cả vai trò</option>
              <option value="Student">Học viên (Student)</option>
              <option value="Teacher">Giáo viên (Teacher)</option>
              <option value="Admin">Quản trị (Admin)</option>
            </Form.Select>
          </Col>

          <Col md={5} className="text-md-end">
            <span className="small text-muted">
              Hiển thị: <strong>{filteredUsers.length}</strong> / {users.length} tài khoản
            </span>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status" />
            <p className="mt-2 text-muted">Đang tải danh sách người dùng...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-5 text-muted small">
            Không tìm thấy người dùng nào phù hợp.
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr className="text-muted small">
                  <th style={{ width: "40px" }}>#</th>
                  <th>Họ Và Tên</th>
                  <th>Email</th>
                  <th>Vai Trò</th>
                  <th>Trường Học</th>
                  <th>Trạng Thái</th>
                  <th>Ngày Đăng Ký</th>
                  <th className="text-end" style={{ width: "160px" }}>
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => {
                  const isDisabled = u.status === "Disabled";
                  const isSelf = String(u._id) === String(currentUserId);
                  return (
                    <tr key={u._id} className={isSelf ? "table-light" : ""}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td className="fw-bold text-dark">
                        {u.name}
                        {isSelf && (
                          <Badge bg="primary" pill className="ms-2 small px-2">
                            Bạn
                          </Badge>
                        )}
                      </td>
                      <td className="small text-muted">{u.email}</td>
                      <td>{getRoleBadge(u.role)}</td>
                      <td className="small text-secondary">{u.school || "-"}</td>
                      <td>
                        <Badge bg={isDisabled ? "danger" : "success"} pill>
                          {isDisabled ? "Disabled" : "Active"}
                        </Badge>
                      </td>
                      <td className="small text-muted">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="rounded-pill px-2 py-1 small"
                            disabled={isSelf}
                            onClick={() => handleOpenRoleModal(u)}
                            title={isSelf ? "Bạn không thể tự đổi vai trò của chính mình" : "Phân quyền vai trò"}
                          >
                            <FaEdit size={11} className="me-1" /> Vai trò
                          </Button>

                          <Button
                            size="sm"
                            variant={isSelf ? "light" : isDisabled ? "success" : "outline-danger"}
                            className="rounded-pill px-2 py-1 small"
                            disabled={isSelf}
                            onClick={() => handleToggleStatus(u)}
                            title={
                              isSelf
                                ? "Không thể tự khóa tài khoản của chính mình"
                                : isDisabled
                                ? "Mở khóa tài khoản"
                                : "Khóa tài khoản"
                            }
                          >
                            {isSelf ? "Chính bạn" : isDisabled ? "Mở khóa" : "Khóa"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* Role Change Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">
            Thay Đổi Phân Quyền &bull; {selectedUser?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">
            Chọn vai trò mới cho tài khoản <strong>{selectedUser?.email}</strong>:
          </p>
          <Form.Group>
            <Form.Select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            >
              <option value="Student">Học viên (Student)</option>
              <option value="Teacher">Giáo viên (Teacher)</option>
              <option value="Admin">Quản trị viên (Admin)</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowRoleModal(false)}>
            Hủy
          </Button>
          <Button variant="warning" size="sm" className="fw-bold text-dark" onClick={handleSaveRole}>
            Lưu Quyền Hạn
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
