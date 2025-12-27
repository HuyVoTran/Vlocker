import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Locker from "@/models/Locker";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ success: false, message: "Missing bookingId" }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }
    
    if (booking.status === 'completed' || booking.status === 'cancelled') {
        return NextResponse.json({ success: false, message: `Booking is already ${booking.status}` }, { status: 400 });
    }

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled', endTime: new Date() },
      { new: true }
    );

    // Free up the locker
    await Locker.findByIdAndUpdate(booking.lockerId, {
      currentBookingId: null,
      isLocked: true,
    });

    return NextResponse.json({ success: true, message: "Booking cancelled successfully", data: updatedBooking });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    return NextResponse.json({ success: false, message: "Server error", error: err.message }, { status: 500 });
  }
}
