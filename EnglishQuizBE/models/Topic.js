const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  slug: String,
  image: String
}, { timestamps: true });

module.exports = mongoose.model("Topic", TopicSchema, "topics");
