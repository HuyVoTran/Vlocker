import { NextResponse } from "next/server";
import Locker from "@/models/Locker";

export async function GET(req) {
  try {
    // Giả sử bạn pass userId trong query hoặc từ token
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const lockers = await Locker.find({
      currentBookingId: userId, // Nếu bạn link booking khác thì chỉnh lại
    }).lean();

    return NextResponse.json({ success: true, data: lockers });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
