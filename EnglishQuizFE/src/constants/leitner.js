// Leitner 5-box schedule (DESIGN.md: Leitner 5-Box Gamified Spaced Repetition Scale)
export const LEITNER_BOXES = {
  1: { intervalLabel: "Ôn hằng ngày", days: 1, color: "#f43f5e", soft: "#ffe4e6", text: "#be123c" },
  2: { intervalLabel: "2 ngày", days: 2, color: "#f97316", soft: "#ffedd5", text: "#c2410c" },
  3: { intervalLabel: "4 ngày", days: 4, color: "#eab308", soft: "#fef9c3", text: "#a16207" },
  4: { intervalLabel: "7 ngày", days: 7, color: "#06b6d4", soft: "#cffafe", text: "#0e7490" },
  5: { intervalLabel: "14 ngày - Thuộc làu", days: 14, color: "#10b981", soft: "#d1fae5", text: "#047857" },
};

export const LEITNER_MAX_BOX = 5;

export const getLeitnerBox = (box) => {
  const n = Math.min(Math.max(Number(box) || 1, 1), LEITNER_MAX_BOX);
  return { box: n, ...LEITNER_BOXES[n] };
};
