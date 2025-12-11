import { NextResponse } from "next/server";
import Locker from "@/models/Locker";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    // Get all lockers
    const allLockers = await Locker.find({})
      .select("lockerId building block status")
      .lean();

    // Get all users
    const allUsers = await User.find({})
      .select("name email building block")
      .lean();

    // Get lockers by status
    const availableCount = await Locker.countDocuments({ status: "available" });
    const bookedCount = await Locker.countDocuments({ status: "booked" });
    const maintenanceCount = await Locker.countDocuments({ status: "maintenance" });

    return NextResponse.json({
      success: true,
      data: {
        totalLockers: allLockers.length,
        lockersByStatus: {
          available: availableCount,
          booked: bookedCount,
          maintenance: maintenanceCount,
        },
        sampleLockers: allLockers.slice(0, 10),
        totalUsers: allUsers.length,
        sampleUsers: allUsers.slice(0, 5),
      },
    });
  } catch (err) {
    console.error("Debug error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
