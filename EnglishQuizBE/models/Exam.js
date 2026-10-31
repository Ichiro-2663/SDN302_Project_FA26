const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: Number,
    type: {
      type: String,
      enum: ["practice", "quiz", "minitest"],
      default: "quiz",
    },
    level: { type: String, default: "Mixed" },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" },
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Exam", ExamSchema, "exams");
