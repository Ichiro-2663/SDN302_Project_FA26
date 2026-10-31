---
title: "Kế Hoạch Triển Khai Giao Diện Dự Án EnglishQuiz Bằng Kombai & Antigravity"
version: "1.0.0"
status: "active"
project: "EnglishQuiz Platform (SDN302 FA26)"
category: "ui-implementation-plan"
tags: ["kombai", "ui-plan", "prompts", "antigravity", "sdn302-fa26"]
created: "2026-10-31"
author: "Frontend & Architecture Team"
---

# KẾ HOẠCH TRIỂN KHAI GIAO DIỆN DỰ ÁN ENGLISHQUIZ
## (Chiến Lược Tạo Base Trang Chủ & Lộ Trình Ghép Nối Màn Hình Với Kombai Prompts)

---

## 1. MỤC TIÊU VÀ CHIẾN LƯỢC TRIỂN KHAI

### 1.1. Chiến Lược "Base Trước - Tính Năng Sau" (Base-First Incremental Delivery)
Thay vì cố gắng code tất cả các màn hình cùng lúc dẫn đến phân mảnh và xung đột, dự án được khởi tạo theo mô hình:
1. **Base Đã Sẵn Sàng**:
   - Trang chủ hiện đại (`Homepage.jsx`) định hình sẵn toàn bộ phong cách thiết kế (Design Tokens: màu sắc cam-vàng ấm áp, bo góc mềm mại, card hover elevation, typography Plus Jakarta Sans).
   - Thanh điều hướng chung (`Navbar.jsx`) và Chân trang (`Footer.jsx`).
   - Cấu trúc thư mục chuẩn cho cả Backend (`EnglishQuizBE`) và Frontend (`EnglishQuizFE`).
   - Hạ tầng Axios Interceptor trung tâm (`axiosClient.js`) và `AuthContext.js`.
2. **Các Màn Hình Tính Năng Ghép Nối Dần**:
   - 3 lập trình viên sẽ lần lượt dùng **Kombai** để xuất mã nguồn giao diện (Dumb Components) và dùng **Antigravity** để ghép logic nghiệp vụ vào dự án.

---

## 2. LỘ TRÌNH 4 GIAI ĐOẠN PHÁT TRIỂN GIAO DIỆN BẰNG KOMBAI

```
+-----------------------------------------------------------------------------+
|                          LỘ TRÌNH TRIỂN KHAI GIAO DIỆN                      |
+-----------------------------------------------------------------------------+
|  [ ĐÃ XONG ] BASE DỰ ÁN: Homepage.jsx, Navbar.jsx, Footer.jsx, theme.css   |
|                                                                             |
|  [ GIAI ĐOẠN 1 ] XÁC THỰC & HỒ SƠ: AuthCard.jsx, ProfileCard.jsx            |
|                                                                             |
|  [ GIAI ĐOẠN 2 ] HỌC VIÊN (DEV 1): ExamRoom.jsx, QuizReview.jsx,           |
|                                    Flashcard3D.jsx, PracticeView.jsx        |
|                                                                             |
|  [ GIAI ĐOẠN 3 ] GIÁO VIÊN (DEV 2): QuestionBankView.jsx, ExamComposer.jsx  |
|                                                                             |
|  [ GIAI ĐOẠN 4 ] QUẢN TRỊ (DEV 3): UserTable.jsx, ReportsDashboard.jsx     |
+-----------------------------------------------------------------------------+
```

---

## 3. THƯ VIỆN PROMPTS KOMBAI THỰC CHIẾN (COPY & PASTE READY)

Dưới đây là các prompt đã được tinh chỉnh để đưa vào khung chat của **Kombai** (nên chọn model `Claude Opus 5.5` hoặc `GPT 5.1 Sol` như đã hướng dẫn để có code đẹp nhất):

---

### GIAI ĐOẠN 1: MÀN HÌNH XÁC THỰC (AUTH)
#### Prompt Kombai 1.1: `AuthModal.jsx` (Đăng nhập / Đăng ký đa năng)
```text
Hãy thiết kế một Authentication Component AuthModal.jsx bằng React-Bootstrap và CSS Modules cho ứng dụng EnglishQuiz:
Yêu cầu:
- Bọc trong Card bo góc 24px, nền trắng, bóng đổ mềm mại (box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)).
- Sử dụng Tabs để chuyển đổi mượt mà giữa "Đăng Nhập" và "Đăng Ký".
- Tab Đăng Nhập: Input Email, Password, Checkbox "Nhớ mật khẩu", nút "Quên mật khẩu", nút bấm "Đăng Nhập" có gradient cam-vàng (#ea580c đến #f59e0b).
- Tab Đăng Ký: Input Họ tên, Email, Mật khẩu, Xác nhận mật khẩu, Form.Select chọn Vai trò: "Học viên (Student)" hoặc "Giáo viên (Teacher)".
- Nút đăng nhập phụ bằng Google (có logo Google).
- Responsive hoàn hảo trên mobile.
```

---

### GIAI ĐOẠN 2: PHÂN HỆ HỌC VIÊN (ROLE STUDENT - DEV 1)

#### Prompt Kombai 2.1: `ExamRoom.jsx` (Phòng thi trực tuyến)
```text
Thiết kế giao diện Phòng thi trực tuyến ExamRoom.jsx bằng React-Bootstrap:
Yêu cầu:
- Header cố định trên cùng: Tên đề thi, Badge đồng hồ đếm ngược (icon FaClock, hiển thị định dạng mm:ss, đổi sang màu đỏ khi còn dưới 2 phút), nút "Nộp bài thi" màu xanh lá.
- Bố cục 2 cột (Layout):
  + Cột trái (75%): Hiển thị nội dung câu hỏi hiện tại. Hỗ trợ 4 phương án trắc nghiệm A, B, C, D to rõ ràng, có hiệu ứng hover và đổi màu viền khi click chọn. Nút "Câu trước", "Câu tiếp theo" và nút "Cắm cờ xem lại (Flag)".
  + Cột phải (25%): Bảng lưới câu hỏi (Question Palette gồm 20 nút vuông). Đổi màu xanh nếu câu đã làm, xám nếu chưa làm, vàng nếu cắm cờ.
- Responsive: Trên mobile cột phải thu gọn thành thanh cuộn ngang hoặc drawer.
```

#### Prompt Kombai 2.2: `QuizReview.jsx` (Màn hình xem lại kết quả thi)
```text
Thiết kế màn hình xem lại kết quả thi QuizReview.jsx bằng React-Bootstrap:
Yêu cầu:
- Phần Header: Card điểm số to ở giữa: "{score} / {total}" điểm, Badge "ĐẠT" (xanh lá) hoặc "CHƯA ĐẠT" (đỏ), thời gian hoàn thành.
- Danh sách câu hỏi cuộn dọc:
  + Câu làm đúng: Viền xanh lá, có icon tích xanh check.
  + Câu làm sai: Viền đỏ, icon dấu gạch chéo đỏ, hiển thị "Bạn chọn: A" và "Đáp án đúng: B".
  + Khung lời giải thích (Explanation): Nền vàng nhạt, icon bóng đèn FaLightbulb.
  + Nút bấm "✨ Hỏi gia sư AI về câu này".
- Nút "Làm lại bài thi" và "Quay lại danh sách đề thi".
```

#### Prompt Kombai 2.3: `FlashcardCard.jsx` (Thẻ lật từ vựng 3D Leitner)
```text
Thiết kế component thẻ từ vựng lật 3D FlashcardCard.jsx bằng React và CSS 3D Transform:
Yêu cầu:
- Kích thước thẻ: Chiều rộng 400px, chiều cao 250px, bo góc 20px, đổ bóng card-shadow.
- Mặt trước thẻ: Từ vựng tiếng Anh to đậm ở giữa, icon Loa để nghe phát âm, phiên âm IPA, từ loại (Noun/Verb). Góc trên bên phải hiển thị số thứ tự Hộp Leitner (Box 1 đến 5).
- Mặt sau thẻ (lật khi click): Định nghĩa tiếng Việt, câu ví dụ tiếng Anh có in đậm từ vựng, mẹo ghi nhớ.
- Dưới thẻ: 2 nút tương tác lớn: Nút Đỏ "Chưa nhớ" (Reset Hộp 1) và Nút Xanh "Đã thuộc" (Tăng Hộp).
- Hiệu ứng lật mượt mà 180 độ (rotateY).
```

#### Prompt Kombai 2.4: `PracticeModeView.jsx` (Chế độ luyện tập tức thì)
```text
Thiết kế giao diện Chế độ Luyện tập Tức thì PracticeModeView.jsx:
Yêu cầu:
- Thanh tiến độ câu hỏi ở đầu trang (ví dụ: Câu 4/10).
- Chọn chủ đề hoặc kỹ năng bên sidebar trái (Grammar, Vocabulary, Reading).
- Khi học sinh chọn một đáp án và bấm "Kiểm Tra":
  + Ngay lập tức tô xanh nếu đúng hoặc tô đỏ nếu sai.
  + Mở khung Lời giải thích chi tiết phía dưới đáp án.
  + Xuất hiện nút "Câu tiếp theo" để chuyển tiếp.
```

---

### GIAI ĐOẠN 3: PHÂN HỆ GIÁO VIÊN (ROLE TEACHER - DEV 2)

#### Prompt Kombai 3.1: `QuestionBankView.jsx` (Quản lý ngân hàng câu hỏi)
```text
Thiết kế giao diện Quản lý Ngân hàng Câu hỏi QuestionBankView.jsx bằng React-Bootstrap:
Yêu cầu:
- Thanh tìm kiếm và bộ lọc đa tầng: Cấp độ (A1-C2), Kỹ năng (Listening, Reading, Grammar), Chủ đề (Topics).
- Nút "Thêm câu hỏi mới" và "✨ Sinh câu hỏi bằng AI".
- Bảng danh sách câu hỏi: Cột Nội dung câu hỏi, Cấp độ, Dạng câu (MultipleChoice, FillInBlank, Matching), Chủ đề, Hành động (Sửa, Xóa).
- Phân trang pagination ở cuối bảng.
```

#### Prompt Kombai 3.2: `ExamComposer.jsx` (Soạn đề thi theo ma trận độ khó)
```text
Thiết kế giao diện Soạn đề thi ExamComposer.jsx:
Yêu cầu:
- Phần 1: Form thông tin đề: Tên đề, thời gian làm bài (phút), thể loại (Quiz, Practice, Mock Test).
- Phần 2: Thanh cấu hình Ma trận Độ khó:
  + 3 thanh trượt (Sliders): % Dễ, % Trung bình, % Khó cộng lại đủ 100%.
  + Chọn Chủ đề và Kỹ năng phân bổ.
  + Nút "Tự động sinh đề theo ma trận".
- Phần 3: Bảng xem trước danh sách câu hỏi trong đề, có thể kéo-thả đổi vị trí hoặc xóa bớt câu.
```

---

### GIAI ĐOẠN 4: PHÂN HỆ QUẢN TRỊ (ROLE ADMIN - DEV 3)

#### Prompt Kombai 4.1: `UserManagementView.jsx` (Quản lý người dùng)
```text
Thiết kế bảng Quản trị Người dùng UserManagementView.jsx bằng React-Bootstrap:
Yêu cầu:
- Thanh công cụ: Ô tìm kiếm theo Tên/Email, Bộ lọc theo Vai trò (Student, Teacher, Admin), Bộ lọc Trạng thái (Active, Disabled).
- Bảng danh sách: Avatar/Tên, Email, Vai trò (Badge màu khác nhau), Ngày tham gia, Trạng thái (Active xanh, Disabled đỏ).
- Cột Hành động: Nút Đổi vai trò, Nút Khóa/Mở tài khoản, Nút Xem lịch sử thi.
```

#### Prompt Kombai 4.2: `ReportsDashboardView.jsx` (Báo cáo thống kê Recharts)
```text
Thiết kế giao diện Báo cáo Thống kê Toàn hệ thống ReportsDashboardView.jsx:
Yêu cầu:
- 4 Card chỉ số trên cùng: Tổng học viên, Tổng đề thi, Lượt thi tuần này, Điểm trung bình hệ thống.
- Khung biểu đồ Recharts (ComposedChart): Cột màu cam thể hiện số lượt thi, đường kẻ màu xanh thể hiện điểm trung bình theo từng ngày.
- Bảng danh sách Top 5 học viên có thành tích xuất sắc nhất kèm huy chương Vàng, Bạc, Đồng.
```

---

## 4. QUY TRÌNH GHÉP NỐI UI TỪ KOMBAI VÀO DỰ ÁN BẰNG ANTIGRAVITY

Sau khi Kombai xuất file component giao diện:
1. **Lưu file**: Đặt file JSX từ Kombai vào đúng thư mục tương ứng trong `EnglishQuizFE/src/components/`.
2. **Gắn kết nối với Antigravity**:
   Mở Antigravity và dùng lệnh mẫu sau để ráp dữ liệu và logic:
   > *"Antigravity, tôi vừa thêm component UI `[TênComponent].jsx` từ Kombai vào dự án. Hãy giúp tôi:*
   > *1. Giữ nguyên toàn bộ phần CSS layout và giao diện của Kombai.*
   > *2. Gắn kết nối với API từ `src/api/axiosClient.js`.*
   > *3. Thêm các hàm xử lý sự kiện `onClick`, `onChange`, `useEffect` để dữ liệu hoạt động thực tế.*
   > *4. Đăng ký route mới này vào `src/App.jsx`."*

