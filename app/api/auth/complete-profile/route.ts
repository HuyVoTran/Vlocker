import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ isProfileComplete: false, message: "Không được phép." }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select('building block isProfileComplete');

    if (!user) {
        return NextResponse.json({ isProfileComplete: false, message: "Không tìm thấy người dùng." }, { status: 404 });
    }

    // Logic chính: Nếu người dùng đã có thông tin địa chỉ trong DB nhưng isProfileComplete là false
    if (user.building && user.block && !user.isProfileComplete) {
      // Cập nhật lại isProfileComplete trong DB
      await User.findByIdAndUpdate(session.user.id, {
        isProfileComplete: true,
      });
      
      // Trả về trạng thái đã hoàn tất để client có thể "skip" (chuyển hướng)
      return NextResponse.json({
        isProfileComplete: true,
        message: "Hồ sơ đã được tự động hoàn tất."
      }, { status: 200 });
    }

    // Nếu không, chỉ cần trả về trạng thái hiện tại
    return NextResponse.json({
      isProfileComplete: user.isProfileComplete
    }, { status: 200 });

  } catch (error) {
    console.error("Lỗi khi kiểm tra profile:", error);
    return NextResponse.json(
      { isProfileComplete: false, message: "Đã xảy ra lỗi khi kiểm tra thông tin." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Không được phép." }, { status: 401 });
    }
    const { building, block, floor, unit } = await req.json();

    if (!building || !block || !floor || !unit) {
      return NextResponse.json(
        { message: "Vui lòng cung cấp đầy đủ thông tin địa chỉ." },
        { status: 400 }
      );
    }

    await connectDB();

    // Tùy chọn: Kiểm tra xem địa chỉ đã có ai đăng ký chưa
    // Chỉ kiểm tra xem địa chỉ này đã được đăng ký bởi một người dùng KHÁC hay chưa.
    const existingAddress = await User.findOne({ building, block, floor, unit, _id: { $ne: session.user.id } });
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