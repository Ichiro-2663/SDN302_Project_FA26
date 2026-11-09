const express = require("express");
const router = express.Router();
const Exam = require("../models/Exam");
const History = require("../models/History");
const Question = require("../models/Question");

// GET ADMIN STATS FOR DASHBOARD
router.get("/stats", async (req, res) => {
  try {
    const totalExams = await Exam.countDocuments();
    const totalAttempts = await History.countDocuments();

    const exams = await Exam.find({}, "title type level duration createdAt").lean();

    const historyGroups = await History.aggregate([
      { $group: { _id: "$examId", attempts: { $sum: 1 }, averageScore: { $avg: "$score" } } }
    ]);

    const historyMap = new Map();
    historyGroups.forEach((item) => {
      if (item._id) {
        historyMap.set(item._id.toString(), {
          attempts: item.attempts,
          averageScore: Math.round((item.averageScore || 0) * 100) / 100,
        });
      }
    });

    const examStats = exams.map((exam) => {
      const examId = exam._id.toString();
      const history = historyMap.get(examId) || { attempts: 0, averageScore: 0 };
      return {
        examId,
        title: exam.title,
        type: exam.type,
        level: exam.level,
        duration: exam.duration,
        createdAt: exam.createdAt,
        attempts: history.attempts,
        averageScore: history.averageScore,
      };
    });

    const chartData = {
      labels: examStats.map((item) => item.title),
      attempts: examStats.map((item) => item.attempts),
      averageScores: examStats.map((item) => item.averageScore),
    };

    res.json({
      totalExams,
      totalAttempts,
      examStats,
      chartData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL EXAMS
router.get("/", async (req, res) => {
  try {
    const { type, level } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (level && level !== "All") filter.level = level;

    const exams = await Exam.find(filter)
      .populate({
        path: "questions",
        populate: [
          { path: "topic" },
          { path: "skill" },
          { path: "certificate" }
        ]
      })
      .populate("topic")
      .populate("certificate")
      .populate("skills")
      .populate("createdBy", "name email role");
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SECURE EXAM TAKING ENDPOINT (Anti-Cheat: removes correctAnswer and explanation)
router.get("/:id/take", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate({
        path: "questions",
        select: "-correctAnswer -explanation",
        populate: [
          { path: "topic" },
          { path: "skill" },
          { path: "certificate" }
        ]
      })
      .populate("topic")
      .populate("certificate")
      .populate("skills");

    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    res.json({
      success: true,
      exam: {
        _id: exam._id,
        title: exam.title,
        duration: exam.duration || 30,
        type: exam.type,
        level: exam.level,
        topic: exam.topic,
        questions: exam.questions,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SERVER-SIDE SUBMISSION & GRADING ENDPOINT (Fixes score manipulation cheat)
router.post("/:id/submit", async (req, res) => {
  try {
    const { userId, answers = {}, timeSpent } = req.body;
    const exam = await Exam.findById(req.params.id).populate("questions");

    if (!exam) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }

    const questions = exam.questions || [];
    let score = 0;
    const details = [];
    const formattedHistoryAnswers = [];

    questions.forEach((q) => {
      const qId = q._id.toString();
      const userAns = answers[qId] !== undefined ? answers[qId] : answers[q._id];
      let isCorrect = false;

      if (q.questionType === "MultipleChoice") {
        if (userAns !== undefined && userAns !== null) {
          isCorrect = String(userAns).trim() === String(q.correctAnswer).trim();
        }
      } else if (q.questionType === "TrueFalse") {
        if (userAns !== undefined && userAns !== null) {
          isCorrect = String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
        }
      } else if (q.questionType === "FillInBlank") {
        if (userAns !== undefined && userAns !== null) {
          isCorrect = String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
        }
      } else if (q.questionType === "Matching") {
        let parsedAns = userAns;
        if (typeof userAns === "string") {
          try { parsedAns = JSON.parse(userAns); } catch (e) { parsedAns = {}; }
        }
        if (parsedAns && typeof parsedAns === "object" && q.matchingPairs && q.matchingPairs.length > 0) {
          let matchCorrect = true;
          q.matchingPairs.forEach((_, idx) => {
            if (Number(parsedAns[idx]) !== idx) {
              matchCorrect = false;
            }
          });
          isCorrect = matchCorrect;
        }
      }

      if (isCorrect) {
        score++;
      }

      const answerString = typeof userAns === "object" ? JSON.stringify(userAns) : (userAns !== undefined ? String(userAns) : "");
      formattedHistoryAnswers.push({
        questionId: qId,
        selectedAnswer: answerString,
      });

      details.push({
        questionId: qId,
        content: q.content,
        questionType: q.questionType,
        options: q.options,
        matchingPairs: q.matchingPairs,
        userAnswer: userAns,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || "No explanation provided.",
      });
    });

    const total = questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const status = percentage >= 50 ? "PASSED" : "FAILED";

    let historyRecord = null;
    if (userId) {
      historyRecord = await History.create({
        userId,
        examId: exam._id,
        score,
        total,
        status,
        answers: formattedHistoryAnswers,
      });
    }

    res.json({
      success: true,
      message: "Exam submitted and graded successfully",
      historyId: historyRecord ? historyRecord._id : null,
      score,
      total,
      percentage,
      status,
      timeSpent,
      details,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// AUTO-MATRIX EXAM GENERATOR (Easy, Medium, Hard breakdown)
router.post("/matrix/generate", async (req, res) => {
  try {
    const { title, duration, type, level, topic, skill, easyCount = 5, mediumCount = 3, hardCount = 2, createdBy } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const baseFilter = {};
    if (topic) baseFilter.topic = topic;
    if (skill) baseFilter.skill = skill;

    // Fetch easy questions (A1, A2, Easy)
    const easyFilter = { ...baseFilter, level: { $in: ["A1", "A2", "Easy"] } };
    const easyQuestions = await Question.aggregate([
      { $match: easyFilter },
      { $sample: { size: Number(easyCount) } }
    ]);

    // Fetch medium questions (B1, B2, Medium)
    const mediumFilter = { ...baseFilter, level: { $in: ["B1", "B2", "Medium"] } };
    const mediumQuestions = await Question.aggregate([
      { $match: mediumFilter },
      { $sample: { size: Number(mediumCount) } }
    ]);

    // Fetch hard questions (C1, C2, Hard)
    const hardFilter = { ...baseFilter, level: { $in: ["C1", "C2", "Hard"] } };
    const hardQuestions = await Question.aggregate([
      { $match: hardFilter },
      { $sample: { size: Number(hardCount) } }
    ]);

    const combinedQuestionIds = [
      ...easyQuestions.map(q => q._id),
      ...mediumQuestions.map(q => q._id),
      ...hardQuestions.map(q => q._id),
    ];

    if (combinedQuestionIds.length === 0) {
      // Fallback: pick any questions available
      const anyQuestions = await Question.aggregate([
        { $match: baseFilter },
        { $sample: { size: Number(easyCount) + Number(mediumCount) + Number(hardCount) || 10 } }
      ]);
      combinedQuestionIds.push(...anyQuestions.map(q => q._id));
    }

    const newExam = await Exam.create({
      title,
      duration: duration || 30,
      type: type || "quiz",
      level: level || "Mixed",
      topic: topic || null,
      skills: skill ? [skill] : [],
      questions: combinedQuestionIds,
      createdBy: createdBy || null,
    });

    const populatedExam = await Exam.findById(newExam._id)
      .populate("questions")
      .populate("topic");

    res.status(201).json({
      success: true,
      message: "Matrix exam generated successfully",
      exam: populatedExam,
      distribution: {
        easy: easyQuestions.length,
        medium: mediumQuestions.length,
        hard: hardQuestions.length,
        total: combinedQuestionIds.length
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET ONE EXAM (Full details for teachers/admins)
router.get("/:id", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate({
        path: "questions",
        populate: [
          { path: "topic" },
          { path: "skill" },
          { path: "certificate" }
        ]
      })
      .populate("topic")
      .populate("certificate")
      .populate("skills")
      .populate("createdBy", "-password");
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE EXAM MANUAL
router.post("/", async (req, res) => {
  try {
    const newExam = await Exam.create(req.body);
    const populated = await Exam.findById(newExam._id).populate("questions");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE EXAM
router.put("/:id", async (req, res) => {
  try {
    const updated = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("questions");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE EXAM
router.delete("/:id", async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
