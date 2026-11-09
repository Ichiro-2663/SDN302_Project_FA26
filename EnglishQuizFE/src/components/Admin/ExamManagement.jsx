import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge, Row, Col, InputGroup, Card, Tabs, Tab } from "react-bootstrap";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaRandom, FaCheckSquare, FaClock } from "react-icons/fa";
import axiosClient from "../../api/axiosClient";

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [topicsList, setTopicsList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form mode
  const [creationMode, setCreationMode] = useState("matrix"); // "matrix" | "manual"

  // Matrix generation state
  const [matrixData, setMatrixData] = useState({
    title: "",
    duration: 30,
    type: "quiz",
    level: "Mixed",
    topic: "",
    skill: "",
    easyCount: 5,
    mediumCount: 3,
    hardCount: 2,
  });

  // Manual generation state
  const [manualData, setManualData] = useState({
    title: "",
    duration: 30,
    type: "quiz",
    level: "Mixed",
    topic: "",
    selectedQuestions: [],
  });

  const [manualSearch, setManualSearch] = useState("");
  const [manualLevelFilter, setManualLevelFilter] = useState("All");

  useEffect(() => {
    fetchExams();
    fetchMetadata();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/exams");
      setExams(res.data || []);
    } catch (err) {
      console.error("Exams fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [qRes, tRes, sRes] = await Promise.allSettled([
        axiosClient.get("/questions"),
        axiosClient.get("/topics"),
        axiosClient.get("/skills"),
      ]);
      if (qRes.status === "fulfilled") setQuestionsList(qRes.value.data || []);
      if (tRes.status === "fulfilled") setTopicsList(tRes.value.data || []);
      if (sRes.status === "fulfilled") setSkillsList(sRes.value.data || []);
    } catch (err) {
      console.error("Metadata load error:", err);
    }
  };

  const handleShow = (exam = null) => {
    if (exam) {
      setEditingId(exam._id);
      setCreationMode("manual");
      setManualData({
        title: exam.title || "",
        duration: exam.duration || 30,
        type: exam.type || "quiz",
        level: exam.level || "Mixed",
        topic: exam.topic?._id || exam.topic || "",
        selectedQuestions: exam.questions ? exam.questions.map((q) => (typeof q === "object" ? q._id : q)) : [],
      });
    } else {
      setEditingId(null);
      setCreationMode("matrix");
      setMatrixData({
        title: "",
        duration: 30,
        type: "quiz",
        level: "Mixed",
        topic: topicsList[0]?._id || "",
        skill: "",
        easyCount: 5,
        mediumCount: 3,
        hardCount: 2,
      });
      setManualData({
        title: "",
        duration: 30,
        type: "quiz",
        level: "Mixed",
        topic: topicsList[0]?._id || "",
        selectedQuestions: [],
      });
    }
    setShowModal(true);
  };

  const handleMatrixSubmit = async (e) => {
    e.preventDefault();
    if (!matrixData.title) return;

    try {
      await axiosClient.post("/exams/matrix/generate", {
        title: matrixData.title,
        duration: Number(matrixData.duration),
        type: matrixData.type,
        level: matrixData.level,
        topic: matrixData.topic || undefined,
        skill: matrixData.skill || undefined,
        easyCount: Number(matrixData.easyCount),
        mediumCount: Number(matrixData.mediumCount),
        hardCount: Number(matrixData.hardCount),
      });

      setShowModal(false);
      fetchExams();
    } catch (err) {
      console.error("Matrix generate error:", err);
      alert("Lỗi tạo đề thi ma trận: " + (err.response?.data?.message || err.message));
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualData.title) return;
    if (manualData.selectedQuestions.length === 0) {
      alert("Vui lòng chọn ít nhất 1 câu hỏi cho đề thi!");
      return;
    }

    const payload = {
      title: manualData.title,
      duration: Number(manualData.duration),
      type: manualData.type,
      level: manualData.level,
      topic: manualData.topic || undefined,
      questions: manualData.selectedQuestions,
    };

    try {
      if (editingId) {
        await axiosClient.put(`/exams/${editingId}`, payload);
      } else {
        await axiosClient.post("/exams", payload);
      }
      setShowModal(false);
      fetchExams();
    } catch (err) {
      console.error("Save exam error:", err);
      alert("Lỗi lưu đề thi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bộ đề thi này?")) return;
    try {
      await axiosClient.delete(`/exams/${id}`);
      fetchExams();
    } catch (err) {
      console.error("Delete exam error:", err);
    }
  };

  const toggleSelectQuestion = (qId) => {
    const list = manualData.selectedQuestions;
    if (list.includes(qId)) {
      setManualData({ ...manualData, selectedQuestions: list.filter((id) => id !== qId) });
    } else {
      setManualData({ ...manualData, selectedQuestions: [...list, qId] });
    }
  };

  // Filter for manual selection list
  const filteredQuestions = questionsList.filter((q) => {
    if (manualSearch && !q.content.toLowerCase().includes(manualSearch.toLowerCase())) {
      return false;
    }
    if (manualLevelFilter !== "All" && q.level?.toLowerCase() !== manualLevelFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-100">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Quản Lý Đề Thi (Exam Management)</h4>
          <p className="text-muted small mb-0">
            Biên soạn và cấu hình đề thi tự động theo ma trận độ khó hoặc lựa chọn thủ công
          </p>
        </div>

        <Button
          variant="warning"
          size="sm"
          className="rounded-pill fw-bold text-dark d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
          onClick={() => handleShow(null)}
        >
          <FaPlus /> Soạn Đề Thi Mới
        </Button>
      </div>

      {/* Exam Table */}
      <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status" />
            <p className="mt-2 text-muted">Đang tải danh sách đề thi...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-5 text-muted small">Chưa có đề thi nào được tạo.</div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr className="text-muted small">
                  <th style={{ width: "40px" }}>#</th>
                  <th>Tiêu Đề Đề Thi</th>
                  <th>Phân Loại</th>
                  <th>Thời Lượng</th>
                  <th>Cấp Độ</th>
                  <th>Số Câu Hỏi</th>
                  <th>Chủ Đề</th>
                  <th className="text-end" style={{ width: "120px" }}>
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam, idx) => (
                  <tr key={exam._id}>
                    <td className="text-muted small">{idx + 1}</td>
                    <td className="fw-bold text-dark">{exam.title}</td>
                    <td>
                      <Badge bg="light" text="dark" className="border text-capitalize">
                        {exam.type || "quiz"}
                      </Badge>
                    </td>
                    <td className="small text-muted">
                      <FaClock size={11} className="me-1 text-warning" />
                      {exam.duration || 30} phút
                    </td>
                    <td>
                      <Badge bg="warning" text="dark" pill>
                        {exam.level || "Mixed"}
                      </Badge>
                    </td>
                    <td className="fw-semibold text-dark">
                      {exam.questions?.length || 0} câu
                    </td>
                    <td className="small text-secondary">{exam.topic?.name || "-"}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="rounded-circle p-2"
                          title="Sửa đề thi"
                          onClick={() => handleShow(exam)}
                        >
                          <FaEdit size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="rounded-circle p-2"
                          title="Xóa đề thi"
                          onClick={() => handleDelete(exam._id)}
                        >
                          <FaTrash size={12} />
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

      {/* Modal Create / Edit Exam */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">
            {editingId ? "Chỉnh Sửa Đề Thi" : "Tạo Đề Thi Mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!editingId ? (
            <Tabs
              activeKey={creationMode}
              onSelect={(k) => setCreationMode(k)}
              className="mb-3"
            >
              <Tab
                eventKey="matrix"
                title={
                  <span className="d-flex align-items-center gap-2">
                    <FaRandom /> Ma Trận Tự Động (Auto-Matrix)
                  </span>
                }
              >
                <Form onSubmit={handleMatrixSubmit} className="d-flex flex-column gap-3 mt-3">
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-muted">Tên đề thi</Form.Label>
                    <Form.Control
                      placeholder="Ví dụ: Đề Thi Thử TOEIC Full Test 01"
                      value={matrixData.title}
                      onChange={(e) => setMatrixData({ ...matrixData, title: e.target.value })}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-muted">Thời lượng (Phút)</Form.Label>
                        <Form.Control
                          type="number"
                          value={matrixData.duration}
                          onChange={(e) => setMatrixData({ ...matrixData, duration: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-muted">Phân loại</Form.Label>
                        <Form.Select
                          value={matrixData.type}
                          onChange={(e) => setMatrixData({ ...matrixData, type: e.target.value })}
                        >
                          <option value="quiz">Thi thử chuẩn (Quiz)</option>
                          <option value="minitest">Mini Test ngắn</option>
                          <option value="practice">Bài luyện tập</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-muted">Chủ đề</Form.Label>
                        <Form.Select
                          value={matrixData.topic}
                          onChange={(e) => setMatrixData({ ...matrixData, topic: e.target.value })}
                        >
                          <option value="">Tất cả chủ đề</option>
                          {topicsList.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-muted">Kỹ năng</Form.Label>
                        <Form.Select
                          value={matrixData.skill}
                          onChange={(e) => setMatrixData({ ...matrixData, skill: e.target.value })}
                        >
                          <option value="">Tất cả kỹ năng</option>
                          {skillsList.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="p-3 bg-light rounded-3 border">
                    <Form.Label className="small fw-bold text-dark mb-2">
                      Phân bổ ma trận câu hỏi theo độ khó:
                    </Form.Label>
                    <Row className="g-3">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="small text-muted">Dễ (A1, A2, Easy)</Form.Label>
                          <Form.Control
                            type="number"
                            min="0"
                            value={matrixData.easyCount}
                            onChange={(e) => setMatrixData({ ...matrixData, easyCount: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="small text-muted">Trung bình (B1, B2, Medium)</Form.Label>
                          <Form.Control
                            type="number"
                            min="0"
                            value={matrixData.mediumCount}
                            onChange={(e) => setMatrixData({ ...matrixData, mediumCount: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="small text-muted">Khó (C1, C2, Hard)</Form.Label>
                          <Form.Control
                            type="number"
                            min="0"
                            value={matrixData.hardCount}
                            onChange={(e) => setMatrixData({ ...matrixData, hardCount: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="small text-muted mt-2">
                      Tổng số câu dự kiến:{" "}
                      <strong>
                        {Number(matrixData.easyCount) +
                          Number(matrixData.mediumCount) +
                          Number(matrixData.hardCount)}
                      </strong>{" "}
                      câu hỏi
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-2">
                    <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                      Hủy
                    </Button>
                    <Button variant="warning" size="sm" type="submit" className="fw-bold text-dark">
                      Sinh Đề Thi Tự Động
                    </Button>
                  </div>
                </Form>
              </Tab>

              <Tab
                eventKey="manual"
                title={
                  <span className="d-flex align-items-center gap-2">
                    <FaCheckSquare /> Chọn Thủ Công (Manual Pick)
                  </span>
                }
              >
                <Form onSubmit={handleManualSubmit} className="d-flex flex-column gap-3 mt-3">
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-muted">Tên đề thi</Form.Label>
                    <Form.Control
                      placeholder="Ví dụ: Đề Thi Chọn Lọc Kỹ Năng Nghe"
                      value={manualData.title}
                      onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-muted">Thời lượng (Phút)</Form.Label>
                        <Form.Control
                          type="number"
                          value={manualData.duration}
                          onChange={(e) => setManualData({ ...manualData, duration: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-muted">Phân loại</Form.Label>
                        <Form.Select
                          value={manualData.type}
                          onChange={(e) => setManualData({ ...manualData, type: e.target.value })}
                        >
                          <option value="quiz">Thi thử chuẩn (Quiz)</option>
                          <option value="minitest">Mini Test</option>
                          <option value="practice">Luyện tập</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                      <Form.Label className="small fw-bold text-dark m-0">
                        Chọn câu hỏi từ ngân hàng (Đã chọn: {manualData.selectedQuestions.length} câu)
                      </Form.Label>
                      <div className="d-flex gap-2">
                        <InputGroup size="sm" style={{ width: "180px" }}>
                          <InputGroup.Text className="bg-light border-end-0">
                            <FaSearch size={11} className="text-muted" />
                          </InputGroup.Text>
                          <Form.Control
                            placeholder="Lọc từ khóa..."
                            className="border-start-0"
                            value={manualSearch}
                            onChange={(e) => setManualSearch(e.target.value)}
                          />
                        </InputGroup>
                        <Form.Select
                          size="sm"
                          value={manualLevelFilter}
                          onChange={(e) => setManualLevelFilter(e.target.value)}
                          style={{ width: "100px" }}
                        >
                          <option value="All">Cấp độ</option>
                          <option value="A1">A1</option>
                          <option value="A2">A2</option>
                          <option value="B1">B1</option>
                          <option value="B2">B2</option>
                          <option value="C1">C1</option>
                          <option value="C2">C2</option>
                        </Form.Select>
                      </div>
                    </div>

                    <div
                      className="border rounded-3 p-2 bg-light d-flex flex-column gap-2"
                      style={{ maxHeight: "250px", overflowY: "auto" }}
                    >
                      {filteredQuestions.map((q) => {
                        const isChecked = manualData.selectedQuestions.includes(q._id);
                        return (
                          <div
                            key={q._id}
                            className={`p-2 rounded-2 border small bg-white d-flex align-items-center gap-2 cursor-pointer ${
                              isChecked ? "border-warning bg-warning bg-opacity-10" : ""
                            }`}
                            onClick={() => toggleSelectQuestion(q._id)}
                            style={{ cursor: "pointer" }}
                          >
                            <Form.Check
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // handled by parent onClick
                            />
                            <Badge bg="secondary" pill style={{ fontSize: "10px" }}>
                              {q.level}
                            </Badge>
                            <span className="text-truncate flex-grow-1">{q.content}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-2">
                    <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                      Hủy
                    </Button>
                    <Button variant="warning" size="sm" type="submit" className="fw-bold text-dark">
                      Lưu Đề Thi
                    </Button>
                  </div>
                </Form>
              </Tab>
            </Tabs>
          ) : (
            /* Editing existing exam */
            <Form onSubmit={handleManualSubmit} className="d-flex flex-column gap-3">
              <Form.Group>
                <Form.Label className="small fw-semibold text-muted">Tên đề thi</Form.Label>
                <Form.Control
                  value={manualData.title}
                  onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-muted">Thời lượng (Phút)</Form.Label>
                    <Form.Control
                      type="number"
                      value={manualData.duration}
                      onChange={(e) => setManualData({ ...manualData, duration: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-muted">Phân loại</Form.Label>
                    <Form.Select
                      value={manualData.type}
                      onChange={(e) => setManualData({ ...manualData, type: e.target.value })}
                    >
                      <option value="quiz">Thi thử chuẩn (Quiz)</option>
                      <option value="minitest">Mini Test</option>
                      <option value="practice">Luyện tập</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-2">
                <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                  Hủy
                </Button>
                <Button variant="warning" size="sm" type="submit" className="fw-bold text-dark">
                  Cập Nhật Đề Thi
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ExamManagement;
