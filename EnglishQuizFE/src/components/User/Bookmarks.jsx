import React, { useState, useEffect, useContext, useCallback } from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { FaBookmark, FaTrash, FaVolumeUp, FaLightbulb, FaCheck } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

const Bookmarks = () => {
  const { user } = useContext(AuthContext);
  const userId = user?._id || localStorage.getItem("id");

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axiosClient.get(`/bookmarks/user/${userId}`);
      setBookmarks(res.data || []);
    } catch (err) {
      console.error("Bookmarks fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/bookmarks/${id}`);
      setBookmarks(bookmarks.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Delete bookmark error:", err);
    }
  };

  const handleTTS = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="w-100">
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Sổ Tay Đánh Dấu (Bookmarks)</h4>
        <p className="text-muted small mb-0">
          Tập hợp các câu hỏi quan trọng hoặc hay sai bạn đã lưu lại để ôn tập
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
          <p className="mt-2 text-muted">Đang tải sổ tay...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 text-center p-5 bg-white">
          <FaBookmark size={40} className="text-muted mx-auto mb-3" />
          <h5 className="fw-bold text-dark">Sổ tay hiện đang trống</h5>
          <p className="text-muted small">
            Trong quá trình làm bài thi hoặc luyện tập, hãy bấm nút "Lưu câu hỏi" để xem lại tại đây!
          </p>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-3">
          {bookmarks.map((bm, idx) => {
            const q = bm.itemId;
            if (!q) return null;

            return (
              <Card key={bm._id} className="border-0 shadow-sm rounded-4 p-4 bg-white">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center bg-light text-dark fw-bold"
                      style={{ width: "28px", height: "28px", fontSize: "12px" }}
                    >
                      {idx + 1}
                    </span>
                    <Badge bg="warning" text="dark" pill>
                      {q.level || "B1"}
                    </Badge>
                    <Badge bg="secondary" pill>
                      {q.questionType}
                    </Badge>
                    {q.topic?.name && (
                      <span className="badge bg-light text-muted border">{q.topic.name}</span>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="rounded-circle p-2"
                      title="Phát âm"
                      onClick={() => handleTTS(q.content)}
                    >
                      <FaVolumeUp />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="rounded-circle p-2"
                      title="Bỏ lưu câu này"
                      onClick={() => handleDelete(bm._id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>

                <h6 className="fw-bold text-dark my-2 lh-base">{q.content}</h6>

                {/* Options if MultipleChoice */}
                {q.questionType === "MultipleChoice" && q.options && (
                  <div className="d-flex flex-column gap-1 my-2">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = String(oIdx) === String(q.correctAnswer);
                      return (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-2 small d-flex align-items-center gap-2 ${
                            isCorrect ? "bg-success bg-opacity-10 text-success fw-bold" : "bg-light text-dark"
                          }`}
                        >
                          <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                          {isCorrect && <FaCheck size={12} />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Direct answer if other type */}
                {q.questionType !== "MultipleChoice" && (
                  <div className="bg-light p-2 rounded-2 small text-success fw-bold my-2">
                    Đáp án đúng: {String(q.correctAnswer)}
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div
                    className="p-3 rounded-3 small mt-2"
                    style={{ background: "#fffbeb", borderLeft: "4px solid #f59e0b" }}
                  >
                    <div className="d-flex align-items-center gap-2 fw-bold text-dark mb-1">
                      <FaLightbulb color="#ea580c" /> Giải Thích:
                    </div>
                    <div className="text-secondary">{q.explanation}</div>
                  </div>
                )}

                {bm.notes && (
                  <div className="text-muted small mt-2 fst-italic">
                    Ghi chú: {bm.notes} &bull; Lưu ngày {new Date(bm.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
