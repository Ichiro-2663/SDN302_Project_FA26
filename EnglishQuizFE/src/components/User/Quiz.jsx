import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { Card, Row, Col, Button, Badge, ProgressBar, Form } from "react-bootstrap";
import {
  FaClock,
  FaFlag,
  FaRegFlag,
  FaBookmark,
  FaRegBookmark,
  FaLightbulb,
  FaRedo,
  FaArrowLeft,
  FaArrowRight,
  FaTrophy,
  FaVolumeUp,
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

const Quiz = ({ type = "quiz" }) => {
  const { user } = useContext(AuthContext);
  const userId = user?._id || localStorage.getItem("id");

  // Exam list state
  const [exams, setExams] = useState([]);
  const [filterLevel, setFilterLevel] = useState("All");
  const [loading, setLoading] = useState(true);

  // Active exam state
  const [activeExam, setActiveExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const timerRef = useRef(null);

  // Submission & Results
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // Result payload from server
  const [bookmarkedList, setBookmarkedList] = useState({});

  // Load exam list
  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get("/exams", {
          params: { type, level: filterLevel !== "All" ? filterLevel : undefined },
        });
        setExams(res.data || []);
      } catch (err) {
        console.error("Exams fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchBookmarks = async () => {
      if (!userId) return;
      try {
        const res = await axiosClient.get(`/bookmarks/user/${userId}`);
        const map = {};
        (res.data || []).forEach((b) => {
          if (b.itemType === "Question" && b.itemId) {
            const qId = b.itemId._id || b.itemId;
            map[qId] = b._id;
          }
        });
        setBookmarkedList(map);
      } catch (err) {
        console.error("Bookmarks fetch error:", err);
      }
    };

    fetchExams();
    fetchBookmarks();
  }, [type, filterLevel, userId]);

  // Submit function (Server-side grading)
  const submitExam = useCallback(
    async (isAutoSubmit = false) => {
      if (!activeExam || submitting || result) return;
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      try {
        const totalDurationSec = (activeExam.duration || 30) * 60;
        const timeSpent = Math.max(0, totalDurationSec - timeLeft);

        const res = await axiosClient.post(`/exams/${activeExam._id}/submit`, {
          userId,
          answers: userAnswers,
          timeSpent,
        });

        setResult(res.data);
      } catch (err) {
        console.error("Exam submit error:", err);
        alert("Lỗi nộp bài: " + (err.response?.data?.message || err.message));
      } finally {
        setSubmitting(false);
      }
    },
    [activeExam, submitting, result, timeLeft, userAnswers, userId]
  );

  // Timer countdown hook
  useEffect(() => {
    if (activeExam && !result && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            submitExam(true); // Auto-submit when time is up!
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeExam, result, submitExam, timeLeft]);

  // Start exam
  const handleStartExam = async (exam) => {
    try {
      setLoading(true);
      // Call SECURE endpoint: no correctAnswer or explanation in client!
      const res = await axiosClient.get(`/exams/${exam._id}/take`);
      const examData = res.data.exam;

      setActiveExam(examData);
      setQuestions(examData.questions || []);
      setCurrentIdx(0);
      setUserAnswers({});
      setFlaggedQuestions({});
      setResult(null);

      // Initialize timer
      const durationSec = (examData.duration || (type === "minitest" ? 15 : 30)) * 60;
      setTimeLeft(durationSec);
    } catch (err) {
      console.error("Start exam error:", err);
      alert("Không thể tải bài thi: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId, answerValue) => {
    setUserAnswers({ ...userAnswers, [qId]: answerValue });
  };

  const toggleFlag = (qId) => {
    setFlaggedQuestions({ ...flaggedQuestions, [qId]: !flaggedQuestions[qId] });
  };

  const toggleBookmark = async (qId) => {
    if (!userId) return;
    if (bookmarkedList[qId]) {
      try {
        await axiosClient.delete(`/bookmarks/${bookmarkedList[qId]}`);
        const updated = { ...bookmarkedList };
        delete updated[qId];
        setBookmarkedList(updated);
      } catch (err) {
        console.error("Bookmark error:", err);
      }
    } else {
      try {
        const res = await axiosClient.post("/bookmarks", {
          userId,
          itemType: "Question",
          itemId: qId,
          notes: "Lưu từ đề thi: " + (activeExam?.title || "Quiz"),
        });
        setBookmarkedList({ ...bookmarkedList, [qId]: res.data._id });
      } catch (err) {
        console.error("Bookmark error:", err);
      }
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

  // Format timer string MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ================= VIEW 1: RESULT REVIEW SCREEN =================
  if (result) {
    const isPassed = result.status === "PASSED";

    return (
      <div className="w-100">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button
            variant="outline-secondary"
            size="sm"
            className="rounded-pill fw-bold"
            onClick={() => {
              setActiveExam(null);
              setResult(null);
            }}
          >
            &larr; Quay Lại Danh Sách Đề Thi
          </Button>
          <Button
            variant="warning"
            size="sm"
            className="rounded-pill fw-bold text-dark d-flex align-items-center gap-1"
            onClick={() => handleStartExam(activeExam)}
          >
            <FaRedo /> Làm Lại Bài Thi
          </Button>
        </div>

        {/* Score Summary Card */}
        <Card
          className="border-0 shadow-sm rounded-4 mb-4 text-white overflow-hidden"
          style={{
            background: isPassed
              ? "linear-gradient(135deg, #15803d 0%, #16a34a 100%)"
              : "linear-gradient(135deg, #b91c1c 0%, #ea580c 100%)",
            borderRadius: "20px",
          }}
        >
          <Card.Body className="p-4 p-md-5 text-center">
            <div className="mb-2">
              <FaTrophy size={48} className="text-warning" />
            </div>
            <h3 className="fw-bold mb-1">
              {isPassed ? "Chúc Mừng! Bạn Đã ĐẠT Bài Thi" : "Rất Tiếc! Bạn Chưa ĐẠT Yêu Cầu"}
            </h3>
            <p className="opacity-90 mb-3">{activeExam?.title}</p>

            <div className="d-inline-flex gap-4 p-3 bg-white bg-opacity-10 rounded-4">
              <div>
                <span className="small d-block opacity-75">Điểm số</span>
                <span className="fs-3 fw-bold">
                  {result.score} / {result.total}
                </span>
              </div>
              <div className="border-start border-white border-opacity-25" />
              <div>
                <span className="small d-block opacity-75">Tỷ lệ chính xác</span>
                <span className="fs-3 fw-bold">{result.percentage}%</span>
              </div>
              <div className="border-start border-white border-opacity-25" />
              <div>
                <span className="small d-block opacity-75">Trạng thái</span>
                <span className="fs-3 fw-bold">{result.status}</span>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Detailed Question Review */}
        <h5 className="fw-bold text-dark mb-3">Chi Tiết Từng Câu Hỏi & Giải Thích:</h5>
        <div className="d-flex flex-column gap-3 mb-4">
          {(result.details || []).map((detail, idx) => {
            const isCorrect = detail.isCorrect;
            return (
              <Card key={detail.questionId || idx} className="border-0 shadow-sm rounded-4 p-4 bg-white">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{
                        width: "30px",
                        height: "30px",
                        background: isCorrect ? "#16a34a" : "#dc2626",
                        fontSize: "13px",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="fw-bold text-dark">Câu {idx + 1}</span>
                    <Badge bg={isCorrect ? "success" : "danger"} pill>
                      {isCorrect ? "Đúng (+1)" : "Sai (0)"}
                    </Badge>
                  </div>

                  <Button
                    size="sm"
                    variant={bookmarkedList[detail.questionId] ? "danger" : "outline-secondary"}
                    className="rounded-pill d-flex align-items-center gap-1"
                    onClick={() => toggleBookmark(detail.questionId)}
                  >
                    {bookmarkedList[detail.questionId] ? <FaBookmark /> : <FaRegBookmark />}
                    <span className="small">
                      {bookmarkedList[detail.questionId] ? "Đã lưu" : "Lưu câu hỏi"}
                    </span>
                  </Button>
                </div>

                <p className="fw-bold text-dark mb-3 mt-1 fs-6">{detail.content}</p>

                {/* Answer comparison */}
                <div className="bg-light p-3 rounded-3 mb-3 small">
                  <Row className="g-2">
                    <Col sm={6}>
                      <span className="text-muted d-block mb-1">Đáp án bạn chọn:</span>
                      <strong className={isCorrect ? "text-success" : "text-danger"}>
                        {detail.userAnswer !== undefined && detail.userAnswer !== null && detail.userAnswer !== ""
                          ? detail.questionType === "MultipleChoice" && detail.options
                            ? `${String.fromCharCode(65 + Number(detail.userAnswer))}. ${
                                detail.options[detail.userAnswer] || detail.userAnswer
                              }`
                            : String(detail.userAnswer)
                          : "(Bỏ trống / Chưa chọn)"}
                      </strong>
                    </Col>
                    <Col sm={6}>
                      <span className="text-muted d-block mb-1">Đáp án đúng của đề:</span>
                      <strong className="text-success">
                        {detail.questionType === "MultipleChoice" && detail.options
                          ? `${String.fromCharCode(65 + Number(detail.correctAnswer))}. ${
                              detail.options[detail.correctAnswer] || detail.correctAnswer
                            }`
                          : String(detail.correctAnswer)}
                      </strong>
                    </Col>
                  </Row>
                </div>

                {/* Explanation */}
                <div
                  className="p-3 rounded-3 small"
                  style={{ background: "#fffbeb", borderLeft: "4px solid #f59e0b" }}
                >
                  <div className="d-flex align-items-center gap-2 fw-bold text-dark mb-1">
                    <FaLightbulb color="#ea580c" /> Giải Thích Chi Tiết:
                  </div>
                  <div className="text-secondary">{detail.explanation}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ================= VIEW 2: ACTIVE EXAM IN PROGRESS =================
  if (activeExam) {
    const currentQ = questions[currentIdx];
    const isFlagged = flaggedQuestions[currentQ?._id];
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(userAnswers).length;
    const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    const isUrgent = timeLeft < 300; // less than 5 minutes

    return (
      <div className="w-100">
        {/* Top Floating Control Bar */}
        <Card className="border-0 shadow-sm rounded-4 p-3 bg-white mb-4 sticky-top">
          <Row className="align-items-center g-2">
            <Col xs={12} md={4} className="d-flex align-items-center gap-2">
              <span className="fw-bold text-dark fs-6 text-truncate">{activeExam.title}</span>
              <Badge bg="warning" text="dark" pill>
                {activeExam.level}
              </Badge>
            </Col>

            {/* Countdown Timer */}
            <Col xs={6} md={4} className="text-md-center">
              <div
                className={`d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill fw-bold ${
                  isUrgent ? "bg-danger text-white" : "bg-light text-dark border"
                }`}
                style={{ fontSize: "16px" }}
              >
                <FaClock />
                <span>{formatTime(timeLeft)}</span>
                {isUrgent && <span className="small fw-normal">Sắp hết giờ!</span>}
              </div>
            </Col>

            {/* Submit button */}
            <Col xs={6} md={4} className="text-end">
              <Button
                variant="warning"
                className="fw-bold px-4 rounded-pill text-dark shadow-sm"
                onClick={() => {
                  if (
                    window.confirm(
                      `Bạn đã làm ${answeredCount}/${totalQuestions} câu. Bạn có chắc chắn muốn nộp bài ngay bây giờ?`
                    )
                  ) {
                    submitExam();
                  }
                }}
                disabled={submitting}
              >
                {submitting ? "Đang chấm..." : "Nộp Bài Thi"}
              </Button>
            </Col>
          </Row>

          <ProgressBar
            now={progressPercent}
            variant="warning"
            style={{ height: "4px" }}
            className="rounded-pill mt-3"
          />
        </Card>

        <Row className="g-4">
          {/* Main Question View (Left / Center) */}
          <Col lg={8}>
            {currentQ && (
              <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark fs-5">Câu {currentIdx + 1}</span>
                    <span className="text-muted small">/ {totalQuestions}</span>
                    <Badge bg="secondary" pill className="ms-2">
                      {currentQ.questionType}
                    </Badge>
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="rounded-circle p-2"
                      title="Phát âm"
                      onClick={() => handleTTS(currentQ.content)}
                    >
                      <FaVolumeUp />
                    </Button>

                    <Button
                      size="sm"
                      variant={isFlagged ? "warning" : "outline-secondary"}
                      className="rounded-pill d-flex align-items-center gap-1"
                      onClick={() => toggleFlag(currentQ._id)}
                    >
                      {isFlagged ? <FaFlag /> : <FaRegFlag />}
                      <span className="small">{isFlagged ? "Đã gắn cờ" : "Gắn cờ"}</span>
                    </Button>
                  </div>
                </div>

                {/* Passage if present */}
                {currentQ.passage && (
                  <div className="bg-light p-3 rounded-3 mb-3 border text-secondary small fst-italic">
                    {currentQ.passage}
                  </div>
                )}

                {/* Question content */}
                <h5 className="fw-bold text-dark mb-4 lh-base">{currentQ.content}</h5>

                {/* Options based on questionType */}
                {currentQ.questionType === "MultipleChoice" && (
                  <div className="d-flex flex-column gap-2 mb-4">
                    {(currentQ.options || []).map((opt, idx) => {
                      const isSelected = String(userAnswers[currentQ._id]) === String(idx);
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-3 d-flex align-items-center gap-3 cursor-pointer"
                          style={{
                            border: `1.5px solid ${isSelected ? "#ea580c" : "#e2e8f0"}`,
                            background: isSelected ? "#fff7ed" : "#ffffff",
                            cursor: "pointer",
                          }}
                          onClick={() => handleSelectAnswer(currentQ._id, String(idx))}
                        >
                          <span
                            className="fw-bold rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "28px",
                              height: "28px",
                              background: isSelected ? "#ea580c" : "#f1f5f9",
                              color: isSelected ? "#ffffff" : "#64748b",
                              fontSize: "12px",
                            }}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="fw-semibold text-dark">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {currentQ.questionType === "TrueFalse" && (
                  <div className="d-flex gap-3 mb-4">
                    {["True", "False"].map((opt) => {
                      const isSelected =
                        String(userAnswers[currentQ._id] || "").toLowerCase() === opt.toLowerCase();
                      return (
                        <Button
                          key={opt}
                          variant={isSelected ? "warning" : "outline-secondary"}
                          className="flex-grow-1 py-3 fw-bold rounded-3"
                          onClick={() => handleSelectAnswer(currentQ._id, opt)}
                        >
                          {opt === "True" ? "✓ Đúng (True)" : "✗ Sai (False)"}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {currentQ.questionType === "FillInBlank" && (
                  <div className="mb-4">
                    <Form.Control
                      type="text"
                      placeholder="Nhập câu trả lời của bạn vào đây..."
                      value={userAnswers[currentQ._id] || ""}
                      onChange={(e) => handleSelectAnswer(currentQ._id, e.target.value)}
                      className="py-2 px-3 fs-6 rounded-3"
                    />
                  </div>
                )}

                {currentQ.questionType === "Matching" && (
                  <div className="mb-4">
                    <p className="text-muted small">Hãy chọn đáp án phù hợp với từng mục:</p>
                    <div className="d-flex flex-column gap-2">
                      {(currentQ.matchingPairs || []).map((pair, pIdx) => {
                        let parsedAns = {};
                        try {
                          parsedAns = JSON.parse(userAnswers[currentQ._id] || "{}");
                        } catch (e) {}

                        return (
                          <Row key={pIdx} className="align-items-center g-2">
                            <Col xs={6}>
                              <div className="p-2 bg-light rounded border fw-semibold small">
                                {pIdx + 1}. {pair.left}
                              </div>
                            </Col>
                            <Col xs={6}>
                              <Form.Select
                                size="sm"
                                value={parsedAns[pIdx] !== undefined ? parsedAns[pIdx] : ""}
                                onChange={(e) => {
                                  const updated = { ...parsedAns, [pIdx]: Number(e.target.value) };
                                  handleSelectAnswer(currentQ._id, JSON.stringify(updated));
                                }}
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
                  </div>
                )}

                {/* Bottom Navigation between questions */}
                <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-4">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="rounded-pill px-3"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(currentIdx - 1)}
                  >
                    <FaArrowLeft /> Câu Trước
                  </Button>

                  <Button
                    variant="warning"
                    size="sm"
                    className="rounded-pill px-4 fw-bold text-dark"
                    disabled={currentIdx === totalQuestions - 1}
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                  >
                    Câu Tiếp Theo <FaArrowRight />
                  </Button>
                </div>
              </Card>
            )}
          </Col>

          {/* Question Palette (Right Panel) */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: "80px" }}>
              <h6 className="fw-bold text-dark mb-3">Bảng Điều Hướng Câu Hỏi</h6>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "8px",
                  maxHeight: "360px",
                  overflowY: "auto",
                  padding: "4px",
                }}
              >
                {questions.map((q, idx) => {
                  const isCurrent = currentIdx === idx;
                  const isAnswered =
                    userAnswers[q._id] !== undefined &&
                    userAnswers[q._id] !== null &&
                    userAnswers[q._id] !== "";
                  const isFlag = flaggedQuestions[q._id];

                  let btnBg = "#f8fafc";
                  let btnColor = "#475569";
                  let btnBorder = "1px solid #e2e8f0";

                  if (isAnswered) {
                    btnBg = "#ffedd5";
                    btnColor = "#ea580c";
                    btnBorder = "1px solid #ea580c";
                  }

                  if (isCurrent) {
                    btnBorder = "2px solid #0f172a";
                  }

                  return (
                    <button
                      key={q._id || idx}
                      onClick={() => setCurrentIdx(idx)}
                      style={{
                        position: "relative",
                        aspectRatio: "1/1",
                        borderRadius: "10px",
                        border: btnBorder,
                        background: btnBg,
                        color: btnColor,
                        fontWeight: isCurrent ? "700" : "500",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {idx + 1}
                      {isFlag && (
                        <FaFlag
                          size={9}
                          color="#f59e0b"
                          style={{ position: "absolute", top: "3px", right: "3px" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-3 border-top small text-muted d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: "14px", height: "14px", background: "#ffedd5", border: "1px solid #ea580c", borderRadius: "4px" }} />
                  <span>Đã trả lời ({answeredCount})</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: "14px", height: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px" }} />
                  <span>Chưa trả lời ({totalQuestions - answeredCount})</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <FaFlag size={12} color="#f59e0b" />
                  <span>Đã gắn cờ ({Object.values(flaggedQuestions).filter(Boolean).length})</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // ================= VIEW 3: EXAM SELECTION LIST =================
  return (
    <div className="w-100">
      {/* Filters and Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            {type === "minitest" ? "Bài Thi Nhanh (Mini-Test)" : "Phòng Thi Thử Chuẩn Hóa"}
          </h4>
          <p className="text-muted small mb-0">
            {type === "minitest"
              ? "Bài kiểm tra nhanh 10-15 câu giúp đánh giá tức thì sự tiến bộ"
              : "Bộ đề thi tổng hợp bấm giờ thực tế, chống gian lận và chấm tự động"}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="small fw-bold text-muted">Cấp độ:</span>
          <Form.Select
            size="sm"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={{ width: "140px" }}
          >
            <option value="All">Tất cả</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </Form.Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
          <p className="mt-2 text-muted">Đang tải danh sách bài thi...</p>
        </div>
      ) : exams.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 text-center p-5 bg-white">
          <h5 className="fw-bold text-dark">Chưa có đề thi nào</h5>
          <p className="text-muted small">Giáo viên đang hoàn thiện các bộ đề mới. Hãy quay lại sau nhé!</p>
        </Card>
      ) : (
        <Row className="g-4">
          {exams.map((exam) => {
            const questionCount = exam.questions?.length || 0;
            const duration = exam.duration || (type === "minitest" ? 15 : 30);

            return (
              <Col key={exam._id} xs={12} md={6} lg={4}>
                <Card className="border-0 shadow-sm rounded-4 p-4 h-100 bg-white d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge bg="warning" text="dark" pill>
                        {exam.level || "Mixed"}
                      </Badge>
                      <span className="text-muted small d-flex align-items-center gap-1">
                        <FaClock size={12} /> {duration} phút
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-2">{exam.title}</h5>
                    <p className="text-muted small mb-3">
                      {exam.description || `Đề thi tổng hợp gồm ${questionCount} câu hỏi được phân bổ theo ma trận.`}
                    </p>

                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <span className="badge bg-light text-dark border">
                        {questionCount} câu hỏi
                      </span>
                      {exam.topic?.name && (
                        <span className="badge bg-light text-secondary border">
                          {exam.topic.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="warning"
                    className="w-100 py-2 fw-bold text-dark rounded-pill shadow-sm"
                    onClick={() => handleStartExam(exam)}
                  >
                    Bắt Đầu Làm Bài &rarr;
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default Quiz;
