// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      building, 
      block, 
      floor, 
      unit 
    } = await req.json();

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Kết nối DB
    await connectDB();

    // 2. Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email này đã được sử dụng." },
        { status: 409 } // 409 Conflict là mã lỗi phù hợp hơn
      );
    }

    // 3. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Tạo User mới
    // Lưu ý: role mặc định là 'resident' theo schema
    await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      building,
      block,
      floor,
      unit,
      role: "resident", // Mặc định dân cư đăng ký
      username: normalizedEmail.split('@')[0], // Tạo username tự động từ email (tùy chọn)
    });

    return NextResponse.json({ message: "Đăng ký thành công!" }, { status: 201 });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi đăng ký." },
      { status: 500 }
    );
  }
}