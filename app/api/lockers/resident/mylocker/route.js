import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Locker from "@/models/Locker"; // ensure Locker model is registered for populate

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    // 1. Tìm tất cả booking của user + populate locker
    const bookings = await Booking.find({ userId })
      .populate({ path: "lockerId", model: Locker })
      .lean();

    if (!bookings) {
      return NextResponse.json(
        { success: true, data: [] },
        { status: 200 }
      );
    }

    // 2. Format dữ liệu cho FE
    const formatted = bookings.map((b) => ({
      locker: b.lockerId || {},
      booking: {
        _id: b._id,
        status: b.status,
        cost: b.cost || 0,
        paymentStatus: b.paymentStatus,
        startTime: b.startTime,
        endTime: b.endTime,
      },
    }));

    return NextResponse.json(
      { success: true, data: formatted },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching my lockers:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
