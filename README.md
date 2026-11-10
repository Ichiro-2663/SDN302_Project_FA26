# EnglishQuiz Platform (SDN302 FA26)
> **Hệ thống đánh giá năng lực tiếng Anh trực tuyến, sinh đề tự động và học từ vựng ngắt quãng Leitner 5 hộp.**

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![QA Tests](https://img.shields.io/badge/QA_Tests-56%2F56_PASS_(100%25)-brightgreen?logo=checkmarx&logoColor=white)](./docs/course-project-report.md)
[![Build](https://img.shields.io/badge/Build-Compiled_Successfully-success)](./docs/deployment-guide.md)

---

## 📚 Hệ Thống Tài Liệu Dự Án (Documentation Suite)

Bộ tài liệu hoàn chỉnh được xây dựng dựa trên tiêu chuẩn Báo cáo Kiến trúc & Thiết kế Phần mềm (Course Project Report) môn SDN302 / SWD392 và chuẩn `/ck:docs`:

1. **[Báo Cáo Toàn Diện Dự Án (Course Project Report)](./docs/course-project-report.md):** Tài liệu học thuật đầy đủ 6 chương (Overview, Requirement Specification, Analysis Models, Design Specification, Implementation Mapping, Alternative Architecture Patterns) với biểu đồ Mermaid phong phú.
2. **[Kiến Trúc Hệ Thống (System Architecture)](./docs/system-architecture.md):** Kiến trúc 3 tầng (Presentation, Application, Data), cơ chế bảo mật chống gian lận (Anti-Cheat), sơ đồ tuần tự (Sequence Diagrams) và thiết kế CSDL (ERD).
3. **[Tổng Quan Sản Phẩm & Yêu Cầu (Project Overview & PDR)](./docs/project-overview-pdr.md):** Phân tích người dùng, bài toán thực tiễn, ma trận tính năng và tiêu chí thành công.
4. **[Tóm Tắt Mã Nguồn (Codebase Summary)](./docs/codebase-summary.md):** Bản đồ cấu trúc thư mục, danh mục API RESTful và thành phần frontend React.
5. **[Quy Chuẩn Viết Code (Code Standards)](./docs/code-standards.md):** Tiêu chuẩn an toàn, nguyên tắc Anti-Cheat server-side, thuật toán Leitner Spaced Repetition và quy tắc URL sync F5.
6. **[Hướng Dẫn Cài Đặt & Triển Khai (Deployment Guide)](./docs/deployment-guide.md):** Hướng dẫn clone, cấu hình database, seed dữ liệu mẫu, tài khoản demo và quy trình kiểm thử.

---

## 🌟 Tính Năng Trọng Tâm

- 🔒 **Chế Độ Phòng Thi Bảo Mật & Chống Gian Lận (Anti-Cheat Lockdown):**
  - Tự động bóc tách và xóa sạch `correctAnswer` và `explanation` trên máy chủ (`GET /exams/:id/take`), ngăn chặn triệt để hành vi soi mạng (Inspect Element / Network tab).
  - Khóa điều hướng (`isExamLocked`): Ẩn Sidebar, mở rộng không gian thi full screen, cảnh báo `beforeunload` khi thí sinh có ý định tải lại hoặc đóng tab.
  - Chấm điểm chuẩn hóa phía Server (`POST /exams/:id/submit`) lưu trữ kết quả `History` an toàn.
- 🎴 **Thẻ Từ Vựng 3D Leitner 5 Hộp (Spaced Repetition):**
  - Thẻ lật 3D tương tác (380×240px, góc bo 24px, 0.6s flip animation) theo thiết kế Kombai.
  - Tích hợp phiên âm IPA (JetBrains Mono) và phát âm tự nhiên qua Web Speech API.
  - Thăng hạng (Hộp 1 → 5) khi nhớ đúng và reset nghiêm ngặt về Hộp 1 khi quên.
- ⚡ **Tự Động Sinh Đề Ma Trận & Mini Test Nhanh:**
  - Giáo viên tạo đề thi tự động theo ma trận độ khó (Dễ, Trung bình, Khó) hoặc Mini Test nhanh 5–15 câu chỉ trong 1 thao tác.
  - Tự động phát thông báo (`Notice`) tới học viên với nút truy cập nhanh **`🚀 Vào Phòng Thi Ngay`**.
- 🔄 **Đồng Bộ URL Subpath & Giữ Trạng Thái F5:**
  - Đồng bộ trạng thái tab đang chọn với URL (`/student/quiz`, `/student/minitest`, `/teacher/exams`, `/admin/users`).
  - Tải lại trang (F5) không bao giờ bị nhảy về Dashboard.

---

## 🚀 Khởi Chạy Nhanh

### 1. Khởi động Backend (Port 9999)
```bash
cd EnglishQuizBE
npm install
node seed.js    # Khởi tạo CSDL & ngân hàng câu hỏi
node server.js
```

### 2. Khởi động Frontend (Port 3000)
```bash
cd EnglishQuizFE
npm install
npm start
```
Truy cập: **`http://localhost:3000`**

### 3. Tài Khoản Thử Nghiệm

| Vai trò | Email | Mật khẩu | Đặc quyền |
| :--- | :--- | :--- | :--- |
| **Học viên (Student)** | `student@gmail.com` | `123456` | Luyện tập, làm bài thi bấm giờ, học từ vựng Flashcards 3D, sổ tay câu hỏi |
| **Giáo viên (Teacher)** | `teacher@gmail.com` | `123456` | Quản lý ngân hàng câu hỏi, tạo đề ma trận & mini test, gửi thông báo |
| **Quản trị (Admin)** | `admin@gmail.com` | `123456` | Quản lý tài khoản người dùng, phân quyền, thống kê hệ thống |

---

## 🧪 Kiểm Thử Tự Động (Dual-Pass QA)

Chạy bộ kiểm thử 56 ca kiểm thử tích hợp liên tiếp 2 vòng:
```bash
cd EnglishQuizBE
node tests/live-e2e-suite.js
```
Kết quả: **56/56 Passed (100%)** qua cả 2 vòng kiểm định.
