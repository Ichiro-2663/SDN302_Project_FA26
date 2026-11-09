import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { Card, Row, Col, Button, Badge, Form, Modal, Spinner } from "react-bootstrap";
import { Sparkles, Clock, Play } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";
import ExamRoom from "./ExamRoom";
import QuizReview from "./QuizReview";

const Quiz = ({ type = "quiz", onExamLockChange }) => {
  const { user } = useContext(AuthContext);
  const userId = user?._id || localStorage.getItem("id");

  // Exam list state
  const [exams, setExams] = useState([]);
  const [filterLevel, setFilterLevel] = useState("All");
  const [loading, setLoading] = useState(true);

  // Metadata for creating tests
  const [topicsList, setTopicsList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);

  // Create Mini Test Modal state
  const [showCreateMiniModal, setShowCreateMiniModal] = useState(false);
  const [isGeneratingMini, setIsGeneratingMini] = useState(false);
  const [miniFormData, setMiniFormData] = useState({
    title: "",
    topic: "",
    skill: "",
    level: "Mixed",
    duration: 15,
    questionCount: 10,
  });

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

  // Load exam list & metadata
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

    const fetchMetadata = async () => {
      try {
        const [tRes, sRes] = await Promise.allSettled([
          axiosClient.get("/topics"),
          axiosClient.get("/skills"),
        ]);
        if (tRes.status === "fulfilled") setTopicsList(tRes.value.data || []);
        if (sRes.status === "fulfilled") setSkillsList(sRes.value.data || []);
      } catch (err) {
        console.error("Metadata load error:", err);
      }
    };

    fetchExams();
    fetchBookmarks();
    fetchMetadata();
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
        alert("Lỗi nộp bài thi: " + (err.response?.data?.message || err.message));
      } finally {
        setSubmitting(false);
      }
    },
    [activeExam, submitting, result, timeLeft, userAnswers, userId]
  );

  // Timer countdown hook
  useEffect(() => {
    if (!activeExam || result) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [activeExam, result, submitExam]);

  // Start Exam
  const handleStartExam = async (exam) => {
    try {
      const res = await axiosClient.get(`/exams/${exam._id}/take`);
      const rawData = res.data;
      const examData = rawData.exam || rawData;
      const qList = examData.questions || rawData.questions || [];

      setActiveExam(examData);
      setQuestions(qList);
      setCurrentIdx(0);
      setUserAnswers({});
      setFlaggedQuestions({});
      setResult(null);
      setTimeLeft((examData.duration || (type === "minitest" ? 15 : 30)) * 60);

      if (onExamLockChange) onExamLockChange(true);
    } catch (err) {
      console.error("Take exam error:", err);
      alert("Không thể tải nội dung đề thi: " + (err.response?.data?.message || err.message));
    }
  };

  // Toggle flag on question
  const toggleFlag = (qId) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Select answer for question
  const handleSelectAnswer = (qId, ans) => {
    if (ans === undefined) {
      const copy = { ...userAnswers };
      delete copy[qId];
      setUserAnswers(copy);
    } else {
      setUserAnswers((prev) => ({
        ...prev,
        [qId]: ans,
      }));
    }
  };

  // Bookmark toggle
  const toggleBookmark = async (qId) => {
    if (!userId) return;
    const existingBookmarkId = bookmarkedList[qId];

    if (existingBookmarkId) {
      try {
        await axiosClient.delete(`/bookmarks/${existingBookmarkId}`);
        const copy = { ...bookmarkedList };
        delete copy[qId];
        setBookmarkedList(copy);
      } catch (err) {
        console.error("Remove bookmark error:", err);
      }
    } else {
      try {
        const res = await axiosClient.post("/bookmarks", {
          userId,
          itemType: "Question",
          itemId: qId,
        });
        setBookmarkedList({ ...bookmarkedList, [qId]: res.data._id });
      } catch (err) {
        console.error("Bookmark error:", err);
      }
    }
  };

  // Handle Quick Mini Test Generation
  const handleCreateMiniTest = async (e) => {
    e.preventDefault();
    setIsGeneratingMini(true);
    try {
      const payload = {
        title: miniFormData.title.trim() || undefined,
        duration: Number(miniFormData.duration) || 15,
        questionCount: Number(miniFormData.questionCount) || 10,
        topic: miniFormData.topic || undefined,
        skill: miniFormData.skill || undefined,
        level: miniFormData.level !== "All" ? miniFormData.level : undefined,
        createdBy: userId || undefined,
      };

      const res = await axiosClient.post("/exams/minitest/generate", payload);
      const newExam = res.data.exam;

      setShowCreateMiniModal(false);
      setExams((prev) => [newExam, ...prev]);

      // Automatically launch the newly generated exam
      await handleStartExam(newExam);
    } catch (err) {
      console.error("Generate mini test error:", err);
      alert("Lỗi tạo bài mini test: " + (err.response?.data?.message || err.message));
    } finally {
      setIsGeneratingMini(false);
    }
  };

  // Warn before leaving page during active exam
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (activeExam && !result) {
        e.preventDefault();
        e.returnValue = "Bạn đang làm bài thi! Mọi kết quả chưa nộp sẽ bị mất.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeExam, result]);

  // ================= VIEW 1: RESULT REVIEW SCREEN =================
  if (result) {
    return (
      <QuizReview
        result={result}
        exam={activeExam}
        onRetry={() => handleStartExam(activeExam)}
        onBackToList={() => {
          setActiveExam(null);
          setResult(null);
          if (onExamLockChange) onExamLockChange(false);
        }}
        bookmarkedList={bookmarkedList}
        onToggleBookmark={toggleBookmark}
      />
    );
  }

  // ================= VIEW 2: ACTIVE EXAM IN PROGRESS =================
  if (activeExam) {
    return (
      <ExamRoom
        exam={activeExam}
        questions={questions}
        currentIdx={currentIdx}
        onSelectIndex={setCurrentIdx}
        userAnswers={userAnswers}
        onSelectAnswer={handleSelectAnswer}
        flaggedQuestions={flaggedQuestions}
        onToggleFlag={toggleFlag}
        bookmarkedList={bookmarkedList}
        onToggleBookmark={toggleBookmark}
        timeLeft={timeLeft}
        onSubmitExam={submitExam}
        isSubmitting={submitting}
      />
    );
  }

  // ================= VIEW 3: EXAM SELECTION LIST =================
  return (
    <div className="w-100">
      {/* Header & Controls Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">
            {type === "minitest" ? "Bài Thi Nhanh (Mini-Test)" : "Phòng Thi Thử Chuẩn Hóa"}
          </h4>
          <p className="text-muted small mb-0">
            {type === "minitest"
              ? "Bài kiểm tra nhanh 5-15 câu đánh giá tức thì sự tiến bộ"
              : "Bộ đề thi tổng hợp bấm giờ thực tế, chống gian lận và chấm tự động"}
          </p>
        </div>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          {/* Quick Create Mini Test Button */}
          <Button
            variant="warning"
            className="fw-bold text-dark rounded-pill px-3 py-2 shadow-sm d-inline-flex align-items-center gap-2 border-0"
            style={{ background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)", color: "#ffffff" }}
            onClick={() => setShowCreateMiniModal(true)}
          >
            <Sparkles size={16} color="#ffffff" />
            <span style={{ color: "#ffffff" }}>
              {type === "minitest" ? "⚡ Tạo Bài Mini Test Tự Động" : "⚡ Tạo Đề Nhanh Tự Động"}
            </span>
          </Button>

          {/* Level Filter */}
          <div className="d-flex align-items-center gap-2">
            <span className="small fw-bold text-muted">Cấp độ:</span>
            <Form.Select
              size="sm"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="rounded-pill px-3"
              style={{ width: "130px" }}
            >
              <option value="All">Tất cả</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
              <option value="Mixed">Mixed</option>
            </Form.Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
          <p className="mt-2 text-muted">Đang tải danh sách bài thi...</p>
        </div>
      ) : exams.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 text-center p-5 bg-white">
          <div className="mb-3">
            <Sparkles size={48} className="text-warning" />
          </div>
          <h5 className="fw-bold text-dark">Chưa có bài thi nào trong danh mục này</h5>
          <p className="text-muted small mb-4">
            Bạn có thể tự tạo bài kiểm tra nhanh theo chủ đề yêu thích ngay bây giờ chỉ với 1 cú nhấp chuột!
          </p>
          <Button
            variant="warning"
            className="rounded-pill px-4 py-2 fw-bold text-dark shadow-sm d-inline-flex align-items-center gap-2 mx-auto"
            onClick={() => setShowCreateMiniModal(true)}
          >
            <Sparkles size={18} /> Tạo Bài Mini Test Đầu Tiên Ngay
          </Button>
        </Card>
      ) : (
        <Row className="g-4">
          {exams.map((exam) => {
            const questionCount = exam.questions?.length || 0;
            const duration = exam.duration || (type === "minitest" ? 15 : 30);

            return (
              <Col key={exam._id} xs={12} md={6} lg={4}>
                <Card className="border-0 shadow-sm rounded-4 p-4 h-100 bg-white d-flex flex-column justify-content-between exam-listing-card">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge bg="warning" text="dark" pill className="px-2.5 py-1">
                        {typeof exam.level === "object" ? exam.level.name : (exam.level || "Mixed")}
                      </Badge>
                      <span className="text-muted small d-flex align-items-center gap-1">
                        <Clock size={13} /> {duration} phút
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-2">{exam.title}</h5>
                    <p className="text-muted small mb-3">
                      {exam.description ||
                        `Bộ đề trắc nghiệm gồm ${questionCount} câu hỏi chuẩn hóa giúp ôn luyện hiệu quả.`}
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
                    className="w-100 py-2 fw-bold text-dark rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2 mt-3"
                    onClick={() => handleStartExam(exam)}
                  >
                    <span>Bắt Đầu Làm Bài</span>
                    <Play size={14} />
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* QUICK MINI TEST CREATION MODAL */}
      <Modal show={showCreateMiniModal} onHide={() => !isGeneratingMini && setShowCreateMiniModal(false)} centered size="lg">
        <Modal.Header closeButton={!isGeneratingMini} className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center gap-2">
            <Sparkles className="text-warning" size={22} />
            Tự Động Tạo Bài Mini Test Nhanh
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          <p className="text-muted small mb-4">
            Hệ thống sẽ tự động tổng hợp câu hỏi từ ngân hàng đề thi theo đúng chủ đề và thời gian bạn chọn, giúp bạn luyện tập nhanh và đánh giá năng lực ngay.
          </p>

          <Form onSubmit={handleCreateMiniTest}>
            <Row className="g-3 mb-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Tên bài kiểm tra</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: Mini Test Ngữ Pháp & Từ Vựng - 10 Câu"
                    value={miniFormData.title}
                    onChange={(e) => setMiniFormData({ ...miniFormData, title: e.target.value })}
                    className="py-2 rounded-3"
                  />
                  <Form.Text className="text-muted small">
                    Để trống nếu muốn hệ thống tự đặt tên tự động.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Chủ đề (Topic)</Form.Label>
                  <Form.Select
                    value={miniFormData.topic}
                    onChange={(e) => setMiniFormData({ ...miniFormData, topic: e.target.value })}
                    className="py-2 rounded-3"
                  >
                    <option value="">-- Tất cả chủ đề --</option>
                    {topicsList.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Kỹ năng (Skill)</Form.Label>
                  <Form.Select
                    value={miniFormData.skill}
                    onChange={(e) => setMiniFormData({ ...miniFormData, skill: e.target.value })}
                    className="py-2 rounded-3"
                  >
                    <option value="">-- Tất cả kỹ năng --</option>
                    {skillsList.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Cấp độ (Level)</Form.Label>
                  <Form.Select
                    value={miniFormData.level}
                    onChange={(e) => setMiniFormData({ ...miniFormData, level: e.target.value })}
                    className="py-2 rounded-3"
                  >
                    <option value="Mixed">Hỗn hợp (Mixed)</option>
                    <option value="A1">A1 - Sơ cấp</option>
                    <option value="A2">A2 - Cơ bản</option>
                    <option value="B1">B1 - Trung cấp</option>
                    <option value="B2">B2 - Khá</option>
                    <option value="C1">C1 - Nâng cao</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Số lượng câu hỏi</Form.Label>
                  <Form.Select
                    value={miniFormData.questionCount}
                    onChange={(e) => setMiniFormData({ ...miniFormData, questionCount: Number(e.target.value) })}
                    className="py-2 rounded-3"
                  >
                    <option value={5}>5 câu hỏi (Siêu nhanh)</option>
                    <option value={10}>10 câu hỏi (Tiêu chuẩn)</option>
                    <option value={15}>15 câu hỏi (Thử thách)</option>
                    <option value={20}>20 câu hỏi (Đầy đủ)</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Thời gian làm bài</Form.Label>
                  <Form.Select
                    value={miniFormData.duration}
                    onChange={(e) => setMiniFormData({ ...miniFormData, duration: Number(e.target.value) })}
                    className="py-2 rounded-3"
                  >
                    <option value={5}>5 phút</option>
                    <option value={10}>10 phút</option>
                    <option value={15}>15 phút</option>
                    <option value={20}>20 phút</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
              <Button
                variant="light"
                className="rounded-pill px-4"
                disabled={isGeneratingMini}
                onClick={() => setShowCreateMiniModal(false)}
              >
                Hủy
              </Button>
              <Button
                variant="warning"
                type="submit"
                disabled={isGeneratingMini}
                className="rounded-pill px-4 fw-bold text-dark shadow-sm d-inline-flex align-items-center gap-2"
                style={{ background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)", color: "#ffffff", border: "none" }}
              >
                {isGeneratingMini ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    <span>Đang Tạo & Tải Đề...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} color="#ffffff" />
                    <span style={{ color: "#ffffff" }}>Tạo & Bắt Đầu Ngay</span>
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Quiz;
