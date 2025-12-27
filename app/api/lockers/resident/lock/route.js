import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Locker from "@/models/Locker";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { bookingId } = body || {};

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Missing bookingId" },
        { status: 400 }
      );
    }

    // Find booking and populate locker to get price
    const booking = await Booking.findById(bookingId).populate('lockerId');
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Only allow locking if status is 'active'
    if (booking.status !== 'active') {
      return NextResponse.json(
        { success: false, message: "Booking is not in active status" },
        { status: 400 }
      );
    }

    // Set startTime when locking (bắt đầu tính tiền)
    const now = new Date();
    booking.status = 'stored';
    booking.startTime = now; // Set startTime when locking - bắt đầu tính tiền từ đây
    
    const dailyRate = Number(booking.lockerId?.price) || 10000;
    booking.cost = dailyRate; // Set initial cost for the first day
    booking.paymentStatus = 'pending';
    await booking.save();

    // Update locker: lock it
    await Locker.findByIdAndUpdate(booking.lockerId, {
      isLocked: true,
    });

    return NextResponse.json(
      { success: true, message: "Khóa tủ thành công", data: { booking, cost: dailyRate } },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error locking locker:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
