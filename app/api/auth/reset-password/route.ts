// app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await connectDB();

    let token: string | undefined;
    let newPassword: string | undefined;

    // Cố gắng parse body JSON
    try {
      const body = await req.json();
      token = body?.token;
      newPassword = body?.newPassword;
    } catch (err) {
      console.error("Lỗi parse JSON:", err);
      return NextResponse.json(
        { message: "Body request phải là JSON" },
        { status: 400 }
      );
    }

    // Nếu token hoặc mật khẩu mới chưa có
    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Thiếu token hoặc mật khẩu mới." },
        { status: 400 }
      );
    }

    // Kiểm tra độ dài mật khẩu
    if (newPassword.length < 8 || newPassword.length > 30) {
      return NextResponse.json(
        { message: "Mật khẩu mới phải có từ 8 đến 30 ký tự." },
        { status: 400 }
      );
    }

    // Hash token giống lúc lưu vào DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Tìm user có token hợp lệ và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token không hợp lệ hoặc đã hết hạn." },
        { status: 400 }
      );
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu và xóa token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Đặt lại mật khẩu thành công!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra." },
      { status: 500 }
    );
  }
}
