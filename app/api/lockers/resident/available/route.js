import { NextResponse } from "next/server";
import Locker from "@/models/Locker";
import { connectDB } from "@/lib/mongodb";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const building = searchParams.get("building");
    const block = searchParams.get("block");

    if (!building || !block) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin tòa nhà hoặc block." },
        { status: 400 }
      );
    }

    // Lấy các tủ có trạng thái 'available' và chưa được ai đặt (currentBookingId is null)
    const lockers = await Locker.find({
      status: "available",
      currentBookingId: null, // Quan trọng: Chỉ lấy tủ thực sự trống
      building,
      block,
    })
      .select("_id lockerId building block status floor size price")
      .lean();

    return NextResponse.json({
      success: true,
      count: lockers.length,
      data: lockers || [],
    });
  } catch (err) {
    console.error("Lỗi khi tải danh sách tủ trống:", err);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ.", error: err.message },
      { status: 500 }
    );
  }
}
