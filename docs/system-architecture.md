# System Architecture & Technical Specifications
## EnglishQuiz Platform — SDN302 FA26

---

## 1. Architectural Overview

The **EnglishQuiz Platform** follows a modern **3-Tier Layered Architecture** adhering to clean separation of concerns, high cohesion, and loose coupling.

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Presentation Tier)"]
        SPA["React 18 Single Page Application"]
        StateSync["URL Subpath Sync & LocalStorage State Manager"]
        AudioSynth["Web Speech Synthesis API"]
    end

    subgraph ServerLayer ["Server Layer (Application / API Tier)"]
        ExpressRouter["Express.js 4 REST Router"]
        AuthGuard["JWT Verification & Role Middleware"]
        AntiCheatService["Anti-Cheat Sanitization & Scoring Engine"]
        LeitnerService["Leitner Spaced Repetition Engine"]
        MatrixService["Exam Matrix & Mini Test Generator"]
    end

    subgraph DataLayer ["Data Layer (Persistence Tier)"]
        MongoDB[(MongoDB 7.0 Document Store)]
        MongooseODM["Mongoose ODM Models & Schemas"]
    end

    SPA <-->|JSON over HTTP / HTTPS| ExpressRouter
    ExpressRouter --> AuthGuard
    AuthGuard --> AntiCheatService
    AuthGuard --> LeitnerService
    AuthGuard --> MatrixService
    AntiCheatService <--> MongooseODM
    LeitnerService <--> MongooseODM
    MatrixService <--> MongooseODM
    MongooseODM <--> MongoDB
```

---

## 2. Component Design & Responsibility Matrix

### 2.1 Frontend Architecture (`EnglishQuizFE`)
- **Port:** 3000
- **Routing:** React Router DOM v6 with dynamic nested subpath sync (`/student/:tab`, `/teacher/:tab`, `/admin/:tab`).
- **Core Modules:**
  1. `ExamRoom.jsx`: Kombai-designed TOEIC Reading Mini Test layout, countdown timer, question palette, and keyboard navigation.
  2. `Flashcard3D.jsx`: 3D perspective flip card (380x240px, 24px border radius, 0.6s cubic-bezier timing), IPA font integration, and pronunciation synthesis.
  3. `QuizReview.jsx`: Post-exam score breakdown with pass/fail badges, time spent, and question-by-question explanations.
  4. `ExamComposer.jsx`: Automated matrix exam generator for teachers/admins.
  5. `Header.jsx`: Top navigation, notice bell with badge count, and active exam lockdown alert.

### 2.2 Backend Architecture (`EnglishQuizBE`)
- **Port:** 9999
- **Framework:** Express.js with JSON body parsing and CORS configuration.
- **Core Services:**
  1. **Anti-Cheat Exam Engine (`routes/exam.js`):**
     - `GET /exams/:id/take`: Strips `correctAnswer` and `explanation` from questions before sending to the client.
     - `POST /exams/:id/submit`: Evaluates examinee answers against server database models, calculates score, and records a permanent `History` entry.
  2. **Automated Exam Compilation (`routes/exam.js`):**
     - `POST /exams/matrix/generate`: Compiles balanced exams across CEFR difficulty levels (Easy, Medium, Hard).
     - `POST /exams/minitest/generate`: Generates 5–15 question Quick Mini Tests with automated notification broadcast to Students.
  3. **Spaced Repetition System (`routes/flashcard.js`):**
     - `POST /flashcards/:id/review`: Implements the Leitner algorithm (Box 1–5 progression, demotion on error to Box 1).

---

## 3. Security & Anti-Cheat Protocols

```mermaid
sequenceDiagram
    participant Student as 🎓 Student Browser
    participant API as ⚙️ Express Server
    participant DB as 🗄️ Database

    Note over Student,API: Scenario A: Inspection Hazard Prevented
    Student->>API: GET /exams/:id/take
    API->>DB: Query Exam & Questions
    DB-->>API: Raw Data (includes correctAnswer)
    API->>API: Strip correctAnswer, explanation, matching right-pairs
    API-->>Student: Sanitized Questions (Zero answer leaks in DevTools)

    Note over Student,API: Scenario B: Score Tampering Prevented
    Student->>API: POST /exams/:id/submit { answers: { q1: "A" } }
    API->>DB: Fetch Authoritative Question Models
    API->>API: Compute score = sum(matches)
    API->>DB: History.create({ score, status })
    API-->>Student: Final Official Score & Verified Feedback
```

---

## 4. Database Schema Specifications

```mermaid
erDiagram
    User ||--o{ Flashcard : owns
    User ||--o{ History : submits
    User ||--o{ Bookmark : marks
    Exam ||--|{ Question : contains
    Exam ||--o{ History : targets

    User {
        ObjectId _id
        string name
        string email
        string password
        string role
    }

    Exam {
        ObjectId _id
        string title
        number duration
        string type
        string level
        ObjectId[] questions
    }

    Question {
        ObjectId _id
        string content
        string questionType
        string level
        string[] options
        string correctAnswer
        string explanation
    }

    Flashcard {
        ObjectId _id
        ObjectId userId
        string word
        string definition
        string pronunciation
        number box
    }

    History {
        ObjectId _id
        ObjectId userId
        ObjectId examId
        number score
        number total
        string status
    }
```

---

## 5. Network Routing & F5 State Preservation

To eliminate state loss upon page reload:
- URL Subpaths are maintained in sync with the current active tab (`/student/quiz`, `/student/minitest`, `/student/flashcards`, `/teacher/exams`, `/admin/users`).
- On F5 refresh, `getInitialTab()` reads `location.pathname` and initializes the tab component immediately without falling back to Dashboard.

