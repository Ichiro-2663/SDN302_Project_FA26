# SDN302_Project_FA26: EnglishQuiz Platform
> Hệ thống ôn luyện thi tiếng Anh trực tuyến với thuật toán lặp lại ngắt quãng (Leitner Spaced Repetition 5 hộp), ngân hàng đề thi chuẩn hóa và Trợ lý AI thông minh.

---

## 1. CẤU TRÚC DỰ ÁN

```
SDN302_Project_FA26/
├── docs/                                   # Tài liệu dự án & Kế hoạch tổng thể
│   ├── project-analysis-roadmap.md         # Báo cáo phân tích toàn diện & lộ trình nâng cấp
│   ├── project-rebuild-ai-plan.md          # Kế hoạch chi tiết phân chia 3 Dev & ứng dụng AI
│   ├── student-role-prompts.md             # Bộ Prompt thực chiến cho Dev 1 (Role Student)
│   └── kombai-ui-implementation-plan.md    # Kế hoạch triển khai UI bằng Kombai Prompts
│
├── EnglishQuizBE/                          # Backend RESTful API (Node.js / Express / MongoDB)
│   ├── docs/
│   │   ├── api-specs.md                    # Đặc tả chi tiết các REST API endpoints
│   │   └── database-schema.md              # Đặc tả các Schema Mongoose
│   ├── config/db.js                        # Kết nối MongoDB
│   ├── middlewares/auth.js                 # JWT Authentication & RBAC Middleware
│   ├── models/                             # Mongoose Schemas (User, Question, Exam, ...)
│   ├── routes/                             # API Routes (auth, user, exam, question, ...)
│   ├── data/                               # Dữ liệu mẫu (Seed data JSON)
│   ├── server.js                           # Server khởi chạy chính
│   └── package.json
│
└── EnglishQuizFE/                          # Frontend SPA (React / React-Bootstrap)
    ├── docs/
    │   ├── component-architecture.md       # Kiến trúc Component & State Frontend
    │   └── kombai-prompts.md               # Danh sách Prompts tạo màn hình với Kombai
    ├── public/index.html                   # HTML template
    ├── src/
    │   ├── api/axiosClient.js              # Axios instance có Interceptor tự inject Token
    │   ├── components/layout/              # Navbar, Footer
    │   ├── context/AuthContext.js          # Quản lý phiên đăng nhập
    │   ├── pages/Homepage.jsx              # Trang chủ Base hoàn chỉnh & bắt mắt
    │   ├── styles/theme.css                # CSS variables, gradient, card styling
    │   ├── App.jsx                         # Bộ định tuyến React Router
    │   └── index.js                        # Điểm khởi tạo React
    └── package.json
```

---

## 2. HƯỚNG DẪN KHỞI CHẠY DỰ ÁN

### Yêu cầu tiên quyết:
- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản v18 trở lên).
- Đã cài đặt và khởi động dịch vụ [MongoDB](https://www.mongodb.com/) (chạy ở cổng mặc định `mongodb://localhost:27017`).

### Bước 1: Khởi động Backend
```bash
cd EnglishQuizBE
npm install
npm run dev
```
> Server Backend sẽ chạy tại: **http://localhost:9999**

### Bước 2: Khởi động Frontend
Mở một cửa sổ Terminal mới:
```bash
cd EnglishQuizFE
npm install
npm start
```
> Giao diện Trang chủ sẽ mở tại: **http://localhost:3000**

---

## 3. PHÂN CHIA NHIỆM VỤ 3 DEVELOPERS

| Thành viên | Role đảm nhiệm | Trọng tâm công việc |
| :--- | :--- | :--- |
| **DEV 1** | **ROLE STUDENT (Học viên)** | Xây dựng phòng thi có đếm giờ (`ExamRoom`), màn hình xem lại kết quả (`QuizReview`), thẻ từ vựng lật 3D (`FlashcardCard`), sổ tay câu sai (`MistakeNotebook`), tích hợp AI Tutor giải thích câu sai. |
| **DEV 2** | **ROLE TEACHER (Giáo viên)** | Xây dựng ngân hàng câu hỏi (`QuestionBank`), công cụ soạn đề theo ma trận độ khó (`ExamComposer`), xây dựng lõi chấm điểm an toàn Server-side, AI sinh đề thi tự động. |
| **DEV 3** | **ROLE ADMIN & CORE SYSTEM** | Quản trị người dùng (`UserManagement`), hệ thống báo cáo biểu đồ Recharts, chuyển Thông báo & Feedback sang MongoDB, hoàn thiện bảo mật JWT và Axios Interceptor. |

---

## 4. QUY TRÌNH PHỐI HỢP KOMBAI VÀ ANTIGRAVITY

1. **Thiết kế UI bằng Kombai**:
   - Mở tài liệu `docs/kombai-ui-implementation-plan.md` hoặc `EnglishQuizFE/docs/kombai-prompts.md`.
   - Copy prompt tương ứng dán vào Kombai để Kombai xuất mã nguồn React component tĩnh (.jsx).
2. **Gắn Logic bằng Antigravity**:
   - Copy file JSX từ Kombai vào `EnglishQuizFE/src/components/`.
   - Dùng Antigravity để kết nối component với API `src/api/axiosClient.js`, quản lý State và đăng ký Route vào `App.jsx`.
