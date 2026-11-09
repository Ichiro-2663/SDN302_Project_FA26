import React, { useState, useEffect, useContext } from "react";
import { Card, Row, Col, Button, Form, Badge, ProgressBar, Alert } from "react-bootstrap";
import {
  FaVolumeUp,
  FaBookmark,
  FaRegBookmark,
  FaLightbulb,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

const Practice = () => {
  const { user } = useContext(AuthContext);
  const userId = user?._id || localStorage.getItem("id");

  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [skills, setSkills] = useState([]);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  // Practice state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [matchingAnswers, setMatchingAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [bookmarkedList, setBookmarkedList] = useState({});
  const [loading, setLoading] = useState(true);

  // Load initial topics, skills, bookmarks
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [topRes, skRes, bmRes] = await Promise.allSettled([
          axiosClient.get("/topics"),
          axiosClient.get("/skills"),
          userId ? axiosClient.get(`/bookmarks/user/${userId}`) : Promise.resolve({ data: [] }),
        ]);

        if (topRes.status === "fulfilled") setTopics(topRes.value.data || []);
        if (skRes.status === "fulfilled") setSkills(skRes.value.data || []);
        if (bmRes.status === "fulfilled") {
          const map = {};
          (bmRes.value.data || []).forEach((b) => {
            if (b.itemType === "Question" && b.itemId) {
              const qId = b.itemId._id || b.itemId;
              map[qId] = b._id;
            }
          });
          setBookmarkedList(map);
        }
      } catch (err) {
        console.error("Metadata load error:", err);
      }
    };

    fetchMetadata();
  }, [userId]);

  // Fetch questions matching filter
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedTopic) params.topic = selectedTopic;
        if (selectedSkill) params.skill = selectedSkill;
        if (selectedLevel) params.level = selectedLevel;

        const res = await axiosClient.get("/questions", { params });
        setQuestions(res.data || []);
        setCurrentIndex(0);
        setUserAnswer("");
        setMatchingAnswers({});
        setChecked(false);
      } catch (err) {
        console.error("Questions load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedTopic, selectedSkill, selectedLevel]);

  const currentQ = questions[currentIndex];

  const handleTTS = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
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
        console.error("Bookmark remove error:", err);
      }
    } else {
      try {
        const res = await axiosClient.post("/bookmarks", {
          userId,
          itemType: "Question",
          itemId: qId,
          notes: "Lưu trong lúc Luyện tập",
        });
        setBookmarkedList({ ...bookmarkedList, [qId]: res.data._id });
      } catch (err) {
        console.error("Bookmark add error:", err);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setMatchingAnswers({});
      setChecked(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserAnswer("");
      setMatchingAnswers({});
      setChecked(false);
    }
  };

  // Check correctness of answer
  const isAnswerCorrect = () => {
    if (!currentQ) return false;
    if (currentQ.questionType === "MultipleChoice") {
      return String(userAnswer).trim() === String(currentQ.correctAnswer).trim();
    }
    if (currentQ.questionType === "TrueFalse") {
      return String(userAnswer).trim().toLowerCase() === String(currentQ.correctAnswer).trim().toLowerCase();
    }
    if (currentQ.questionType === "FillInBlank") {
      return String(userAnswer).trim().toLowerCase() === String(currentQ.correctAnswer).trim().toLowerCase();
    }
    if (currentQ.questionType === "Matching" && currentQ.matchingPairs) {
      let allCorrect = true;
      currentQ.matchingPairs.forEach((_, idx) => {
        if (Number(matchingAnswers[idx]) !== idx) allCorrect = false;
      });
      return allCorrect;
    }
    return false;
  };

  return (
    <div className="w-100">
      {/* Filters Bar */}
      <Card className="border-0 shadow-sm rounded-4 bg-white mb-4 p-3">
        <Row className="g-3 align-items-center">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted mb-1">Chủ Đề (Topic)</Form.Label>
              <Form.Select
                size="sm"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="">Tất cả chủ đề</option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted mb-1">Kỹ Năng (Skill)</Form.Label>
              <Form.Select
                size="sm"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                <option value="">Tất cả kỹ năng</option>
                {skills.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted mb-1">Cấp Độ (Level)</Form.Label>
              <Form.Select
                size="sm"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="">Tất cả cấp độ</option>
                <option value="A1">A1 - Sơ cấp</option>
                <option value="A2">A2 - Cơ bản</option>
                <option value="B1">B1 - Trung cấp</option>
                <option value="B2">B2 - Khá</option>
                <option value="C1">C1 - Nâng cao</option>
                <option value="C2">C2 - Thành thạo</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3} className="text-md-end pt-md-3">
            <span className="badge bg-light text-dark px-3 py-2 rounded-pill border">
              Tìm thấy: <strong>{questions.length}</strong> câu hỏi
            </span>
          </Col>
        </Row>
      </Card>

      {/* Main Practice Area */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
          <p className="mt-2 text-muted">Đang tải ngân hàng câu hỏi...</p>
        </div>
      ) : questions.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 text-center p-5 bg-white">
          <h5 className="fw-bold text-dark">Chưa có câu hỏi phù hợp bộ lọc</h5>
          <p className="text-muted small">Hãy thử chọn lại chủ đề hoặc cấp độ khác nhé!</p>
          <Button
            variant="warning"
            size="sm"
            className="w-auto mx-auto rounded-pill fw-bold text-dark"
            onClick={() => {
              setSelectedTopic("");
              setSelectedSkill("");
              setSelectedLevel("");
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </Card>
      ) : (
        <div>
          {/* Progress Header */}
          <div className="d-flex justify-content-between align-items-center mb-2 px-1">
            <span className="fw-bold text-dark small">
              Câu {currentIndex + 1} / {questions.length}
            </span>
            <div className="d-flex gap-2">
              <Badge bg="info" pill>
                {currentQ.level || "B1"}
              </Badge>
              <Badge bg="secondary" pill>
                {currentQ.questionType}
              </Badge>
            </div>
          </div>
          <ProgressBar
            now={((currentIndex + 1) / questions.length) * 100}
            variant="warning"
            style={{ height: "6px" }}
            className="rounded-pill mb-4"
          />

          {/* Question Card */}
          <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="d-flex align-items-center gap-2">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="rounded-circle p-2"
                  title="Đọc to câu hỏi"
                  onClick={() => handleTTS(currentQ.content)}
                >
                  <FaVolumeUp />
                </Button>
                <span className="text-muted small">
                  {currentQ.topic?.name && `Chủ đề: ${currentQ.topic.name}`}
                </span>
              </div>

              <Button
                size="sm"
                variant={bookmarkedList[currentQ._id] ? "danger" : "outline-secondary"}
                className="rounded-pill d-flex align-items-center gap-1"
                onClick={() => toggleBookmark(currentQ._id)}
              >
                {bookmarkedList[currentQ._id] ? <FaBookmark /> : <FaRegBookmark />}
                <span className="small">
                  {bookmarkedList[currentQ._id] ? "Đã lưu" : "Lưu câu hỏi"}
                </span>
              </Button>
            </div>

            {/* Passage if present */}
            {currentQ.passage && (
              <div className="bg-light p-3 rounded-3 mb-3 border text-secondary small fst-italic">
                {currentQ.passage}
              </div>
            )}

            {/* Question Text */}
            <h5 className="fw-bold text-dark mb-4 lh-base">{currentQ.content}</h5>

            {/* Answer Options based on Type */}
            {currentQ.questionType === "MultipleChoice" && (
              <div className="d-flex flex-column gap-2 mb-4">
                {(currentQ.options || []).map((opt, idx) => {
                  const isSelected = String(userAnswer) === String(idx);
                  let optStyle = {
                    border: "1px solid #e2e8f0",
                    background: isSelected ? "#fff7ed" : "#ffffff",
                    borderColor: isSelected ? "#ea580c" : "#e2e8f0",
                    color: isSelected ? "#ea580c" : "#1e293b",
                  };

                  if (checked) {
                    if (String(idx) === String(currentQ.correctAnswer)) {
                      optStyle.background = "#dcfce7";
                      optStyle.borderColor = "#16a34a";
                      optStyle.color = "#15803d";
                    } else if (isSelected && String(idx) !== String(currentQ.correctAnswer)) {
                      optStyle.background = "#fee2e2";
                      optStyle.borderColor = "#dc2626";
                      optStyle.color = "#b91c1c";
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-3 d-flex align-items-center gap-3 cursor-pointer"
                      style={{ ...optStyle, cursor: checked ? "default" : "pointer" }}
                      onClick={() => !checked && setUserAnswer(String(idx))}
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
                      <span className="fw-semibold">{opt}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQ.questionType === "TrueFalse" && (
              <div className="d-flex gap-3 mb-4">
                {["True", "False"].map((opt) => {
                  const isSelected = String(userAnswer).toLowerCase() === opt.toLowerCase();
                  return (
                    <Button
                      key={opt}
                      variant={isSelected ? "warning" : "outline-secondary"}
                      className="flex-grow-1 py-3 fw-bold rounded-3"
                      disabled={checked}
                      onClick={() => setUserAnswer(opt)}
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
                  placeholder="Nhập từ hoặc cụm từ còn thiếu..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={checked}
                  className="py-2 px-3 fs-6 rounded-3"
                />
              </div>
            )}

            {currentQ.questionType === "Matching" && (
              <div className="mb-4">
                <p className="text-muted small">Hãy ghép các cặp tương ứng:</p>
                <div className="d-flex flex-column gap-2">
                  {(currentQ.matchingPairs || []).map((pair, idx) => (
                    <Row key={idx} className="align-items-center g-2">
                      <Col xs={6}>
                        <div className="p-2 bg-light rounded border fw-semibold small">
                          {idx + 1}. {pair.left}
                        </div>
                      </Col>
                      <Col xs={6}>
                        <Form.Select
                          size="sm"
                          value={matchingAnswers[idx] !== undefined ? matchingAnswers[idx] : ""}
                          disabled={checked}
                          onChange={(e) =>
                            setMatchingAnswers({ ...matchingAnswers, [idx]: Number(e.target.value) })
                          }
                        >
                          <option value="">-- Chọn ghép --</option>
                          {currentQ.matchingPairs.map((p, pIdx) => (
                            <option key={pIdx} value={pIdx}>
                              {String.fromCharCode(65 + pIdx)}. {p.right}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  ))}
                </div>
              </div>
            )}

            {/* Check Button & Feedback Display */}
            {!checked ? (
              <Button
                variant="warning"
                className="w-100 py-2 fw-bold text-dark rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                onClick={() => setChecked(true)}
                disabled={userAnswer === "" && Object.keys(matchingAnswers).length === 0}
              >
                <FaCheckCircle /> Kiểm Tra Đáp Án
              </Button>
            ) : (
              <div>
                <Alert
                  variant={isAnswerCorrect() ? "success" : "danger"}
                  className="rounded-3 d-flex align-items-start gap-2 mb-3"
                >
                  {isAnswerCorrect() ? (
                    <FaCheckCircle className="mt-1 flex-shrink-0" />
                  ) : (
                    <FaTimesCircle className="mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <strong className="d-block">
                      {isAnswerCorrect() ? "Chính xác! Làm tốt lắm." : "Chưa chính xác!"}
                    </strong>
                    {!isAnswerCorrect() && (
                      <span className="small">
                        Đáp án đúng:{" "}
                        <strong>
                          {currentQ.questionType === "MultipleChoice" && currentQ.options
                            ? currentQ.options[currentQ.correctAnswer]
                            : String(currentQ.correctAnswer)}
                        </strong>
                      </span>
                    )}
                  </div>
                </Alert>

                {currentQ.explanation && (
                  <div
                    className="p-3 rounded-3 mb-3"
                    style={{ background: "#fef3c7", borderLeft: "4px solid #f59e0b" }}
                  >
                    <div className="d-flex align-items-center gap-2 fw-bold text-dark small mb-1">
                      <FaLightbulb color="#ea580c" /> Giải Thích Chi Tiết:
                    </div>
                    <div className="small text-secondary lh-base">{currentQ.explanation}</div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <Button
                variant="outline-secondary"
                size="sm"
                className="rounded-pill px-3 d-flex align-items-center gap-1"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                <FaArrowLeft /> Câu Trước
              </Button>

              <Button
                variant="warning"
                size="sm"
                className="rounded-pill px-4 fw-bold text-dark d-flex align-items-center gap-1"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
              >
                Câu Tiếp Theo <FaArrowRight />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Practice;
