import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Locker from "@/models/Locker";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { broadcastLockerEvent } from "@/lib/lockerEvents";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { bookingId } = body || {};

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Missing bookingId" },
        { status: 400 }
      );
    }

    // Find booking and ensure it belongs to the current user
    const booking = await Booking.findOne({ _id: bookingId, userId: session.user.id });
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found or you don't have permission to access it" },
        { status: 404 }
      );
    }

    // Only allow opening if status is 'active' (can open/close freely)
    // Or if status is 'stored' and payment is 'paid' (can open after payment, within 30 minutes)
    if (booking.status === 'active') {
      // Can open freely
      await Locker.findByIdAndUpdate(booking.lockerId, {
        isLocked: false,
      });
    } else if (booking.status === 'stored' && booking.paymentStatus === 'paid') {
      // Check if pickup time has expired (30 minutes after payment)
      const now = new Date();
      if (booking.pickupExpiryTime && now > booking.pickupExpiryTime) {
        // Time expired - auto complete and lock
        booking.status = 'completed';
        await booking.save();
        
        await Locker.findByIdAndUpdate(booking.lockerId, {
          isLocked: true,
          currentBookingId: null,
        });

        broadcastLockerEvent({
          action: "auto-complete",
          lockerId: booking.lockerId?.toString(),
          bookingId: booking._id?.toString(),
        });
        
        return NextResponse.json(
          { success: false, message: "Thời gian lấy đồ đã hết hạn (30 phút). Tủ đã được khóa và hoàn tất." },
          { status: 400 }
        );
      }
      
      // Can open within 30 minutes after payment
      await Locker.findByIdAndUpdate(booking.lockerId, {
        isLocked: false,
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Cannot open locker. Please complete payment first." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Locker opened successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error opening locker:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
