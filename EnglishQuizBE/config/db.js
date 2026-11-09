const mongoose = require("mongoose");

mongoose.set("strictPopulate", false);

const connectDB = async (customUri) => {
  try {
    const mongoUri = customUri || process.env.MONGO_URI || "mongodb://localhost:27017/SDN302_project_FA26";
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[Database] MongoDB Connected: ${mongoUri}`);
  } catch (err) {
    console.error("[Database] MongoDB Connection Error:", err.message);
    if (process.env.NODE_ENV !== "test") {
      // Allow fallback / retry rather than immediate hard exit
      console.warn("[Database] Running without active database connection. Some routes may fail until MongoDB is started.");
    }
  }
};

module.exports = connectDB;
