const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
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

const dataDir = path.join(__dirname, "data");

const loadJson = (filename) => {
  const filePath = path.join(dataDir, filename);
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  }
  return [];
};

const cleanIds = (items) => {
  return items.map((item) => {
    const copy = { ...item };
    if (copy._id && copy._id.$oid) copy._id = copy._id.$oid;
    if (copy.userId && copy.userId.$oid) copy.userId = copy.userId.$oid;
    if (copy.examId && copy.examId.$oid) copy.examId = copy.examId.$oid;
    if (copy.topic && copy.topic.$oid) copy.topic = copy.topic.$oid;
    if (copy.skill && copy.skill.$oid) copy.skill = copy.skill.$oid;
    if (copy.certificate && copy.certificate.$oid) copy.certificate = copy.certificate.$oid;
    if (copy.createdBy && copy.createdBy.$oid) copy.createdBy = copy.createdBy.$oid;
    if (copy.itemId && copy.itemId.$oid) copy.itemId = copy.itemId.$oid;
    if (copy.questions && Array.isArray(copy.questions)) {
      copy.questions = copy.questions.map((q) => (q.$oid ? q.$oid : q));
    }
    if (copy.skills && Array.isArray(copy.skills)) {
      copy.skills = copy.skills.map((s) => (s.$oid ? s.$oid : s));
    }
    if (copy.createdAt && copy.createdAt.$date) copy.createdAt = new Date(copy.createdAt.$date);
    if (copy.updatedAt && copy.updatedAt.$date) copy.updatedAt = new Date(copy.updatedAt.$date);
    if (copy.nextReviewDate && copy.nextReviewDate.$date) copy.nextReviewDate = new Date(copy.nextReviewDate.$date);
    return copy;
  });
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

    console.log(`[Seed] Successfully seeded:
      - ${users.length} Users
      - ${topics.length} Topics
      - ${skills.length} Skills
      - ${certificates.length} Certificates
      - ${questions.length} Questions
      - ${exams.length} Exams
      - ${history.length} History entries
      - ${flashcards.length} Flashcards
      - ${bookmarks.length} Bookmarks
      - 1 Notice`);

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
