const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const History = require("../models/History");

// SUBMIT
router.post("/", async (req, res) => {
  try {
    const result = await History.create(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET HISTORY
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === "null" || userId === "undefined" || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json([]);
    }
    const data = await History.find({ userId })
      .populate({
        path: "examId",
        populate: [
          {
            path: "questions",
            populate: [
              { path: "topic" },
              { path: "skill" },
              { path: "certificate" }
            ]
          },
          { path: "topic" }
        ]
      });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL HISTORY
router.get("/", async (req, res) => {
  try {
    const data = await History.find()
      .populate("userId")
      .populate({
        path: "examId",
        populate: [
          {
            path: "questions",
            populate: [
              { path: "topic" },
              { path: "skill" },
              { path: "certificate" }
            ]
          },
          { path: "topic" }
        ]
      });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE HISTORY RECORD BY ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await History.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "History record not found" });
    res.json({ message: "History record deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;