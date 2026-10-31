# Danh Sách Prompts Cho Kombai Để Sinh Các Màn Hình Frontend

Tài liệu này cung cấp các prompt mẫu đã được chuẩn hóa để bạn sao chép (copy) và dán (paste) trực tiếp vào **Kombai** nhằm sinh ra các file React component pixel-perfect cho dự án EnglishQuiz.

---

## 1. Màn Hình Đăng Nhập & Đăng Ký (AuthCard.jsx)
### Prompt cho Kombai:
```text
Tạo cho tôi một Auth Card component bằng React-Bootstrap cho ứng dụng học tiếng Anh EnglishQuiz.
Yêu cầu:
- Hỗ trợ 2 chế độ (Tabs): "Đăng Nhập" và "Đăng Ký".
- Tab Đăng Nhập: Input Email, Password, Checkbox "Ghi nhớ đăng nhập", nút Submit "Đăng Nhập" gradient cam-vàng.
- Tab Đăng Ký: Input Họ và tên, Email, Mật khẩu, Chọn vai trò (Role: Học viên / Giáo viên).
- Nút đăng nhập nhanh bằng Google (có icon Google).
- Bo góc 20px, bóng đổ mềm mại, có nút quay về Trang chủ.
- Xuất thành file AuthCard.jsx.
```

---

## 2. Màn Hình Phòng Thi Trực Tuyến (ExamRoom.jsx)
### Prompt cho Kombai:
```text
Thiết kế giao diện Phòng thi trực tuyến ExamRoom.jsx bằng React-Bootstrap cho học sinh làm bài thi tiếng Anh:
Yêu cầu:
- Header cố định: Tiêu đề đề thi, Badge đồng hồ đếm ngược (đổi màu đỏ khi sắp hết giờ), nút "Nộp bài thi".
- Cột bên trái (70%): Hiển thị nội dung câu hỏi hiện tại, hỗ trợ 4 lựa chọn A, B, C, D to rõ ràng, hiệu ứng hover nổi bật khi click chọn. Nút "Câu trước", "Câu tiếp theo" và nút "Cắm cờ xem lại (Flag)".
- Cột bên phải (30%): Bảng lưới câu hỏi (Question Palette 1 đến 20). Mỗi ô vuông câu hỏi đổi màu xanh khi đã làm, xám khi chưa làm, vàng khi gắn cờ.
- Responsive trên điện thoại (bảng câu hỏi chuyển xuống dưới dạng drawer hoặc thanh cuộn ngang).
```

---

## 3. Thẻ Từ Vựng Lật 3D (Flashcard3D.jsx)
### Prompt cho Kombai:
```text
Tạo component Flashcard3D.jsx bằng React với hiệu ứng lật thẻ 3D (3D Flip Animation):
Yêu cầu:
- Kích thước thẻ chuẩn: 380px x 240px, bo góc 24px, đổ bóng card-shadow.
- Mặt trước: Từ vựng to đậm ở giữa, có icon Loa để nghe phát âm, phiên âm IPA, loại từ. Góc trên hiển thị số thứ tự Hộp Leitner (Box 1-5).
- Mặt sau: Định nghĩa tiếng Việt, câu ví dụ tiếng Anh có in đậm từ vựng, mẹo ghi nhớ.
- Dưới thẻ có 2 nút to: Nút Đỏ "Chưa nhớ" (Reset Hộp 1) và Nút Xanh "Đã thuộc" (Tăng Hộp).
- Click vào thẻ sẽ lật mượt mà 180 độ.
```

---

## 4. Màn Hình Xem Lại Kết Quả Thi (QuizReview.jsx)
### Prompt cho Kombai:
```text
Tạo giao diện màn hình xem lại kết quả thi QuizReview.jsx bằng React-Bootstrap:
Yêu cầu:
- Phần Header: Card điểm số to ở giữa (ví dụ: 18/20 điểm - 90%), Badge "ĐẠT" (PASSED - màu xanh lá), thời gian hoàn thành.
- Danh sách câu hỏi:
  + Câu làm đúng: Viền xanh lá, tích xanh.
  + Câu làm sai: Viền đỏ, dấu gạch chéo đỏ, hiển thị rõ "Bạn chọn: X" và "Đáp án đúng: Y".
  + Khung giải thích chi tiết màu vàng nhạt có icon bóng đèn.
  + Nút "✨ Hỏi gia sư AI về câu này".
- Nút "Làm lại bài thi" và "Quay lại danh sách đề thi".
```

---

## 5. Màn Hình Soạn Đề Thi Theo Ma Trận (ExamComposer.jsx)
### Prompt cho Kombai:
```text
Tạo giao diện Soạn đề thi ExamComposer.jsx dành cho Giáo viên bằng React-Bootstrap:
Yêu cầu:
- Phần 1: Thông tin cơ bản: Tên đề thi, thời gian làm bài (phút), chứng chỉ mục tiêu (TOEIC/IELTS), thể loại (Quiz, Practice, Mock Test).
- Phần 2: Cấu hình Ma trận độ khó tự động:
  + Thanh trượt (Slider) tỷ lệ: % Dễ (Easy), % Trung bình (Medium), % Khó (Hard) cộng lại đủ 100%.
  + Chọn Chủ đề (Topics) và Kỹ năng (Skills).
  + Nút bấm "Sinh đề tự động theo ma trận".
- Phần 3: Danh sách câu hỏi được chọn trong đề có nút xóa hoặc đổi câu hỏi khác.
```

