import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// GET: Fetch all resident users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'manager') {
      return NextResponse.json({ success: false, message: "Không được phép." }, { status: 403 });
    }
    await connectDB();
    const users = await User.find({ role: 'resident' }).select('-password').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Lỗi khi tải danh sách người dùng:", error);
    return NextResponse.json(
      { success: false, message: "Đã xảy ra lỗi khi tải danh sách người dùng." },
      { status: 500 }
    );
  }
}

// PATCH: Update a user's address
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'manager') {
      return NextResponse.json({ success: false, message: "Không được phép." }, { status: 403 });
    }
    const { userId, building, block, floor, unit } = await req.json();

    if (!userId || !building || !block || !floor || !unit) {
      return NextResponse.json(
        { success: false, message: "Vui lòng cung cấp đầy đủ thông tin (userId, building, block, floor, unit)." },
        { status: 400 }
      );
    }

    await connectDB();

    // Optional: Check if the address is already registered by another user
    const existingAddress = await User.findOne({ building, block, floor, unit, _id: { $ne: userId } });
    if (existingAddress) {
        return NextResponse.json(
            { success: false, message: "Địa chỉ căn hộ này đã được đăng ký cho một người dùng khác." },
            { status: 409 }
        );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        building,
        block,
        floor,
        unit,
        // A user with a full address should have their profile marked as complete
        isProfileComplete: true,
      },
      { new: true } // Return the updated document
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng." }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Cập nhật địa chỉ người dùng thành công!", data: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lỗi cập nhật địa chỉ người dùng:", error);
    return NextResponse.json(
      { success: false, message: "Đã xảy ra lỗi khi cập nhật thông tin." },
      { status: 500 }
    );
  }
}