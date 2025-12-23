import { NextResponse } from "next/server";
import Locker from "@/models/Locker";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    // Run queries in parallel for better performance
    const [allLockers, allUsers, lockerStatusCounts] = await Promise.all([
      Locker.find({}).select("lockerId building block status").lean(),
      User.find({}).select("name email building block").lean(),
      // Use a single aggregation query to count statuses efficiently
      Locker.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    // Process the aggregation result into a more usable object
    const lockersByStatus = lockerStatusCounts.reduce(
      (acc, status) => {
        acc[status._id] = status.count;
        return acc;
      },
      { available: 0, booked: 0, maintenance: 0 }
    );

    return NextResponse.json({
      success: true,
      data: {
        totalLockers: allLockers.length,
        lockersByStatus: {
          // Ensure all keys exist even if count is 0
          available: lockersByStatus.available || 0,
          booked: lockersByStatus.booked || 0,
          maintenance: lockersByStatus.maintenance || 0,
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
