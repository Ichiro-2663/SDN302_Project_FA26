const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const History = require("../models/History");

// SUBMIT HISTORY DIRECT
router.post("/", async (req, res) => {
  try {
    const result = await History.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET SINGLE HISTORY ATTEMPT DETAILS
router.get("/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid history ID" });
    }
    const data = await History.findById(id)
      .populate("userId", "name email role")
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
    if (!data) return res.status(404).json({ success: false, message: "History record not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET HISTORY FOR SPECIFIC USER
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === "null" || userId === "undefined" || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json([]);
    }
    const data = await History.find({ userId })
      .sort({ createdAt: -1 })
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
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET ALL HISTORY (ADMIN / TEACHER)
router.get("/", async (req, res) => {
  try {
    const data = await History.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email role school")
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
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE HISTORY RECORD BY ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await History.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "History record not found" });
    res.json({ success: true, message: "History record deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
