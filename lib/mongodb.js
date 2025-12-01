// lib/mongodb.js
const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI chưa được định nghĩa trong .env");
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err);
    throw err;
  }
}

module.exports = { connectDB };
