import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Không được phép." }, { status: 401 });
  }

  try {
    const { building, block, floor, unit } = await req.json();

    if (!building || !block || !floor || !unit) {
      return NextResponse.json(
        { message: "Vui lòng cung cấp đầy đủ thông tin địa chỉ." },
        { status: 400 }
      );
    }

    await connectDB();

    // Tùy chọn: Kiểm tra xem địa chỉ đã có ai đăng ký chưa
    const existingAddress = await User.findOne({ building, block, floor, unit });
    if (existingAddress) {
        return NextResponse.json(
            { message: "Địa chỉ căn hộ này đã được đăng ký." },
            { status: 409 }
        );
    }

    await User.findByIdAndUpdate(session.user.id, {
      building,
      block,
      floor,
      unit,
      isProfileComplete: true, // Đánh dấu hồ sơ đã hoàn tất
    });

    return NextResponse.json(
      { message: "Cập nhật thông tin thành công!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lỗi cập nhật profile:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi cập nhật thông tin." },
      { status: 500 }
    );
  }
}