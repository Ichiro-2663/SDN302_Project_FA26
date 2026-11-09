import React, { useState, useEffect } from "react";
import { Table, Card, Badge, Button, Form } from "react-bootstrap";
import { FaTrash, FaCheck } from "react-icons/fa";
import axiosClient from "../../api/axiosClient";

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/feedbacks");
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error("Feedbacks fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosClient.put(`/feedbacks/${id}`, { status });
      fetchFeedbacks();
    } catch (err) {
      console.error("Update feedback error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa góp ý này?")) return;
    try {
      await axiosClient.delete(`/feedbacks/${id}`);
      fetchFeedbacks();
    } catch (err) {
      console.error("Delete feedback error:", err);
    }
  };

  const filtered = feedbacks.filter((f) => {
    if (statusFilter !== "All" && f.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (st) => {
    switch (st) {
      case "Resolved":
        return <Badge bg="success" pill>Resolved (Đã xử lý)</Badge>;
      case "Reviewed":
        return <Badge bg="info" pill>Reviewed (Đã xem)</Badge>;
      case "Pending":
      default:
        return <Badge bg="warning" text="dark" pill>Pending (Chờ duyệt)</Badge>;
    }
  };

  return (
    <div className="w-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Hòm Thư Đóng Góp Ý Kiến (Feedback Center)</h4>
          <p className="text-muted small mb-0">
            Xem và xử lý các phản ánh, góp ý từ phía học viên và người dùng
          </p>
        </div>

        <Form.Select
          size="sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: "180px" }}
        >
          <option value="All">Tất cả trạng thái</option>
          <option value="Pending">Chờ duyệt (Pending)</option>
          <option value="Reviewed">Đã xem (Reviewed)</option>
          <option value="Resolved">Đã xử lý (Resolved)</option>
        </Form.Select>
      </div>

      <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status" />
            <p className="mt-2 text-muted">Đang tải danh sách góp ý...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted small">
            Không có góp ý nào trong danh mục này.
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr className="text-muted small">
                  <th style={{ width: "40px" }}>#</th>
                  <th>Học Viên</th>
                  <th>Tiêu Đề & Phân Loại</th>
                  <th>Nội Dung</th>
                  <th>Đánh Giá</th>
                  <th>Trạng Thái</th>
                  <th>Thời Gian</th>
                  <th className="text-end" style={{ width: "140px" }}>
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, idx) => (
                  <tr key={f._id}>
                    <td className="text-muted small">{idx + 1}</td>
                    <td>
                      <strong className="d-block text-dark small">{f.userName || "Học viên"}</strong>
                      <span className="text-muted" style={{ fontSize: "11px" }}>
                        {f.userEmail}
                      </span>
                    </td>
                    <td>
                      <strong className="d-block text-dark small">{f.title}</strong>
                      <Badge bg="light" text="dark" className="border" style={{ fontSize: "10px" }}>
                        {f.category}
                      </Badge>
                    </td>
                    <td className="small text-secondary" style={{ maxWidth: "260px" }}>
                      {f.content}
                    </td>
                    <td className="text-warning small">{f.rating || 5} ⭐</td>
                    <td>{getStatusBadge(f.status)}</td>
                    <td className="small text-muted">
                      {new Date(f.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {f.status !== "Resolved" && (
                          <Button
                            size="sm"
                            variant="outline-success"
                            className="rounded-circle p-2"
                            title="Đánh dấu đã giải quyết"
                            onClick={() => handleUpdateStatus(f._id, "Resolved")}
                          >
                            <FaCheck size={11} />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="rounded-circle p-2"
                          title="Xóa góp ý"
                          onClick={() => handleDelete(f._id)}
                        >
                          <FaTrash size={11} />
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
    </div>
  );
};

export default FeedbackManagement;
