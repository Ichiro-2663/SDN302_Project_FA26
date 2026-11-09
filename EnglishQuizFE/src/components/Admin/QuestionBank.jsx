import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Row,
  Col,
  Pagination,
  Card,
  InputGroup,
} from "react-bootstrap";
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axiosClient from "../../api/axiosClient";

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: "",
    level: "All",
    topic: "All",
    skill: "All",
    questionType: "All",
  });

  const [formData, setFormData] = useState({
    content: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswer: "0",
    level: "B1",
    questionType: "MultipleChoice",
    topic: "",
    skill: "",
    certificate: "",
    pair1Left: "",
    pair1Right: "",
    pair2Left: "",
    pair2Right: "",
    pair3Left: "",
    pair3Right: "",
    passage: "",
    audioUrl: "",
    explanation: "",
  });

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2", "easy", "medium", "hard"];
  const questionTypes = ["MultipleChoice", "FillInBlank", "TrueFalse", "Matching"];

  useEffect(() => {
    fetchQuestions();
    fetchMetadata();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/questions");
      setQuestions(res.data || []);
    } catch (err) {
      console.error("Questions fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [tRes, sRes, cRes] = await Promise.allSettled([
        axiosClient.get("/topics"),
        axiosClient.get("/skills"),
        axiosClient.get("/certificates"),
      ]);
      if (tRes.status === "fulfilled") setTopics(tRes.value.data || []);
      if (sRes.status === "fulfilled") setSkills(sRes.value.data || []);
      if (cRes.status === "fulfilled") setCertificates(cRes.value.data || []);
    } catch (err) {
      console.error("Metadata load error:", err);
    }
  };

  const handleShow = (q = null) => {
    if (q) {
      setEditingId(q._id);
      setFormData({
        content: q.content || "",
        option1: q.options?.[0] || "",
        option2: q.options?.[1] || "",
        option3: q.options?.[2] || "",
        option4: q.options?.[3] || "",
        correctAnswer: q.correctAnswer !== undefined ? String(q.correctAnswer) : "0",
        level: q.level || "B1",
        questionType: q.questionType || "MultipleChoice",
        topic: q.topic?._id || q.topic || "",
        skill: q.skill?._id || q.skill || "",
        certificate: q.certificate?._id || q.certificate || "",
        pair1Left: q.matchingPairs?.[0]?.left || "",
        pair1Right: q.matchingPairs?.[0]?.right || "",
        pair2Left: q.matchingPairs?.[1]?.left || "",
        pair2Right: q.matchingPairs?.[1]?.right || "",
        pair3Left: q.matchingPairs?.[2]?.left || "",
        pair3Right: q.matchingPairs?.[2]?.right || "",
        passage: q.passage || "",
        audioUrl: q.audioUrl || "",
        explanation: q.explanation || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        content: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctAnswer: "0",
        level: "B1",
        questionType: "MultipleChoice",
        topic: topics[0]?._id || "",
        skill: skills[0]?._id || "",
        certificate: certificates[0]?._id || "",
        pair1Left: "",
        pair1Right: "",
        pair2Left: "",
        pair2Right: "",
        pair3Left: "",
        pair3Right: "",
        passage: "",
        audioUrl: "",
        explanation: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const options = [formData.option1, formData.option2, formData.option3, formData.option4].filter(
      (opt) => opt.trim() !== ""
    );

    const matchingPairs = [];
    if (formData.pair1Left && formData.pair1Right) {
      matchingPairs.push({ left: formData.pair1Left, right: formData.pair1Right });
    }
    if (formData.pair2Left && formData.pair2Right) {
      matchingPairs.push({ left: formData.pair2Left, right: formData.pair2Right });
    }
    if (formData.pair3Left && formData.pair3Right) {
      matchingPairs.push({ left: formData.pair3Left, right: formData.pair3Right });
    }

    const payload = {
      content: formData.content,
      level: formData.level,
      questionType: formData.questionType,
      options: formData.questionType === "MultipleChoice" ? options : [],
      matchingPairs: formData.questionType === "Matching" ? matchingPairs : [],
      correctAnswer:
        formData.questionType === "MultipleChoice"
          ? Number(formData.correctAnswer)
          : formData.correctAnswer,
      topic: formData.topic || undefined,
      skill: formData.skill || undefined,
      certificate: formData.certificate || undefined,
      passage: formData.passage || undefined,
      audioUrl: formData.audioUrl || undefined,
      explanation: formData.explanation || undefined,
    };

    try {
      if (editingId) {
        await axiosClient.put(`/questions/${editingId}`, payload);
      } else {
        await axiosClient.post("/questions", payload);
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      console.error("Save question error:", err);
      alert("Lỗi lưu câu hỏi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng đề?")) return;
    try {
      await axiosClient.delete(`/questions/${id}`);
      fetchQuestions();
    } catch (err) {
      console.error("Delete question error:", err);
    }
  };

  // Filter questions
  const filtered = questions.filter((q) => {
    if (
      filters.search &&
      !q.content.toLowerCase().includes(filters.search.toLowerCase()) &&
      !(q.explanation || "").toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.level !== "All" && q.level?.toLowerCase() !== filters.level.toLowerCase()) {
      return false;
    }
    if (filters.topic !== "All" && (q.topic?._id || q.topic) !== filters.topic) {
      return false;
    }
    if (filters.skill !== "All" && (q.skill?._id || q.skill) !== filters.skill) {
      return false;
    }
    if (filters.questionType !== "All" && q.questionType !== filters.questionType) {
      return false;
    }
    return true;
  });

  // Pagination slice
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="w-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Ngân Hàng Câu Hỏi (Question Bank)</h4>
          <p className="text-muted small mb-0">
            Quản trị và biên soạn các câu hỏi trắc nghiệm, điền từ, đúng/sai và nối từ
          </p>
        </div>

        <Button
          variant="warning"
          size="sm"
          className="rounded-pill fw-bold text-dark d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
          onClick={() => handleShow(null)}
        >
          <FaPlus /> Thêm Câu Hỏi Mới
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <Row className="g-2">
          <Col md={3}>
            <InputGroup size="sm">
              <InputGroup.Text className="bg-light border-end-0">
                <FaSearch className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Tìm nội dung câu hỏi..."
                className="border-start-0"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </InputGroup>
          </Col>

          <Col md={2}>
            <Form.Select
              size="sm"
              value={filters.level}
              onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            >
              <option value="All">Cấp độ: Tất cả</option>
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Select
              size="sm"
              value={filters.questionType}
              onChange={(e) => setFilters({ ...filters, questionType: e.target.value })}
            >
              <option value="All">Dạng: Tất cả</option>
              {questionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Select
              size="sm"
              value={filters.topic}
              onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
            >
              <option value="All">Chủ đề: Tất cả</option>
              {topics.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={3} className="text-md-end pt-1">
            <span className="small text-muted">
              Tổng số: <strong>{filtered.length}</strong> / {questions.length} câu hỏi
            </span>
          </Col>
        </Row>
      </Card>

      {/* Question Table */}
      <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status" />
            <p className="mt-2 text-muted">Đang tải ngân hàng câu hỏi...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-5 text-muted small">
            Không tìm thấy câu hỏi phù hợp với bộ lọc tìm kiếm.
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr className="text-muted small">
                  <th style={{ width: "40px" }}>#</th>
                  <th>Nội Dung Câu Hỏi</th>
                  <th>Dạng</th>
                  <th>Cấp Độ</th>
                  <th>Chủ Đề</th>
                  <th>Đáp Án Đúng</th>
                  <th className="text-end" style={{ width: "120px" }}>
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((q, idx) => {
                  return (
                    <tr key={q._id}>
                      <td className="text-muted small">{indexOfFirst + idx + 1}</td>
                      <td>
                        <strong className="text-dark d-block text-truncate" style={{ maxWidth: "320px" }}>
                          {q.content}
                        </strong>
                        {q.explanation && (
                          <span className="text-muted" style={{ fontSize: "11px" }}>
                            Giải thích: {q.explanation.substring(0, 50)}...
                          </span>
                        )}
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="border">
                          {q.questionType}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="warning" text="dark" pill>
                          {q.level}
                        </Badge>
                      </td>
                      <td className="small text-secondary">{q.topic?.name || "-"}</td>
                      <td className="small fw-semibold text-success">
                        {q.questionType === "MultipleChoice" && q.options
                          ? `${String.fromCharCode(65 + Number(q.correctAnswer))}. ${
                              q.options[q.correctAnswer] || q.correctAnswer
                            }`
                          : String(q.correctAnswer)}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="rounded-circle p-2"
                            title="Sửa câu hỏi"
                            onClick={() => handleShow(q)}
                          >
                            <FaEdit size={12} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="rounded-circle p-2"
                            title="Xóa câu hỏi"
                            onClick={() => handleDelete(q._id)}
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
            <span className="small text-muted">
              Trang {currentPage} / {totalPages}
            </span>
            <Pagination size="sm" className="mb-0">
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              />
            </Pagination>
          </div>
        )}
      </Card>

      {/* Modal Add / Edit Question */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">
            {editingId ? "Chỉnh Sửa Câu Hỏi" : "Soạn Câu Hỏi Mới"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="d-flex flex-column gap-3">
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Dạng câu hỏi</Form.Label>
                  <Form.Select
                    value={formData.questionType}
                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                  >
                    {questionTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Cấp độ (Level)</Form.Label>
                  <Form.Select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    {levels.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Chủ đề</Form.Label>
                  <Form.Select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  >
                    <option value="">-- Chọn chủ đề --</option>
                    {topics.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Kỹ năng</Form.Label>
                  <Form.Select
                    value={formData.skill}
                    onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                  >
                    <option value="">-- Chọn kỹ năng --</option>
                    {skills.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Chứng chỉ</Form.Label>
                  <Form.Select
                    value={formData.certificate}
                    onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                  >
                    <option value="">-- Chọn chứng chỉ --</option>
                    {certificates.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group>
              <Form.Label className="small fw-semibold text-muted">Đoạn văn đọc hiểu (Passage - Tùy chọn)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Nội dung đoạn văn đọc hiểu nếu có..."
                value={formData.passage}
                onChange={(e) => setFormData({ ...formData, passage: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="small fw-semibold text-muted">Nội dung câu hỏi</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Nhập nội dung câu hỏi..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </Form.Group>

            {/* DYNAMIC FIELDS: Multiple Choice */}
            {formData.questionType === "MultipleChoice" && (
              <div className="p-3 bg-light rounded-3 border">
                <Form.Label className="small fw-bold text-dark mb-2">4 Lựa chọn trắc nghiệm:</Form.Label>
                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <Form.Control
                      placeholder="Lựa chọn A"
                      value={formData.option1}
                      onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      placeholder="Lựa chọn B"
                      value={formData.option2}
                      onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      placeholder="Lựa chọn C"
                      value={formData.option3}
                      onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      placeholder="Lựa chọn D"
                      value={formData.option4}
                      onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
                    />
                  </Col>
                </Row>

                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Đáp án đúng:</Form.Label>
                  <Form.Select
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  >
                    <option value="0">A - {formData.option1 || "Lựa chọn A"}</option>
                    <option value="1">B - {formData.option2 || "Lựa chọn B"}</option>
                    <option value="2">C - {formData.option3 || "Lựa chọn C"}</option>
                    <option value="3">D - {formData.option4 || "Lựa chọn D"}</option>
                  </Form.Select>
                </Form.Group>
              </div>
            )}

            {/* True/False */}
            {formData.questionType === "TrueFalse" && (
              <Form.Group className="p-3 bg-light rounded-3 border">
                <Form.Label className="small fw-bold text-dark">Đáp án đúng:</Form.Label>
                <Form.Select
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                >
                  <option value="True">True (Đúng)</option>
                  <option value="False">False (Sai)</option>
                </Form.Select>
              </Form.Group>
            )}

            {/* Fill in Blank */}
            {formData.questionType === "FillInBlank" && (
              <Form.Group className="p-3 bg-light rounded-3 border">
                <Form.Label className="small fw-bold text-dark">Từ/Cụm từ đáp án chính xác:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ví dụ: went hoặc had been"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  required
                />
              </Form.Group>
            )}

            {/* Matching */}
            {formData.questionType === "Matching" && (
              <div className="p-3 bg-light rounded-3 border">
                <Form.Label className="small fw-bold text-dark mb-2">Các cặp tương ứng:</Form.Label>
                <Row className="g-2 mb-2">
                  <Col md={6}>
                    <Form.Control
                      placeholder="Cột trái 1 (Ví dụ: Apple)"
                      value={formData.pair1Left}
                      onChange={(e) => setFormData({ ...formData, pair1Left: e.target.value })}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      placeholder="Cột phải 1 (Ví dụ: Quả táo)"
                      value={formData.pair1Right}
                      onChange={(e) => setFormData({ ...formData, pair1Right: e.target.value })}
                    />
                  </Col>
                </Row>
                <Row className="g-2 mb-2">
                  <Col md={6}>
                    <Form.Control
                      placeholder="Cột trái 2 (Ví dụ: Book)"
                      value={formData.pair2Left}
                      onChange={(e) => setFormData({ ...formData, pair2Left: e.target.value })}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      placeholder="Cột phải 2 (Ví dụ: Quyển sách)"
                      value={formData.pair2Right}
                      onChange={(e) => setFormData({ ...formData, pair2Right: e.target.value })}
                    />
                  </Col>
                </Row>
                <Row className="g-2">
                  <Col md={6}>
                    <Form.Control
                      placeholder="Cột trái 3 (Ví dụ: School)"
                      value={formData.pair3Left}
                      onChange={(e) => setFormData({ ...formData, pair3Left: e.target.value })}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      placeholder="Cột phải 3 (Ví dụ: Trường học)"
                      value={formData.pair3Right}
                      onChange={(e) => setFormData({ ...formData, pair3Right: e.target.value })}
                    />
                  </Col>
                </Row>
              </div>
            )}

            <Form.Group>
              <Form.Label className="small fw-semibold text-muted">Giải thích chi tiết (Explanation)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Giải thích ngữ pháp hoặc từ vựng chi tiết sau khi học sinh nộp bài..."
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="warning" size="sm" type="submit" className="fw-bold text-dark">
              {editingId ? "Cập Nhật Câu Hỏi" : "Tạo Câu Hỏi Mới"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionBank;
