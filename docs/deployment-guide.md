# Deployment & Setup Guide
## EnglishQuiz Platform — SDN302 FA26

---

## 1. System Requirements & Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **Package Manager:** npm v9+
- **Database:** MongoDB Community Server v6.0+ (running locally on `mongodb://localhost:27017` or remote MongoDB Atlas URI)
- **Web Browser:** Modern browser supporting HTML5, Web Speech API, and CSS 3D transforms (Chrome, Edge, Firefox, Safari)

---

## 2. Quickstart Installation

### Step 1: Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd SDN302_Project_FA26

# Install backend dependencies
cd EnglishQuizBE
npm install

# Install frontend dependencies
cd ../EnglishQuizFE
npm install
```

### Step 2: Database Initialization & Seeding

```bash
# Seed initial curriculum (Topics, Skills, Certificates) and test questions
cd ../EnglishQuizBE
node seed.js
```

### Step 3: Start Services

```bash
# Terminal 1: Start Backend Server (Port 9999)
cd EnglishQuizBE
node server.js

# Terminal 2: Start Frontend Application (Port 3000)
cd ../EnglishQuizFE
npm start
```

Open your browser and navigate to: **`http://localhost:3000`**

---

## 3. Demo Accounts & Credentials

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Student** | `student@gmail.com` | `123456` | Practice quizzes, Leitner flashcards, timed exams, bookmarks, history |
| **Teacher** | `teacher@gmail.com` | `123456` | Question bank authoring, matrix test generator, mini test broadcast |
| **Admin** | `admin@gmail.com` | `123456` | Full platform administration, user management, system statistics |

---

## 4. Running the Automated QA Verification Suite

Execute the dual-pass test runner (`/ck:test` protocol):

```bash
cd EnglishQuizBE
node tests/live-e2e-suite.js
```

### Production Build Validation

```bash
cd ../EnglishQuizFE
npm run build
```
Expected result: `Compiled successfully` with 0 errors and 0 warnings.

