import React, { useState, useContext } from "react";
import { Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { FaUserCircle, FaSave, FaKey, FaShieldAlt } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const userId = user?._id || localStorage.getItem("id");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    school: user?.school || "",
    age: user?.age || "",
    address: user?.address || "",
    targetCertificate: user?.studentProfile?.targetCertificate || "TOEIC",
    targetScore: user?.studentProfile?.targetScore || "800",
  });

  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePassChange = (e) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    setSavingProfile(true);

    try {
      const payload = {
        name: formData.name,
        school: formData.school,
        age: formData.age ? Number(formData.age) : undefined,
        address: formData.address,
        studentProfile: {
          targetCertificate: formData.targetCertificate,
          targetScore: formData.targetScore,
        },
      };

      const res = await axiosClient.put(`/users/${userId}`, payload);
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setProfileMsg({ type: "success", text: "Cập nhật hồ sơ thành công!" });
    } catch (err) {
      setProfileMsg({
        type: "danger",
        text: err.response?.data?.message || err.message || "Cập nhật hồ sơ thất bại",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ type: "", text: "" });

    if (passData.newPassword !== passData.confirmPassword) {
      setPassMsg({ type: "danger", text: "Mật khẩu mới và xác nhận mật khẩu không khớp!" });
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassMsg({ type: "danger", text: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
      return;
    }

    setSavingPass(true);

    try {
      await axiosClient.put(`/users/change-password/${userId}`, {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });

      setPassMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPassMsg({
        type: "danger",
        text: err.response?.data?.message || err.message || "Đổi mật khẩu thất bại",
      });
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="w-100">
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Hồ Sơ Cá Nhân & Bảo Mật</h4>
        <p className="text-muted small mb-0">
          Cập nhật thông tin tài khoản và thiết lập mục tiêu chứng chỉ học tập
        </p>
      </div>

      <Row className="g-4">
        {/* Profile Info Form */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaUserCircle className="text-warning" /> Thông Tin Cá Nhân
            </h5>

            {profileMsg.text && (
              <Alert variant={profileMsg.type} className="py-2 small">
                {profileMsg.text}
              </Alert>
            )}

            <Form onSubmit={handleUpdateProfile}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Họ và tên</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Email (Không đổi)</Form.Label>
                    <Form.Control type="email" value={formData.email} disabled className="bg-light" />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Trường học / Đơn vị</Form.Label>
                    <Form.Control
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleProfileChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Tuổi</Form.Label>
                    <Form.Control
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleProfileChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Địa chỉ</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleProfileChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Chứng chỉ mục tiêu</Form.Label>
                    <Form.Select
                      name="targetCertificate"
                      value={formData.targetCertificate}
                      onChange={handleProfileChange}
                    >
                      <option value="TOEIC">TOEIC</option>
                      <option value="IELTS">IELTS</option>
                      <option value="TOEFL">TOEFL</option>
                      <option value="CEFR">CEFR (B1-C2)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-muted">Điểm số mục tiêu</Form.Label>
                    <Form.Control
                      type="text"
                      name="targetScore"
                      placeholder="Ví dụ: 850 hoặc 7.5"
                      value={formData.targetScore}
                      onChange={handleProfileChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                variant="warning"
                type="submit"
                className="fw-bold px-4 py-2 rounded-pill text-dark shadow-sm d-flex align-items-center gap-2"
                disabled={savingProfile}
              >
                <FaSave /> {savingProfile ? "Đang lưu..." : "Lưu Thay Đổi"}
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Change Password Form */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaKey className="text-warning" /> Đổi Mật Khẩu
            </h5>

            {passMsg.text && (
              <Alert variant={passMsg.type} className="py-2 small">
                {passMsg.text}
              </Alert>
            )}

            <Form onSubmit={handleChangePassword}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-muted">Mật khẩu hiện tại</Form.Label>
                <Form.Control
                  type="password"
                  name="currentPassword"
                  placeholder="••••••••"
                  value={passData.currentPassword}
                  onChange={handlePassChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-muted">Mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  placeholder="Ít nhất 6 ký tự"
                  value={passData.newPassword}
                  onChange={handlePassChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-semibold text-muted">Xác nhận mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu mới"
                  value={passData.confirmPassword}
                  onChange={handlePassChange}
                  required
                />
              </Form.Group>

              <Button
                variant="outline-dark"
                type="submit"
                className="w-100 fw-bold py-2 rounded-pill d-flex align-items-center justify-content-center gap-2"
                disabled={savingPass}
              >
                <FaShieldAlt /> {savingPass ? "Đang xử lý..." : "Cập Nhật Mật Khẩu"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
