# Project Overview & Product Development Requirements (PDR)
## EnglishQuiz Platform — SDN302 FA26

---

## 1. Executive Summary
The **EnglishQuiz Platform** is a web-based e-learning and exam assessment platform engineered for Vietnamese college students preparing for standardized English qualifications (TOEIC, IELTS, CEFR). The system addresses common shortcomings in online testing by introducing **Authoritative Anti-Cheat Examination**, **Leitner 5-Box Spaced Repetition**, and **Automated Matrix Test Compilation**.

---

## 2. Target Users & Problem Space

### 2.1 User Personas
- **The College Student:** Needs to learn 600+ essential TOEIC vocabulary words without rapid forgetting, practice realistic timed tests under exam pressure, and bookmark mistakes for systematic review.
- **The English Teacher / Instructor:** Needs an automated way to assemble balanced exams from a question bank based on difficulty matrices (Easy, Medium, Hard), assign mini tests, and immediately notify students.
- **The Academic Administrator:** Oversees platform integrity, manages student and teacher credentials, tracks test completion statistics, and reviews user feedback.

### 2.2 Core Problems Solved
1. **Academic Dishonesty in Online Quizzes:** Many web quizzes leak correct answers in client DOM or JSON responses. EnglishQuiz strips all answers on the server and computes grades authoritatively.
2. **Vocabulary Forgetting Curve:** Conventional word lists fail to reinforce words at scientific retention intervals. EnglishQuiz implements Leitner's 5-box algorithm with 3D interactive flip cards and Web Speech pronunciation.
3. **Manual Exam Authoring Bottlenecks:** Compiling a balanced 50-question test manually takes 45–60 minutes. The automated Matrix and Mini Test generator generates ready-to-test exams in seconds.

---

## 3. Product Feature Matrix

| ID | Feature Name | Description | Status |
| :---: | :--- | :--- | :---: |
| **FE-01** | **Authentication & RBAC** | JWT-based auth with roles: Student, Teacher, Admin | **Completed** |
| **FE-02** | **3D Leitner Flashcards** | 5-box spaced repetition with 3D flip card & speech synthesis | **Completed** |
| **FE-03** | **Kombai Exam Room** | High-fidelity TOEIC Reading Mini Test layout with lockdown mode | **Completed** |
| **FE-04** | **Anti-Cheat Engine** | Server-side answer sanitization and authoritative grading | **Completed** |
| **FE-05** | **Matrix & Mini Test Generator** | Automatic exam generator by CEFR difficulty tiers | **Completed** |
| **FE-06** | **Automated Exam Notices** | Student notification with one-click direct exam launch | **Completed** |
| **FE-07** | **Bookmarks & History Review** | Question bookmarking and detailed attempt review breakdown | **Completed** |
| **FE-08** | **F5 URL Synchronization** | Seamless subpath routing preserving active tabs on reload | **Completed** |

---

## 4. Release Criteria & Verification
- All critical flows tested using `/ck:test` across dual passes (56/56 tests passing, 0 failures).
- Production build compilation verified with 0 errors and 0 warnings.
- Backend response times verified under 100ms for standard database queries.

