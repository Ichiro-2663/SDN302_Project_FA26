const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET USER BY ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 🔐 CHANGE PASSWORD (đặt trước update)
router.put("/change-password/:id", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong current password" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE USER
router.put("/:id", async (req, res) => {
  try {
    const updateFields = {};
    const allowedFields = ["name", "email", "role", "age", "address", "school", "status"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DISABLE USER (changed from DELETE)
router.delete("/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { status: "Disabled" },
      { new: true }
    ).select("-password");
    
    if (!updated) return res.status(404).json({ message: "User not found" });
    
    res.json({ message: "Disabled", user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;