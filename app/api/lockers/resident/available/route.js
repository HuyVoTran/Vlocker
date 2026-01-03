import { NextResponse } from "next/server";
import Locker from "@/models/Locker";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Lấy thông tin tòa nhà và block của người dùng từ DB thông qua session
    const user = await User.findById(session.user.id).select('building block').lean();
    if (!user || !user.building || !user.block) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy thông tin tòa nhà hoặc block của người dùng. Vui lòng cập nhật hồ sơ." },
        { status: 400 }
      );
    }

    const { building, block } = user;

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
