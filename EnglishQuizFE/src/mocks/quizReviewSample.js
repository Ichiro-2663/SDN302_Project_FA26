// Sample attempt so QuizReview renders standalone. Shapes follow the Question / History models.

export const SAMPLE_REVIEW_EXAM = {
  title: "TOEIC Reading — Part 5 Mini Test",
  certificateLabel: "TOEIC 850",
  duration: 25,
};

export const SAMPLE_REVIEW_RESULT = {
  score: 850,
  maxScore: 990,
  passScore: 600,
  timeSpent: 24 * 60 + 30,
  submittedAt: "2026-11-09T18:20:00",
};

// [content, options, correctIndex, skill, explanation, grammarNote?, vocabulary?]
const RAW = [
  ["The marketing team will _____ the results of the survey at Friday's meeting.", ["present", "presents", "presenting", "presented"], 0, "Grammar",
    "Sau động từ khuyết thiếu \"will\" luôn dùng động từ nguyên mẫu không \"to\"."],
  ["Ms. Tanaka has worked at the firm _____ she graduated from university.", ["during", "since", "while", "until"], 1, "Grammar",
    "Thì hiện tại hoàn thành \"has worked\" đi với \"since\" + mốc thời gian bắt đầu."],
  ["Employees are reminded to submit their travel expense reports _____ the end of the month.", ["by", "on", "at", "within"], 0, "Grammar",
    "\"By + mốc thời gian\" nghĩa là \"chậm nhất là\", dùng cho hạn chót (deadline). \"Within\" đi với một khoảng thời gian (within 30 days), không đi với một mốc như \"the end of the month\".",
    "by + deadline (by Friday, by the end of the month) | within + khoảng thời gian (within two weeks)",
    [{ term: "expense report", meaning: "báo cáo chi phí" }, { term: "be reminded to do sth", meaning: "được nhắc nhở làm gì" }]],
  ["The new software is designed to make data entry faster and more _____.", ["accurate", "accuracy", "accurately", "accuracies"], 0, "Vocabulary",
    "Cấu trúc \"make + O + adj\": cần tính từ \"accurate\", song song với \"faster\"."],
  ["Because of the heavy rain, the outdoor concert has been _____ until next Saturday.", ["postponed", "canceled", "delayed off", "put up"], 0, "Vocabulary",
    "\"Postpone ... until\" là hoãn lại đến một thời điểm sau. \"Canceled\" không đi với \"until\"."],
  ["All visitors must sign in at the front desk _____ entering the laboratory.", ["before", "prior", "ahead", "early"], 0, "Grammar",
    "\"Before + V-ing\" là giới từ chỉ thời gian. \"Prior\" phải đi kèm \"to\" (prior to entering)."],
  ["The hotel offers a complimentary shuttle service _____ guests staying more than three nights.", ["to", "for", "with", "from"], 1, "Grammar",
    "Dịch vụ dành \"cho\" ai dùng \"for\": a service for guests. \"Offer sth to sb\" chỉ đúng khi tân ngữ người đứng ngay sau cụm \"offer sth\", còn ở đây \"for guests\" bổ nghĩa cho danh từ \"service\".",
    "service / discount / program + for + đối tượng hưởng lợi",
    [{ term: "complimentary", meaning: "miễn phí (đi kèm dịch vụ)" }, { term: "shuttle service", meaning: "dịch vụ xe đưa đón" }]],
  ["Mr. Alvarez was _____ for his outstanding contribution to the project.", ["recognized", "recognizing", "recognition", "recognizable"], 0, "Vocabulary",
    "Câu bị động \"was + V3\": \"be recognized for\" là được ghi nhận vì điều gì."],
  ["Please contact the IT department if your password needs to be _____.", ["reset", "resets", "resetting", "to reset"], 0, "Grammar",
    "\"Need to be + V3\" là bị động. \"Reset\" có V3 giống nguyên mẫu."],
  ["The quarterly report indicates a _____ increase in online sales.", ["significant", "significance", "significantly", "signify"], 0, "Vocabulary",
    "Trước danh từ \"increase\" cần tính từ \"significant\"."],
  ["Neither the manager _____ her assistant was available to answer the call.", ["or", "nor", "and", "but"], 1, "Grammar",
    "Cặp liên từ cố định \"neither ... nor\" (không ... cũng không). \"Or\" chỉ đi với \"either\".",
    "either ... or | neither ... nor | both ... and | not only ... but also",
    [{ term: "available", meaning: "rảnh, có thể tiếp nhận" }]],
  ["The factory has _____ its production capacity to meet growing demand.", ["expanded", "extended", "enlarged up", "spread"], 0, "Vocabulary",
    "Collocation: \"expand capacity\" là mở rộng công suất."],
  ["Applicants should have _____ three years of experience in customer service.", ["at least", "at most", "less than", "much"], 0, "Vocabulary",
    "\"At least\" là ít nhất, dùng cho yêu cầu tối thiểu trong tin tuyển dụng."],
  ["The contract will be signed _____ both parties agree on the final terms.", ["once", "despite", "unless", "whereas"], 0, "Grammar",
    "\"Once + mệnh đề\" là ngay khi. \"Despite\" phải đi với danh từ, không đi với mệnh đề."],
  ["Our branch in Singapore is _____ responsible for operations in Southeast Asia.", ["primarily", "primary", "prime", "primacy"], 0, "Vocabulary",
    "Trạng từ \"primarily\" bổ nghĩa cho tính từ \"responsible\"."],
  ["The seminar was so popular that additional seats had to be _____.", ["arranged", "arranging", "arrangement", "arranges"], 0, "Grammar",
    "\"Had to be + V3\" là bị động với động từ khuyết thiếu."],
  ["Customers who order online can choose to have items delivered or _____ them up in store.", ["pick", "picking", "picked", "to picking"], 0, "Grammar",
    "Cấu trúc song song sau \"choose to\": (to) have ... or (to) pick ..."],
  ["The board of directors approved the budget _____ some minor revisions.", ["with", "among", "beside", "upon"], 0, "Grammar",
    "\"With + revisions\" là kèm theo một vài chỉnh sửa."],
  ["Due to _____ demand, the limited edition model sold out within a week.", ["overwhelming", "overwhelmed", "overwhelm", "overwhelmingly"], 0, "Vocabulary",
    "Tính từ đuôi -ing mô tả bản chất sự vật: \"overwhelming demand\" là nhu cầu áp đảo."],
  ["The research team is _____ to publish its findings early next year.", ["expected", "expecting", "expectation", "expectant"], 0, "Vocabulary",
    "\"Be expected to do sth\" là được dự kiến sẽ làm gì."],
];

export const SAMPLE_REVIEW_QUESTIONS = RAW.map(
  ([content, options, correctAnswer, skill, explanation, grammarNote, vocabulary], i) => ({
    _id: `sample-q${i + 1}`,
    content,
    options,
    correctAnswer,
    skill,
    explanation,
    grammarNote,
    vocabulary,
    questionType: "MultipleChoice",
  })
);

// 17 correct, 3 incorrect (q3, q7, q11)
export const SAMPLE_REVIEW_ANSWERS = SAMPLE_REVIEW_QUESTIONS.reduce((m, q) => {
  const wrong = { "sample-q3": 3, "sample-q7": 0, "sample-q11": 0 };
  return { ...m, [q._id]: wrong[q._id] ?? q.correctAnswer };
}, {});

export const SAMPLE_REVIEW_FLAGGED = ["sample-q7", "sample-q14"];
