const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// GET ALL
router.get("/", async (req, res) => {
  try {
    const { topic, skill, certificate, questionType, level } = req.query;
    const filter = {};
    if (topic) filter.topic = topic;
    if (skill) filter.skill = skill;
    if (certificate) filter.certificate = certificate;
    if (questionType) filter.questionType = questionType;
    if (level) filter.level = level;

    const questions = await Question.find(filter)
      .populate("topic")
      .populate("skill")
      .populate("certificate");
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ONE
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("topic")
      .populate("skill")
      .populate("certificate");
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const newQuestion = await Question.create(req.body);
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;