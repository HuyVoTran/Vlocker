// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { message: "Vui lòng nhập email." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Email không tồn tại trong hệ thống." },
        { status: 404 }
      );
    }

    // Tạo token reset
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Mã hóa token trước khi lưu
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Lưu token + thời gian hết hạn (10 phút)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Link reset gửi qua email
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`;

    // TODO: Gửi email (tùy bạn cấu hình)
    console.log("Reset password link:", resetLink);

    return NextResponse.json(
      { message: "Đã gửi hướng dẫn đặt lại mật khẩu qua email!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra." },
      { status: 500 }
    );
  }
}
