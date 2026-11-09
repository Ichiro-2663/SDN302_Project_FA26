// Pure helpers for the post-exam review screen (QuizReview.jsx)

export const OPTION_LETTERS = ["A", "B", "C", "D"];

export const REVIEW_FILTERS = [
  { key: "all", label: "Tất cả câu", showCount: false },
  { key: "correct", label: "Câu đúng", showCount: true },
  { key: "incorrect", label: "Câu sai", showCount: true },
  { key: "flagged", label: "Câu cắm cờ", showCount: true },
];

/* Accepts an option index, a numeric string, or the option text. Returns -1 if unknown. */
export const toOptionIndex = (value, options = []) => {
  if (value === undefined || value === null || value === "") return -1;
  if (typeof value === "number") return Number.isInteger(value) ? value : -1;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  return options.indexOf(value);
};

/* answers: { [questionId]: index | text } or History.answers array [{ questionId, selectedAnswer }] */
const toAnswerMap = (answers) => {
  if (Array.isArray(answers)) {
    return answers.reduce((m, a) => ({ ...m, [a.questionId]: a.selectedAnswer }), {});
  }
  return answers || {};
};

/* flagged: array of ids or { [id]: true } */
export const toFlagMap = (flagged) => {
  if (Array.isArray(flagged)) return flagged.reduce((m, id) => ({ ...m, [id]: true }), {});
  return { ...(flagged || {}) };
};

export const buildReviewItems = (questions, answers) => {
  const answerMap = toAnswerMap(answers);
  return questions.map((q, index) => {
    const options = q.options || [];
    const selected = toOptionIndex(answerMap[q._id], options);
    const correct = toOptionIndex(q.correctAnswer, options);
    const isSkipped = selected === -1;
    return {
      question: q,
      index,
      selected,
      correct,
      isSkipped,
      isCorrect: !isSkipped && selected === correct,
    };
  });
};

export const matchesFilter = (item, filterKey, flagMap) => {
  switch (filterKey) {
    case "correct":
      return item.isCorrect;
    case "incorrect":
      return !item.isCorrect;
    case "flagged":
      return Boolean(flagMap[item.question._id]);
    default:
      return true;
  }
};

export const formatDuration = (totalSec = 0) => {
  const safe = Math.max(0, Math.round(totalSec));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h) return `${h}h ${m}m`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
};

export const formatScore = (value) =>
  Number.isInteger(value) ? String(value) : Number(value).toFixed(1);

export const letterOf = (idx) => (idx >= 0 ? OPTION_LETTERS[idx] || String(idx + 1) : "—");
