import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Card } from "react-bootstrap";
import { FaFolder, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axiosClient from "../../api/axiosClient";

const TopicManagement = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/topics");
      setTopics(res.data || []);
    } catch (err) {
      console.error("Topics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleShow = (t = null) => {
    if (t) {
      setEditingId(t._id);
      setFormData({
        name: t.name || "",
        description: t.description || "",
        image: t.image || "",
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", description: "", image: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingId) {
        await axiosClient.put(`/topics/${editingId}`, formData);
      } else {
        await axiosClient.post("/topics", formData);
      }
      setShowModal(false);
      fetchTopics();
    } catch (err) {
      console.error("Save topic error:", err);
      alert("Lỗi lưu chủ đề: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chủ đề này?")) return;
    try {
      await axiosClient.delete(`/topics/${id}`);
      fetchTopics();
    } catch (err) {
      console.error("Delete topic error:", err);
    }
  };

  return (
    <div className="w-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Quản Lý Chủ Đề (Topic Management)</h4>
          <p className="text-muted small mb-0">
            Danh mục các chủ đề bài học, từ vựng và câu hỏi trong hệ thống
          </p>
        </div>

        <Button
          variant="warning"
          size="sm"
          className="rounded-pill fw-bold text-dark d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
          onClick={() => handleShow(null)}
        >
          <FaPlus /> Thêm Chủ Đề Mới
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status" />
            <p className="mt-2 text-muted">Đang tải danh sách chủ đề...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-5 text-muted small">Chưa có chủ đề nào được tạo.</div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr className="text-muted small">
                  <th style={{ width: "40px" }}>#</th>
                  <th>Tên Chủ Đề</th>
                  <th>Mô Tả</th>
                  <th className="text-end" style={{ width: "120px" }}>
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {topics.map((t, idx) => (
                  <tr key={t._id}>
                    <td className="text-muted small">{idx + 1}</td>
                    <td className="fw-bold text-dark d-flex align-items-center gap-2">
                      <FaFolder className="text-warning" />
                      <span>{t.name}</span>
                    </td>
                    <td className="small text-muted">{t.description || "Chưa có mô tả"}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="rounded-circle p-2"
                          title="Sửa chủ đề"
                          onClick={() => handleShow(t)}
                        >
                          <FaEdit size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="rounded-circle p-2"
                          title="Xóa chủ đề"
                          onClick={() => handleDelete(t._id)}
                        >
                          <FaTrash size={12} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* Modal Add / Edit Topic */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">
            {editingId ? "Chỉnh Sửa Chủ Đề" : "Thêm Chủ Đề Mới"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label className="small fw-semibold text-muted">Tên chủ đề</Form.Label>
              <Form.Control
                placeholder="Ví dụ: Daily Life, Business, Technology..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="small fw-semibold text-muted">Mô tả chủ đề</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Mô tả tóm tắt nội dung chủ đề..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="warning" size="sm" type="submit" className="fw-bold text-dark">
              {editingId ? "Cập Nhật" : "Tạo Mới"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default TopicManagement;
