---
title: "Ke Hoach Dung Lai Du An English Quiz Platform & Tich Hop AI"
version: "2.0.0"
status: "in-progress"
project: "EnglishQuiz Platform (SDN302)"
category: "implementation-plan"
tags: ["plan", "rebuild", "ai-integration", "3-dev-team", "sprint-roadmap"]
created: "2026-10-31"
author: "Lead Architecture & Team"
---
# KẾ HOẠCH DỰNG LẠI DỰ ÁN ENGLISH QUIZ PLATFORM
## Kiến Trúc Chuẩn Hóa, Phân Chia 3 Developers & Ứng Dụng AI Toàn Diện

---

## 1. TỔNG QUAN KIẾN TRÚC MỤC TIÊU (TARGET ARCHITECTURE)

Để giải quyết triệt để các vấn đề của dự án cũ (lộ đáp án, gian lận điểm, code phân mảnh, khó bảo trì), hệ thống mới được thiết kế theo mô hình **Modular Layered Architecture (Kiến trúc phân tầng mô-đun)** và **Contract-First API (Thiết kế API trước khi viết code)** giúp 3 lập trình viên có thể làm việc độc lập song song mà không bị nghẽn (blocking).

```
+-----------------------------------------------------------------------------------+
|                            CLIENT TIER (React 19 / Vite)                          |
|  +-------------------------+  +--------------------------+  +------------------+  |
|  |     Admin Workspace     |  |     Teacher Studio       |  |  Student Portal  |  |
|  | (User, System, Reports) |  | (Question Bank, Exams, AI|  | (Practice, Test, |  |
|  +-------------------------+  +--------------------------+  +------------------+  |
|               \                            |                           /          |
|                +---------------------------+--------------------------+           |
|                                            |                                      |
|                               Axios Client Interceptor                            |
|                            (JWT Token, Error Handling)                            |
+--------------------------------------------|--------------------------------------+
                                             | HTTPS / REST API
+--------------------------------------------v--------------------------------------+
|                           BACKEND TIER (Node.js / Express)                        |
|                                                                                   |
|  [ Middlewares Layer ]: Auth (JWT), RBAC (Role Guards), Rate Limiter, Validation  |
|                                                                                   |
|  [ Controller Layer ]: Điều hướng HTTP Request & Validate Dữ liệu (Zod / Joi)     |
|                                                                                   |
|  [ Service Layer (Core Business Logic) ]:                                         |
|    +--------------------+  +--------------------+  +---------------------------+  |
|    |    Auth Service    |  |    Exam Service    |  |     Practice Service      |  |
|    | (JWT, RBAC, Users) |  | (Matrix, Grading,  |  | (Adaptive, Immediate Feed)|  |
|    +--------------------+  |  Anti-cheat Timer) |  +---------------------------+  |
|    +--------------------+  +--------------------+  +---------------------------+  |
|    | Flashcard Service  |  |    Analytics &     |  |      AI Agent Engine      |  |
|    | (Leitner 5 Boxes)  |  |   Report Service   |  | (Gemini / OpenAI Services)|  |
|    +--------------------+  +--------------------+  +---------------------------+  |
|                                                                                   |
|  [ Repository / Model Layer ]: Mongoose Schema, Indexing, Transactions            |
+--------------------------------------------|--------------------------------------+
                                             |
             +-------------------------------+-------------------------------+
             |                               |                               |
             v                               v                               v
+-------------------------+     +-------------------------+     +-------------------------+
|     MongoDB Server      |     |      Redis (Optional)   |     |    LLM Cloud Service    |
| (Persistent DB Storage) |     |  (Exam Session & Timer) |     | (Gemini 2.0 / OpenAI)   |
+-------------------------+     +-------------------------+     +-------------------------+
```

---

## 2. PHÂN CHIA NHIỆM VỤ CHO 3 DEVELOPERS (ROLE-BASED VERTICAL SLICES)

Mỗi Developer sẽ đảm nhiệm toàn diện một Role từ giao diện (Frontend) đến nghiệp vụ (Backend) và Cơ sở dữ liệu tương ứng.
- **DEV 1 (Người thứ nhất)**: Đảm nhận trọn vẹn **ROLE STUDENT (Học viên)** - Trọng tâm trải nghiệm luyện tập, thi cử, flashcard và gia sư AI.
- **DEV 2 (Người thứ hai)**: Đảm nhận trọn vẹn **ROLE TEACHER (Giáo viên)** - Trọng tâm ngân hàng câu hỏi, soạn đề theo ma trận, chấm thi Server-side và AI sinh đề.
- **DEV 3 (Người thứ ba)**: Đảm nhận trọn vẹn **ROLE ADMIN & PLATFORM CORE (Quản trị & Nền tảng)** - Trọng tâm hạ tầng JWT/RBAC bảo mật, Axios trung tâm, Quản trị người dùng, Báo cáo và Thông báo.

```
       +---------------------------------------------------------------------+
       |                       PHÂN CHIA 3 DEVELOPERS                        |
       +---------------------------------------------------------------------+
              |                              |                               |
              v                              v                               v
     [ DEV 1: STUDENT ]             [ DEV 2: TEACHER ]             [ DEV 3: ADMIN & CORE ]
   - Luyện tập (Practice)        - Ngân hàng câu hỏi            - Khung JWT Auth & RBAC
   - Phòng thi (Exam Room)       - Soạn đề Ma trận Độ khó       - Axios Interceptor trung tâm
   - Bộ đếm giờ & Nộp an toàn    - Chấm thi Server-side         - Quản trị User (Phân quyền)
   - Flashcard Leitner 5 hộp     - Đề thi Mock Test chuẩn hóa   - Báo cáo thống kê Recharts
   - Sổ tay lỗi sai & Bookmark   - AI Exam Generator (Soạn đề)  - Thông báo hệ thống (DB)
   - AI Explain Tutor (Gia sư)   - AI Distractor Generator      - Chuẩn hóa Theme & Layout
```

---

### DEV 1: ROLE STUDENT - LEARNING EXPERIENCE & PRACTICE ENGINE
*Trọng tâm: Hoàn thiện & sửa lỗi các tính năng học viên hiện có, xây dựng phòng thi trực tuyến an toàn, ôn tập từ vựng Leitner, sổ tay lỗi sai và Gia sư AI.*

#### 1. Hoàn thiện & Sửa lỗi các tính năng Học viên hiện có:
1. **Khắc phục triệt để lỗ hổng nộp bài & gian lận điểm**:
   - Loại bỏ hoàn toàn việc tính điểm trên Client trong `Quiz.js` và `Practice.js`.
   - Kết nối với API an toàn `GET /exams/:id/take` (không lộ `correctAnswer`) và `POST /exams/:id/submit` (gửi đáp án chọn lên để Server chấm).
2. **Nâng cấp Phòng thi trực tuyến (`Quiz.js` / Exam Room)**:
   - Tích hợp **Bộ đếm thời gian thực (Countdown Timer)** hiển thị cố định trên màn hình dựa vào `duration` của bài thi.
   - Xây dựng **Bảng điều hướng câu hỏi (Question Palette)**: Đánh dấu câu đã làm, câu chưa làm, câu gắn cờ xem lại (`Flag`).
   - Tự động nộp bài khi hết giờ (Auto-submit on time up).
3. **Màn hình Xem lại Kết quả (`QuizResult.js` / Review Screen)**:
   - Hiển thị bảng điểm chính thức từ Server, phân tích chi tiết từng câu hỏi (Đáp án của bạn vs Đáp án đúng kèm lời giải thích `explanation`).
4. **Nâng cấp Flashcards & Thuật toán Leitner (`Flashcards.js`)**:
   - Sửa lỗi thuật toán Leitner 5 hộp: Box 1 (+1 ngày), Box 2 (+3 ngày), Box 3 (+7 ngày), Box 4 (+14 ngày), Box 5 (+30 ngày). Trả lời sai lập tức reset về Box 1.
   - Thêm hiệu ứng lật thẻ 3D (3D Flip Animation) trực quan.
   - Tích hợp Web Speech API (Text-to-Speech) để phát âm từ vựng tiếng Anh chuẩn giọng bản xứ.
   - Bộ lọc thẻ cần ôn tập hôm nay ("Due Today").
5. **Nâng cấp Bookmarks & Hồ sơ cá nhân (`Bookmarks.js`, `Profile.js`)**:
   - Cho phép học viên lưu câu hỏi khó khi đang làm bài hoặc lúc xem lại kết quả kèm ghi chú cá nhân.
   - Quản trị thông tin học viên, mục tiêu điểm số (Target Score) và chứng chỉ hướng tới (IELTS/TOEIC).

#### 2. Xây dựng các tính năng mới cần thiết:
1. **Chế độ Luyện tập Tức thì (Practice Mode)**:
   - Khác với bài thi Quiz (phải nộp mới biết điểm), chế độ Practice cho phép chọn bài theo Kỹ năng/Chủ đề; học viên làm câu nào biết ngay đúng/sai và lời giải thích của câu đó lập tức.
2. **Sổ tay Câu hỏi Làm sai (Mistake Notebook)**:
   - Tự động lưu vết tất cả các câu hỏi học viên từng làm sai trong các bài Quiz/Mini-test/Mock-test.
   - Cung cấp nút "Luyện tập lại các câu sai" để biến điểm yếu thành điểm mạnh.
3. **Tích hợp AI Learning Companion (AI Tutor cho Học viên)**:
   - **AI Explain Tutor**: Thêm nút *"Hỏi gia sư AI về câu này"* ở màn hình Review. AI sẽ phân tích: Bạn chọn A vì sao sai, B mới đúng vì sao, cấu trúc ngữ pháp cần lưu ý là gì.
   - **AI Flashcard Booster**: Khi thêm từ mới, chỉ cần gõ từ, AI tự điền phiên âm IPA, nghĩa tiếng Việt, câu ví dụ và cụm từ đi kèm (Collocations).
   - **AI Mistake Remediation**: Tự động tạo 1 bài luyện tập 10 câu khắc phục đúng lỗ hổng kiến thức từ các câu học viên hay làm sai nhất.

---

### DEV 2: ROLE TEACHER - CONTENT ENGINE & EXAMINATION CORE
*Trọng tâm: Quản lý ngân hàng câu hỏi đa định dạng, soạn đề thi tự động theo ma trận độ khó, chấm điểm Server-side bảo mật và AI sinh đề thi.*

#### 1. Hoàn thiện & Sửa lỗi các tính năng Giáo viên hiện có:
1. **Nâng cấp Ngân hàng Câu hỏi (`QuestionBank.js`)**:
   - Hoàn thiện form tạo câu hỏi hỗ trợ đầy đủ 4 dạng: Trắc nghiệm (Multiple Choice), Điền từ (Fill in Blank), Đúng/Sai (True/False), Nối cặp (Matching).
   - Bổ sung hỗ trợ câu hỏi Đọc hiểu (có trường `passage` văn bản dài) và câu hỏi Nghe (trường `audioUrl`).
   - Gắn nhãn phân loại: Level (A1, A2, B1, B2, C1, C2 hoặc Easy, Medium, Hard), Topic, Skill, Certificate.
2. **Nâng cấp Soạn đề thi (`ExamManagement.js`)**:
   - Cho phép chọn câu hỏi thủ công hoặc tạo tự động.
   - Phân loại rõ: `practice`, `quiz`, `mini_test`, `mock_test`.
3. **Xây dựng Lõi Chấm điểm Bảo mật Server-Side**:
   - API `GET /exams/:id/take`: Lấy đề thi nhưng lọc bỏ `correctAnswer` và `explanation` trước khi gửi cho học sinh.
   - API `POST /exams/:id/submit`: Server tự động chấm điểm, lưu bản ghi vào `History` và trả về kết quả an toàn.

#### 2. Xây dựng các tính năng mới cần thiết:
1. **Soạn đề thi theo Ma trận Độ khó (Matrix Exam Generator)**:
   - Giáo viên cấu hình tỷ lệ: ví dụ đề 40 câu gồm 30% Easy, 50% Medium, 20% Hard thuộc Topic "Business English". Hệ thống tự động bốc ngẫu nhiên từ Question Bank để tạo đề.
2. **Mô hình Đề thi Thử Chuẩn hóa (Mock Test TOEIC/IELTS)**:
   - Hỗ trợ chia đề thành nhiều Section (Ví dụ: Part 1: Photos, Part 5: Incomplete Sentences, Part 7: Reading Comprehension).
3. **Tích hợp AI Teacher Copilot (AI Hỗ trợ Giáo viên)**:
   - **One-Click Exam Generator**: Giáo viên chỉ cần nhập chủ đề hoặc paste một đoạn bài báo/tài liệu, AI tự động sinh 10 - 20 câu hỏi trắc nghiệm chuẩn JSON có sẵn đáp án và giải thích chi tiết.
   - **Smart Distractor Generator**: Giáo viên nhập câu hỏi và đáp án đúng, AI tự động sinh 3 đáp án sai có tính "bẫy" phổ biến.
   - **CEFR Auto-tagging**: Tự động đánh giá độ khó của câu hỏi theo chuẩn CEFR.

---

### DEV 3: ROLE ADMIN & PLATFORM CORE INFRASTRUCTURE
*Trọng tâm: Kiến trúc nền tảng, Bảo mật xác thực JWT/RBAC, Axios trung tâm, Quản trị tài khoản, Báo cáo thống kê và Thông báo hệ thống.*

#### 1. Hoàn thiện & Sửa lỗi Hạ tầng Hệ thống Chung:
1. **Bảo mật Xác thực JWT & Phân quyền RBAC**:
   - Viết `authMiddleware` (xác thực token Bearer) và `roleMiddleware(["Admin", "Teacher", "Student"])`.
   - Cập nhật `routes/auth.js`: Ký JWT token khi đăng nhập, loại bỏ mật khẩu plaintext fallback, giấu trường password khi trả về Client.
   - Cập nhật `ProtectRoute.js` trên Frontend: Nhận prop `allowedRoles`, ngăn chặn triệt để học viên gõ URL `/admin` hoặc `/teacher`.
2. **Chuẩn hóa Giao tiếp API & Giao diện Dùng chung**:
   - Xây dựng `src/api/axiosClient.js` trung tâm có Request & Response Interceptors (tự gắn Token, tự logout khi 401).
   - Loại bỏ URL hardcoded `http://localhost:9999`, thay bằng `process.env.REACT_APP_API_URL`.
   - Dọn dẹp các tệp tin trùng lặp: Xóa bỏ thư mục `components/common` thừa, hợp nhất `Header.js`, `Sidebar.js`, `Footer.js`.
   - Thống nhất thư viện icon: Gỡ bỏ `lucide-react`, dùng đồng bộ `react-icons`.
   - Khắc phục lỗi font chữ tiếng Việt (chuyển mã nguồn sang UTF-8 sạch).

#### 2. Hoàn thiện & Xây dựng các tính năng Quản trị (Admin):
1. **Quản trị Người dùng (`Usermanagement.js`)**:
   - Danh sách người dùng phân trang, tìm kiếm, lọc theo vai trò (Student, Teacher, Admin).
   - Kích hoạt / Vô hiệu hóa tài khoản (Active / Disabled), đổi quyền người dùng.
2. **Quản trị Danh mục Hệ thống (Taxonomy Management)**:
   - Quản trị danh mục Topics (Chủ đề), Skills (Kỹ năng: Listening, Reading, Grammar...), Certificates (TOEIC, IELTS, CEFR).
3. **Báo cáo Thống kê Toàn diện (`Reports.js`)**:
   - Thống kê số lượng người dùng, đề thi, lượt thi.
   - Biểu đồ ComposedChart trực quan: Xu hướng làm bài, điểm trung bình theo thời gian, tỷ lệ Đạt/Trượt (Pass/Fail).
   - Bảng xếp hạng học viên tích cực nhất.
4. **Hệ thống Thông báo & Phản hồi Thực tế**:
   - Chuyển `SystemNotice.js` và `UserFeedback.js` từ `useState` ảo sang Model & Collection MongoDB thực tế (`notices`, `feedbacks`).
   - Admin có thể đăng thông báo toàn trường, học viên xem thông báo và gửi góp ý thực tế.

---

## 3. THIẾT KẾ KIẾN TRÚC LÕI: QUẢN LÝ & TẠO ĐỀ THI, BÀI ÔN

Để tạo ra một hệ thống thi cử và ôn luyện bài bản, giải quyết được từ bài tập nhanh đến thi thử chứng chỉ (IELTS/TOEIC), kiến trúc cần phân tách rõ **4 chế độ học**:

```
+----------------------------------------------------------------------------------+
|                            4 CHẾ ĐỘ HỌC & KIỂM TRA                              |
+----------------------------------------------------------------------------------+
| 1. PRACTICE MODE (Luyện tập tự do):                                              |
|    - Không áp lực thời gian, chọn câu theo kỹ năng/chủ đề cụ thể.                |
|    - Trả kết quả + giải thích ngay lập tức sau mỗi câu.                          |
+----------------------------------------------------------------------------------+
| 2. QUIZ / MINI-TEST (Kiểm tra nhanh):                                            |
|    - 10 - 20 câu hỏi, thời gian từ 10 - 20 phút.                                 |
|    - Kiểm tra củng cố kiến thức cuối mỗi chủ đề. Nộp bài mới hiển thị điểm số.  |
+----------------------------------------------------------------------------------+
| 3. MOCK TEST (Thi thử chuẩn hóa):                                                |
|    - Mô phỏng đề thi thật (TOEIC 200 câu/120p, IELTS Reading 40 câu/60p).       |
|    - Chia Sections rõ ràng (Part 1, 2, 3, 4, 5, 6, 7). Bảng điểm quy đổi chuẩn.  |
+----------------------------------------------------------------------------------+
| 4. ADAPTIVE REVIEW (Ôn tập khắc phục điểm yếu):                                  |
|    - Hệ thống tự động lọc các câu hỏi trong "Sổ tay lỗi sai" (Mistake Notebook)  |
|      để tạo đề thi ôn tập riêng cho từng cá nhân.                                |
+----------------------------------------------------------------------------------+
```

### Thiết kế Cơ sở Dữ liệu Đề thi & Ma trận (Mongoose Schemas)

```javascript
// models/Exam.js
const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { 
    type: String, 
    enum: ["practice", "quiz", "mini_test", "mock_test", "adaptive_review"],
    default: "quiz" 
  },
  certificate: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" }, // TOEIC, IELTS, B1...
  durationMinutes: { type: Number, required: true }, // Thời gian làm bài (phút)
  passingScore: { type: Number, default: 50 }, // Điểm phần trăm để đạt (Ví dụ: 50%)
  
  // Ma trận cấu hình đề (phục vụ tự động sinh câu hỏi)
  matrixConfig: {
    isAutoGenerated: { type: Boolean, default: false },
    totalQuestions: Number,
    levelDistribution: {
      easy: Number,    // ví dụ: 30%
      medium: Number,  // ví dụ: 50%
      hard: Number     // ví dụ: 20%
    },
    topicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
    skillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }]
  },

  // Danh sách câu hỏi thực tế trong đề
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  
  // Phân chia sections nếu là Mock Test chuẩn
  sections: [{
    title: String, // Ví dụ: "Part 5: Incomplete Sentences"
    questionCount: Number,
    durationMinutes: Number
  }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });
```

---

## 4. ỨNG DỤNG AI ĐỂ TỐI ƯU HÓA TẠO VÀ LÀM BÀI TẬP (AI INTEGRATION FRAMEWORK)

Việc tích hợp AI không chỉ dừng lại ở chat đơn thuần, mà đóng vai trò như một **AI Copilot** cho cả Giáo viên và Học viên. Sử dụng **Google Gemini 1.5/2.0 Flash** hoặc **OpenAI GPT-4o-mini** nhờ tốc độ cực nhanh, chi phí siêu rẻ và khả năng trả về **Structured JSON Output**.

```
                   +----------------------------------+
                   |        AI SERVICE ENGINE         |
                   | (Gemini SDK / OpenAI Structured) |
                   +----------------------------------+
                               /              \
                              /                \
                             v                  v
         [ DÀNH CHO GIÁO VIÊN ]                [ DÀNH CHO HỌC VIÊN ]
         1. One-Click Exam Generator           1. AI Explain Tutor (Giải thích lỗi)
         2. Smart Distractor Generator         2. Sổ lỗi cá nhân hóa (AI Mistake Fix)
         3. Text/Reading Comprehension Maker   3. AI Flashcard Context Generator
         4. CEFR Level Checker & Auto-tag      4. AI Pronunciation & Speaking Feedback
```

---

### 4.1. Ứng dụng AI cho Giáo viên (Teacher AI Copilot)

#### Tính năng 1: Tạo Câu Hỏi Tự Động theo Chủ đề hoặc Văn bản (One-Click Question Generator)
- **Cách hoạt động**: Giáo viên chỉ cần paste một đoạn tin tức tiếng Anh (BBC/CNN), hoặc nhập prompt: *"Tạo 5 câu trắc nghiệm ngữ pháp Thì Hiện tại Hoàn thành cấp độ B1"*.
- **Cơ chế Prompt với Structured Output**:
  ```javascript
  const generateQuestionsPrompt = `
  Bạn là chuyên gia khảo thí tiếng Anh quốc tế.
  Hãy tạo 5 câu hỏi trắc nghiệm dựa trên chủ đề: "${topic}" với cấp độ CEFR "${level}".
  Yêu cầu trả về DUY NHẤT một mảng JSON tuân thủ đúng định dạng:
  [
    {
      "content": "Câu hỏi chứa chỗ trống ___",
      "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      "correctAnswer": 0, // Chỉ số đáp án đúng (0-3)
      "explanation": "Giải thích chi tiết tại sao chọn đáp án này và vì sao các đáp án khác sai",
      "level": "${level}",
      "questionType": "MultipleChoice"
    }
  ]
  `;
  ```
- **Lợi ích**: Giúp giáo viên soạn một đề thi 50 câu chỉ trong 30 giây thay vì mất 2-3 tiếng gõ tay.

#### Tính năng 2: Sinh Đáp Án Nhiễu Thông Minh (Smart Distractor Generator)
- **Vấn đề**: Khi soạn câu trắc nghiệm, việc nghĩ ra 3 phương án sai (distractors) hợp lý và "đánh lừa" đúng các lỗi phổ biến của học sinh Việt Nam là khâu mất thời gian nhất.
- **Giải pháp AI**: Giáo viên nhập câu hỏi và đáp án đúng. AI tự động phân tích và sinh ra 3 đáp án sai dựa trên các bẫy ngữ pháp thường gặp (nhầm lẫn từ loại, thì, giới từ, false friends).

#### Tính năng 3: Tự Động Đánh Giá Cấp Độ CEFR (CEFR Auto-Leveling)
- AI phân tích độ phức tạp câu (lexical diversity, sentence length, syntactic complexity) để gắn nhãn tự động A1, A2, B1, B2, C1, C2 cho câu hỏi trong kho ngân hàng.

---

### 4.2. Ứng dụng AI cho Học viên (Student AI Learning Companion)

#### Tính năng 1: Gia Sư Giải Thích Chuyên Sâu (AI Explain Tutor)
- Khi học viên làm sai một câu trong phần Review, thay vì chỉ đọc một dòng đáp án cứng nhắc, học viên có thể bấm **"Giải thích thêm"**.
- AI sẽ đối chiếu:
  - Đáp án của câu hỏi.
  - Đáp án học sinh đã chọn.
  - **Chỉ ra cụ thể**: Học sinh đã nhầm lẫn ở điểm ngữ pháp nào? Dịch nghĩa câu trong ngữ cảnh này là gì? Đưa ra 2 ví dụ tương tự để ghi nhớ ngay.

#### Tính năng 2: Tạo Đề Luyện Tập Cá Nhân Hóa Khắc Phục Lỗ Hổng (AI Mistake Remediation)
- **Thuật toán**: Hệ thống thu thập 10 câu hỏi gần nhất mà học sinh làm sai trong `History`.
- Gửi danh sách các câu sai này vào AI Service:
  *"Dựa trên 10 lỗi sai này của học viên (chủ yếu sai về Mệnh đề quan hệ và Giới từ chỉ thời gian), hãy sinh một bài luyện tập mới gồm 10 câu hỏi tương tự để học viên làm lại và khắc phục lỗ hổng kiến thức."*
- Học sinh được học đúng phần mình yếu, tối ưu 100% thời gian ôn luyện.

#### Tính năng 3: Sinh Dữ Liệu Flashcard Tự Động (AI Flashcard Booster)
- Học viên chỉ cần nhập 1 từ vựng mới (ví dụ: `Ubiquitous`).
- AI tự động điền:
  - Định nghĩa tiếng Anh & tiếng Việt dễ hiểu.
  - Phiên âm chuẩn quốc tế IPA (`/juːˈbɪk.wɪ.təs/`).
  - Câu ví dụ thực tế trong đời sống.
  - Các cụm từ hay đi kèm (Collocations).
  - Mẹo ghi nhớ từ vựng (Mnemonics).

---

## 5. KẾ HOẠCH TRIỂN KHAI VÀ PHÂN BỔ SPRINT (5 TUẦN)

| Tuần | Mục tiêu chính | Nhiệm vụ DEV 1 (Role Student) | Nhiệm vụ DEV 2 (Role Teacher) | Nhiệm vụ DEV 3 (Role Admin & Core) |
| :---: | :--- | :--- | :--- | :--- |
| **Sprint 0<br/>(Tuần 1)** | **Khung kiến trúc & Khởi tạo dự án** | - Khảo sát Schema `History`, `Flashcard`, `Bookmark`.<br/>- Dựng khung `studentService.js` giao tiếp API.<br/>- Dựng mockup giao diện Student Dashboard. | - Thiết kế Mongoose Schema `Question`, `Topic`, `Skill`, `Certificate`.<br/>- Xây dựng Seed Data mẫu cho ngân hàng câu hỏi.<br/>- Viết API CRUD danh mục. | - Setup Monorepo, ESLint, Git flow.<br/>- Dựng JWT Auth & Middleware.<br/>- Dựng Axios Interceptor & ProtectRoute.<br/>- Viết API Specs (Swagger/Postman). |
| **Sprint 1<br/>(Tuần 2)** | **Hoàn thiện Core Feature từng Role** | - Nâng cấp Flashcards: Thuật toán 5 hộp Leitner, hiệu ứng Flip 3D, Web Speech TTS.<br/>- Nâng cấp Bookmarks & Profile học viên.<br/>- Lọc thẻ cần ôn hôm nay (Due Flashcards). | - Hoàn thiện API & Giao diện Ngân hàng Câu hỏi (Question Bank).<br/>- Hỗ trợ câu hỏi Trắc nghiệm, Điền từ, Đúng/Sai, Nối cặp. | - Hoàn thiện Module Quản trị Người dùng (User Management table, Filter, Disable).<br/>- Màn hình Quản trị Danh mục (CRUD Topics & Skills). |
| **Sprint 2<br/>(Tuần 3)** | **Đề thi & Phòng thi Trực tuyến** | - Xây dựng Phòng thi trực tuyến (Exam Room): Bộ đếm thời gian thực, bảng câu hỏi, cờ đánh dấu.<br/>- Cơ chế tự nộp bài khi hết giờ.<br/>- Màn hình xem lại kết quả thi (Review Screen). | - Xây dựng Module Soạn Đề thi (Exam Composer).<br/>- Xây dựng Ma trận Đề thi tự động theo độ khó.<br/>- Viết logic Chấm điểm Server-side `POST /exams/:id/submit`. | - Hoàn thiện Hệ thống Báo cáo (Recharts: Lượt thi, Top học viên, Phân bổ điểm).<br/>- Chuyển `SystemNotice` và `Feedback` sang lưu MongoDB. |
| **Sprint 3<br/>(Tuần 4)** | **Tích hợp Trí tuệ Nhân tạo (AI Core)** | - Xây dựng **Chế độ Luyện tập Tức thì (Practice Mode)**: Làm câu nào biết đáp án câu đó.<br/>- Tích hợp **AI Explain Tutor**: Giải thích câu sai chi tiết.<br/>- Xây dựng Sổ tay lỗi sai & bài ôn tập AI (Mistake Fixer). | - Tích hợp **AI Exam Generator**: Giáo viên nhập prompt/đoạn văn -> Sinh đề thi tự động.<br/>- Tích hợp Smart Distractor Generator. | - Tích hợp Rate-limiting bảo vệ API AI.<br/>- Bổ sung Audit Logs & Quản lý hạn ngạch gọi AI (Tokens tracking). |
| **Sprint 4<br/>(Tuần 5)** | **Kiểm thử, Tối ưu & Đóng gói Triển khai** | - Tối ưu Responsive Mobile, kiểm thử trải nghiệm người dùng (UX).<br/>- Fix bug hiển thị biểu đồ và hiệu ứng chuyển trang. | - Kiểm thử tải và kiểm tra logic chống gian lận (Anti-cheat test).<br/>- Import thêm 200+ câu hỏi luyện thi TOEIC/IELTS chuẩn. | - Đóng gói Docker (`docker-compose.yml` gồm MongoDB, Backend, Frontend).<br/>- Viết tài liệu hướng dẫn triển khai & Readme. |

---

## 6. BỘ QUY TẮC PHỐI HỢP DÀNH CHO NHÓM 3 DEVELOPERS

Để đảm bảo 3 người làm việc trơn tru và không xảy ra xung đột code (Merge conflicts):

1. **Chuẩn hóa API Response**:
   Tất cả các API do bất kỳ Dev nào viết đều phải trả về cấu trúc thống nhất:
   ```json
   {
     "success": true,
     "message": "Thao tác thành công",
     "data": { ... }
   }
   ```
   Nếu có lỗi:
   ```json
   {
     "success": false,
     "message": "Mô tả lỗi rõ ràng cho người dùng",
     "errors": [ ... ]
   }
   ```

2. **Quy tắc Git Branching**:
   - Nhánh chính: `main` (chỉ merge khi đã test ổn định).
   - Nhánh phát triển: `develop`.
   - Mỗi Dev tạo nhánh riêng theo tính năng:
     - Dev 1: `feature/admin-auth-users`
     - Dev 2: `feature/teacher-question-exam-ai`
     - Dev 3: `feature/student-quiz-flashcard-ai`

3. **Phân tách Mã nguồn Rõ ràng**:
   - Backend: Chia thư mục route và service riêng biệt theo Role (`routes/admin/`, `routes/teacher/`, `routes/student/` hoặc theo Domain `routes/exams.js`, `routes/questions.js`).
   - Frontend: Không đụng vào thư mục page của nhau. Mọi component dùng chung (Button, Modal, Input, Layout) do Dev 1 chủ trì và đặt trong `src/components/common/`.

4. **Tích hợp AI Tiết Kiệm & Ổn Định**:
   - Đặt biến `GEMINI_API_KEY` hoặc `OPENAI_API_KEY` tại `.env` phía Backend.
   - **Tuyệt đối không gọi trực tiếp API AI từ Frontend** để tránh lộ API Key. Mọi luồng AI đều đi qua Backend Service do nhóm kiểm soát.


