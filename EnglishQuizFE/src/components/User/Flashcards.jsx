import React, { useState, useEffect, useContext, useCallback } from "react";
import { Card, Button, Badge, Modal, Form, ProgressBar } from "react-bootstrap";
import {
  FaLayerGroup,
  FaVolumeUp,
  FaCheck,
  FaTimes,
  FaPlus,
  FaTrash,
  FaSyncAlt,
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

const BOX_SCHEDULE = {
  1: { name: "Hộp 1", interval: "Hàng ngày", delay: "1 ngày", color: "#ef4444" },
  2: { name: "Hộp 2", interval: "Mỗi 3 ngày", delay: "3 ngày", color: "#f97316" },
  3: { name: "Hộp 3", interval: "Hàng tuần", delay: "7 ngày", color: "#eab308" },
  4: { name: "Hộp 4", interval: "Mỗi 2 tuần", delay: "14 ngày", color: "#3b82f6" },
  5: { name: "Hộp 5", interval: "Thuần thục", delay: "30 ngày", color: "#10b981" },
};

const Flashcards = () => {
  const { user } = useContext(AuthContext);
  const userId = user?._id || localStorage.getItem("id");

  const [cards, setCards] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedBox, setSelectedBox] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal create
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCard, setNewCard] = useState({
    word: "",
    definition: "",
    example: "",
    pronunciation: "",
    topic: "",
  });

  const fetchFlashcards = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [cardsRes, topicsRes] = await Promise.allSettled([
        axiosClient.get(`/flashcards/user/${userId}`),
        axiosClient.get("/topics"),
      ]);
      if (cardsRes.status === "fulfilled") setCards(cardsRes.value.data || []);
      if (topicsRes.status === "fulfilled") setTopics(topicsRes.value.data || []);
      setCurrentIdx(0);
      setIsFlipped(false);
    } catch (err) {
      console.error("Flashcards fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Filter cards
  const filteredCards = cards.filter((c) => {
    if (selectedBox !== "all" && Number(c.box) !== Number(selectedBox)) return false;
    if (selectedTopic && c.topic?._id !== selectedTopic) return false;
    return true;
  });

  const currentCard = filteredCards[currentIdx];

  const handleTTS = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Review flashcard (Leitner)
  const handleReview = async (isCorrect) => {
    if (!currentCard) return;
    try {
      const res = await axiosClient.post(`/flashcards/${currentCard._id}/review`, { isCorrect });
      // Update card in state
      const updatedCards = cards.map((c) => (c._id === currentCard._id ? res.data : c));
      setCards(updatedCards);

      // Advance
      setIsFlipped(false);
      if (currentIdx < filteredCards.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        setCurrentIdx(0);
      }
    } catch (err) {
      console.error("Review flashcard error:", err);
    }
  };

  // Create new flashcard
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCard.word || !newCard.definition) return;
    try {
      await axiosClient.post("/flashcards", {
        ...newCard,
        userId,
        box: 1,
      });
      setShowCreateModal(false);
      setNewCard({ word: "", definition: "", example: "", pronunciation: "", topic: "" });
      fetchFlashcards();
    } catch (err) {
      console.error("Create flashcard error:", err);
    }
  };

  // Delete flashcard
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thẻ từ vựng này?")) return;
    try {
      await axiosClient.delete(`/flashcards/${id}`);
      setCards(cards.filter((c) => c._id !== id));
      if (currentIdx >= filteredCards.length - 1) {
        setCurrentIdx(Math.max(0, filteredCards.length - 2));
      }
    } catch (err) {
      console.error("Delete flashcard error:", err);
    }
  };

  // Leitner box counts
  const boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  cards.forEach((c) => {
    const b = c.box || 1;
    if (boxCounts[b] !== undefined) boxCounts[b]++;
  });

  return (
    <div className="w-100">
      {/* Header and Add button */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Flashcards Ôn Tập Leitner</h4>
          <p className="text-muted small mb-0">
            Hệ thống ghi nhớ lặp lại ngắt quãng khoa học qua 5 hộp thời gian
          </p>
        </div>

        <Button
          variant="warning"
          size="sm"
          className="rounded-pill fw-bold text-dark d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> Thêm Từ Vựng Mới
        </Button>
      </div>

      {/* Leitner Box Progress Bar Selector */}
      <Card className="border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <Button
            size="sm"
            variant={selectedBox === "all" ? "dark" : "outline-secondary"}
            className="rounded-pill fw-bold px-3"
            onClick={() => {
              setSelectedBox("all");
              setCurrentIdx(0);
              setIsFlipped(false);
            }}
          >
            Tất cả ({cards.length})
          </Button>

          {[1, 2, 3, 4, 5].map((boxNum) => {
            const isSelected = selectedBox === String(boxNum);
            const info = BOX_SCHEDULE[boxNum];
            return (
              <Button
                key={boxNum}
                size="sm"
                variant={isSelected ? "warning" : "light"}
                className={`rounded-pill fw-bold px-3 d-flex align-items-center gap-2 border ${
                  isSelected ? "text-dark" : "text-muted"
                }`}
                onClick={() => {
                  setSelectedBox(String(boxNum));
                  setCurrentIdx(0);
                  setIsFlipped(false);
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: info.color,
                  }}
                />
                <span>{info.name}</span>
                <Badge bg="secondary" pill style={{ fontSize: "11px" }}>
                  {boxCounts[boxNum]}
                </Badge>
              </Button>
            );
          })}

          <Form.Select
            size="sm"
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              setCurrentIdx(0);
            }}
            style={{ width: "160px" }}
          >
            <option value="">Tất cả chủ đề</option>
            {topics.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </Form.Select>
        </div>
      </Card>

      {/* Active Card Interactive Stage */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
          <p className="mt-2 text-muted">Đang tải thẻ ghi nhớ...</p>
        </div>
      ) : filteredCards.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 text-center p-5 bg-white">
          <FaLayerGroup size={40} className="text-muted mx-auto mb-3" />
          <h5 className="fw-bold text-dark">Chưa có thẻ từ vựng trong danh mục này</h5>
          <p className="text-muted small">Hãy bấm nút "Thêm Từ Vựng Mới" để tạo thẻ học đầu tiên của bạn!</p>
        </Card>
      ) : (
        <div className="mx-auto" style={{ maxWidth: "650px" }}>
          {/* Progress */}
          <div className="d-flex justify-content-between align-items-center mb-2 px-1">
            <span className="fw-bold text-dark small">
              Thẻ {currentIdx + 1} / {filteredCards.length}
            </span>
            <div className="d-flex align-items-center gap-2">
              <Badge
                pill
                style={{
                  background: BOX_SCHEDULE[currentCard.box || 1]?.color,
                  color: "#ffffff",
                }}
              >
                Hộp {currentCard.box || 1} &bull; {BOX_SCHEDULE[currentCard.box || 1]?.interval}
              </Badge>
              <Button
                size="sm"
                variant="light"
                className="text-danger p-1 rounded-circle"
                title="Xóa thẻ này"
                onClick={() => handleDelete(currentCard._id)}
              >
                <FaTrash size={12} />
              </Button>
            </div>
          </div>

          <ProgressBar
            now={((currentIdx + 1) / filteredCards.length) * 100}
            variant="warning"
            style={{ height: "4px" }}
            className="rounded-pill mb-4"
          />

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              minHeight: "320px",
              cursor: "pointer",
              perspective: "1000px",
            }}
          >
            <Card
              className="border-0 shadow-sm rounded-4 p-5 text-center d-flex flex-column justify-content-between h-100"
              style={{
                borderRadius: "24px",
                background: isFlipped ? "#fffbeb" : "#ffffff",
                border: isFlipped ? "2px dashed #f59e0b" : "1px solid #e2e8f0",
                transition: "all 0.3s ease",
                minHeight: "320px",
              }}
            >
              {!isFlipped ? (
                /* FRONT VIEW */
                <div className="my-auto">
                  <span className="badge bg-light text-muted border rounded-pill mb-3 px-3 py-1">
                    Mặt trước &bull; Nhấp để lật thẻ
                  </span>
                  <h2 className="fw-bold text-dark mb-2">{currentCard.word}</h2>
                  {currentCard.pronunciation && (
                    <p className="text-muted fst-italic fs-6 mb-3">{currentCard.pronunciation}</p>
                  )}
                  <Button
                    size="sm"
                    variant="outline-warning"
                    className="rounded-circle p-2 text-dark mx-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTTS(currentCard.word);
                    }}
                    title="Phát âm"
                  >
                    <FaVolumeUp size={16} />
                  </Button>
                </div>
              ) : (
                /* BACK VIEW */
                <div className="my-auto">
                  <span className="badge bg-warning text-dark rounded-pill mb-3 px-3 py-1">
                    Định nghĩa & Ví dụ
                  </span>
                  <h4 className="fw-bold text-dark mb-3 lh-base">{currentCard.definition}</h4>
                  {currentCard.example && (
                    <div className="bg-white p-3 rounded-3 shadow-sm border text-secondary small text-start mb-2">
                      <div className="fw-bold text-dark mb-1">Ví dụ:</div>
                      <div>"{currentCard.example}"</div>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="link"
                    className="text-warning text-decoration-none small mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTTS(currentCard.example || currentCard.definition);
                    }}
                  >
                    <FaVolumeUp /> Nghe đọc câu ví dụ
                  </Button>
                </div>
              )}

              <div className="text-muted small mt-3">
                <FaSyncAlt size={12} className="me-1" /> Bấm vào thẻ để lật xem mặt sau
              </div>
            </Card>
          </div>

          {/* Leitner Evaluation Buttons */}
          <div className="d-flex gap-3 mt-4">
            <Button
              variant="outline-danger"
              className="flex-grow-1 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
              onClick={() => handleReview(false)}
            >
              <FaTimes /> Quên (Về Hộp 1)
            </Button>

            <Button
              variant="success"
              className="flex-grow-1 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
              onClick={() => handleReview(true)}
            >
              <FaCheck /> Nhớ Tốt (+1 Hộp)
            </Button>
          </div>
        </div>
      )}

      {/* Modal Add Flashcard */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">Thêm Thẻ Từ Vựng Mới</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label className="small fw-bold text-muted">Từ vựng (Word / Phrase)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ví dụ: Accomplish"
                value={newCard.word}
                onChange={(e) => setNewCard({ ...newCard, word: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="small fw-bold text-muted">Phiên âm IPA</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ví dụ: /əˈkʌm.plɪʃ/"
                value={newCard.pronunciation}
                onChange={(e) => setNewCard({ ...newCard, pronunciation: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="small fw-bold text-muted">Định nghĩa / Ý nghĩa tiếng Việt</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ví dụ: Hoàn thành, đạt được một mục tiêu"
                value={newCard.definition}
                onChange={(e) => setNewCard({ ...newCard, definition: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="small fw-bold text-muted">Câu ví dụ thực tế</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Ví dụ: She accomplished such great results through dedication."
                value={newCard.example}
                onChange={(e) => setNewCard({ ...newCard, example: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="small fw-bold text-muted">Chủ đề (Topic)</Form.Label>
              <Form.Select
                value={newCard.topic}
                onChange={(e) => setNewCard({ ...newCard, topic: e.target.value })}
              >
                <option value="">-- Chọn chủ đề --</option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button variant="warning" size="sm" type="submit" className="fw-bold text-dark">
              Tạo Thẻ Flashcard
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Flashcards;
