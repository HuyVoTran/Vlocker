import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { bookingId, paymentMethod } = body || {}; // paymentMethod: 'momo' | 'vnpay' | 'virtual'

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Missing bookingId" },
        { status: 400 }
      );
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Only allow payment if status is 'stored' and paymentStatus is 'pending'
    if (booking.status !== 'stored' || booking.paymentStatus !== 'pending') {
      return NextResponse.json(
        { success: false, message: "Booking is not ready for payment" },
        { status: 400 }
      );
    }

    // For now, we'll do virtual payment (simulate payment)
    // In production, integrate with MoMo/VNPay APIs here
    if (paymentMethod === 'virtual' || !paymentMethod) {
      // Calculate final cost from startTime to now (5,000 VNĐ per day)
      const startTime = booking.startTime || new Date();
      const endTime = new Date();
      const daysDiff = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
      const finalCost = Math.max(1, daysDiff) * 5000; // At least 1 day, 5,000 VNĐ per day
      
      // Virtual payment - mark as paid and set final cost
      booking.paymentStatus = 'paid';
      booking.endTime = endTime; // Set endTime when payment is completed
      booking.cost = finalCost; // Set final cost
      
      // Set pickup expiry time: 30 minutes from now
      const pickupExpiryTime = new Date(endTime.getTime() + 30 * 60 * 1000); // 30 minutes
      booking.pickupExpiryTime = pickupExpiryTime;
      
      await booking.save();
      
      console.log("Payment completed - pickupExpiryTime set:", pickupExpiryTime);
      console.log("Booking after save:", {
        _id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        pickupExpiryTime: booking.pickupExpiryTime
      });

      return NextResponse.json(
        { 
          success: true, 
          message: "Payment completed successfully", 
          data: { 
            booking: {
              _id: booking._id,
              status: booking.status,
              paymentStatus: booking.paymentStatus,
              pickupExpiryTime: booking.pickupExpiryTime,
              cost: booking.cost,
              endTime: booking.endTime
            }
          } 
        },
        { status: 200 }
      );
    }

    // TODO: Integrate with MoMo/VNPay APIs
    // For now, return error for real payment methods
    return NextResponse.json(
      { success: false, message: "Payment method not implemented yet" },
      { status: 501 }
    );
  } catch (err) {
    console.error("Error processing payment:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}

