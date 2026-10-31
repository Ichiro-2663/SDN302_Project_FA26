const mongoose = require("mongoose");

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Grammar, Vocabulary, Listening, Reading, Writing
  description: String
}, { timestamps: true });

module.exports = mongoose.model("Skill", SkillSchema, "skills");
