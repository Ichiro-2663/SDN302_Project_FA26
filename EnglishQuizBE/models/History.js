const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  score: Number,
  total: Number,
  status: String,
  answers: [
    {
      questionId: String,
      selectedAnswer: String,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("History", HistorySchema, "history");