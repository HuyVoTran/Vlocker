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

    // 1. Tìm tất cả booking của user (trừ completed) + populate locker
    const bookings = await Booking.find({ 
      userId,
      status: { $ne: 'completed' } // Exclude completed bookings
    })
      .populate({ path: "lockerId", model: Locker })
      .lean();

    if (!bookings) {
      return NextResponse.json(
        { success: true, data: [] },
        { status: 200 }
      );
    }

    // 2. Fix bookings that are paid but missing pickupExpiryTime
    // (for bookings created before pickupExpiryTime was added)
    const now = new Date();
    const bookingsToFix = bookings.filter(b => 
      b.status === 'stored' && 
      b.paymentStatus === 'paid' && 
      b.endTime && 
      !b.pickupExpiryTime
    );

    // Set pickupExpiryTime for bookings that are missing it
    for (const bookingToFix of bookingsToFix) {
      const endTime = new Date(bookingToFix.endTime);
      const timeSincePayment = now.getTime() - endTime.getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      
      // If payment was more than 30 minutes ago, auto-complete the booking
      if (timeSincePayment > thirtyMinutes) {
        await Booking.findByIdAndUpdate(bookingToFix._id, {
          status: 'completed',
          pickupExpiryTime: new Date(endTime.getTime() + thirtyMinutes) // Set for record keeping
        });
        
        // Make locker available again
        await Locker.findByIdAndUpdate(bookingToFix.lockerId, {
          status: 'available',
          isLocked: true,
          currentBookingId: null,
        });
        
        console.log(`Auto-completed expired booking ${bookingToFix._id} (paid ${Math.round(timeSincePayment / 60000)} minutes ago)`);
      } else {
        // If payment was recent, set pickupExpiryTime = endTime + 30 minutes
        const calculatedExpiry = new Date(endTime.getTime() + thirtyMinutes);
        
        await Booking.findByIdAndUpdate(bookingToFix._id, {
          pickupExpiryTime: calculatedExpiry
        });
        
        // Update the booking object in memory for response
        bookingToFix.pickupExpiryTime = calculatedExpiry;
        
        console.log(`Fixed booking ${bookingToFix._id} - set pickupExpiryTime to:`, calculatedExpiry);
      }
    }

    // 3. Fetch bookings again after fixes to get updated data
    const updatedBookings = await Booking.find({ 
      userId,
      status: { $ne: 'completed' }
    })
      .populate({ path: "lockerId", model: Locker })
      .lean();

    // 4. Auto-complete expired bookings (paid but past pickup expiry time)
    const expiredBookings = updatedBookings.filter(b => {
      if (b.status !== 'stored' || b.paymentStatus !== 'paid') return false;
      if (!b.pickupExpiryTime) return false;
      return new Date(b.pickupExpiryTime) < now;
    });

    // Update expired bookings to completed
    for (const expired of expiredBookings) {
      await Booking.findByIdAndUpdate(expired._id, {
        status: 'completed'
      });
      
      // Make locker available again
      await Locker.findByIdAndUpdate(expired.lockerId, {
        status: 'available',
        isLocked: true,
        currentBookingId: null,
      });
    }

    // 5. Filter out expired and completed bookings from response
    const activeBookings = updatedBookings.filter(b => {
      if (b.status === 'completed') return false;
      if (b.status === 'stored' && b.paymentStatus === 'paid' && b.pickupExpiryTime) {
        return new Date(b.pickupExpiryTime) >= now;
      }
      return true;
    });

    // 4. Format dữ liệu cho FE
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
      
      // Debug log for bookings with paid status
      if (b.paymentStatus === 'paid') {
        console.log(`Booking ${b._id} - pickupExpiryTime:`, b.pickupExpiryTime);
      }
      
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
