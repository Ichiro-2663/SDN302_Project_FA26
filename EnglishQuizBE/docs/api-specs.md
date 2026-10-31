# EnglishQuiz Backend API Specifications

## 1. Authentication Endpoints (\/auth\)
- **POST \/auth/register\**: Đăng ký người dùng mới.
  - Body: \{ name, email, password, role: "Student" | "Teacher" | "Admin" }\
- **POST \/auth/login\**: Đăng nhập tài khoản, trả về JWT Token.
  - Body: \{ email, password }\
  - Response: \{ success: true, token, user: { _id, name, email, role } }\

## 2. Exam Endpoints (\/exams\)
- **GET \/exams\**: Lấy danh sách đề thi (hỗ trợ query \?type=quiz|practice|minitest\).
- **GET \/exams/:id\**: Lấy thông tin chi tiết đề thi.
- **GET \/exams/:id/take\**: Lấy đề thi để làm (ẨN \correctAnswer\ và \explanation\).
- **POST \/exams/:id/submit\**: Nộp bài thi để server tự chấm điểm.
  - Body: \{ answers: { [questionId]: selectedValue } }\
  - Response: \{ score, total, status: "PASSED" | "FAILED", details: [...] }\
- **POST \/exams\**: Tạo đề thi mới (Role: Teacher, Admin).
- **PUT \/exams/:id\**: Cập nhật đề thi.
- **DELETE \/exams/:id\**: Xóa đề thi.
- **GET \/exams/stats\**: Thống kê số lượt thi và điểm trung bình cho dashboard.

## 3. Question Bank Endpoints (\/questions\)
- **GET \/questions\**: Lấy danh sách câu hỏi (\?topic=...&skill=...&level=...\).
- **GET \/questions/:id\**: Lấy chi tiết câu hỏi.
- **POST \/questions\**: Thêm câu hỏi mới.
- **PUT \/questions/:id\**: Chỉnh sửa câu hỏi.
- **DELETE \/questions/:id\**: Xóa câu hỏi.

## 4. Flashcards Endpoints (\/flashcards\)
- **GET \/flashcards/user/:userId\**: Lấy danh sách thẻ từ vựng của học viên.
- **POST \/flashcards\**: Tạo thẻ từ vựng mới.
- **PUT \/flashcards/:id\**: Cập nhật thẻ từ vựng.
- **DELETE \/flashcards/:id\**: Xóa thẻ.
- **POST \/flashcards/:id/review\**: Đánh giá thẻ theo thuật toán Leitner 5 hộp.
  - Body: \{ isCorrect: true | false }\

## 5. History & Bookmarks Endpoints
- **GET \/history/:userId\**: Xem lịch sử thi cử của học viên.
- **GET \/bookmarks/user/:userId\**: Lấy danh sách câu hỏi đã lưu.
- **POST \/bookmarks\**: Đánh dấu câu hỏi yêu thích.
- **DELETE \/bookmarks/:id\**: Xóa đánh dấu.

## 6. System Taxonomies (\/topics\, \/skills\, \/certificates\)
- CRUD Chủ đề, Kỹ năng, Chứng chỉ mục tiêu.
