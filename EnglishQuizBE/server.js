const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Connect to Database
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes Registration
app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/user"));
app.use("/exams", require("./routes/exam"));
app.use("/questions", require("./routes/question"));
app.use("/history", require("./routes/history"));
app.use("/topics", require("./routes/topic"));
app.use("/skills", require("./routes/skill"));
app.use("/certificates", require("./routes/certificate"));
app.use("/flashcards", require("./routes/flashcard"));
app.use("/bookmarks", require("./routes/bookmark"));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API Route Not Found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[ServerError]:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log([Server] EnglishQuiz BE running at http://localhost:);
});
