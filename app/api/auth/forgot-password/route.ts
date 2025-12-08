import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    await connectDB();
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Tìm user theo email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { message: "Email không tồn tại trong hệ thống." },
        { status: 404 }
      );
    }

    // 2. Tạo token reset
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 3. Hash token để lưu vào DB
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // 4. Lưu token & thời gian hết hạn (15 phút)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; 
    await user.save();

    // 5. Tạo link gửi mail
    const resetLink = `${process.env.NEXT_PUBLIC_URL}/auth/reset-password?token=${resetToken}`;

    // 6. Cấu hình transporter gửi email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    // 7. Gửi Email
    await transporter.sendMail({
      from: `"VLocker Support" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Đặt lại mật khẩu VLocker",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Khôi phục mật khẩu</h2>
          <p>Xin chào <strong>${user.name}</strong>,</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào nút bên dưới để tiếp tục:</p>

          <a 
            href="${resetLink}"
            style="
              display: inline-block;
              padding: 12px 20px;
              margin: 20px 0;
              background-color: #0070f3;
              color: #fff;
              text-decoration: none;
              border-radius: 6px;
            "
          >Đặt lại mật khẩu</a>

          <p>Hoặc mở liên kết sau:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>

          <p><i>Liên kết này sẽ hết hạn sau 15 phút.</i></p>

          <p>Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.</p>

          <br />
          <p>Trân trọng,<br/>VLocker Team</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Đã gửi email khôi phục mật khẩu!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Lỗi máy chủ. Không thể gửi email." },
      { status: 500 }
    );
  }
}
