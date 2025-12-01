// testConnect.js
const { connectDB } = require("./lib/mongodb");

async function main() {
  try {
    await connectDB();
    console.log("Test connection success!");
  } catch (err) {
    console.error("Test connection failed:", err);
  }
}

main();
