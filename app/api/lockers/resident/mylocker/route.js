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

    // 1. Find all user bookings (excluding completed) and populate locker details
    const bookings = await Booking.find({ 
      userId,
      status: { $ne: 'completed' } // Exclude completed bookings
    })
      .populate({ path: "lockerId", model: Locker })
      .lean();
    
    if (!bookings || bookings.length === 0) {
      return NextResponse.json(
        { success: true, data: [] },
        { status: 200 }
      );
    }

    const now = new Date();
    const dbUpdatePromises = [];
    const completedBookingIds = new Set();

    // 2. Iterate through bookings to fix old data and handle expirations
    for (const booking of bookings) {
      // Case A: Fix bookings created before pickupExpiryTime was added
      if (booking.status === 'stored' && booking.paymentStatus === 'paid' && booking.endTime && !booking.pickupExpiryTime) {
        const endTime = new Date(booking.endTime);
        const thirtyMinutes = 30 * 60 * 1000;
        const timeSincePayment = now.getTime() - endTime.getTime();

        if (timeSincePayment > thirtyMinutes) {
          // Auto-complete if payment was > 30 mins ago
          completedBookingIds.add(booking._id.toString());
          dbUpdatePromises.push(
            Booking.findByIdAndUpdate(booking._id, {
              status: 'completed',
              pickupExpiryTime: new Date(endTime.getTime() + thirtyMinutes)
            }),
            Locker.findByIdAndUpdate(booking.lockerId._id, {
              status: 'available',
              isLocked: true,
              currentBookingId: null,
            })
          );
        } else {
          // Set pickupExpiryTime if payment was recent
          const calculatedExpiry = new Date(endTime.getTime() + thirtyMinutes);
          booking.pickupExpiryTime = calculatedExpiry; // Update in-memory object for response
          dbUpdatePromises.push(
            Booking.findByIdAndUpdate(booking._id, { pickupExpiryTime: calculatedExpiry })
          );
        }
      } 
      // Case B: Auto-complete bookings past their pickup expiry time
      else if (booking.status === 'stored' && booking.paymentStatus === 'paid' && booking.pickupExpiryTime && new Date(booking.pickupExpiryTime) < now) {
        completedBookingIds.add(booking._id.toString());
        dbUpdatePromises.push(
          Booking.findByIdAndUpdate(booking._id, { status: 'completed' }),
          Locker.findByIdAndUpdate(booking.lockerId._id, {
            status: 'available',
            isLocked: true,
            currentBookingId: null,
          })
        );
      }
    }

    // 3. Execute all database updates in parallel
    if (dbUpdatePromises.length > 0) {
      await Promise.all(dbUpdatePromises);
    }

    // 4. Filter out completed bookings from the in-memory list
    const activeBookings = bookings.filter(b => !completedBookingIds.has(b._id.toString()));

    // 5. Format data for the frontend
    const formatted = activeBookings.map((b) => {
      const bookingData = {
        _id: b._id,
        status: b.status,
        cost: b.cost || 0,
        paymentStatus: b.paymentStatus,
        startTime: b.startTime,
        endTime: b.endTime,
        pickupExpiryTime: b.pickupExpiryTime || null,
      };
      
      return {
        locker: b.lockerId || {},
        booking: bookingData,
      };
    });

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
