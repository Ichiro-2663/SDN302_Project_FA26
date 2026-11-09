const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");

// GET ALL NOTICES
router.get("/", async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) {
      filter.$or = [{ targetRole: "All" }, { targetRole: role }];
    }
    const notices = await Notice.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");
    res.json(notices);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE NOTICE
router.post("/", async (req, res) => {
  try {
    const { title, content, type, targetRole, createdBy } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required" });
    }
    const notice = await Notice.create({
      title,
      content,
      type: type || "info",
      targetRole: targetRole || "All",
      createdBy,
    });
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// UPDATE NOTICE
router.put("/:id", async (req, res) => {
  try {
    const updated = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Notice not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE NOTICE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Notice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Notice not found" });
    res.json({ success: true, message: "Notice deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
