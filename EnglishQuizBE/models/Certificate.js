const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // TOEIC, IELTS, TOEFL, etc.
  description: String,
  format: String,
  maxScore: Number
}, { timestamps: true });

module.exports = mongoose.model("Certificate", CertificateSchema, "certificates");
