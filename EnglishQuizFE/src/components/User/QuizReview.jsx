import React, { useState } from "react";
import { Card, Row, Col, Button, Badge, Modal } from "react-bootstrap";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Clock,
  Target,
  FileText,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Bookmark,
  Volume2,
} from "lucide-react";
import "./QuizReview.css";

const QuizReview = ({
  result,
  exam,
  onRetry,
  onBackToList,
  bookmarkedList = {},
  onToggleBookmark,
}) => {
  const [filter, setFilter] = useState("all"); // 'all', 'correct', 'incorrect'
  const [activeAIModal, setActiveAIModal] = useState(null); // Selected question for AI Tutor

  if (!result) return null;

  const isPassed = result.status === "PASSED";
  const details = result.details || [];
  const correctCount = details.filter((d) => d.isCorrect).length;
  const incorrectCount = details.length - correctCount;

  // Filter questions
  const filteredDetails = details.filter((d) => {
    if (filter === "correct") return d.isCorrect;
    if (filter === "incorrect") return !d.isCorrect;
    return true;
  });

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const s = Number(secs) || 0;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}m ${rem}s`;
  };

  // Text to speech
  const handleTTS = (text) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && text) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      window.speechSynthesis.speak(utter);
    }
  };

  // Format review answer nicely
  const formatReviewAnswer = (val, detail) => {
    if (val === undefined || val === null || val === "") return "(Bỏ trống / Chưa làm)";
    if ((detail.questionType === "MultipleChoice" || detail.questionType === "Multiple Choice") && Array.isArray(detail.options)) {
      const idx = Number(val);
      if (!isNaN(idx) && detail.options[idx] !== undefined) {
        const letter = String.fromCharCode(65 + idx);
        const optText = typeof detail.options[idx] === "object" ? detail.options[idx]?.text : detail.options[idx];
        return `${letter}. ${optText}`;
      }
    }
    if (detail.questionType === "TrueFalse" || detail.questionType === "True/False") {
      return String(val).toLowerCase() === "true" ? "True (Đúng)" : "False (Sai)";
    }
    return String(val);
  };

  return (
    <div className="quiz-review-container">
      {/* Top Navigation Action Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <Button
          variant="outline-secondary"
          size="sm"
          className="rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-2"
          onClick={onBackToList}
        >
          <ArrowLeft size={16} /> Quay Lại Danh Sách Đề Thi
        </Button>

        <Button
          variant="warning"
          size="sm"
          className="rounded-pill px-4 py-2 fw-bold text-dark d-inline-flex align-items-center gap-2 shadow-sm"
          onClick={onRetry}
        >
          <RotateCcw size={16} /> Làm Lại Bài Thi Này
        </Button>
      </div>

      {/* 1. SCORE SUMMARY HERO CARD */}
      <Card className={`review-score-hero mb-4 border-0 ${isPassed ? "passed" : "failed"}`}>
        <div className="mb-2">
          <Trophy size={54} className="text-warning drop-shadow" />
        </div>
        <h2 className="fw-bold mb-1">
          {isPassed ? "Chúc Mừng! Bạn Đã ĐẠT Yêu Cầu" : "Rất Tiếc! Bạn Cần Cố Gắng Hơn"}
        </h2>
        <p className="opacity-90 mb-4">{exam?.title || "Bài Kiểm Tra Tiếng Anh"}</p>

        <div className="d-inline-flex flex-wrap align-items-center justify-content-center gap-4 px-4 py-3 bg-white bg-opacity-15 rounded-4 backdrop-blur">
          <div className="text-center px-3">
            <span className="small d-block opacity-80 text-uppercase fw-semibold mb-1">
              Điểm Đạt Được
            </span>
            <span className="score-display-number">
              {result.score}
              <span className="fs-4 opacity-75">/{result.total}</span>
            </span>
          </div>

          <div className="d-none d-md-block border-start border-white border-opacity-25" style={{ height: "48px" }} />

          <div className="text-center px-3">
            <span className="small d-block opacity-80 text-uppercase fw-semibold mb-1">
              Tỷ Lệ Chính Xác
            </span>
            <span className="fs-1 fw-bold">{result.percentage}%</span>
          </div>

          <div className="d-none d-md-block border-start border-white border-opacity-25" style={{ height: "48px" }} />

          <div className="text-center px-3">
            <span className="small d-block opacity-80 text-uppercase fw-semibold mb-1">
              Xếp Loại
            </span>
            <Badge
              bg={isPassed ? "success" : "danger"}
              className="fs-6 px-3 py-2 rounded-pill shadow-sm"
            >
              {isPassed ? "PASSED (ĐẠT)" : "NEEDS IMPROVEMENT"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* 2. THREE KEY METRIC STATS CARDS */}
      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <div className="review-metric-card d-flex align-items-center gap-3">
            <div
              className="rounded-circle p-3 d-flex align-items-center justify-content-center"
              style={{ background: "#dcfce7", color: "#16a34a" }}
            >
              <Target size={24} />
            </div>
            <div>
              <span className="text-muted small d-block">Tỷ lệ trả lời đúng</span>
              <strong className="fs-5 text-dark">
                {correctCount} / {details.length} câu ({result.percentage}%)
              </strong>
            </div>
          </div>
        </Col>

        <Col xs={12} md={4}>
          <div className="review-metric-card d-flex align-items-center gap-3">
            <div
              className="rounded-circle p-3 d-flex align-items-center justify-content-center"
              style={{ background: "#ffedd5", color: "#ea580c" }}
            >
              <Clock size={24} />
            </div>
            <div>
              <span className="text-muted small d-block">Thời gian hoàn thành</span>
              <strong className="fs-5 text-dark">{formatTime(result.timeSpent)}</strong>
            </div>
          </div>
        </Col>

        <Col xs={12} md={4}>
          <div className="review-metric-card d-flex align-items-center gap-3">
            <div
              className="rounded-circle p-3 d-flex align-items-center justify-content-center"
              style={{ background: "#e0f2fe", color: "#0284c7" }}
            >
              <FileText size={24} />
            </div>
            <div>
              <span className="text-muted small d-block">Tổng số câu hỏi</span>
              <strong className="fs-5 text-dark">{result.total} câu hỏi</strong>
            </div>
          </div>
        </Col>
      </Row>

      {/* 3. QUESTION FILTER TABS */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <h5 className="fw-bold text-dark mb-0">Xem Lại Chi Tiết Từng Câu Hỏi</h5>

        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "dark" : "light"}
            className="review-filter-btn border"
            onClick={() => setFilter("all")}
          >
            Tất cả ({details.length})
          </Button>
          <Button
            size="sm"
            variant={filter === "correct" ? "success" : "light"}
            className="review-filter-btn border"
            onClick={() => setFilter("correct")}
          >
            Câu đúng ({correctCount})
          </Button>
          <Button
            size="sm"
            variant={filter === "incorrect" ? "danger" : "light"}
            className="review-filter-btn border"
            onClick={() => setFilter("incorrect")}
          >
            Câu sai ({incorrectCount})
          </Button>
        </div>
      </div>

      {/* 4. DETAILED QUESTION CARDS LIST */}
      <div className="d-flex flex-column gap-3 mb-5">
        {filteredDetails.map((detail, idx) => {
          const isCorrect = detail.isCorrect;
          const qId = detail.questionId;
          const isBookmarked = !!bookmarkedList[qId];

          return (
            <Card
              key={qId || idx}
              className={`review-question-card ${isCorrect ? "correct" : "incorrect"}`}
            >
              {/* Card Header */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex align-items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 size={24} className="text-success flex-shrink-0" />
                  ) : (
                    <XCircle size={24} className="text-danger flex-shrink-0" />
                  )}
                  <span className="fw-bold text-dark fs-6">Câu hỏi #{idx + 1}</span>
                  <Badge bg={isCorrect ? "success" : "danger"} pill className="px-2 py-1">
                    {isCorrect ? "Chính xác (+1)" : "Chưa chính xác (0)"}
                  </Badge>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    className="rounded-circle p-2 border"
                    title="Nghe phát âm câu hỏi"
                    onClick={() => handleTTS(detail.content)}
                  >
                    <Volume2 size={16} className="text-secondary" />
                  </Button>

                  {onToggleBookmark && (
                    <Button
                      size="sm"
                      variant={isBookmarked ? "warning" : "light"}
                      className="rounded-circle p-2 border"
                      title={isBookmarked ? "Bỏ lưu câu hỏi" : "Lưu vào sổ tay"}
                      onClick={() => onToggleBookmark(qId)}
                    >
                      <Bookmark
                        size={16}
                        className={isBookmarked ? "text-dark fill-dark" : "text-muted"}
                      />
                    </Button>
                  )}

                  {/* AI Tutor Assistant Button */}
                  <Button
                    className="btn-ai-tutor d-inline-flex align-items-center gap-1"
                    onClick={() => setActiveAIModal(detail)}
                  >
                    <Sparkles size={14} />
                    <span>Hỏi Gia Sư AI</span>
                  </Button>
                </div>
              </div>

              {/* Question Text */}
              <p className="fw-semibold text-dark mb-3" style={{ fontSize: "1.05rem" }}>
                {detail.content}
              </p>

              {/* Answer Comparison Grid */}
              <Row className="g-2 mb-3">
                <Col xs={12} md={6}>
                  <div
                    className="p-3 rounded-3 border"
                    style={{
                      background: isCorrect ? "#ecfdf5" : "#fef2f2",
                      borderColor: isCorrect ? "#a7f3d0" : "#fecaca",
                    }}
                  >
                    <span className="text-muted small d-block mb-1 fw-semibold">
                      Lựa chọn của bạn:
                    </span>
                    <strong className={isCorrect ? "text-success" : "text-danger"}>
                      {formatReviewAnswer(detail.userAnswer, detail)}
                    </strong>
                  </div>
                </Col>

                <Col xs={12} md={6}>
                  <div className="p-3 rounded-3 border bg-white" style={{ borderColor: "#86efac" }}>
                    <span className="text-muted small d-block mb-1 fw-semibold">
                      Đáp án chính xác:
                    </span>
                    <strong className="text-success">
                      {formatReviewAnswer(detail.correctAnswer, detail)}
                    </strong>
                  </div>
                </Col>
              </Row>

              {/* Explanation Box */}
              {detail.explanation && (
                <div className="review-explanation-box d-flex align-items-start gap-2">
                  <Lightbulb size={20} className="text-warning flex-shrink-0 mt-1" />
                  <div>
                    <strong className="d-block mb-1">Giải thích chi tiết:</strong>
                    <span>{detail.explanation}</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* AI TUTOR SMART MODAL */}
      <Modal show={!!activeAIModal} onHide={() => setActiveAIModal(null)} centered size="lg">
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title className="fs-5 fw-bold text-dark d-flex align-items-center gap-2">
            <Sparkles className="text-primary" size={22} />
            Gia Sư Trí Tuệ Nhân Tạo (AI English Tutor)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {activeAIModal && (
            <div>
              <div className="p-3 bg-light rounded-4 mb-3 border">
                <span className="small text-muted d-block fw-semibold mb-1">Câu hỏi:</span>
                <p className="fw-bold text-dark mb-0">{activeAIModal.content}</p>
              </div>

              <div className="p-3 rounded-4 mb-3 border" style={{ background: "#f5f3ff", borderColor: "#ddd6fe" }}>
                <span className="fw-bold text-primary d-block mb-1">💡 Phân Tích Ngữ Pháp & Từ Vựng Chuyên Sâu:</span>
                <p className="small text-secondary mb-2 lh-lg">
                  Trong câu hỏi này, đáp án chính xác là <strong>"{activeAIModal.correctAnswer}"</strong>.
                  {activeAIModal.explanation ? ` ${activeAIModal.explanation}` : ""}
                </p>
                <div className="p-2 bg-white rounded-3 border small text-dark">
                  <strong>Mẹo thi cử (Exam Strategy):</strong> Chú ý đến thì của động từ, giới từ đi kèm hoặc từ đồng nghĩa trong đoạn văn để loại suy nhanh các phương án bẫy.
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border">
                <span className="small text-muted">Luyện phát âm chuẩn:</span>
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="rounded-pill d-flex align-items-center gap-1"
                  onClick={() => handleTTS(activeAIModal.content)}
                >
                  <Volume2 size={14} /> Nghe đọc câu hỏi
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="dark" className="rounded-pill px-4" onClick={() => setActiveAIModal(null)}>
            Đã hiểu
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QuizReview;

