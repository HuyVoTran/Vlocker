import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

// Define a more specific type for the booking object after `lean()` and `populate()`
// This helps avoid using `any`.
interface PopulatedLocker {
  price?: string | number;
}

interface PopulatedBooking {
  status?: string;
  paymentStatus?: string;
  startTime?: string | Date;
  lockerId?: PopulatedLocker;
  cost?: number;
  // Allow other properties since lean() returns a plain object
  [key: string]: unknown;
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "Thiếu userId." },
        { status: 400 }
      );
    }

    const bookings = await Booking.find({ userId })
      .sort({ startTime: -1 })
      .populate("lockerId")
      .populate("userId")
      .lean<PopulatedBooking[]>();

    const now = new Date();
    const calculatedBookings = bookings.map((booking) => {
      // Tính toán lại chi phí cho các booking đang ở trạng thái 'stored' và 'pending'
      if (booking.status === 'stored' && booking.paymentStatus === 'pending' && booking.startTime) {
        const dailyRate = Number(booking.lockerId?.price) || 10000; // Lấy giá từ tủ, mặc định 10000
        const startTime = new Date(booking.startTime);
        const timeDiff = now.getTime() - startTime.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        const calculatedCost = Math.max(1, daysDiff) * dailyRate;

        return { ...booking, cost: calculatedCost };
      }
      return booking;
    });

    return NextResponse.json(
      {
        success: true,
        data: calculatedBookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resident history error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tải lịch sử." },
      { status: 500 }
    );
  }
}
