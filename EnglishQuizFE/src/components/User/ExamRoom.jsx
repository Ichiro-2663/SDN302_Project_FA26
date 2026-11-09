import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Modal, Form } from "react-bootstrap";
import {
  Clock,
  CheckCircle2,
  Bookmark,
  Flag,
  Volume2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import "./ExamRoom.css";

const ExamRoom = ({
  exam,
  questions = [],
  currentIdx = 0,
  onSelectIndex,
  userAnswers = {},
  onSelectAnswer,
  flaggedQuestions = {},
  onToggleFlag,
  bookmarkedList = {},
  onToggleBookmark,
  timeLeft = 0,
  onSubmitExam,
  isSubmitting = false,
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const totalQuestions = questions.length;
  const currentQ = questions[currentIdx] || null;
  const answeredCount = Object.keys(userAnswers).filter(
    (k) => userAnswers[k] !== undefined && userAnswers[k] !== "" && userAnswers[k] !== null
  ).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const isUrgent = timeLeft > 0 && timeLeft <= 120; // less than 2 minutes
  const isWarning = timeLeft > 120 && timeLeft <= 300; // less than 5 minutes

  // Helper safely returning string for category/skill/topic
  const getCategoryLabel = (q) => {
    if (!q) return "Grammar";
    if (q.skill) {
      if (typeof q.skill === "object" && q.skill.name) return q.skill.name;
      if (typeof q.skill === "string") return q.skill;
    }
    if (q.topic) {
      if (typeof q.topic === "object" && q.topic.name) return q.topic.name;
      if (typeof q.topic === "string") return q.topic;
    }
    return "Grammar";
  };

  // Format time MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Text-to-speech speaker
  const handleTTS = (text) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Keyboard navigation & option selection shortcuts
  const handleKeyDown = useCallback(
    (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      // Left / Right arrows
      if (e.key === "ArrowLeft" && currentIdx > 0) {
        onSelectIndex(currentIdx - 1);
      } else if (e.key === "ArrowRight" && currentIdx < totalQuestions - 1) {
        onSelectIndex(currentIdx + 1);
      }

      // Keys A, B, C, D to pick option
      if (
        currentQ &&
        (currentQ.questionType === "Multiple Choice" ||
          currentQ.questionType === "MultipleChoice")
      ) {
        const key = e.key.toUpperCase();
        if (["A", "B", "C", "D"].includes(key)) {
          const optIdx = key.charCodeAt(0) - 65;
          if (currentQ.options && currentQ.options[optIdx] !== undefined) {
            onSelectAnswer(currentQ._id, optIdx);
          }
        }
      }
    },
    [currentIdx, totalQuestions, onSelectIndex, currentQ, onSelectAnswer]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!exam) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status" />
        <p className="mt-3 text-muted">Đang tải đề thi...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded-4 p-5 shadow-sm border my-4">
        <h5 className="fw-bold text-dark mb-2">Đề thi này chưa có câu hỏi</h5>
        <p className="text-muted small mb-4">Vui lòng quay lại danh sách hoặc chọn đề thi khác để tiếp tục.</p>
        <button
          type="button"
          className="btn btn-warning rounded-pill px-4 fw-bold shadow-sm"
          onClick={() => {
            if (typeof window !== "undefined") window.location.reload();
          }}
        >
          Quay lại danh sách đề thi
        </button>
      </div>
    );
  }

  const isFlagged = currentQ ? !!flaggedQuestions[currentQ._id] : false;
  const isBookmarked = currentQ ? !!bookmarkedList[currentQ._id] : false;
  const progressPercent = totalQuestions > 0 ? ((currentIdx + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="exam-room-container">
      {/* 1. TOP STICKY EXAM HEADER */}
      <div className="exam-sticky-header p-3 mb-4">
        <Row className="align-items-center g-3">
          {/* Exam Title, Certificate & Duration */}
          <Col xs={12} md={6}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="exam-title text-truncate" title={typeof exam.title === "string" ? exam.title : ""}>
                {typeof exam.title === "object" ? exam.title?.name : String(exam.title || "")}
              </span>
              {exam.level && (
                <span className="exam-level-pill">
                  <Bookmark size={12} /> {typeof exam.level === "object" ? exam.level.name : String(exam.level)}
                </span>
              )}
              {exam.certificate && (
                <span className="exam-cert-pill">
                  {typeof exam.certificate === "object" ? (exam.certificate.name || exam.certificate.title) : String(exam.certificate)}
                </span>
              )}
            </div>
            <div className="exam-subtitle text-muted mt-1">
              {totalQuestions} câu hỏi, {exam.duration || 25} phút
            </div>
          </Col>

          {/* Dynamic Countdown Timer & Submit Button */}
          <Col xs={12} md={6} className="d-flex align-items-center justify-content-md-end gap-3">
            <div
              className={`exam-timer-pill ${
                isUrgent ? "urgent" : isWarning ? "warning" : "normal"
              }`}
            >
              <Clock size={16} />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              type="button"
              className="btn-submit-exam"
              onClick={() => setShowSubmitModal(true)}
              disabled={isSubmitting}
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? "Đang nộp..." : "Nộp bài thi"}</span>
            </button>
          </Col>
        </Row>
      </div>

      {/* 2. MAIN BODY (2 COLUMNS: QUESTION STAGE + QUESTION PALETTE) */}
      <Row className="g-4">
        {/* Left Column (lg=8): Current Question Stage */}
        <Col lg={8}>
          {currentQ && (
            <Card className="exam-question-card bg-white p-4 p-md-5">
              {/* Question Header meta */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="exam-qnum-title">
                    Câu hỏi <span className="fw-bolder text-dark">{currentIdx + 1}</span> / {totalQuestions}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {/* TTS Audio */}
                  <button
                    type="button"
                    className="btn-action-round"
                    title="Phát âm câu hỏi"
                    onClick={() => handleTTS(currentQ.content)}
                  >
                    <Volume2 size={16} className="text-secondary" />
                  </button>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    className={`btn-action-round ${isBookmarked ? "active" : ""}`}
                    title={isBookmarked ? "Đã lưu vào sổ tay" : "Lưu vào sổ tay"}
                    onClick={() => onToggleBookmark(currentQ._id)}
                  >
                    <Bookmark
                      size={16}
                      className={isBookmarked ? "text-amber fill-amber" : "text-muted"}
                    />
                  </button>

                  {/* Flag Button */}
                  <button
                    type="button"
                    className={`btn-flag-toggle ${isFlagged ? "flagged" : ""}`}
                    onClick={() => onToggleFlag(currentQ._id)}
                  >
                    <Flag size={14} className={isFlagged ? "text-amber" : "text-muted"} />
                    <span>{isFlagged ? "Đã cắm cờ" : "Cắm cờ"}</span>
                  </button>
                </div>
              </div>

              {/* Question Sub-Progress Indicator */}
              <div className="question-progress-track mb-3">
                <div
                  className="question-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Topic / Category Badge */}
              <div className="mb-3">
                <span className="exam-category-pill">
                  {getCategoryLabel(currentQ)}
                </span>
              </div>

              {/* Question Content */}
              <h5 className="exam-question-text mb-4">
                {typeof currentQ.content === "object"
                  ? currentQ.content?.text || JSON.stringify(currentQ.content)
                  : String(currentQ.content || "")}
              </h5>

              {/* MULTIPLE CHOICE TYPE */}
              {(currentQ.questionType === "Multiple Choice" ||
                currentQ.questionType === "MultipleChoice") && (
                <div className="exam-options-list mb-4">
                  {(currentQ.options || []).map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isSelected = String(userAnswers[currentQ._id]) === String(optIdx);
                    const optText =
                      typeof opt === "object"
                        ? opt?.text || opt?.content || JSON.stringify(opt)
                        : String(opt || "");

                    return (
                      <div
                        key={optIdx}
                        className={`exam-choice-item ${isSelected ? "selected" : ""}`}
                        onClick={() => onSelectAnswer(currentQ._id, optIdx)}
                      >
                        <span className="choice-letter-badge">{letter}</span>
                        <span className="choice-text">{optText}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* FILL IN THE BLANK TYPE */}
              {currentQ.questionType === "Fill in the Blank" && (
                <div className="mb-4">
                  <p className="text-muted small mb-2">Nhập từ/cụm từ còn thiếu vào ô trống:</p>
                  <Form.Control
                    type="text"
                    placeholder="Gõ đáp án của bạn tại đây..."
                    value={userAnswers[currentQ._id] || ""}
                    onChange={(e) => onSelectAnswer(currentQ._id, e.target.value)}
                    className="py-3 px-3 fs-6 rounded-3 border-2"
                    style={{ borderColor: "#cbd5e1" }}
                  />
                </div>
              )}

              {/* MATCHING TYPE */}
              {currentQ.questionType === "Matching" && (
                <div className="mb-4">
                  <p className="text-muted small mb-2">Ghép cặp thuật ngữ / định nghĩa tương ứng:</p>
                  {(currentQ.matchingPairs || []).map((pair, pIdx) => {
                    let parsedAns = {};
                    try {
                      parsedAns = typeof userAnswers[currentQ._id] === "string"
                        ? JSON.parse(userAnswers[currentQ._id] || "{}")
                        : (userAnswers[currentQ._id] || {});
                    } catch (e) {}

                    return (
                      <Row key={pIdx} className="align-items-center g-2 mb-2">
                        <Col xs={6}>
                          <div className="p-2.5 bg-light rounded-3 fw-semibold text-dark border">
                            {pIdx + 1}. {pair.left}
                          </div>
                        </Col>
                        <Col xs={6}>
                          <Form.Select
                            size="sm"
                            value={parsedAns[pIdx] !== undefined ? parsedAns[pIdx] : ""}
                            onChange={(e) => {
                              const updated = { ...parsedAns, [pIdx]: Number(e.target.value) };
                              onSelectAnswer(currentQ._id, JSON.stringify(updated));
                            }}
                            className="py-2 rounded-3"
                          >
                            <option value="">-- Chọn ghép --</option>
                            {currentQ.matchingPairs.map((p, mIdx) => (
                              <option key={mIdx} value={mIdx}>
                                {String.fromCharCode(65 + mIdx)}. {p.right}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                      </Row>
                    );
                  })}
                </div>
              )}

              {/* Bottom Card Navigation Controls */}
              <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-2">
                <button
                  type="button"
                  className="btn-nav-prev"
                  disabled={currentIdx === 0}
                  onClick={() => onSelectIndex(currentIdx - 1)}
                >
                  <ChevronLeft size={16} />
                  <span>Câu trước</span>
                </button>

                {/* Keyboard Shortcuts Hint in Center */}
                <div className="d-none d-md-flex align-items-center gap-2 text-muted small user-select-none">
                  <span>Phím</span>
                  <span className="kbd-pill">A</span> - <span className="kbd-pill">D</span>
                  <span>để chọn,</span>
                  <span className="kbd-pill">&larr;</span> <span className="kbd-pill">&rarr;</span>
                  <span>để chuyển câu</span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {userAnswers[currentQ._id] !== undefined && (
                    <button
                      type="button"
                      className="btn-clear-choice d-none d-sm-inline-flex"
                      onClick={() => onSelectAnswer(currentQ._id, undefined)}
                      title="Xóa lựa chọn"
                    >
                      <RotateCcw size={14} /> Xóa
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-nav-next"
                    disabled={currentIdx >= totalQuestions - 1}
                    onClick={() => onSelectIndex(currentIdx + 1)}
                  >
                    <span>Câu tiếp theo</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </Card>
          )}
        </Col>

        {/* Right Column (lg=4): Question Palette Navigator */}
        <Col lg={4}>
          <Card className="palette-card bg-white p-4 sticky-top" style={{ top: "100px" }}>
            <h6 className="palette-title fw-bold text-dark mb-3">Danh sách câu hỏi</h6>

            {/* Status Legend */}
            <div className="palette-legend-row d-flex align-items-center gap-3 mb-3 text-muted small pb-2 border-bottom">
              <span className="d-flex align-items-center gap-1.5">
                <span className="palette-legend-dot bg-done" /> Đã làm
              </span>
              <span className="d-flex align-items-center gap-1.5">
                <span className="palette-legend-dot bg-unanswered" /> Chưa làm
              </span>
              <span className="d-flex align-items-center gap-1.5">
                <span className="palette-legend-dot bg-flag" /> Cắm cờ
              </span>
            </div>

            {/* 5-Column Grid of Palette Buttons */}
            <div className="palette-grid-5cols">
              {questions.map((q, idx) => {
                const isAnswered =
                  userAnswers[q._id] !== undefined &&
                  userAnswers[q._id] !== "" &&
                  userAnswers[q._id] !== null;
                const isCurrent = idx === currentIdx;
                const isFlag = !!flaggedQuestions[q._id];

                let stateClass = "cell-unanswered";
                if (isCurrent) stateClass = "cell-current";
                else if (isAnswered) stateClass = "cell-done";
                if (isFlag) stateClass += " cell-flagged";

                return (
                  <button
                    key={q._id || idx}
                    type="button"
                    className={`palette-cell ${stateClass}`}
                    onClick={() => onSelectIndex(idx)}
                    title={`Câu ${idx + 1}`}
                  >
                    {idx + 1}
                    {isFlag && <span className="cell-flag-pin" />}
                  </button>
                );
              })}
            </div>

            {/* 3-Column Bottom Stats */}
            <div className="palette-stats-footer mt-4 pt-3 border-top d-flex justify-content-between text-center">
              <div className="stat-col flex-fill">
                <div className="stat-number text-success">{answeredCount}</div>
                <div className="stat-label">Đã làm</div>
              </div>
              <div className="stat-col flex-fill border-start border-end">
                <div className="stat-number text-secondary">{totalQuestions - answeredCount}</div>
                <div className="stat-label">Chưa làm</div>
              </div>
              <div className="stat-col flex-fill">
                <div className="stat-number text-warning">{flaggedCount}</div>
                <div className="stat-label">Cắm cờ</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* SUBMISSION CONFIRMATION MODAL */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center gap-2">
            <AlertTriangle className="text-warning" size={24} />
            Xác Nhận Nộp Bài Thi
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          <p className="text-secondary mb-3">
            Bạn đã hoàn thành <strong>{answeredCount}</strong> / <strong>{totalQuestions}</strong> câu hỏi.
          </p>

          {totalQuestions - answeredCount > 0 && (
            <div className="p-3 bg-warning bg-opacity-10 rounded-3 border border-warning mb-3">
              <span className="fw-semibold text-warning-emphasis">
                Chú ý: Còn {totalQuestions - answeredCount} câu chưa trả lời!
              </span>
            </div>
          )}

          <p className="text-muted small mb-0">
            Bạn có chắc chắn muốn nộp bài ngay bây giờ? Sau khi nộp bạn sẽ không thể chỉnh sửa đáp án.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <button
            type="button"
            className="btn btn-light rounded-pill px-4"
            onClick={() => setShowSubmitModal(false)}
          >
            Tiếp tục làm bài
          </button>
          <button
            type="button"
            className="btn btn-success rounded-pill px-4 fw-bold"
            disabled={isSubmitting}
            onClick={() => {
              setShowSubmitModal(false);
              onSubmitExam();
            }}
          >
            {isSubmitting ? "Đang gửi kết quả..." : "Xác nhận nộp bài"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExamRoom;
