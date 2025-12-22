import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Locker from "@/models/Locker";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find all bookings that are currently active or stored
    const bookings = await Booking.find({
      status: { $in: ['active', 'stored'] }
    })
    .populate({ path: 'userId', model: User, select: 'name email phone' })
    .populate({ path: 'lockerId', model: Locker, select: 'lockerId building block' })
    .sort({ createdAt: -1 }) // Sort by newest first
    .lean();

    return NextResponse.json({ success: true, data: bookings });

  } catch (err) {
    console.error("Error fetching booked lockers for manager:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
