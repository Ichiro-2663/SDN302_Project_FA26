const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: String,
    userEmail: String,
    title: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    category: {
      type: String,
      enum: ["Exam", "Practice", "System", "Other"],
      default: "System",
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedbackSchema, "feedbacks");
