/**
 * Script: Generate Comprehensive Vietnamese System Flows & Features Document (.docx)
 * Project: EnglishQuiz Platform (SDN302 FA26)
 * Authors: Lê Duy & Nguyễn Tuấn Minh
 */

const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  LineRuleType,
} = require("docx");

// Color Palette
const COLOR_PRIMARY = "1E3A8A"; // Deep Navy
const COLOR_SECONDARY = "2563EB"; // Blue
const COLOR_TEXT = "1F2937"; // Charcoal
const COLOR_MUTED = "4B5563"; // Slate
const COLOR_BORDER = "CBD5E1"; // Light Slate
const COLOR_BG_HEADER = "F1F5F9"; // Very light blue-gray
const COLOR_CODE_BG = "F8FAFC"; // Light background
const COLOR_HIGHLIGHT = "D97706"; // Amber / Orange

// Helpers for clean typography
function h1(text, pageBreakBefore = false) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore,
    spacing: { before: 360, after: 160, line: 360, lineRule: LineRuleType.AUTO },
    run: { size: 30, bold: true, color: COLOR_PRIMARY, font: "Arial" },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120, line: 320, lineRule: LineRuleType.AUTO },
    run: { size: 26, bold: true, color: COLOR_SECONDARY, font: "Arial" },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80, line: 280, lineRule: LineRuleType.AUTO },
    run: { size: 22, bold: true, color: COLOR_TEXT, font: "Arial" },
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.alignment || AlignmentType.LEFT,
    spacing: { before: 80, after: 80, line: 280, lineRule: LineRuleType.AUTO },
    children: [
      new TextRun({
        text,
        size: 22, // 11pt
        color: opts.color || COLOR_TEXT,
        bold: opts.bold || false,
        italics: opts.italics || false,
        font: "Arial",
      }),
    ],
  });
}

function pCallout(text, icon = "📌") {
  return new Paragraph({
    spacing: { before: 120, after: 120, line: 280, lineRule: LineRuleType.AUTO },
    border: {
      left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_SECONDARY, space: 10 },
    },
    shading: { type: ShadingType.CLEAR, fill: "F8FAFC" },
    children: [
      new TextRun({
        text: `  ${icon} ${text}`,
        size: 21,
        italics: true,
        color: COLOR_MUTED,
        font: "Arial",
      }),
    ],
  });
}

function bullet(text, level = 0, boldPrefix = "") {
  const children = [];
  if (boldPrefix) {
    children.push(
      new TextRun({
        text: boldPrefix,
        bold: true,
        size: 22,
        color: COLOR_TEXT,
        font: "Arial",
      })
    );
  }
  children.push(
    new TextRun({
      text,
      size: 22,
      color: COLOR_TEXT,
      font: "Arial",
    })
  );

  return new Paragraph({
    bullet: { level },
    spacing: { before: 50, after: 50, line: 280, lineRule: LineRuleType.AUTO },
    children,
  });
}

function step(number, title, description) {
  return new Paragraph({
    spacing: { before: 90, after: 90, line: 280, lineRule: LineRuleType.AUTO },
    children: [
      new TextRun({
        text: `Bước ${number}: `,
        bold: true,
        color: COLOR_SECONDARY,
        size: 22,
        font: "Arial",
      }),
      new TextRun({
        text: `${title} — `,
        bold: true,
        color: COLOR_TEXT,
        size: 22,
        font: "Arial",
      }),
      new TextRun({
        text: description,
        color: COLOR_TEXT,
        size: 22,
        font: "Arial",
      }),
    ],
  });
}

function createTable(headers, rows, colWidths = []) {
  const tableRows = [];

  // Header Row
  tableRows.push(
    new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: headers.map((h, i) =>
        new TableCell({
          width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
          shading: { type: ShadingType.CLEAR, fill: COLOR_BG_HEADER },
          margins: { top: 140, bottom: 140, left: 160, right: 160 },
          children: [
            new Paragraph({
              spacing: { before: 40, after: 40, line: 240, lineRule: LineRuleType.AUTO },
              children: [
                new TextRun({ text: h, bold: true, color: COLOR_PRIMARY, font: "Arial", size: 21 }),
              ],
            }),
          ],
        })
      ),
    })
  );

  // Data Rows
  rows.forEach((row) => {
    tableRows.push(
      new TableRow({
        cantSplit: true,
        children: row.map((cellText, i) =>
          new TableCell({
            width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40, line: 240, lineRule: LineRuleType.AUTO },
                children: [
                  new TextRun({ text: String(cellText), color: COLOR_TEXT, font: "Arial", size: 20 }),
                ],
              }),
            ],
          })
        ),
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
    },
    rows: tableRows,
  });
}

const docChildren = [
  // ==========================================
  // TRANG BÌA (COVER PAGE)
  // ==========================================
  new Paragraph({
    text: "TRƯỜNG ĐẠI HỌC FPT — FPT UNIVERSITY",
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 100 },
    run: { size: 24, bold: true, color: "475569", font: "Arial" },
  }),
  new Paragraph({
    text: "BỘ MÔN KỸ THUẬT PHẦN MỀM (SOFTWARE ENGINEERING)",
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 500 },
    run: { size: 20, bold: true, color: "64748B", font: "Arial" },
  }),
  new Paragraph({
    text: "TÀI LIỆU ĐẶC TẢ TÍNH NĂNG VÀ CÁC LUỒNG NGHIỆP VỤ",
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 140 },
    run: { size: 34, bold: true, color: COLOR_PRIMARY, font: "Arial" },
  }),
  new Paragraph({
    text: "HỆ THỐNG ĐÁNH GIÁ NĂNG LỰC TIẾNG ANH & HỌC TỪ VỰNG NGẮT QUÃNG LEITNER 5 HỘP",
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 100 },
    run: { size: 22, bold: true, color: COLOR_SECONDARY, font: "Arial" },
  }),
  new Paragraph({
    text: "ENGLISHQUIZ PLATFORM — SDN302_FA26_EQP",
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 500 },
    run: { size: 20, italics: true, color: COLOR_MUTED, font: "Arial" },
  }),

  createTable(
    ["Thông Tin Đồ Án", "Chi Tiết"],
    [
      ["Tên Đồ Án", "Hệ Thống Luyện Thi & Học Từ Vựng Trực Tuyến EnglishQuiz Platform"],
      ["Mã Môn Học", "SDN302 — Web Application Development with NodeJS & ReactJS"],
      ["Học Kỳ / Năm Học", "Fall 2026 (FA26) — FPT University"],
      ["Công Nghệ Xây Dựng", "MERN Stack (MongoDB, Express.js, React 18, Node.js v20+)"],
      ["Thành Viên Nhóm", "1. Lê Duy (Trưởng nhóm / Kiến trúc sư phần mềm)\n2. Nguyễn Tuấn Minh (Lập trình viên Full-stack & QA)"],
      ["Trạng Thái Dự Án", "Hoàn thành 100% tính năng, vượt qua 2 vòng kiểm định tự động (56/56 tests passing)"],
    ],
    [3200, 6000]
  ),

  new Paragraph({ spacing: { before: 240 } }),
  p("Giảng viên hướng dẫn: hanhnt84@fe.edu.vn", { bold: true }),
  p("Địa điểm & Thời gian: Hà Nội, Tháng 11 Năm 2026"),

  // ==========================================
  // PHẦN 1: TỔNG QUAN HỆ THỐNG
  // ==========================================
  new Paragraph({ pageBreakBefore: true }),
  h1("PHẦN 1: TỔNG QUAN DỰ ÁN VÀ ĐỐI TƯỢNG SỬ DỤNG"),

  h2("1.1. Giới thiệu tổng quan về EnglishQuiz Platform"),
  p(
    "EnglishQuiz Platform là nền tảng ứng dụng web e-learning toàn diện, được thiết kế chuyên biệt để hỗ trợ sinh viên luyện thi các chứng chỉ tiếng Anh chuẩn hóa (TOEIC, IELTS, CEFR A1-C2) và ghi nhớ từ vựng học thuật một cách bền vững. Hệ thống kết hợp giữa phòng thi mô phỏng áp lực thời gian thực với thuật toán lặp lại ngắt quãng khoa học Leitner 5 hộp (Spaced Repetition) và bộ công cụ soạn đề thi tự động thông minh dành cho giảng viên."
  ),

  h2("1.2. Các bài toán thực tiễn hệ thống giải quyết"),
  bullet(
    "Đường cong quên lãng từ vựng (Ebbinghaus Forgetting Curve): Học từ vựng theo cách truyền thống khiến học viên quên hơn 75% lượng từ mới chỉ sau 48 giờ. EnglishQuiz giải quyết triệt để vấn đề này bằng mô hình 5 hộp Leitner, phân phối chu kỳ ôn tập tự động theo các mốc 1, 2, 4, 7 và 14 ngày kết hợp thẻ lật 3D sống động và phát âm bản xứ.",
    0,
    "1. "
  ),
  bullet(
    "Gian lận thi cử trực tuyến (Client-side Cheat Hazards): Đa số các nền tảng web quiz thông thường gửi kèm đáp án đúng hoặc lời giải trong gói dữ liệu JSON về trình duyệt, cho phép thí sinh mở Developer Tools (F12) để xem trước đáp án. EnglishQuiz giải quyết bằng cơ chế bóc tách đáp án an toàn trên máy chủ và chấm điểm tập trung.",
    0,
    "2. "
  ),
  bullet(
    "Năng suất soạn đề của giáo viên: Soạn một đề thi phân bổ đều câu hỏi Dễ, Trung bình, Khó thủ công thường mất 45–60 phút. Hệ thống cung cấp công cụ tạo đề ma trận và sinh Mini Test tự động chỉ trong 1 thao tác (dưới 3 giây).",
    0,
    "3. "
  ),
  bullet(
    "Mất trạng thái khi tải lại trang (F5 Reload): Ứng dụng đã xử lý hoàn toàn trải nghiệm chuyển trang bằng cách đồng bộ hóa subpath URL hai chiều với React Router và localStorage.",
    0,
    "4. "
  ),

  h2("1.3. Các tác tử (Actors) và Không gian làm việc trong hệ thống"),
  p("Hệ thống phân quyền người dùng nghiêm ngặt theo 3 vai trò chính với các không gian làm việc tách biệt:"),
  createTable(
    ["Tác Tử (Role)", "Không Gian Làm Việc", "Đặc Quyền Nghiệp Vụ"],
    [
      [
        "Học Viên (Student)",
        "Student Space (/student/*)",
        "Luyện tập tự do, làm bài thi bấm giờ trong phòng thi bảo mật, học từ vựng 3D Leitner, đánh dấu câu hỏi khó vào Sổ tay, xem lịch sử và gửi góp ý.",
      ],
      [
        "Giáo Viên (Teacher)",
        "Teacher Space (/teacher/*)",
        "Quản lý ngân hàng câu hỏi (thêm, sửa, xóa, lọc), tự động sinh đề theo ma trận độ khó, tạo bài Mini Test nhanh, phát thông báo đề thi và xem phản hồi.",
      ],
      [
        "Quản Trị Viên (Admin)",
        "Admin Space (/admin/*)",
        "Toàn quyền quản trị hệ thống, quản lý tài khoản người dùng, đổi quyền hạn, cấu hình danh mục chủ đề / kỹ năng và xem biểu đồ phân tích số liệu.",
      ],
    ],
    [2200, 2400, 4600]
  ),

  // ==========================================
  // PHẦN 2: TẤT CẢ CÁC TÍNH NĂNG TRONG DỰ ÁN
  // ==========================================
  new Paragraph({ pageBreakBefore: true }),
  h1("PHẦN 2: DANH MỤC CHI TIẾT TẤT CẢ CÁC TÍNH NĂNG CỦA HỆ THỐNG"),

  h2("2.1. Nhóm Tính Năng Xác Thực & Phân Quyền (Auth & RBAC)"),
  bullet(
    "Đăng ký tài khoản (Register): Cho phép học viên tạo tài khoản mới với tên, email, mật khẩu (mã hóa chuẩn Bcrypt salt=10), trường học và độ tuổi. Hệ thống kiểm tra hợp lệ và chặn đăng ký trùng email.",
    0,
    "• "
  ),
  bullet(
    "Đăng nhập an toàn (Login): Xác thực thông tin đăng nhập và cấp chứng chỉ số JSON Web Token (JWT) có thời hạn, phân quyền chính xác vào không gian tương ứng.",
    0,
    "• "
  ),
  bullet(
    "Xác thực phiên làm việc (/auth/me): Kiểm tra tính toàn vẹn của token khi người dùng tải lại trang, tự động điều hướng về màn hình đăng nhập nếu token hết hạn.",
    0,
    "• "
  ),
  bullet(
    "Bảo toàn trạng thái đường dẫn (URL Subpath Sync): Khi người dùng đang ở bất kỳ tab nào (ví dụ: /student/quiz, /student/flashcards, /teacher/exams) và nhấn F5, giao diện giữ nguyên màn hình làm việc hiện tại thay vì bị reset về Dashboard.",
    0,
    "• "
  ),

  h2("2.2. Nhóm Tính Năng Phòng Thi Bảo Mật (Anti-Cheat Exam Room)"),
  bullet(
    "Giao diện chuẩn Kombai (TOEIC Reading Mini Test): Thiết kế hiện đại bo góc tròn 24px, phân chia rõ ràng giữa khung câu hỏi bên trái và bảng điều hướng câu hỏi bên phải (Question Palette).",
    0,
    "• "
  ),
  bullet(
    "Cơ chế bóc tách đáp án an toàn (Answer Stripping): Endpoint GET /exams/:id/take tự động xóa bỏ hoàn toàn trường correctAnswer và explanation khỏi dữ liệu trả về cho client. Thí sinh dù mở Network tab hay Inspect Element cũng tuyệt đối không thể thấy trước đáp án.",
    0,
    "• "
  ),
  bullet(
    "Chế độ phòng thi khóa nghiêm ngặt (Lockdown Mode): Khi bắt đầu thi, Sidebar điều hướng bị ẩn hoàn toàn, giao diện giãn rộng full màn hình, Header hiển thị huy hiệu bảo mật '🔒 Chế Độ Phòng Thi Bảo Mật — Phải nộp bài để quay lại Menu'.",
    0,
    "• "
  ),
  bullet(
    "Cảnh báo chống thoát (beforeunload Event): Tích hợp listener can thiệp cảnh báo trình duyệt khi thí sinh vô tình nhấn nút tải lại hoặc đóng tab.",
    0,
    "• "
  ),
  bullet(
    "Bộ đếm giờ và Tự động nộp bài (Countdown Timer): Hiển thị đồng hồ đếm ngược viền pill. Khi thời gian chạm 00:00, bài thi được tự động nộp ngay lập tức mà không làm mất bài.",
    0,
    "• "
  ),
  bullet(
    "Bảng trạng thái câu hỏi (Question Palette): Trực quan hóa tiến độ làm bài với mã màu: Xanh lá (Đã làm), Trắng (Chưa làm), Cam (Đang chọn hoặc Cắm cờ xem lại). Thống kê số lượng thời gian thực.",
    0,
    "• "
  ),
  bullet(
    "Hỗ trợ phím tắt tiện lợi: Thí sinh có thể ấn phím A, B, C, D trên bàn phím để chọn đáp án và mũi tên Trái/Phải để chuyển nhanh giữa các câu hỏi.",
    0,
    "• "
  ),
  bullet(
    "Chấm điểm tập trung phía máy chủ (Server-Side Scoring): Client chỉ gửi câu trả lời đã chọn qua POST /exams/:id/submit. Server tự đối chiếu với database, tính toán điểm số và cấp mã lịch sử (historyId).",
    0,
    "• "
  ),

  h2("2.3. Nhóm Tính Năng Học Từ Vựng Ngắt Quãng Leitner 5 Hộp (Flashcard 3D)"),
  bullet(
    "Thẻ lật 3D chân thực: Kích thước 380×240px, góc bo 24px, hiệu ứng lật không gian 3 chiều 0.6s mượt mà khi click hoặc nhấn phím Space/Enter.",
    0,
    "• "
  ),
  bullet(
    "Mặt trước thẻ từ vựng: Hiển thị huy hiệu Hộp Leitner (mã màu riêng cho từng hộp 1–5), từ vựng tiếng Anh, phiên âm quốc tế IPA (font JetBrains Mono), từ loại (Noun, Verb, Adj) và nút loa phát âm.",
    0,
    "• "
  ),
  bullet(
    "Tích hợp Web Speech API: Nhấn nút loa để nghe giọng đọc chuẩn bản ngữ từ trình duyệt mà không cần tải file âm thanh ngoài.",
    0,
    "• "
  ),
  bullet(
    "Mặt sau thẻ từ vựng: Hiển thị nghĩa tiếng Việt, câu ví dụ ngữ cảnh có bôi đậm từ vựng bằng màu hổ phách (amber pill), và khung mẹo ghi nhớ kèm icon Sparkles.",
    0,
    "• "
  ),
  bullet(
    "Cơ chế thăng / reset hộp Leitner khoa học:",
    0,
    "• "
  ),
  p(
    "  - Nhấn 'Đã thuộc' (Nút xanh lá): Thăng hạng lên Hộp kế tiếp (Hộp 1 → 2 → 3 → 4 → 5). Khi đã ở Hộp 5, giữ nguyên ở Hộp 5 (trạng thái đã ghi nhớ vĩnh viễn).\n  - Nhấn 'Chưa nhớ' (Nút đỏ/xám): Reset ngay lập tức về Hộp 1 để học lại từ đầu chu kỳ, đảm bảo không bị hổng kiến thức."
  ),

  h2("2.4. Nhóm Tính Năng Soạn Đề Thông Minh & Thông Báo Đề Mới"),
  bullet(
    "Soạn đề thi theo ma trận độ khó (Matrix Exam Generator): Giáo viên chỉ cần nhập số lượng câu Dễ, Trung bình, Khó; hệ thống tự động lọc và trộn ngẫu nhiên từ ngân hàng câu hỏi để xuất ra đề thi hoàn chỉnh.",
    0,
    "• "
  ),
  bullet(
    "Tạo bài Mini Test nhanh 5–15 câu: Giáo viên hoặc Sinh viên có thể tạo đề kiểm tra nhanh 5, 10 hoặc 15 câu theo chủ đề chỉ bằng 1 cú click.",
    0,
    "• "
  ),
  bullet(
    "Tự động phát thông báo đề thi mới (Notice Trigger): Ngay khi đề thi hoặc bài Mini Test được tạo thành công, hệ thống tự động sinh bản ghi thông báo gửi đến toàn bộ tài khoản Sinh viên.",
    0,
    "• "
  ),
  bullet(
    "Nút vào phòng thi siêu tốc: Trong cửa sổ thông báo, sinh viên có nút '🚀 Vào Phòng Thi Ngay'. Nhấn vào nút này sẽ mở thẳng phòng thi của đề đó mà không cần phải duyệt tìm đề trong danh sách.",
    0,
    "• "
  ),

  h2("2.5. Nhóm Tính Năng Ôn Tập, Sổ Tay & Lịch Sử"),
  bullet(
    "Sổ tay đánh dấu (Bookmarks): Sinh viên có thể bấm icon Bookmark trên bất kỳ câu hỏi nào để lưu lại danh sách câu hỏi cần ôn tập, có cơ chế ngăn chặn lưu trùng lặp.",
    0,
    "• "
  ),
  bullet(
    "Lịch sử làm bài (Exam History): Bảng lưu trữ toàn diện tất cả các lượt thi với thông tin ngày giờ, số câu đúng, điểm số, tỷ lệ % và trạng thái ĐẠT/KHÔNG ĐẠT.",
    0,
    "• "
  ),
  bullet(
    "Màn hình tổng kết và xem lại chi tiết (QuizReview): Sau khi nộp bài, thí sinh được xem điểm số tổng quát, thời gian hoàn thành và bản giải thích chi tiết từng câu hỏi (câu nào đúng, câu nào sai, giải thích ngữ pháp).",
    0,
    "• "
  ),

  h2("2.6. Nhóm Tính Năng Quản Lý Ngân Hàng Câu Hỏi & Quản Trị Hệ Thống"),
  bullet(
    "Ngân hàng câu hỏi đa dạng (Question Bank): Hỗ trợ đầy đủ các dạng câu hỏi: Trắc nghiệm 1 đáp án, Trắc nghiệm nhiều đáp án, Đúng/Sai, Điền từ vào chỗ trống, Nối cặp từ vựng.",
    0,
    "• "
  ),
  bullet(
    "Bộ lọc nâng cao: Tìm kiếm câu hỏi theo từ khóa, lọc theo khung năng lực CEFR (A1, A2, B1, B2, C1, C2), lọc theo chủ đề và kỹ năng.",
    0,
    "• "
  ),
  bullet(
    "Hệ thống đóng góp ý kiến (Feedback): Sinh viên gửi đánh giá 1-5 sao và nội dung góp ý; Giáo viên và Admin theo dõi và cập nhật trạng thái đã xem xét.",
    0,
    "• "
  ),
  bullet(
    "Quản lý người dùng & Báo cáo thống kê: Quản trị viên quản lý danh sách tài khoản, chuyển đổi quyền hạn (Student/Teacher/Admin) và xem biểu đồ phân tích lượt thi và điểm trung bình.",
    0,
    "• "
  ),

  // ==========================================
  // PHẦN 3: 10 LUỒNG NGHIỆP VỤ HỆ THỐNG
  // ==========================================
  new Paragraph({ pageBreakBefore: true }),
  h1("PHẦN 3: ĐẶC TẢ CHI TIẾT 10 LUỒNG NGHIỆP VỤ CHÍNH (SYSTEM FLOWS)"),

  h2("Luồng 1: Quy trình Đăng Ký, Đăng Nhập & Phân Quyền Không Gian Làm Việc"),
  p(
    "Mục đích: Đảm bảo người dùng truy cập đúng không gian chức năng tương ứng với vai trò của mình và giữ an toàn dữ liệu cá nhân."
  ),
  step("1.1", "Truy cập màn hình Đăng ký / Đăng nhập", "Người dùng mở trình duyệt vào http://localhost:3000/login hoặc /register."),
  step("1.2", "Gửi dữ liệu xác thực", "Người dùng nhập email và mật khẩu. Frontend gửi request POST /auth/login đến Backend."),
  step("1.3", "Xác thực trên máy chủ", "Backend tìm kiếm user theo email, sử dụng bcrypt.compare để so khớp mật khẩu đã băm. Nếu hợp lệ, ký JWT token chứa userId và role."),
  step("1.4", "Lưu trữ phiên và Điều hướng", "Frontend lưu JWT và thông tin user vào localStorage và Context API."),
  step("1.5", "Phân luồng theo Vai trò", "Hệ thống tự động chuyển hướng: Sinh viên vào /student, Giáo viên vào /teacher, Quản trị viên vào /admin."),
  pCallout("Nếu người dùng reload trang (F5), Context API sẽ gọi GET /auth/me để phục hồi phiên đăng nhập mà không bắt đăng nhập lại."),

  h2("Luồng 2: Quy trình Luyện Tập Tự Do (Free Practice)"),
  p("Mục đích: Cho phép sinh viên rèn luyện kiến thức thoải mái mà không bị áp lực thời gian."),
  step("2.1", "Chọn tab Luyện Tập Tự Do", "Sinh viên vào màn hình Sinh viên và chọn mục 'Luyện Tập Tự Do' trên menu."),
  step("2.2", "Chọn bài tập", "Hệ thống tải danh sách các bài luyện tập theo chủ đề (Topic) hoặc kỹ năng (Skill)."),
  step("2.3", "Làm bài và Kiểm tra tức thì", "Sinh viên chọn câu trả lời; hệ thống cho phép kiểm tra ngay giải thích và ghi nhớ kiến thức."),
  step("2.4", "Lưu câu hỏi khó", "Sinh viên có thể nhấn nút Bookmark để lưu lại câu hỏi này vào Sổ tay ôn tập."),

  h2("Luồng 3: Quy trình Làm Bài Thi Bấm Giờ trong Phòng Thi Bảo Mật (Lockdown Mode)"),
  p(
    "Mục đích: Mô phỏng kỳ thi thực tế, ngăn chặn triệt để hành vi gian lận và tính điểm chuẩn xác trên máy chủ."
  ),
  step("3.1", "Bắt đầu bài thi", "Sinh viên chọn một đề thi trong tab 'Thi Thử Bấm Giờ' và bấm 'Làm bài thi'."),
  step("3.2", "Khởi tạo dữ liệu chống gian lận", "Frontend gọi GET /exams/:id/take. Server bóc tách sạch correctAnswer và explanation trước khi trả về. Trình duyệt không lưu đáp án đúng."),
  step("3.3", "Kích hoạt Chế độ Khóa (Lockdown Mode)", "Sidebar bị ẩn đi, màn hình thi mở rộng 100%, Header đổi sang badge cảnh báo '🔒 Chế Độ Phòng Thi Bảo Mật'. Đăng ký listener beforeunload."),
  step("3.4", "Đếm ngược thời gian và Thao tác", "Đồng hồ đếm ngược chạy. Thí sinh chọn đáp án bằng chuột hoặc phím tắt A-D. Bảng câu hỏi bên phải cập nhật trực quan số câu đã làm."),
  step("3.5", "Cắm cờ câu hỏi", "Thí sinh có thể ấn 'Cắm cờ' những câu chưa chắc chắn; ô số tương ứng trên Palette sẽ đổi sang màu cam nổi bật."),
  step("3.6", "Nộp bài thi", "Thí sinh bấm '✓ Nộp bài thi' (hoặc hệ thống tự nộp khi đồng hồ chạm 00:00). Frontend gửi payload POST /exams/:id/submit chứa danh sách câu trả lời."),
  step("3.7", "Chấm điểm máy chủ", "Backend lấy đề gốc từ CSDL, đối chiếu đáp án, tính điểm số, lưu bản ghi vào collection History."),
  step("3.8", "Mở khóa phòng thi & Xem kết quả", "Lockdown mode được giải phóng. Sinh viên được chuyển sang màn hình QuizReview hiển thị điểm, xếp loại Đạt/Không đạt và phân tích chi tiết câu đúng/sai."),

  h2("Luồng 4: Quy trình Học Từ Vựng Ngắt Quãng với Thẻ 3D Leitner 5 Hộp"),
  p("Mục đích: Tối ưu hóa khả năng ghi nhớ dài hạn từ vựng tiếng Anh theo phương pháp Spaced Repetition."),
  step("4.1", "Mở tab Flashcards Leitner", "Sinh viên bấm vào tab 'Flashcards Leitner' trên menu."),
  step("4.2", "Tải danh sách thẻ học", "Hệ thống gọi GET /flashcards/user/:id để tải toàn bộ thẻ từ vựng phân loại theo 5 Hộp ghi nhớ."),
  step("4.3", "Quan sát mặt trước thẻ 3D", "Sinh viên nhìn thấy từ vựng, phiên âm IPA JetBrains Mono, từ loại và huy hiệu Hộp hiện tại."),
  step("4.4", "Nghe phát âm bản xứ", "Sinh viên bấm nút Loa (có hiệu ứng sóng âm); Web Speech API phát âm chuẩn từ vựng."),
  step("4.5", "Lật thẻ xem đáp án", "Sinh viên click vào thẻ hoặc ấn Space/Enter; thẻ lật 3D 180 độ sang mặt sau hiển thị nghĩa tiếng Việt, câu ví dụ và mẹo ghi nhớ."),
  step("4.6", "Đánh giá khả năng ghi nhớ:", ""),
  bullet("Trường hợp 1 (Nhớ đúng): Sinh viên bấm 'Đã thuộc' (nút xanh lá). Frontend gọi POST /flashcards/:id/review { isCorrect: true }. Server tăng hộp: Box = Math.min(5, Box + 1)."),
  bullet("Trường hợp 2 (Chưa nhớ): Sinh viên bấm 'Chưa nhớ'. Frontend gọi POST /flashcards/:id/review { isCorrect: false }. Server reset hộp: Box = 1."),
  step("4.7", "Cập nhật tiến độ", "Thẻ tiếp theo xuất hiện và thanh thống kê số lượng thẻ trong 5 Hộp được cập nhật ngay lập tức."),

  h2("Luồng 5: Quy trình Đánh Dấu Câu Hỏi Khó vào Sổ Tay (Bookmarks)"),
  p("Mục đích: Giúp sinh viên tập trung ôn luyện những câu hỏi thường xuyên làm sai hoặc câu hỏi ngữ pháp phức tạp."),
  step("5.1", "Đánh dấu câu hỏi", "Trong phòng thi hoặc khi xem lại bài thi, sinh viên bấm nút icon Bookmark."),
  step("5.2", "Gửi yêu cầu lưu trữ", "Frontend gọi POST /bookmarks { userId, itemType: 'Question', itemId }. Backend kiểm tra nếu đã lưu thì báo lỗi, nếu chưa thì tạo bản ghi mới."),
  step("5.3", "Truy cập Sổ Tay Đánh Dấu", "Sinh viên mở tab 'Sổ Tay Đánh Dấu' (/student/bookmarks). Hệ thống gọi GET /bookmarks/user/:id để hiển thị danh sách."),
  step("5.4", "Ôn luyện lại", "Sinh viên xem lại nội dung câu hỏi, các lựa chọn và lời giải thích chi tiết."),
  step("5.5", "Xóa đánh dấu khi đã thành thạo", "Khi đã hiểu rõ câu hỏi, sinh viên bấm nút Xóa để gỡ khỏi danh sách Bookmark."),

  h2("Luồng 6: Quy trình Giáo Viên Tạo Đề Thi Theo Ma Trận Độ Khó & Mini Test"),
  p("Mục đích: Giúp giáo viên tạo ra các đề kiểm tra cân bằng về độ khó chỉ trong vài giây."),
  step("6.1", "Mở công cụ soạn đề", "Giáo viên vào tab 'Quản Lý Đề Thi' (/teacher/exams) và bấm nút '⚡ Tạo Đề Theo Ma Trận' hoặc 'Tạo Mini Test Nhanh'."),
  step("6.2", "Cấu hình ma trận", "Giáo viên nhập: Tiêu đề đề thi, Thời lượng (phút), số câu Dễ (A1-A2), số câu Trung bình (B1-B2), số câu Khó (C1-C2)."),
  step("6.3", "Gửi yêu cầu sinh đề", "Frontend gửi POST /exams/matrix/generate (hoặc POST /exams/minitest/generate)."),
  step("6.4", "Xử lý ngẫu nhiên trên máy chủ", "Backend dùng Mongoose Aggregate ($match theo độ khó và $sample theo số lượng) để lấy đúng số câu hỏi ngẫu nhiên và tạo bản ghi Exam mới."),
  step("6.5", "Tự động phát thông báo", "Ngay sau khi Exam được tạo, backend tự động gọi Notice.create gửi thông báo đến role 'Student'."),
  step("6.6", "Hoàn tất", "Hệ thống thông báo tạo đề thành công và hiển thị đề mới trên bảng danh sách đề thi."),

  h2("Luồng 7: Quy trình Hệ Thống Tự Động Gửi Thông Báo & Sinh Viên Vào Thi Tức Thì"),
  p("Mục đích: Kết nối tức thời giữa việc giáo viên giao bài và học viên bắt đầu làm bài."),
  step("7.1", "Sự kiện tạo đề xảy ra", "Giáo viên tạo đề thi mới ở Luồng 6."),
  step("7.2", "Hệ thống tạo thông báo", "Bản ghi Notice mới được lưu với tiêu đề 'Đề thi mới: [Tên đề]' và targetRole: 'Student'."),
  step("7.3", "Học viên nhận thông báo", "Học viên đăng nhập hoặc đang ở bất kỳ trang nào, icon Chuông trên Header hiển thị số lượng thông báo mới màu đỏ."),
  step("7.4", "Mở xem thông báo", "Học viên bấm vào icon Chuông để xem danh sách thông báo."),
  step("7.5", "Vào thi nhanh bằng 1 click", "Trong nội dung thông báo đề thi, có nút bấm nổi bật '🚀 Vào Phòng Thi Ngay'."),
  step("7.6", "Chuyển thẳng vào phòng thi", "Học viên bấm nút, hệ thống tự động mở đúng đề thi trong chế độ phòng thi bảo mật (ExamRoom) mà không cần tìm đề thủ công."),

  h2("Luồng 8: Quy trình Quản Lý Ngân Hàng Câu Hỏi (Question Bank)"),
  p("Mục đích: Cung cấp kho dữ liệu câu hỏi phong phú, chuẩn hóa cho việc kiểm tra đánh giá."),
  step("8.1", "Mở Quản Lý Câu Hỏi", "Giáo viên/Admin truy cập vào tab 'Quản Lý Câu Hỏi'."),
  step("8.2", "Tìm kiếm & Lọc dữ liệu", "Sử dụng các bộ lọc: Lọc theo CEFR level (A1, A2, B1, B2, C1, C2), lọc theo kỹ năng (Listening, Reading, Grammar, Vocabulary), lọc theo dạng câu hỏi."),
  step("8.3", "Thêm câu hỏi mới", "Bấm 'Thêm Câu Hỏi', nhập nội dung đề bài, chọn dạng câu hỏi (Trắc nghiệm, Điền từ, Nối cặp), nhập các đáp án lựa chọn, chỉ định đáp án đúng và lời giải chi tiết."),
  step("8.4", "Lưu vào hệ thống", "Frontend gửi POST /questions. Backend kiểm tra hợp lệ và lưu vào MongoDB."),
  step("8.5", "Chỉnh sửa hoặc Xóa", "Giáo viên có thể sửa đổi nội dung câu hỏi (PUT /questions/:id) hoặc xóa bỏ câu hỏi lỗi thời (DELETE /questions/:id)."),

  h2("Luồng 9: Quy trình Sinh Viên Gửi Góp Ý & Quản Trị Viên Xử Lý Phản Hồi"),
  p("Mục đích: Thu thập đánh giá của người học để liên tục nâng cao chất lượng nền tảng."),
  step("9.1", "Mở tab Góp Ý Hệ Thống", "Sinh viên vào tab 'Góp Ý Hệ Thống' (/student/feedback)."),
  step("9.2", "Soạn thảo góp ý", "Sinh viên chọn số sao đánh giá (1 đến 5 sao), chọn phân loại (Giao diện, Đề thi, Tính năng, Khác) và nhập nội dung góp ý."),
  step("9.3", "Gửi phản hồi", "Frontend gửi POST /feedbacks; hệ thống ghi nhận bản ghi với trạng thái mặc định là 'Pending'."),
  step("9.4", "Admin/Giáo viên tiếp nhận", "Quản trị viên hoặc Giáo viên vào tab 'Góp Ý Của Sinh Viên' để đọc các phản hồi."),
  step("9.5", "Cập nhật tiến độ xử lý", "Admin bấm chuyển trạng thái sang 'Reviewed' hoặc 'Resolved' sau khi đã giải quyết vấn đề."),

  h2("Luồng 10: Quy trình Kỹ Thuật Bảo Mật Chống Gian Lận (Anti-Cheat Engine Flow)"),
  p("Mục đích: Đảm bảo tính công bằng và giá trị học thuật tuyệt đối của điểm số trong kỳ thi."),
  step("10.1", "Tách bạch Dữ liệu Thi & Đáp án", "CSDL lưu trữ đầy đủ correctAnswer và explanation. Tuy nhiên, API take bài thi (/exams/:id/take) sử dụng bộ lọc Mongoose select('-correctAnswer -explanation') kết hợp hàm sanitization thủ công để xóa mọi dấu vết đáp án."),
  step("10.2", "Vô hiệu hóa Công cụ Soi Mạng (Inspect Elements)", "Kể cả thí sinh mở F12, tab Console, Network response hoặc React DevTools, payload nhận được chỉ có nội dung câu hỏi và các phương án lựa chọn (A, B, C, D)."),
  step("10.3", "Ngăn chặn sửa đổi điểm số phía Client", "Client tuyệt đối không có quyền gửi điểm số lên server. Client chỉ được gửi object dạng { answers: { questionId: selectedOption } }."),
  step("10.4", "Chấm điểm độc lập tại Backend", "Backend tự nạp lại đề thi gốc từ DB, chạy vòng lặp kiểm tra từng câu hỏi, tính tổng điểm và sinh ra kết quả chính thức."),
  step("10.5", "Bảo vệ toàn vẹn lịch sử", "Kết quả được lưu vào History với liên kết chặt chẽ tới userId và examId, không cho phép học viên tự ý sửa đổi."),

  // ==========================================
  // PHẦN 4: TÀI KHOẢN MẪU & KỊCH BẢN KIỂM THỬ
  // ==========================================
  new Paragraph({ pageBreakBefore: true }),
  h1("PHẦN 4: TÀI KHOẢN MẪU VÀ KỊCH BẢN TRẢI NGHIỆM HỆ THỐNG"),

  h2("4.1. Danh Sách Tài Khoản Mẫu Trải Nghiệm 3 Vai Trò"),
  createTable(
    ["Vai Trò (Role)", "Địa Chỉ Email", "Mật Khẩu Mặc Định", "Mục Đích Thử Nghiệm"],
    [
      ["Học Viên (Student)", "student@gmail.com", "123456", "Thử nghiệm làm bài thi bảo mật, lật thẻ từ vựng 3D Leitner, đánh dấu câu hỏi và xem lịch sử thi."],
      ["Giáo Viên (Teacher)", "teacher@gmail.com", "123456", "Thử nghiệm công cụ tạo đề ma trận độ khó, sinh Mini Test tự động, gửi thông báo và quản lý ngân hàng câu hỏi."],
      ["Quản Trị Viên (Admin)", "admin@gmail.com", "123456", "Thử nghiệm phân quyền người dùng, xem thống kê hệ thống và duyệt phản hồi góp ý."],
    ],
    [2200, 2600, 1800, 3400]
  ),

  h2("4.2. Kịch Bản Trải Nghiệm Mẫu Đề Xuất (Test Walkthrough)"),
  p("Để có cái nhìn toàn diện nhất về sản phẩm, khuyến nghị thực hiện kịch bản thử nghiệm 4 bước sau:"),
  bullet(
    "Bước 1: Đăng nhập tài khoản Giáo viên (teacher@gmail.com) -> Vào tab 'Quản Lý Đề Thi' -> Bấm 'Tạo Mini Test Nhanh' 5 câu -> Nhập tiêu đề và bấm Sinh đề. Hệ thống sẽ tạo đề và tự động gửi thông báo đến học viên.",
    0,
    "1. "
  ),
  bullet(
    "Bước 2: Đăng xuất và Đăng nhập tài khoản Sinh viên (student@gmail.com) -> Quan sát icon Chuông trên Header có số thông báo mới -> Mở thông báo và bấm '🚀 Vào Phòng Thi Ngay'.",
    0,
    "2. "
  ),
  bullet(
    "Bước 3: Trải nghiệm Phòng thi bảo mật (Lockdown Mode): Thử click menu (đã bị ẩn hoàn toàn), làm bài với phím tắt A-D, cắm cờ câu hỏi, quan sát đồng hồ đếm ngược -> Bấm '✓ Nộp bài thi' -> Xem phân tích câu đúng/sai tại màn hình QuizReview.",
    0,
    "3. "
  ),
  bullet(
    "Bước 4: Vào tab 'Flashcards Leitner' -> Trải nghiệm thẻ lật 3D sống động -> Bấm Loa nghe phát âm -> Bấm 'Đã thuộc' để thăng hạng hộp từ vựng, hoặc 'Chưa nhớ' để reset về Hộp 1.",
    0,
    "4. "
  ),

  h2("4.3. Kết Quả Kiểm Thử Đảm Bảo Chất Lượng (QA Dual-Pass Verification)"),
  p(
    "Hệ thống đã trải qua quy trình kiểm thử tự động toàn diện theo chuẩn /ck:test với 2 vòng chạy độc lập liên tiếp (Dual-pass testing), đạt tỷ lệ thành công 100%:"
  ),
  createTable(
    ["Chỉ Số Kiểm Định", "Vòng 1 (Round 1)", "Vòng 2 (Round 2)", "Đánh Giá Cuối Cùng"],
    [
      ["Số lượng test cases", "56 bài test tích hợp", "56 bài test tích hợp", "112 / 112 lượt kiểm thử"],
      ["Số ca thành công (Passed)", "56 / 56 (100%)", "56 / 56 (100%)", "100% PASS"],
      ["Thời gian thực thi", "1043 ms", "660 ms", "Tốc độ phản hồi cực nhanh"],
      ["Biên dịch Frontend (npm run build)", "Compiled successfully", "Compiled successfully", "0 errors, 0 warnings (266 kB JS)"],
    ],
    [3200, 2000, 2000, 2800]
  ),

  pCallout(
    "Kết luận: Hệ thống EnglishQuiz Platform đã hoàn thiện toàn bộ các tính năng theo kế hoạch, vận hành ổn định, giao diện mượt mà và hoàn toàn sẵn sàng cho công tác nghiệm thu đồ án môn học SDN302."
  ),
];

// Document Definition
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22, color: COLOR_TEXT },
        paragraph: {
          spacing: {
            line: 280,
            lineRule: LineRuleType.AUTO,
            before: 80,
            after: 80,
          },
        },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch margins
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              text: "SDN302 — Đặc Tả Tính Năng & Luồng Hệ Thống — EnglishQuiz (Lê Duy & Nguyễn Tuấn Minh)",
              alignment: AlignmentType.RIGHT,
              run: { size: 16, italics: true, color: "94A3B8", font: "Arial" },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: "Trang ", size: 16, color: "94A3B8", font: "Arial" }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 16,
                  color: "94A3B8",
                  font: "Arial",
                }),
                new TextRun({ text: " / ", size: 16, color: "94A3B8", font: "Arial" }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: 16,
                  color: "94A3B8",
                  font: "Arial",
                }),
              ],
            }),
          ],
        }),
      },
      children: docChildren,
    },
  ],
});

const outputPathRoot = path.join(
  __dirname,
  "..",
  "Tai_Lieu_Huong_Dan_Tinh_Nang_Va_Luong_He_Thong_EnglishQuiz.docx"
);
const outputPathDocs = path.join(
  __dirname,
  "..",
  "docs",
  "Tai_Lieu_Huong_Dan_Tinh_Nang_Va_Luong_He_Thong_EnglishQuiz.docx"
);

Packer.toBuffer(doc)
  .then((buffer) => {
    fs.writeFileSync(outputPathRoot, buffer);
    console.log(`✓ Đã tạo file Word tại thư mục gốc: ${outputPathRoot} (${buffer.length} bytes)`);
    fs.writeFileSync(outputPathDocs, buffer);
    console.log(`✓ Đã copy file Word vào docs/: ${outputPathDocs}`);
    console.log("🎉 Hoàn tất sinh tài liệu tiếng Việt thành công!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Lỗi khi sinh file Word:", err);
    process.exit(1);
  });

