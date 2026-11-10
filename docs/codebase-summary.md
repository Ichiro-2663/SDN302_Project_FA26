# Codebase Summary
## EnglishQuiz Platform — SDN302 FA26

---

## 1. Codebase Architecture & Metrics
- **Frontend Stack:** React 18, React Router v6, Tailwind CSS, Lucide Icons, Web Speech API.
- **Backend Stack:** Node.js v20+, Express.js, MongoDB, Mongoose ODM, JWT, bcryptjs.
- **Test Automation:** Custom E2E integration test runner (`tests/live-e2e-suite.js`) implementing dual-pass execution.
- **Frontend Build Size:** `266.52 kB` (JS) and `38.46 kB` (CSS) gzipped.

---

## 2. Directory Layout & Module Responsibilities

```
SDN302_Project_FA26/
├── EnglishQuizBE/                  # Node.js + Express Backend (Port 9999)
│   ├── config/
│   │   └── db.js                   # MongoDB connection pool setup
│   ├── middleware/
│   │   └── auth.js                 # JWT verification and RBAC middleware
│   ├── models/                     # Mongoose Schema Definitions
│   │   ├── User.js                 # User credentials, roles & profiles
│   │   ├── Question.js             # Question bank (MCQ, Matching, T/F, FIB)
│   │   ├── Exam.js                 # Test structure & question relations
│   │   ├── Flashcard.js            # Leitner 5-box items
│   │   ├── History.js              # Graded test attempt records
│   │   ├── Bookmark.js             # User bookmarked revision items
│   │   ├── Notice.js               # System notices & triggers
│   │   └── Feedback.js             # User ratings & comments
│   ├── routes/                     # RESTful API Endpoint Controllers
│   │   ├── auth.js                 # POST /login, POST /register, GET /me
│   │   ├── exam.js                 # GET /take, POST /submit, matrix/generate
│   │   ├── question.js             # CRUD & CEFR level filtering
│   │   ├── flashcard.js            # GET /user/:id, POST /review
│   │   ├── history.js              # User history & detail breakdown
│   │   ├── bookmark.js             # Bookmark creation & unique prevention
│   │   ├── notice.js               # Notice querying by role
│   │   └── feedback.js             # Feedback submission & status updates
│   ├── tests/
│   │   └── live-e2e-suite.js       # Dual-pass automated test suite (56 cases)
│   ├── seed.js                     # Curriculum seed script
│   └── server.js                   # Main application entry point
│
├── EnglishQuizFE/                  # React 18 SPA Frontend (Port 3000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── User/
│   │   │   │   ├── ExamRoom.jsx    # Kombai TOEIC exam interface
│   │   │   │   ├── ExamRoom.css    # High-fidelity layout styles
│   │   │   │   ├── Flashcard3D.jsx # 3D Leitner flip card component
│   │   │   │   ├── Flashcard3D.css # CSS 3D perspective transitions
│   │   │   │   ├── Flashcards.jsx  # Spaced repetition study screen
│   │   │   │   ├── Quiz.jsx        # Exam catalog & Mini Test generator modal
│   │   │   │   ├── QuizReview.jsx  # Detailed post-exam review breakdown
│   │   │   │   ├── Bookmarks.jsx   # Marked question revision deck
│   │   │   │   └── History.jsx     # Past attempt audit log
│   │   │   ├── Teacher/
│   │   │   │   ├── ExamComposer.jsx# Automated matrix exam generator
│   │   │   │   └── QuestionBank.jsx# Question authoring and filtering
│   │   │   ├── Admin/
│   │   │   │   ├── UserManagement.jsx # User accounts & role modification
│   │   │   │   └── ExamManagement.jsx # Platform test administration
│   │   │   └── common/
│   │   │       ├── Header.jsx      # Navigation, notice bell & lockdown badge
│   │   │       └── Sidebar.jsx     # Navigation drawer (hidden during exams)
│   │   ├── pages/
│   │   │   ├── StudentPage.jsx     # Student space with URL subpath sync
│   │   │   ├── TeacherPage.jsx     # Teacher space with URL subpath sync
│   │   │   └── AdminPage.jsx       # Admin space with URL subpath sync
│   │   ├── constants/
│   │   │   └── leitner.js          # Leitner 5-box intervals and theme colors
│   │   └── styles/
│   │       └── theme.css           # Design tokens, variables & typography
│   └── package.json
└── docs/                           # Comprehensive documentation suite
```

---

## 3. REST API Endpoint Catalog

| Endpoint | Method | Role | Description |
| :--- | :---: | :---: | :--- |
| `/auth/register` | POST | Public | Register new user account |
| `/auth/login` | POST | Public | Authenticate user & issue JWT |
| `/auth/me` | GET | Authenticated | Retrieve authenticated user profile |
| `/exams` | GET | Authenticated | Retrieve available exams list |
| `/exams/:id/take` | GET | Student | **Anti-Cheat:** Strip answers and serve exam |
| `/exams/:id/submit` | POST | Student | **Server Grading:** Evaluate answers & save history |
| `/exams/matrix/generate` | POST | Teacher/Admin | Auto-generate matrix exam by difficulty |
| `/exams/minitest/generate`| POST | Teacher/Admin | Auto-generate quick mini test & send notice |
| `/flashcards/user/:id` | GET | Student | Retrieve user flashcards |
| `/flashcards/:id/review` | POST | Student | Update Leitner box (advance or reset) |
| `/bookmarks/user/:id` | GET | Student | Retrieve bookmarked revision items |
| `/history/:userId` | GET | Student | Retrieve exam attempt history |
| `/notices?role=Student` | GET | Student | Query notices filtered by role |
| `/feedbacks` | POST | Student | Submit feedback with rating |

