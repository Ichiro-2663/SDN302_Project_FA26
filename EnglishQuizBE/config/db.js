const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/SDN302_project_FA26";
    await mongoose.connect(mongoUri);
    console.log([Database] MongoDB Connected: );
  } catch (err) {
    console.error("[Database] MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
