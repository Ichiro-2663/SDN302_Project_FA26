const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// GET ALL FEEDBACKS
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email");
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET FEEDBACKS BY USER
router.get("/user/:userId", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE FEEDBACK
router.post("/", async (req, res) => {
  try {
    const { userId, userName, userEmail, title, content, rating, category } = req.body;
    if (!userId || !title || !content) {
      return res.status(400).json({ success: false, message: "UserId, title, and content are required" });
    }
    const feedback = await Feedback.create({
      userId,
      userName,
      userEmail,
      title,
      content,
      rating: rating || 5,
      category: category || "System",
      status: "Pending",
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// UPDATE FEEDBACK STATUS
router.put("/:id", async (req, res) => {
  try {
    const updated = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Feedback not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE FEEDBACK
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Feedback not found" });
    res.json({ success: true, message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
