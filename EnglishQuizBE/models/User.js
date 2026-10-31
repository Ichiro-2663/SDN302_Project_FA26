const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Student", "Teacher", "Admin"], default: "Student" },
  status: { type: String, enum: ["Active", "Disabled"], default: "Active" },
  age: Number,
  address: String,
  school: String,
  teacherProfile: {
    specialization: [String],
    experienceYears: Number,
    bio: String
  },
  studentProfile: {
    targetCertificate: String,
    targetScore: String
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema, "users");