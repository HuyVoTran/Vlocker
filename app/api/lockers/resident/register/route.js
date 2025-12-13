import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Locker from "@/models/Locker";

export async function POST(req) {
  console.log("=== Register Locker API START ===");
  try {
    await connectDB();

    const body = await req.json();
    const { userId, lockerId } = body || {};

    console.log("Register request:", { userId, lockerId });

    if (!userId || !lockerId) {
      console.warn("Missing userId or lockerId");
      return NextResponse.json({ success: false, message: "Missing userId or lockerId" }, { status: 200 });
    }

    // Find locker and ensure it's available
    const locker = await Locker.findById(lockerId).lean();
    if (!locker) {
      console.warn("Locker not found", lockerId);
      return NextResponse.json({ success: false, message: "Locker not found" }, { status: 200 });
    }

    if (locker.status !== 'available') {
      console.warn("Locker not available", lockerId, "status=", locker.status);
      return NextResponse.json({ success: false, message: "Locker not available" }, { status: 200 });
    }

    // Create booking
    const newBooking = await Booking.create({
      userId,
      lockerId,
      status: 'active',
      paymentStatus: 'pending',
      cost: 0
    });

    // Update locker: mark as booked and reference booking
    await Locker.findByIdAndUpdate(lockerId, {
      status: 'booked',
      currentBookingId: newBooking._id,
    });

    console.log("Booking created", newBooking._id);

    return NextResponse.json({ success: true, data: { bookingId: newBooking._id } }, { status: 200 });
  } catch (err) {
    console.error("Error in register locker API:", err);
    return NextResponse.json({ success: false, message: "Server error", error: err.message }, { status: 500 });
  } finally {
    console.log("=== Register Locker API END ===");
  }
}
