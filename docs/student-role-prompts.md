---
title: "Bo Prompts Chuan Thuc Chien Danh Cho Developer 1: Role Student"
version: "1.0.0"
status: "ready"
project: "EnglishQuiz Platform (SDN302)"
category: "prompt-playbook"
role: "Student (Hoc vien)"
tags: ["prompts", "student-role", "kombai", "antigravity", "ai-companion"]
created: "2026-10-31"
author: "Dev 1 / Lead Architect"
---
# BỘ PROMPTS CHUẨN DÀNH CHO DEVELOPER 1: ROLE STUDENT
## (Hướng Dẫn Từng Bước Dùng AI Để Hoàn Thiện & Nâng Cấp Phân Hệ Học Viên)

---

## 0. HƯỚNG DẪN SỬ DỤNG CHO DEV 1

Tài liệu này được biên soạn độc quyền cho **Developer 1 (Phụ trách Phân hệ Student - Học viên)**.
Mỗi prompt dưới đây được thiết kế sẵn theo chuẩn **Role - Task - Context - Constraints - Output Format**. Bạn chỉ cần sao chép (copy) và dán (paste) nguyên văn vào trợ lý AI lập trình (như Antigravity, ChatGPT, Claude hoặc Gemini) để AI viết code chính xác 100%, không bị lỗi và tuân thủ đúng kiến trúc dự án.

> **Quy ước công nghệ của dự án**:
> - Frontend: React, React-Bootstrap, `react-icons`, Axios (đọc từ biến môi trường `process.env.REACT_APP_API_URL || "http://localhost:9999"`).
> - Backend: Node.js, Express, Mongoose (MongoDB).
> - Phân quyền: Học viên có `role: "Student"`.

---

## PHẦN 1: SỬA LỖI & HOÀN THIỆN CÁC TÍNH NĂNG HIỆN CÓ

---

### PROMPT 1.1: TẬP TRUNG HÓA GỌI API CHO STUDENT (`studentService.js`)
*Mục đích: Gom tất cả các hàm gọi API của học viên vào 1 file duy nhất, thay vì viết `axios.get("http://localhost:9999/...")` rải rác khắp các component.*

```markdown
Bạn là lập trình viên Frontend React chuyên nghiệp. 
Hãy tạo cho tôi file `src/services/studentService.js` để tập trung toàn bộ các hàm gọi API cho phân hệ Student (Học viên) trong dự án EnglishQuiz.

Yêu cầu kỹ thuật:
1. Sử dụng axios instance từ `src/api/axiosClient.js` (đã có sẵn baseURL và tự gắn Authorization Header Bearer Token).
2. Viết các hàm async sau (có try/catch và trả về data hoặc ném lỗi rõ ràng):
   - `getExams(type, level)`: Lấy danh sách đề thi (hỗ trợ filter type: 'quiz', 'practice', 'minitest').
   - `getExamForTaking(examId)`: Lấy nội dung đề thi để làm bài (gọi endpoint `GET /exams/${examId}/take`).
   - `submitExam(examId, payload)`: Gửi bài thi lên server chấm điểm (gọi endpoint `POST /exams/${examId}/submit` với `{ answers: {...} }`).
   - `getExamHistory(userId)`: Lấy lịch sử làm bài thi của học viên (`GET /history/${userId}`).
   - `getFlashcards(userId, topic, type)`: Lấy danh sách flashcards của học viên.
   - `reviewFlashcard(cardId, isCorrect)`: Cập nhật tiến độ Leitner (`POST /flashcards/${cardId}/review`).
   - `createFlashcard(payload)`: Thêm flashcard mới.
   - `deleteFlashcard(cardId)`: Xóa flashcard.
   - `getBookmarks(userId)`: Lấy danh sách câu hỏi đã bookmark (`GET /bookmarks/user/${userId}`).
   - `toggleBookmark(payload)`: Đánh dấu/bỏ đánh dấu câu hỏi (`POST /bookmarks` hoặc `DELETE /bookmarks/${id}`).
   - `getUserProfile(userId)` và `updateUserProfile(userId, data)`: Lấy và cập nhật profile học viên.

Định dạng xuất: Cung cấp mã nguồn hoàn chỉnh của `src/services/studentService.js`, có comment giải thích rõ ràng.
```

---

### PROMPT 1.2: NÂNG CẤP PHÒNG THI AN TOÀN, ĐẾM GIỜ VÀ TỰ ĐỘNG NỘP BÀI (`Quiz.js`)
*Mục đích: Sửa lỗi lộ đáp án, bổ sung đồng hồ đếm ngược thời gian thực, bảng điều hướng câu hỏi và tự động nộp bài khi hết giờ.*

```markdown
Bạn là Senior React Developer. Hãy viết lại hoàn toàn component `src/components/User/Quiz.js` để tạo thành một Phòng thi trực tuyến (Exam Room) chuyên nghiệp và chống gian lận cho học viên.

Yêu cầu chi tiết:
1. Luồng tải đề thi:
   - Dùng `getExamForTaking(examId)` từ `studentService.js`.
   - Lưu ý: Dữ liệu câu hỏi nhận về KHÔNG chứa `correctAnswer` và `explanation` (để bảo mật).
2. Bộ đếm thời gian thi (Countdown Timer):
   - Lấy thời gian từ `exam.duration` (phút).
   - Dùng hook `useEffect` đếm lùi từng giây. Hiển thị badge đồng hồ nổi bật (đổi sang màu đỏ cảnh báo khi còn dưới 2 phút).
   - KHI THỜI GIAN VỀ 0: Tự động gọi hàm nộp bài `handleSubmit()` ngay lập tức kèm thông báo "Đã hết thời gian làm bài!".
3. Bảng điều hướng câu hỏi (Question Palette):
   - Bên cạnh câu hỏi đang làm, hiển thị lưới số thứ tự các câu (1, 2, 3, ... N).
   - Tô màu trạng thái: 
     + Xanh lá: Câu đã trả lời.
     + Trắng/Xám: Câu chưa trả lời.
     + Vàng: Câu được học viên cắm cờ xem lại (`Flag for review`).
   - Bấm vào số câu trên lưới sẽ nhảy trực tiếp đến câu đó.
4. Hỗ trợ đa dạng loại câu hỏi:
   - `MultipleChoice`: Các radio button chọn 1 đáp án A, B, C, D.
   - `TrueFalse`: 2 nút True / False to, trực quan.
   - `FillInBlank`: Input text nhập câu trả lời.
   - `Matching`: Ghép cặp trực quan.
5. Luồng nộp bài (Submit):
   - Trước khi nộp, nếu còn câu chưa làm thì hiển thị Modal cảnh báo: "Bạn còn X câu chưa làm, bạn có chắc chắn muốn nộp bài?".
   - Khi nộp, gửi payload dạng `{ answers: { [questionId]: selectedValue } }` qua `studentService.submitExam(examId, payload)`.
   - Nhận kết quả chấm điểm chính thức từ Server và chuyển sang màn hình Review kết quả.
6. Giao diện: Sử dụng `react-bootstrap`, icon từ `react-icons`, thiết kế hiện đại, bo góc mềm mại, responsive trên di động.

Định dạng xuất: Mã nguồn đầy đủ của `Quiz.js`.
```

---

### PROMPT 1.3: MÀN HÌNH XEM LẠI KẾ QUẢ THI CHI TIẾT (`QuizReview.js`)
*Mục đích: Hiển thị bảng điểm chính thức từ server, phân tích câu đúng/sai, lời giải thích và nút hỏi gia sư AI.*

```markdown
Hãy tạo một component mới `src/components/User/QuizReview.js` để hiển thị kết quả chi tiết sau khi học viên nộp bài thi hoặc khi xem lại một bài thi trong mục Lịch sử (`History.js`).

Yêu cầu chi tiết:
1. Nhận props: `resultData` (chứa score, total, status, questions, userAnswers, explanations).
2. Phần Header tổng kết:
   - Card điểm số to, bắt mắt: `{score} / {total}` điểm.
   - Tỷ lệ phần trăm làm đúng và Badge: "PASSED" (màu xanh lá) nếu >= 50%, "FAILED" (màu đỏ) nếu < 50%.
   - Thời gian hoàn thành bài thi.
3. Danh sách phân tích từng câu hỏi:
   - Duyệt qua từng câu hỏi:
     + Hiển thị rõ câu hỏi, loại câu hỏi, điểm số.
     + Nếu người dùng chọn đúng: Viền xanh lá (Border Success), có icon tích xanh check.
     + Nếu người dùng chọn sai: Viền đỏ (Border Danger), có icon dấu gạch chéo đỏ. Hiển thị rõ "Đáp án của bạn: X" và "Đáp án đúng: Y".
     + Phần Giải thích chi tiết (`Explanation`): Đặt trong khung nền màu vàng/xanh pastel nhẹ, có icon bóng đèn sáng `FaLightbulb`.
4. Nút chức năng cho từng câu hỏi:
   - Nút Bookmark: Lưu câu này vào mục yêu thích để xem lại sau.
   - Nút AI Tutor: "✨ Giải thích vì sao tôi sai (Hỏi AI)" (khi bấm sẽ gọi hàm `onAskAI(question, userAns, correctAns)` - sẽ tích hợp ở Prompt 3.2).
5. Nút điều hướng cuối trang:
   - "Làm lại bài thi này" (Retake).
   - "Quay lại danh sách đề thi".

Định dạng xuất: Mã nguồn React component `QuizReview.js`.
```

---

### PROMPT 1.4: NÂNG CẤP FLASHCARD THUẬT TOÁN LEITNER 5 HỘP + PHÁT ÂM TTS (`Flashcards.js`)
*Mục đích: Hoàn thiện tính năng học từ vựng khoa học theo phương pháp lặp lại ngắt quãng (Spaced Repetition).*

```markdown
Bạn là chuyên gia React & EdTech. Hãy viết lại component `src/components/User/Flashcards.js` để biến nó thành một ứng dụng học từ vựng chuẩn thuật toán Leitner 5 Hộp (Leitner Spaced Repetition Box).

Yêu cầu chức năng:
1. Thuật toán Leitner 5 Hộp:
   - Hộp 1: Ôn sau 1 ngày (Mới học / Hay quên).
   - Hộp 2: Ôn sau 3 ngày.
   - Hộp 3: Ôn sau 7 ngày.
   - Hộp 4: Ôn sau 14 ngày.
   - Hộp 5: Ôn sau 30 ngày (Đã ghi nhớ sâu).
   - Hiển thị thanh tiến trình 5 hộp để học sinh thấy từ vựng của mình đang nằm ở hộp nào.
2. Bộ lọc thông minh:
   - Tab "Cần ôn hôm nay (Due Today)": Lọc các thẻ có `nextReviewDate <= Date.now()`.
   - Tab "Tất cả từ vựng" và bộ lọc theo Chủ đề (Topic).
3. Thẻ tương tác 3D Flip Card:
   - Mặt trước: Từ vựng to rõ ràng, nút bấm nghe phát âm (dùng Web Speech API `speechSynthesis` chuẩn giọng tiếng Anh 'en-US'), loại từ (noun/verb/adj), phiên âm IPA.
   - Mặt sau (Lật khi click): Định nghĩa tiếng Việt, câu ví dụ thực tế (Example sentence) có highlight từ vựng, mẹo ghi nhớ.
4. Cơ chế Đánh giá:
   - Nút Đỏ "Chưa nhớ" (Incorrect): Gọi API review với `{ isCorrect: false }` -> Thẻ bị rớt về Hộp 1 ngay lập tức.
   - Nút Xanh "Đã thuộc" (Correct): Gọi API review với `{ isCorrect: true }` -> Thẻ thăng lên hộp tiếp theo (tối đa Hộp 5), tính ngày ôn tiếp theo.
   - Tự động chuyển mượt mà sang thẻ tiếp theo sau khi đánh giá.
5. Thêm từ vựng mới:
   - Modal thêm từ có sẵn các trường: Từ vựng, nghĩa, ví dụ, phiên âm, topic.
   - Có nút "✨ AI tự động điền" (để chuẩn bị kết nối AI Prompt 3.3).

Định dạng xuất: Toàn bộ mã nguồn `Flashcards.js` kèm CSS 3D flip card gọn nhẹ.
```

---

## PHẦN 2: XÂY DỰNG CÁC TÍNH NĂNG MỚI CẦN THIẾT

---

### PROMPT 2.1: CHẾ ĐỘ LUYỆN TẬP TỨC THÌ (`Practice.js`)
*Mục đích: Giúp học viên tự do ôn luyện từng câu, nhận phản hồi đúng/sai và giải thích ngay lập tức sau mỗi câu chọn mà không bị áp lực thời gian.*

```markdown
Hãy viết lại component `src/components/User/Practice.js` để xây dựng chế độ "Luyện tập tức thì" (Instant Practice Mode) cho học viên.

Sự khác biệt với Quiz:
- Không giới hạn thời gian (không đếm ngược).
- Chọn chủ đề (Topic) hoặc kỹ năng (Skill: Grammar, Vocab, Reading, Listening) và cấp độ (A1 đến C2).
- Học sinh làm câu nào -> Chọn đáp án -> Bấm "Kiểm tra" -> Hệ thống hiển thị NGAY LẬP TỨC đáp án đó Đúng hay Sai, kèm lời giải thích chi tiết phía dưới.

Yêu cầu chi tiết:
1. Màn hình chọn bài luyện tập:
   - Lọc theo Topic (Business, Travel, Daily Life, Academic...).
   - Lọc theo Skill (Grammar, Vocabulary, Reading).
   - Chọn số lượng câu muốn luyện (Ví dụ: 5 câu, 10 câu, 20 câu).
2. Giao diện làm bài tương tác từng câu:
   - Hiển thị thanh tiến độ: "Câu 3 / 10".
   - Sau khi học sinh chọn đáp án và bấm "Kiểm tra (Check)":
     + Vô hiệu hóa lựa chọn để không chọn lại.
     + Nếu Đúng: Tô xanh phương án đã chọn, hiển thị thông báo "Chính xác! 🎉".
     + Nếu Sai: Tô đỏ phương án đã chọn và tô xanh phương án đúng, hiển thị "Chưa chính xác! 💡".
     + Hiển thị khung Lời giải thích (Explanation).
     + Nút Bookmark câu hỏi nếu thấy hay.
     + Nút "Câu tiếp theo (Next)".
3. Màn hình Tổng kết buổi luyện tập:
   - Tỷ lệ đúng (Ví dụ: 8/10 câu - 80%).
   - Nút "Luyện tập tiếp" hoặc "Xem lại các câu đã làm sai".

Định dạng xuất: Mã nguồn hoàn chỉnh `Practice.js`.
```

---

### PROMPT 2.2: SỔ TAY CÂU HỎI LÀM SAI (`MistakeNotebook.js`)
*Mục đích: Tự động gom các câu hỏi học viên từng làm sai từ bảng lịch sử làm bài để học sinh ôn tập lại.*

```markdown
Hãy tạo một component mới `src/components/User/MistakeNotebook.js` (Sổ tay câu hỏi làm sai) để giúp học viên xem lại và làm lại các câu hỏi đã từng làm sai trong các bài kiểm tra.

Yêu cầu kỹ thuật:
1. Thu thập dữ liệu:
   - Gọi API `getExamHistory(userId)` để lấy toàn bộ lịch sử thi.
   - Quét qua mảng `answers` của tất cả các bài thi, lọc ra những câu hỏi mà học viên đã chọn sai (đối chiếu đáp án của user vs đáp án đúng của câu hỏi).
   - Gom nhóm và loại bỏ câu trùng lặp (nếu cùng 1 câu hỏi bị làm sai nhiều lần thì ghi nhận số lần sai: "Sai 2 lần").
2. Giao diện hiển thị:
   - Thống kê đầu trang: Tổng số câu hỏi đang làm sai, phân bổ theo Topic/Kỹ năng.
   - Accordion hoặc Card danh sách câu sai:
     + Nội dung câu hỏi, kỹ năng, chủ đề.
     + Lựa chọn sai mà học viên từng chọn (màu đỏ) vs Đáp án đúng chuẩn (màu xanh).
     + Lời giải thích.
3. Nút hành động đắt giá:
   - Nút "Xóa khỏi sổ lỗi": Khi học viên cảm thấy đã hiểu và thuần thục câu này.
   - Nút "✨ Ôn tập lại các câu sai": Bấm vào sẽ khởi tạo một bài thi mini gồm chính những câu hỏi trong sổ lỗi để học viên làm lại trực tiếp.

Định dạng xuất: Mã nguồn hoàn chỉnh `MistakeNotebook.js`.
```

---

### PROMPT 2.3: NÂNG CẤP BIỂU ĐỒ NĂNG LỰC HỌC VIÊN (`UserDashboard.js`)
*Mục đích: Trực quan hóa tiến độ học tập, biểu đồ mạng nhện (Radar Chart) đánh giá 5 kỹ năng tiếng Anh.*

```markdown
Hãy nâng cấp component `src/components/User/UserDashboard.js` thành một trang Dashboard cá nhân hóa, truyền cảm hứng học tập cho học viên.

Yêu cầu chi tiết:
1. Thống kê tổng quan (Top Metric Cards):
   - Tổng số bài thi đã làm.
   - Tỷ lệ đỗ trung bình (Pass Rate %).
   - Số từ vựng Flashcard đã thuộc (Box 4, 5) / Tổng số từ vựng.
   - Chuỗi ngày học liên tục (Learning Streak: ví dụ 🔥 5 ngày liên tiếp).
2. Biểu đồ Radar Chart (Đánh giá kỹ năng):
   - Sử dụng `RadarChart`, `PolarGrid`, `PolarAngleAxis`, `PolarRadiusAxis`, `Radar` từ thư viện `recharts`.
   - Phân tích điểm trung bình của học viên qua 5 kỹ năng: Ngữ pháp (Grammar), Từ vựng (Vocabulary), Đọc hiểu (Reading), Nghe (Listening), Sử dụng ngôn ngữ tổng hợp.
   - Giúp học viên nhìn thấy ngay điểm mạnh và kỹ năng còn yếu cần cải thiện.
3. Danh sách Đề xuất cá nhân hóa (Recommended for You):
   - Nếu điểm Ngữ pháp thấp -> Đề xuất "Bài luyện tập Ngữ pháp B1".
   - Nhắc nhở: "Bạn có X từ vựng cần ôn tập hôm nay trong Flashcard".
4. Lịch sử bài thi gần đây: Bảng 5 bài kiểm tra gần nhất kèm ngày giờ, điểm số và nút xem lại nhanh.

Định dạng xuất: Mã nguồn hoàn chỉnh `UserDashboard.js`.
```

---

## PHẦN 3: TÍCH HỢP TRÍ TUỆ NHÂN TẠO (AI LEARNING COMPANION)

---

### PROMPT 3.1: VIẾT BACKEND SERVICE GỌI AI GEMINI CHO STUDENT (`studentAiService.js`)
*Mục đích: Xây dựng service ở phía Backend để gọi Google Gemini API, đảm bảo bảo mật API Key và trả về kết quả chuẩn cho học viên.*

```markdown
Bạn là Backend Node.js Developer. Hãy tạo file `EnglishQuizBE/services/studentAiService.js` và route `EnglishQuizBE/routes/studentAi.js` để cung cấp các API hỗ trợ học viên bằng trí tuệ nhân tạo (Google Gemini).

Yêu cầu kỹ thuật:
1. Cài đặt thư viện: Sử dụng `@google/genai` (hoặc `@google/generative-ai`) với `process.env.GEMINI_API_KEY`.
2. Viết các hàm nghiệp vụ:
   - `explainMistake(questionContent, options, userAnswer, correctAnswer)`:
     + Prompt AI: Đóng vai gia sư tiếng Anh tận tâm. Phân tích vì sao học sinh chọn `userAnswer` lại sai, vì sao `correctAnswer` mới là chính xác. Chỉ ra quy tắc ngữ pháp hoặc ngữ cảnh từ vựng. Đưa ra 1 ví dụ tương tự. Độ dài khoảng 3 - 5 câu súc tích.
   - `generateFlashcardData(word)`:
     + Prompt AI: Nhận vào 1 từ tiếng Anh. Trả về định dạng JSON thuần túy gồm: `{ word, pronunciation (IPA), partOfSpeech, definitionVi, exampleEn, exampleVi, collocations: [] }`.
   - `generateRemediationQuestions(mistakeTopicsList)`:
     + Prompt AI: Dựa trên danh sách các chủ đề ngữ pháp học sinh hay làm sai, sinh 5 câu hỏi trắc nghiệm mới tương tự (JSON output có options, correctAnswer, explanation).
3. Viết các API tương ứng trong `routes/studentAi.js`:
   - `POST /api/student-ai/explain`
   - `POST /api/student-ai/enrich-flashcard`
   - `POST /api/student-ai/remediation-quiz`
   (Tất cả route đều được bảo vệ bởi middleware `verifyToken`).

Định dạng xuất: Toàn bộ mã nguồn của `studentAiService.js` và `routes/studentAi.js`.
```

---

### PROMPT 3.2: TÍCH HỢP NÚT "GIA SƯ AI GIẢI THÍCH CÂU SAI" TRÊN FRONTEND
*Mục đích: Học viên chỉ cần bấm 1 nút là nhận được lời phân tích chuyên sâu của AI ngay tại câu mình làm sai.*

```markdown
Hãy viết một React Modal hoặc Drawer component `src/components/User/AiExplainModal.js` để hiển thị giải thích của AI khi học viên bấm nút "✨ Hỏi gia sư AI về câu này" trong màn hình xem lại kết quả (`QuizReview.js`).

Yêu cầu chi tiết:
1. Nhận props: `show`, `onHide`, `questionData`, `userAnswer`.
2. Trạng thái:
   - Khi vừa mở Modal: Tự động gọi API `POST /api/student-ai/explain` gửi kèm câu hỏi, đáp án học sinh chọn, đáp án đúng.
   - Hiển thị hiệu ứng Loading mượt mà (Skeleton hoặc Spinner xoay kèm thông điệp "Gia sư AI đang phân tích lỗi sai của bạn...").
3. Giao diện hiển thị phản hồi:
   - Avatar icon Robot gia sư thân thiện.
   - Nội dung giải thích được định dạng đẹp mắt:
     + ❌ Lỗi bạn mắc phải: Phân tích vì sao đáp án bạn chọn chưa đúng.
     + ✅ Kiến thức cốt lõi: Giải thích đáp án đúng và điểm ngữ pháp quan trọng.
     + 💡 Ví dụ áp dụng: Đưa ra 1 câu ví dụ để ghi nhớ.
4. Nút tương tác:
   - "Lưu câu hỏi này vào Bookmark".
   - "Đã hiểu, đóng lại".

Định dạng xuất: Mã nguồn `AiExplainModal.js` và hướng dẫn gắn vào `QuizReview.js`.
```

---

### PROMPT 3.3: TỰ ĐỘNG ĐIỀN THÔNG TIN TỪ VỰNG KHI THÊM FLASHCARD
*Mục đích: Học sinh chỉ cần gõ 1 từ tiếng Anh (ví dụ: "Sustainable"), bấm "AI điền giúp", toàn bộ phiên âm, nghĩa, câu ví dụ sẽ tự động xuất hiện.*

```markdown
Hãy cập nhật Modal thêm mới từ vựng trong `src/components/User/Flashcards.js` để tích hợp tính năng "✨ AI tự động điền dữ liệu" (AI Auto-fill Flashcard).

Quy trình hoạt động:
1. Học viên chỉ cần nhập ô `Word` (Từ vựng, ví dụ: "Resilient").
2. Bên cạnh có nút bấm "✨ Điền tự động bằng AI".
3. Khi bấm:
   - Kiểm tra ô `Word` không được rỗng.
   - Bật trạng thái `isAiLoading = true` (nút hiển thị spinner).
   - Gửi yêu cầu đến API `POST /api/student-ai/enrich-flashcard` với `{ word }`.
   - Nhận về JSON: `{ pronunciation, definitionVi, exampleEn, collocations }`.
   - Tự động điền dữ liệu vào các ô input:
     + Phiên âm IPA -> Điền vào ô `pronunciation`.
     + Định nghĩa tiếng Việt -> Điền vào ô `definition`.
     + Câu ví dụ tiếng Anh -> Điền vào ô `example`.
   - Hiển thị badge gợi ý các cụm Collocations phổ biến bên dưới.
4. Học viên có thể chỉnh sửa lại theo ý thích trước khi bấm "Lưu thẻ".

Định dạng xuất: Đoạn mã code logic và giao diện Modal thêm flashcard đã tích hợp AI.
```

---

## PHẦN 4: KIỂM THỬ VÀ ĐẢM BẢO CHẤT LƯỢNG

---

### PROMPT 4.1: VIẾT TEST CASE CHO LOGIC HỌC VIÊN
*Mục đích: Đảm bảo thuật toán tính ngày ôn Leitner và hàm chấm điểm hoạt động chính xác 100%.*

```markdown
Hãy viết các unit test bằng Jest cho các hàm nghiệp vụ của học viên:
1. Test thuật toán Spaced Repetition Leitner:
   - Khi `isCorrect = true`: Box tăng từ 1 -> 2, `nextReviewDate` được cộng thêm 3 ngày.
   - Khi ở Box 5 và `isCorrect = true`: Box vẫn giữ nguyên 5, ngày ôn cộng 30 ngày.
   - Khi ở Box 4 và `isCorrect = false`: Box lập tức bị reset về 1, ngày ôn đặt về ngày mai (+1 ngày).
2. Test hàm định dạng thời gian Countdown Timer (ví dụ: chuyển 125 giây thành "02:05").

Định dạng xuất: File `test/studentLogic.test.js`.
```

---

## 5. CHECKLIST TIẾN ĐỘ THỰC HIỆN DÀNH CHO DEV 1

Hãy dùng bảng checklist này để đánh dấu tiến độ công việc hàng ngày của bạn:

- [ ] **Bước 1**: Tạo `studentService.js` tập trung hóa gọi API (Prompt 1.1).
- [ ] **Bước 2**: Nâng cấp `Quiz.js` với Countdown Timer và Bảng câu hỏi (Prompt 1.2).
- [ ] **Bước 3**: Tạo màn hình xem lại kết quả chi tiết `QuizReview.js` (Prompt 1.3).
- [ ] **Bước 4**: Nâng cấp `Flashcards.js` với thuật toán Leitner 5 hộp và phát âm TTS (Prompt 1.4).
- [ ] **Bước 5**: Xây dựng Chế độ Luyện tập Tức thì `Practice.js` (Prompt 2.1).
- [ ] **Bước 6**: Xây dựng Sổ tay Câu hỏi Làm sai `MistakeNotebook.js` (Prompt 2.2).
- [ ] **Bước 7**: Nâng cấp `UserDashboard.js` với biểu đồ Radar kỹ năng (Prompt 2.3).
- [ ] **Bước 8**: Dựng Backend AI Service `studentAiService.js` (Prompt 3.1).
- [ ] **Bước 9**: Tích hợp nút Gia sư AI giải thích câu sai (Prompt 3.2) và AI Flashcard (Prompt 3.3).
- [ ] **Bước 10**: Kiểm thử toàn bộ luồng học viên từ làm bài đến xem kết quả.


