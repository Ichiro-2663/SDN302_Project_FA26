import React, { useState, useEffect, useContext, useCallback } from "react";
import { Card, Table, Badge, Button, Modal } from "react-bootstrap";
import { FaHistory, FaEye, FaTrash } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

const History = () => {
  const { user } = useContext(AuthContext);
  const userId = user?._id || localStorage.getItem("id");

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axiosClient.get(`/history/${userId}`);
      setHistoryList(res.data || []);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lượt thi này khỏi lịch sử?")) return;
    try {
      await axiosClient.delete(`/history/${id}`);
      setHistoryList(historyList.filter((h) => h._id !== id));
    } catch (err) {
      console.error("Delete history error:", err);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  return (
    <div className="w-100">
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Lịch Sử Làm Bài Kiểm Tra</h4>
        <p className="text-muted small mb-0">
          Theo dõi toàn bộ kết quả, điểm số và chi tiết các lượt thi bạn đã thực hiện
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
          <p className="mt-2 text-muted">Đang tải lịch sử làm bài...</p>
        </div>
      ) : historyList.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 text-center p-5 bg-white">
          <FaHistory size={40} className="text-muted mx-auto mb-3" />
          <h5 className="fw-bold text-dark">Chưa có lịch sử làm bài</h5>
          <p className="text-muted small">
            Bạn chưa hoàn thành bài thi nào. Hãy làm một bài kiểm tra để theo dõi tiến độ học tập nhé!
          </p>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr className="text-muted small">
                  <th>#</th>
                  <th>Tên Đề Thi</th>
                  <th>Phân Loại</th>
                  <th>Thời Điểm Làm</th>
                  <th>Điểm Số</th>
                  <th>Tỷ Lệ</th>
                  <th>Kết Quả</th>
                  <th className="text-end">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((h, idx) => {
                  const percent = h.total > 0 ? Math.round((h.score / h.total) * 100) : 0;
                  const isPassed = h.status === "PASSED";

                  return (
                    <tr key={h._id}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td className="fw-bold text-dark">
                        {h.examId?.title || "Bài thi tự do"}
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="border">
                          {h.examId?.type || "quiz"}
                        </Badge>
                      </td>
                      <td className="text-muted small">
                        {new Date(h.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="fw-bold text-dark">
                        {h.score} / {h.total}
                      </td>
                      <td className="fw-bold">{percent}%</td>
                      <td>
                        <Badge bg={isPassed ? "success" : "danger"} pill>
                          {isPassed ? "ĐẠT (PASSED)" : "CHƯA ĐẠT"}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                            onClick={() => handleViewDetail(h)}
                          >
                            <FaEye size={12} /> Chi Tiết
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="rounded-circle p-2"
                            title="Xóa lượt thi"
                            onClick={() => handleDelete(h._id)}
                          >
                            <FaTrash size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">
            Chi Tiết Lượt Thi &bull; {selectedRecord?.examId?.title || "Bài Kiểm Tra"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <div>
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 mb-3">
                <div>
                  <span className="text-muted small d-block">Kết quả đạt được:</span>
                  <strong className="fs-5 text-dark">
                    {selectedRecord.score} / {selectedRecord.total} (
                    {selectedRecord.total > 0
                      ? Math.round((selectedRecord.score / selectedRecord.total) * 100)
                      : 0}
                    %)
                  </strong>
                </div>
                <Badge
                  bg={selectedRecord.status === "PASSED" ? "success" : "danger"}
                  pill
                  className="fs-6 px-3 py-2"
                >
                  {selectedRecord.status}
                </Badge>
              </div>

              <h6 className="fw-bold text-dark mb-2">Đáp án ghi nhận trong hệ thống:</h6>
              <div className="d-flex flex-column gap-2" style={{ maxHeight: "350px", overflowY: "auto" }}>
                {(selectedRecord.answers || []).map((ans, aIdx) => (
                  <div key={aIdx} className="p-2 border rounded-2 small bg-white d-flex justify-content-between align-items-center">
                    <span className="text-muted">Câu {aIdx + 1}</span>
                    <strong className="text-dark">
                      Đáp án chọn: {ans.selectedAnswer || "(Trống)"}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default History;
