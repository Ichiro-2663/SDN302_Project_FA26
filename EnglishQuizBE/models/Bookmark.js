const mongoose = require("mongoose");

const BookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  itemType: { type: String, enum: ["Question", "Exam"], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "itemType" },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model("Bookmark", BookmarkSchema, "bookmarks");
