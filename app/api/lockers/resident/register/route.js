import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Locker from "@/models/Locker";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { userId, lockerId } = body || {};

    if (!userId || !lockerId) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin người dùng hoặc tủ." }, { status: 400 });
    }

    // Find locker and ensure it's available
    const locker = await Locker.findById(lockerId).lean();
    if (!locker) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tủ." }, { status: 404 });
    }

    // A locker can be registered only if its status is 'available' AND it's not already booked.
    if (locker.status !== 'available' || locker.currentBookingId) {
      return NextResponse.json({ success: false, message: "Tủ này không có sẵn hoặc đã được người khác đặt." }, { status: 409 });
    }

    // Create booking
    const newBooking = await Booking.create({
      userId,
      lockerId,
      status: 'active', // 'active' means booked but not yet used for storage
      paymentStatus: 'pending', // Payment is pending until user stores items and then pays
      cost: 0
    });

    // Update locker: set the current booking reference.
    // The status remains 'available' in terms of physical state, but currentBookingId makes it unavailable for others.
    await Locker.findByIdAndUpdate(lockerId, {
      currentBookingId: newBooking._id,
    });

    return NextResponse.json({ success: true, data: { bookingId: newBooking._id } }, { status: 201 });
  } catch (err) {
    console.error("Error in register locker API:", err);
    return NextResponse.json({ success: false, message: "Server error", error: err.message }, { status: 500 });
  }
}
