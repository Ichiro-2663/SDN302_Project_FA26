const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Flashcard = require("../models/Flashcard");

// GET ALL FOR A USER
router.get("/user/:userId", async (req, res) => {
  try {
    const { topic, type } = req.query;
    const filter = { userId: req.params.userId };
    if (topic) filter.topic = topic;
    if (type) filter.type = type;
    const cards = await Flashcard.find(filter).populate("topic");
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const card = await Flashcard.create(req.body);
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const card = await Flashcard.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("topic");
    res.json(card);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Flashcard.findByIdAndDelete(req.params.id);
    res.json({ message: "Flashcard deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// REVIEW (Leitner Spaced Repetition logic)
router.post("/:id/review", async (req, res) => {
  try {
    const { isCorrect } = req.body;
    const card = await Flashcard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Flashcard not found" });

    let currentBox = card.box || 1;
    if (isCorrect) {
      currentBox = Math.min(currentBox + 1, 5);
    } else {
      currentBox = 1; // reset to box 1 on failure
    }

    // Leitner intervals in days: Box 1 (1d), Box 2 (3d), Box 3 (7d), Box 4 (14d), Box 5 (30d)
    const intervals = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
    const delayDays = intervals[currentBox];
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + delayDays);

    card.box = currentBox;
    card.nextReviewDate = nextReview;
    await card.save();

    const populatedCard = await card.populate("topic");
    res.json(populatedCard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
