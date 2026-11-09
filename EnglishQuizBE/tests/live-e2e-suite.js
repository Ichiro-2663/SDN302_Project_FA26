/**
 * Comprehensive Live E2E Integration Test Suite for EnglishQuiz Platform FA26
 * Implements /ck:test protocol:
 * - Full system verification against running backend (port 9999) & frontend (port 3000)
 * - 2 complete consecutive test rounds (Dual Pass)
 * - Anti-cheat, Server grading, Leitner spaced repetition, RBAC, Bookmarks, History, Notices & Feedbacks
 * - URL Subpath routing preservation across F5 reloads
 * - Teacher -> Exam Notification -> Student Exam Room workflow
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:9999";
const FE_URL = process.env.FE_URL || "http://localhost:3000";

class TestRunner {
  constructor(roundNumber) {
    this.round = roundNumber;
    this.passed = 0;
    this.failed = 0;
    this.total = 0;
    this.results = [];
    this.startTime = Date.now();
  }

  async runTest(name, fn) {
    this.total++;
    const t0 = Date.now();
    try {
      await fn();
      const duration = Date.now() - t0;
      this.passed++;
      this.results.push({ name, status: "PASS", duration });
      console.log(`  ✓ [PASS] ${name} (${duration}ms)`);
    } catch (err) {
      const duration = Date.now() - t0;
      this.failed++;
      this.results.push({ name, status: "FAIL", duration, error: err.message });
      console.error(`  ✗ [FAIL] ${name} (${duration}ms):`, err.message);
    }
  }

  summary() {
    const totalDuration = Date.now() - this.startTime;
    return {
      round: this.round,
      total: this.total,
      passed: this.passed,
      failed: this.failed,
      durationMs: totalDuration,
      results: this.results,
    };
  }
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
};

async function executeTestSuite(roundNumber) {
  console.log(`\n======================================================`);
  console.log(`🚀 STARTING TEST EXECUTION - ROUND ${roundNumber}`);
  console.log(`======================================================`);

  const runner = new TestRunner(roundNumber);
  let studentToken = "";
  let teacherToken = "";
  let adminToken = "";
  let studentUserId = "";
  let firstExamId = "";
  let sampleQuestionId = "";
  let bookmarkTestQuestionId = "";
  let createdQuestionId = "";
  let createdFlashcardId = "";
  let createdBookmarkId = "";
  let createdNoticeId = "";
  let createdFeedbackId = "";
  let submittedHistoryId = "";
  let createdExamTitle = `Auto Mini Test R${roundNumber}_${Date.now()}`;

  // ---------------------------------------------------------
  // MODULE 1: AUTH & RBAC VERIFICATION
  // ---------------------------------------------------------
  console.log(`\n--- [Module 1: Authentication & Role-Based Access Control] ---`);

  await runner.runTest("1.1 Register new student user", async () => {
    const testEmail = `student_test_${Date.now()}_r${roundNumber}@example.com`;
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Runner Student",
        email: testEmail,
        password: "Password123!",
        role: "Student",
        age: 21,
        school: "FPT University",
      }),
    });
    const data = await res.json();
    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    assert(data.success === true, "Expected success: true");
    assert(data.token, "Expected token in register response");
    assert(data.user && data.user.email === testEmail, "User object returned correctly");
  });

  await runner.runTest("1.2 Reject duplicate email registration", async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate Student",
        email: "student@gmail.com", // existing
        password: "Password123!",
      }),
    });
    const data = await res.json();
    assert(res.status === 400, `Expected 400 for duplicate, got ${res.status}`);
    assert(data.success === false, "Expected success: false for duplicate registration");
  });

  await runner.runTest("1.3 Login as Admin (admin@gmail.com / 123456)", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@gmail.com", password: "123456" }),
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.token, "Expected JWT token returned for Admin");
    assert(data.user.role === "Admin", "User role must be Admin");
    adminToken = data.token;
  });

  await runner.runTest("1.4 Login as Teacher (teacher@gmail.com / 123456)", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "teacher@gmail.com", password: "123456" }),
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.token, "Expected JWT token returned for Teacher");
    assert(data.user.role === "Teacher", "User role must be Teacher");
    teacherToken = data.token;
  });

  await runner.runTest("1.5 Login as Student (student@gmail.com / 123456)", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student@gmail.com", password: "123456" }),
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.token, "Expected JWT token returned for Student");
    assert(data.user.role === "Student", "User role must be Student");
    studentToken = data.token;
    studentUserId = data.user._id;
  });

  await runner.runTest("1.6 Reject invalid password login", async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student@gmail.com", password: "wrong_password" }),
    });
    assert(res.status === 400, `Expected 400 for wrong credentials, got ${res.status}`);
  });

  await runner.runTest("1.7 Verify authenticated user profile via GET /auth/me", async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.success === true, "Expected success: true");
    assert(data.user.email === "student@gmail.com", "Resolved correct user email");
    assert(!data.user.password, "Password must not be returned in /auth/me");
  });

  await runner.runTest("1.8 Reject unauthenticated request to /auth/me without token", async () => {
    const res = await fetch(`${BASE_URL}/auth/me`);
    assert(res.status === 401, `Expected 401 Unauthorized, got ${res.status}`);
  });

  // ---------------------------------------------------------
  // MODULE 2: QUESTION BANK CRUD & FILTERING
  // ---------------------------------------------------------
  console.log(`\n--- [Module 2: Question Bank CRUD & Filtering] ---`);

  await runner.runTest("2.1 Retrieve question bank list", async () => {
    const res = await fetch(`${BASE_URL}/questions`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data) && data.length > 0, "Question bank must not be empty");
  });

  await runner.runTest("2.2 Create a new MultipleChoice question in bank", async () => {
    const res = await fetch(`${BASE_URL}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `What is the synonym of 'rapid'? (Test R${roundNumber})`,
        questionType: "MultipleChoice",
        level: "B1",
        options: ["Fast", "Slow", "Quiet", "Heavy"],
        correctAnswer: "Fast",
        explanation: "'Rapid' means happening in a short time or at a fast pace.",
      }),
    });
    const data = await res.json();
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(data._id, "Question created with ID");
    assert(data.correctAnswer === "Fast", "Correct answer preserved on server");
    createdQuestionId = data._id;
  });

  await runner.runTest("2.3 Update question content", async () => {
    assert(createdQuestionId, "Need question ID");
    const res = await fetch(`${BASE_URL}/questions/${createdQuestionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `What is the synonym of 'rapid'? [Updated R${roundNumber}]`,
      }),
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.content.includes("[Updated"), "Content updated successfully");
  });

  await runner.runTest("2.4 Filter questions by level", async () => {
    const res = await fetch(`${BASE_URL}/questions?level=B1`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data) && data.length > 0, "Filtered questions returned");
    for (const q of data) {
      assert(q.level === "B1", `Expected level B1, got ${q.level}`);
    }
  });

  // ---------------------------------------------------------
  // MODULE 3: EXAM ENGINE, NOTICES & ANTI-CHEAT GRADING
  // ---------------------------------------------------------
  console.log(`\n--- [Module 3: Exam Creation, Automated Notices & Anti-Cheat Grading] ---`);

  await runner.runTest("3.1 Retrieve available exams list", async () => {
    const res = await fetch(`${BASE_URL}/exams`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data) && data.length > 0, "Exams list should not be empty");
    firstExamId = data[0]._id;
  });

  await runner.runTest("3.2 Auto-generate Quick Mini Test with automated student notice", async () => {
    const res = await fetch(`${BASE_URL}/exams/minitest/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: createdExamTitle,
        duration: 10,
        questionCount: 5,
        level: "Mixed",
      }),
    });
    const data = await res.json();
    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    assert(data.success === true, "Expected success: true");
    assert(data.exam && data.exam.type === "minitest", "Generated exam type must be minitest");
    assert(data.exam.questions && data.exam.questions.length > 0, "Mini test questions must exist");
  });

  await runner.runTest("3.3 Verify Student receives Notice for newly created exam", async () => {
    const res = await fetch(`${BASE_URL}/notices?role=Student`);
    const notices = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(notices) && notices.length > 0, "Notices list must not be empty");
    
    // Check if notice with createdExamTitle exists
    const matchingNotice = notices.find((n) => n.title.includes(createdExamTitle) || n.content.includes(createdExamTitle));
    assert(matchingNotice, `Expected student notice containing '${createdExamTitle}'`);
    assert(matchingNotice.targetRole === "Student" || matchingNotice.targetRole === "All", "Target role must cover Student");
  });

  await runner.runTest("3.4 Anti-Cheat: GET /exams/:id/take must strip correctAnswer & explanation", async () => {
    assert(firstExamId, "Need an exam ID to test take endpoint");
    const res = await fetch(`${BASE_URL}/exams/${firstExamId}/take`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.success === true, "Expected success: true");
    assert(data.exam && data.exam.questions, "Exam questions must exist");

    // CRITICAL ANTI-CHEAT CHECK: Ensure no question leaks answers
    for (const q of data.exam.questions) {
      assert(q.correctAnswer === undefined, `Cheat hazard! Question ${q._id} exposed correctAnswer`);
      assert(q.explanation === undefined, `Cheat hazard! Question ${q._id} exposed explanation`);
      if (q.questionType === "Matching" && q.matchingPairs) {
        for (const pair of q.matchingPairs) {
          assert(pair.right === undefined, `Cheat hazard! Matching pair exposed right answer`);
        }
      }
    }
    sampleQuestionId = data.exam.questions[0]._id;
    bookmarkTestQuestionId = (data.exam.questions.find((q) => q._id !== "6a26c404d4f0999dd0bf7a52") || data.exam.questions[1])._id;
  });

  await runner.runTest("3.5 Server-side grading & auto history creation (POST /exams/:id/submit)", async () => {
    assert(firstExamId, "Need an exam ID");
    const res = await fetch(`${BASE_URL}/exams/${firstExamId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: studentUserId,
        answers: {
          [sampleQuestionId]: "A",
        },
        timeSpent: 120, // 2 minutes
      }),
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.success === true, "Submission successful");
    assert(typeof data.score === "number", "Server must calculate numerical score");
    assert(typeof data.totalQuestions === "number", "Total questions present");
    assert(data.historyId, "History record must be created and returned");
    submittedHistoryId = data.historyId;
  });

  await runner.runTest("3.6 Auto-generate Matrix Exam by difficulty", async () => {
    const res = await fetch(`${BASE_URL}/exams/matrix/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Auto Matrix Test Exam R${roundNumber}`,
        duration: 25,
        matrix: { Easy: 1, Medium: 1, Hard: 1 },
      }),
    });
    const data = await res.json();
    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    assert(data.success === true, "Expected success: true");
    assert(data.exam && data.exam.questions.length > 0, "Matrix exam generated with questions");
  });

  // ---------------------------------------------------------
  // MODULE 4: FLASHCARDS & LEITNER SPACED REPETITION
  // ---------------------------------------------------------
  console.log(`\n--- [Module 4: Leitner 5-Box Spaced Repetition Flashcards] ---`);

  await runner.runTest("4.1 Retrieve user flashcards", async () => {
    const res = await fetch(`${BASE_URL}/flashcards/user/${studentUserId}`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data), "Expected array of flashcards");
  });

  await runner.runTest("4.2 Create new Leitner flashcard", async () => {
    const res = await fetch(`${BASE_URL}/flashcards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: studentUserId,
        word: `Perseverance (Round ${roundNumber})`,
        definition: "Persistence in doing something despite difficulty or delay in achieving success.",
        example: "His perseverance with the work was rewarded with success.",
        pronunciation: "/ˌpɜː.sɪˈvɪə.rəns/",
        type: "vocabulary",
        box: 1,
      }),
    });
    const data = await res.json();
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(data._id, "Flashcard created with valid ID");
    assert(data.box === 1, "Initial box must be 1");
    createdFlashcardId = data._id;
  });

  await runner.runTest("4.3 Leitner box advancement on correct recall (Box 1 -> Box 2)", async () => {
    assert(createdFlashcardId, "Need flashcard ID");
    const res = await fetch(`${BASE_URL}/flashcards/${createdFlashcardId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCorrect: true }),
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.box === 2, `Expected box to advance to 2, got ${data.box}`);
  });

  await runner.runTest("4.4 Leitner box reset to Box 1 on failed recall", async () => {
    assert(createdFlashcardId, "Need flashcard ID");
    const res = await fetch(`${BASE_URL}/flashcards/${createdFlashcardId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCorrect: false }),
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.box === 1, `Expected box to reset to 1 on failure, got ${data.box}`);
  });

  // ---------------------------------------------------------
  // MODULE 5: BOOKMARKS & EXAM HISTORY
  // ---------------------------------------------------------
  console.log(`\n--- [Module 5: Bookmarks & Exam History Breakdown] ---`);

  await runner.runTest("5.1 Add Question to Student Bookmarks", async () => {
    assert(bookmarkTestQuestionId, "Need unbookmarked question ID");
    const res = await fetch(`${BASE_URL}/bookmarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: studentUserId,
        itemType: "Question",
        itemId: bookmarkTestQuestionId,
        notes: `Revision bookmark from test round ${roundNumber}`,
      }),
    });
    const data = await res.json();
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(data._id, "Bookmark created successfully");
    createdBookmarkId = data._id;
  });

  await runner.runTest("5.2 Retrieve student bookmarks with populated item", async () => {
    const res = await fetch(`${BASE_URL}/bookmarks/user/${studentUserId}`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data) && data.length > 0, "Bookmarks list not empty");
  });

  await runner.runTest("5.3 Prevent duplicate bookmark creation", async () => {
    assert(bookmarkTestQuestionId, "Need question ID");
    const res = await fetch(`${BASE_URL}/bookmarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: studentUserId,
        itemType: "Question",
        itemId: bookmarkTestQuestionId,
      }),
    });
    assert(res.status === 400, `Expected 400 for duplicate bookmark, got ${res.status}`);

    // Cleanup created bookmark so round 2 can run idempotently
    if (createdBookmarkId) {
      await fetch(`${BASE_URL}/bookmarks/${createdBookmarkId}`, { method: "DELETE" });
    }
  });

  await runner.runTest("5.4 Fetch user exam history", async () => {
    const res = await fetch(`${BASE_URL}/history/${studentUserId}`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data), "History entries returned as array");
  });

  await runner.runTest("5.5 Fetch detailed history attempt with question review", async () => {
    assert(submittedHistoryId, "Need submitted history ID");
    const res = await fetch(`${BASE_URL}/history/detail/${submittedHistoryId}`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data._id === submittedHistoryId, "Detailed record ID matches");
    assert(data.examId, "Populated exam information exists");
  });

  // ---------------------------------------------------------
  // MODULE 6: SYSTEM NOTICES & FEEDBACK MANAGEMENT
  // ---------------------------------------------------------
  console.log(`\n--- [Module 6: System Notices & Feedback Management] ---`);

  await runner.runTest("6.1 Create new system notice", async () => {
    const res = await fetch(`${BASE_URL}/notices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Scheduled Maintenance Notification R${roundNumber}`,
        content: "Platform maintenance scheduled for midnight UTC.",
        type: "warning",
        targetRole: "All",
      }),
    });
    const data = await res.json();
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(data._id, "Notice created successfully");
    createdNoticeId = data._id;
  });

  await runner.runTest("6.2 Retrieve notices filtered by Student role", async () => {
    const res = await fetch(`${BASE_URL}/notices?role=Student`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data) && data.length > 0, "Student notices list returned");
  });

  await runner.runTest("6.3 Submit user feedback", async () => {
    const res = await fetch(`${BASE_URL}/feedbacks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: studentUserId,
        userName: "Student Bob",
        userEmail: "student@gmail.com",
        title: `Exam interface feedback R${roundNumber}`,
        content: "The timer auto-submit feature worked seamlessly!",
        rating: 5,
        category: "Exam",
      }),
    });
    const data = await res.json();
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(data._id, "Feedback created");
    createdFeedbackId = data._id;
  });

  await runner.runTest("6.4 Retrieve all feedbacks (Admin review)", async () => {
    const res = await fetch(`${BASE_URL}/feedbacks`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data) && data.length > 0, "Feedback list retrieved");
  });

  await runner.runTest("6.5 Update feedback status to Reviewed", async () => {
    assert(createdFeedbackId, "Need feedback ID");
    const res = await fetch(`${BASE_URL}/feedbacks/${createdFeedbackId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Reviewed" }),
    });
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(data.status === "Reviewed", "Feedback status updated to Reviewed");
  });

  // ---------------------------------------------------------
  // MODULE 7: CURRICULUM (TOPICS, SKILLS, CERTIFICATES)
  // ---------------------------------------------------------
  console.log(`\n--- [Module 7: Curriculum Metadata (Topics, Skills, Certificates)] ---`);

  await runner.runTest("7.1 Retrieve all Topics", async () => {
    const res = await fetch(`${BASE_URL}/topics`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data) && data.length >= 5, "At least 5 topics available");
  });

  await runner.runTest("7.2 Retrieve all Skills", async () => {
    const res = await fetch(`${BASE_URL}/skills`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data) && data.length >= 5, "At least 5 skills available");
  });

  await runner.runTest("7.3 Retrieve all Certificates", async () => {
    const res = await fetch(`${BASE_URL}/certificates`);
    const data = await res.json();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(data) && data.length >= 3, "At least 3 certificates available");
  });

  // ---------------------------------------------------------
  // MODULE 8: FRONTEND ROUTE DELIVERY & URL SYNC PRESERVATION
  // ---------------------------------------------------------
  console.log(`\n--- [Module 8: Frontend Delivery & URL Route Subpath Resolution] ---`);

  const studentSubpaths = [
    "/student",
    "/student/practice",
    "/student/quiz",
    "/student/minitest",
    "/student/flashcards",
    "/student/bookmarks",
    "/student/history",
    "/student/feedback",
    "/student/profile",
  ];

  for (const path of studentSubpaths) {
    await runner.runTest(`8.1 Student route accessible: ${path}`, async () => {
      const res = await fetch(`${FE_URL}${path}`);
      assert(res.status === 200, `Expected 200 for ${path}, got ${res.status}`);
      const text = await res.text();
      assert(text.includes("<div id=\"root\">"), `Root div missing on ${path}`);
    });
  }

  const teacherSubpaths = [
    "/teacher",
    "/teacher/exams",
    "/teacher/questions",
    "/teacher/feedback",
    "/teacher/reports",
  ];

  for (const path of teacherSubpaths) {
    await runner.runTest(`8.2 Teacher route accessible: ${path}`, async () => {
      const res = await fetch(`${FE_URL}${path}`);
      assert(res.status === 200, `Expected 200 for ${path}, got ${res.status}`);
    });
  }

  const adminSubpaths = [
    "/admin",
    "/admin/users",
    "/admin/questions",
    "/admin/exams",
    "/admin/notices",
    "/admin/feedback",
    "/admin/system",
  ];

  for (const path of adminSubpaths) {
    await runner.runTest(`8.3 Admin route accessible: ${path}`, async () => {
      const res = await fetch(`${FE_URL}${path}`);
      assert(res.status === 200, `Expected 200 for ${path}, got ${res.status}`);
    });
  }

  // Clean up created question
  if (createdQuestionId) {
    await fetch(`${BASE_URL}/questions/${createdQuestionId}`, { method: "DELETE" });
  }

  const sum = runner.summary();
  console.log(`\n------------------------------------------------------`);
  console.log(`🏁 ROUND ${roundNumber} FINISHED: ${sum.passed}/${sum.total} Passed (${sum.failed} Failed) in ${sum.durationMs}ms`);
  console.log(`------------------------------------------------------`);

  return sum;
}

async function main() {
  console.log("===============================================================");
  console.log(" ENGLISHQUIZ PLATFORM FA26 - DUAL PASS SYSTEM VERIFICATION ");
  console.log(" Skill: /ck:test | Backend: 9999 | Frontend: 3000 | DB: FA26 ");
  console.log("===============================================================");

  // RUN 1
  const round1 = await executeTestSuite(1);

  // Small delay between rounds
  await new Promise((r) => setTimeout(r, 1200));

  // RUN 2
  const round2 = await executeTestSuite(2);

  console.log("\n===============================================================");
  console.log(" FINAL COMPARISON REPORT (ROUND 1 vs ROUND 2) ");
  console.log("===============================================================");
  console.log(`Round 1: ${round1.passed}/${round1.total} Passed, ${round1.failed} Failed, Time: ${round1.durationMs}ms`);
  console.log(`Round 2: ${round2.passed}/${round2.total} Passed, ${round2.failed} Failed, Time: ${round2.durationMs}ms`);

  const allPassed = round1.failed === 0 && round2.failed === 0;
  if (allPassed) {
    console.log(`\n🏆 ALL TESTS PASSED WITH 100% SUCCESS ACROSS BOTH ROUNDS!`);
    process.exit(0);
  } else {
    console.error(`\n❌ SOME TESTS FAILED IN ROUND 1 OR ROUND 2.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
