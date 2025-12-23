import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

type Period = "all" | "month" | "quarter" | "year";

// Define a more specific type for the booking object after `lean()` and `populate()`
// This helps avoid using `any`.
interface PopulatedBooking {
  status?: string;
  paymentStatus?: string;
  startTime?: string | Date;
  cost?: number;
  // Allow other properties since lean() returns a plain object
  [key: string]: unknown;
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const period = (searchParams.get("period") as Period) || "all";
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");
    const quarterParam = searchParams.get("quarter");

    const now = new Date();
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (period === "year") {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
    } else if (period === "month") {
      const month = monthParam ? parseInt(monthParam, 10) - 1 : now.getMonth();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 1);
    } else if (period === "quarter") {
      const q = quarterParam ? parseInt(quarterParam, 10) : 1;
      const startMonth = (q - 1) * 3;
      startDate = new Date(year, startMonth, 1);
      endDate = new Date(year, startMonth + 3, 1);
    }

    const query: {
      startTime?: {
        $gte: Date;
        $lt: Date;
      };
    } = {};
    if (startDate && endDate) {
      query.startTime = { $gte: startDate, $lt: endDate };
    }

    const bookings = await Booking.find(query)
      .sort({ startTime: -1 })
      .populate("lockerId")
      .populate("userId")
      .lean<PopulatedBooking[]>();

    const calculatedBookings = bookings.map((booking) => {
      // Tính toán lại chi phí cho các booking đang ở trạng thái 'stored' và 'pending'
      if (booking.status === 'stored' && booking.paymentStatus === 'pending' && booking.startTime) {
        const startTime = new Date(booking.startTime);
        const timeDiff = now.getTime() - startTime.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        const calculatedCost = Math.max(1, daysDiff) * 5000; // 5,000 VNĐ mỗi ngày

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
    console.error("Manager history error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tải lịch sử." },
      { status: 500 }
    );
  }
}
