const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  options: [String], // for MultipleChoice, Matching
  correctAnswer: mongoose.Schema.Types.Mixed, // number (index), string, boolean, or array/object
  level: { type: String, required: true },
  questionType: { 
    type: String, 
    enum: ["MultipleChoice", "FillInBlank", "TrueFalse", "Matching"], 
    default: "MultipleChoice" 
  },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
  certificate: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" },
  matchingPairs: [{
    left: String,
    right: String
  }],
  passage: String,
  audioUrl: String,
  explanation: String
}, { timestamps: true });

module.exports = mongoose.model("Question", QuestionSchema, "questions");