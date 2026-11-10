# Code Standards & Architectural Principles
## EnglishQuiz Platform — SDN302 FA26

---

## 1. Architectural Integrity & Security Rules

### 1.1 Zero Client Answer Leaks (Anti-Cheat Principle)
- **Mandatory Server Sanitization:** The frontend must NEVER receive the `correctAnswer` or `explanation` field prior to official test submission.
- All exam delivery endpoints (`GET /exams/:id/take`) must strictly delete or omit answer keys on the server before serialization.
- For Matching questions, `matchingPairs` right-side items must not reveal index pairings.

### 1.2 Authoritative Server-Side Grading
- The client-submitted payload to `POST /exams/:id/submit` must ONLY contain `{ answers: { questionId: selectedAnswer } }`.
- Under no circumstances should the client transmit `score`, `percentage`, or `isPassed` to the server.
- The server recalculates scores by comparing user answers against database question records.

### 1.3 Spaced Repetition State Determinism
- Flashcard progression follows the mathematical Leitner model:
  - Success: `box = Math.min(5, box + 1)`
  - Failure: `box = 1` (strict reset)
- No intermediate box states (such as Box 0 or Box 6) are allowed.

---

## 2. Frontend Guidelines (React 18)

### 2.1 State & URL Synchronization
- Navigation tabs must synchronize bidirectionally with the URL subpath.
- Always use `useLocation()` to detect current subpaths and `useNavigate()` to update the URL upon tab transitions.
- Ensure `getInitialTab()` supports deep-linking and browser refresh (F5).

### 2.2 Exam Lockdown Mode Execution
- When `isExamLocked === true`:
  - The navigation sidebar MUST be hidden (`!isExamLocked`).
  - Container margin must be reset (`marginLeft: 0`).
  - A browser `beforeunload` event listener must be registered on mount and cleaned up on unmount.
  - The Header must present the security alert badge `🔒 Chế Độ Phòng Thi Bảo Mật`.

### 2.3 Object Rendering Safety
- Mongoose populated fields (such as `question.skill` or `question.topic`) may be objects `{_id, name, description}` or raw string IDs.
- Never render raw objects directly into JSX. Always use a safe string extraction helper (e.g., `getCategoryLabel(q)`).

---

## 3. Backend Guidelines (Node.js & Express)

### 3.1 Error Handling & Async Wrappers
- All route handlers must enclose asynchronous operations in `try/catch` blocks.
- Non-critical side-effects (such as broadcasting notifications) must have their own nested `try/catch` blocks to prevent blocking the primary transaction.

### 3.2 Password Hashing & Secret Protection
- User passwords must be hashed using `bcryptjs` with a minimum salt factor of 10.
- Passwords must be excluded by default (`select: "-password"`) from user queries.

