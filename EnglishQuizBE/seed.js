const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Question = require("./models/Question");
const Exam = require("./models/Exam");
const History = require("./models/History");
const Flashcard = require("./models/Flashcard");
const Bookmark = require("./models/Bookmark");
const Topic = require("./models/Topic");
const Skill = require("./models/Skill");
const Certificate = require("./models/Certificate");
const Notice = require("./models/Notice");
const Feedback = require("./models/Feedback");

const dataDir = path.join(__dirname, "data");

const loadJson = (filename) => {
  const filePath = path.join(dataDir, filename);
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  }
  return [];
};

const deepCleanOids = (data) => {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) {
    return data.map(deepCleanOids);
  }
  if (typeof data === "object") {
    if (data.$oid && Object.keys(data).length === 1) {
      return data.$oid;
    }
    if (data.$date && Object.keys(data).length === 1) {
      return new Date(data.$date);
    }
    const result = {};
    for (const key of Object.keys(data)) {
      result[key] = deepCleanOids(data[key]);
    }
    return result;
  }
  return data;
};

const cleanIds = (items) => {
  return items.map((item) => deepCleanOids(item));
};

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/SDN302_project_FA26";
    await mongoose.connect(mongoUri);
    console.log("[Seed] Connected to MongoDB");

    // Clean existing
    await Promise.all([
      User.deleteMany({}),
      Question.deleteMany({}),
      Exam.deleteMany({}),
      History.deleteMany({}),
      Flashcard.deleteMany({}),
      Bookmark.deleteMany({}),
      Topic.deleteMany({}),
      Skill.deleteMany({}),
      Certificate.deleteMany({}),
      Notice.deleteMany({}),
      Feedback.deleteMany({}),
    ]);
    console.log("[Seed] Cleared existing data");

    const users = cleanIds(loadJson("SDN302_project_SP26.users.json"));
    const questions = cleanIds(loadJson("SDN302_project_SP26.questions.json"));
    const exams = cleanIds(loadJson("SDN302_project_SP26.exams.json"));
    const history = cleanIds(loadJson("SDN302_project_SP26.history.json"));
    const flashcards = cleanIds(loadJson("SDN302_project_SP26.flashcards.json"));
    const bookmarks = cleanIds(loadJson("SDN302_project_SP26.bookmarks.json"));
    const topics = cleanIds(loadJson("SDN302_project_SP26.topics.json"));
    const skills = cleanIds(loadJson("SDN302_project_SP26.skills.json"));
    const certificates = cleanIds(loadJson("SDN302_project_SP26.certificates.json"));

    // Standardize all user passwords to '123456' using bcrypt
    const defaultPasswordHash = await bcrypt.hash("123456", 10);
    users.forEach((u) => {
      u.password = defaultPasswordHash;
      if (!u.status) u.status = "Active";
    });

    if (topics.length) await Topic.insertMany(topics);
    if (skills.length) await Skill.insertMany(skills);
    if (certificates.length) await Certificate.insertMany(certificates);
    if (users.length) await User.insertMany(users);
    if (questions.length) await Question.insertMany(questions);
    if (exams.length) await Exam.insertMany(exams);
    if (history.length) await History.insertMany(history);
    if (flashcards.length) await Flashcard.insertMany(flashcards);
    if (bookmarks.length) await Bookmark.insertMany(bookmarks);

    // Initial system notice
    await Notice.create({
      title: "Chào mừng bạn đến với EnglishQuiz Platform FA26!",
      content: "Hệ thống đã nâng cấp toàn diện bảo mật JWT, bộ đếm giờ thi thực tế, chống gian lận và phương pháp ghi nhớ Leitner 5 hộp.",
      type: "success",
      targetRole: "All",
    });

    // Initial sample feedback from student
    const studentUser = users.find((u) => u.role === "Student") || users[0];
    if (studentUser) {
      await Feedback.create({
        userId: studentUser._id,
        userName: studentUser.name,
        userEmail: studentUser.email,
        title: "Trải nghiệm làm bài thi rất mượt mà",
        content: "Hệ thống đếm ngược thời gian và bảng điều hướng câu hỏi rất trực quan, giúp em làm bài tập trung hơn.",
        rating: 5,
        category: "Exam",
        status: "Pending",
      });
    }

    console.log(`[Seed] Successfully seeded:
      - ${users.length} Users (Default password set to '123456')
      - ${topics.length} Topics
      - ${skills.length} Skills
      - ${certificates.length} Certificates
      - ${questions.length} Questions
      - ${exams.length} Exams
      - ${history.length} History entries
      - ${flashcards.length} Flashcards
      - ${bookmarks.length} Bookmarks
      - 1 Notice
      - 1 Feedback`);

    await mongoose.disconnect();
    console.log("[Seed] Finished and disconnected.");
  } catch (err) {
    console.error("[Seed] Error seeding data:", err);
    process.exit(1);
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;
