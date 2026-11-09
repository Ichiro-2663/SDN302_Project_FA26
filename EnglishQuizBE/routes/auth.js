const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken } = require("../middlewares/auth");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_sdn302_fa26";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role || "Student",
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, age, address, school, teacherProfile, studentProfile } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    // Check existing
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "Student",
      status: "Active",
      age,
      address,
      school,
      teacherProfile,
      studentProfile,
    });

    const token = generateToken(user);
    const safeUser = sanitizeUser(user);

    res.status(201).json({
      success: true,
      message: "Register success",
      token,
      user: safeUser,
      role: safeUser.role,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (user.status === "Disabled") {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled. Please contact the administrator.",
      });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (err) {
      isMatch = false;
    }

    // In case user in seeded JSON has plaintext password, migrate it safely
    if (!isMatch && password === user.password) {
      isMatch = true;
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
    }

    if (isMatch) {
      const token = generateToken(user);
      const safeUser = sanitizeUser(user);
      return res.json({
        success: true,
        message: "Login successful",
        token,
        user: safeUser,
        role: safeUser.role,
      });
    }

    res.status(400).json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET CURRENT USER PROFILE
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
