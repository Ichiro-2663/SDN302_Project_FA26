const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    const targetUserId = req.params.id;

    // Resolve caller user id from Authorization header or body
    let callerId = req.body?.adminId;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_sdn302_fa26");
        callerId = decoded.id;
      } catch (e) {}
    }

    // Check if caller is trying to lock or downgrade themselves
    if (callerId && String(callerId) === String(targetUserId)) {
      if (req.body.status === "Disabled") {
        return res.status(400).json({
          success: false,
          message: "Admin không thể tự khóa tài khoản của chính mình.",
        });
      }
      if (req.body.role && req.body.role !== "Admin") {
        return res.status(400).json({
          success: false,
          message: "Admin không thể tự hạ quyền Admin của chính mình.",
        });
      }
    }

    const updateFields = {};
    const allowedFields = ["name", "email", "role", "age", "address", "school", "status"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const updated = await User.findByIdAndUpdate(
      targetUserId,
      updateFields,
      { new: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DISABLE USER (changed from DELETE)
router.delete("/:id", async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Resolve caller user id from Authorization header or body
    let callerId = req.body?.adminId;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_sdn302_fa26");
        callerId = decoded.id;
      } catch (e) {}
    }

    // Check if caller is trying to disable themselves
    if (callerId && String(callerId) === String(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Admin không thể tự khóa tài khoản của chính mình.",
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (targetUser.role === "Admin" && callerId && String(callerId) === String(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Admin không thể tự khóa tài khoản của chính mình.",
      });
    }

    targetUser.status = "Disabled";
    await targetUser.save();
    
    res.json({ message: "Disabled", user: targetUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;