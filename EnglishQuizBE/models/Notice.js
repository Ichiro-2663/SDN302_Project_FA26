const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "warning", "success", "danger"],
      default: "info",
    },
    targetRole: {
      type: String,
      enum: ["All", "Student", "Teacher"],
      default: "All",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", NoticeSchema, "notices");
