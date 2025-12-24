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

    // --- VALIDATION START ---
    if (!name || !email || !password || !building || !block || !floor || !unit) {
      return NextResponse.json(
        { message: "Vui lòng điền đầy đủ các trường thông tin bắt buộc." },
        { status: 400 }
      );
    }

    // Validate name: allow Vietnamese characters, spaces. Disallow numbers and special characters.
    const nameRegex = /^[a-zA-Zàáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ\s]+$/;
    if (!nameRegex.test(name)) {
      return NextResponse.json(
        { message: "Tên không hợp lệ. Tên chỉ được chứa ký tự chữ và khoảng trắng." },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8 || password.length > 30) {
      return NextResponse.json(
        { message: "Mật khẩu phải có từ 8 đến 30 ký tự." },
        { status: 400 }
      );
    }
    // --- VALIDATION END ---

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
      isProfileComplete: true, // Profile hoàn chỉnh khi đăng ký qua form
    });

    return NextResponse.json({ message: "Đăng ký thành công!" }, { status: 201 });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);    
    if (error.name === 'ValidationError') {
        let errors = {};
        Object.keys(error.errors).forEach((key) => {
            errors[key] = error.errors[key].message;
        });
        return NextResponse.json({ message: "Dữ liệu không hợp lệ", errors }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi đăng ký." },
      { status: 500 }
    );
  }
}