const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Bookmark = require("../models/Bookmark");

// GET ALL BOOKMARKS FOR USER
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === "null" || userId === "undefined" || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json([]);
    }
    const bookmarks = await Bookmark.find({ userId })
      .populate({
        path: "itemId",
        populate: [
          { path: "topic" },
          { path: "skill" },
          { path: "certificate" }
        ]
      });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE BOOKMARK
router.post("/", async (req, res) => {
  try {
    const { userId, itemType, itemId, notes } = req.body;

    // Check duplicate
    const existing = await Bookmark.findOne({ userId, itemType, itemId });
    if (existing) {
      return res.status(400).json({ message: "Item already bookmarked" });
    }

    const bookmark = await Bookmark.create({ userId, itemType, itemId, notes });
    const populated = await Bookmark.findById(bookmark._id).populate("itemId");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE BOOKMARK BY ID
router.delete("/:id", async (req, res) => {
  try {
    await Bookmark.findByIdAndDelete(req.params.id);
    res.json({ message: "Bookmark removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CHECK IF BOOKMARKED
router.get("/check", async (req, res) => {
  try {
    const { userId, itemId } = req.query;
    if (!userId || userId === "null" || userId === "undefined" || !mongoose.Types.ObjectId.isValid(userId) ||
        !itemId || itemId === "null" || itemId === "undefined" || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.json({ bookmarked: false, bookmarkId: null });
    }
    const bookmark = await Bookmark.findOne({ userId, itemId });
    res.json({ bookmarked: !!bookmark, bookmarkId: bookmark ? bookmark._id : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
