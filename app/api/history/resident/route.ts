import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Locker from "@/models/Locker";
import User from "@/models/User";

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
      .populate<{ lockerId: typeof Locker }>("lockerId")
      .populate<{ userId: typeof User }>("userId")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: bookings,
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


