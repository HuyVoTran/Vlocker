import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Locker from "@/models/Locker";

export async function GET() {
  try {
    await connectDB();

    // Lấy tất cả các tủ không đang được cư dân thuê
    // Tức là những tủ có currentBookingId là null
    const lockers = await Locker.find({
      currentBookingId: null,
    }).lean();

    return NextResponse.json(
      { success: true, data: lockers },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching all available lockers for manager:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
