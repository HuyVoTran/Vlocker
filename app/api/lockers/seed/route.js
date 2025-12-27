import { NextResponse } from "next/server";
import Locker from "@/models/Locker";
import { connectDB } from "@/lib/mongodb";

export async function POST(req) {
  try {
    // QUAN TRỌNG: Route này chỉ nên được truy cập trong môi trường development.
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { success: false, message: "This endpoint is only available in development mode." },
        { status: 403 } // 403 Forbidden
      );
    }

    // Check for authorization token (optional security)
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.SEED_TOKEN || "dev-seed-token";
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Clear existing lockers
    await Locker.deleteMany({});
    console.log("Cleared existing lockers");

    // Sample buildings and blocks
    const buildings = ["A", "B", "C"];
    const blocks = ["1", "2", "3"];

    const lockers = [];

    for (const building of buildings) {
      for (const block of blocks) {
        for (let i = 1; i <= 5; i++) {
          lockers.push({
            lockerId: `${building}${block}-${String(i).padStart(3, "0")}`,
            building,
            block,
            status: "available", // All seeded lockers are available by default
            isLocked: true,
            size: 'M',
            price: 10000,
          });
        }
      }
    }

    const created = await Locker.insertMany(lockers);
    console.log(`Created ${created.length} lockers`);

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} lockers`,
      data: created.slice(0, 5), // Return first 5 as sample
    });
  } catch (err) {
    console.error("Error seeding lockers:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
