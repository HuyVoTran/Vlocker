import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export async function POST(req) {
  try {
    // Check for authorization
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.SEED_TOKEN || "dev-seed-token";
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Update all users without building/block to have default values
    const result = await User.updateMany(
      {
        $or: [
          { building: { $exists: false } },
          { block: { $exists: false } }
        ]
      },
      {
        $set: {
          building: "A",
          block: "1"
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} users with default building/block`);

    // Get updated users
    const users = await User.find({})
      .select("name email building block")
      .lean();

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} users`,
      data: users,
    });
  } catch (err) {
    console.error("Error updating users:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
