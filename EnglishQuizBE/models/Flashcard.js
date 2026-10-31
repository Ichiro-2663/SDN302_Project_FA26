const mongoose = require("mongoose");

const FlashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // category/type of flashcard: vocabulary, grammar, common_mistake, collocation, idiom, collection
  type: { type: String, enum: ["vocabulary", "grammar", "common_mistake", "collocation", "idiom", "collection"], default: "vocabulary" },
  word: { type: String, required: true },
  definition: { type: String, required: true },
  example: String,
  pronunciation: String,
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  box: { type: Number, default: 1 }, // Leitner box (1 to 5)
  nextReviewDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Flashcard", FlashcardSchema, "flashcards");
