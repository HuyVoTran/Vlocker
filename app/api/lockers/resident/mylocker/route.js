import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Locker from "@/models/Locker";

export async function GET(req) {
  try {
    await dbConnect();

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
      .populate("lockerId") // <-- lấy toàn bộ info locker
      .lean();

    // 2. Format dữ liệu cho FE
    const formatted = bookings.map((b) => ({
      locker: b.lockerId,        // thông tin locker
      booking: {
        _id: b._id,
        status: b.status,
        cost: b.cost,
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
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
