import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  // Kiểm tra các biến môi trường cần thiết
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Lỗi: Thiếu biến môi trường EMAIL_USER hoặc EMAIL_PASS.");
    return NextResponse.json(
      { message: "Lỗi cấu hình máy chủ: Không thể xác thực dịch vụ email." },
      { status: 500 }
    );
  }
  if (!process.env.NEXT_PUBLIC_URL) {
    console.error("Lỗi: Thiếu biến môi trường NEXT_PUBLIC_URL.");
    return NextResponse.json(
      { message: "Lỗi cấu hình máy chủ: Không tìm thấy URL của ứng dụng." },
      { status: 500 }
    );
  }

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
    // ⚠ Phải dùng cùng 1 kiểu hash với API /auth/reset-password
    // Ở route reset-password đang dùng crypto.createHash("sha256")
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

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
      subject: "Yêu cầu đặt lại mật khẩu VLocker",
      html: `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
        <tr>
          <td align="center" style="padding: 40px 16px;">
            
            <!-- CONTAINER GIỮA (tạo khoảng trống trái phải) -->
            <table width="600" cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif; color:#050505;">
              <tr>
                <td>
                  <img src="vlocker.vercel.app/Logo.png" alt="Vlocker" width="70" />
                  <hr style="border:none; border-top:1px solid #dadde1; margin-bottom:24px;" />

                  <h2 style="font-size:22px; font-weight:700; margin-bottom:20px;">
                    Thêm một bước nữa để đổi mật khẩu của bạn
                  </h2>

                  <p>Xin chào <strong>${user.name}</strong>,</p>

                  <p>
                    Chúng tôi đã nhận được yêu cầu đổi mật khẩu cho tài khoản của bạn.
                    Nhấn vào nút bên dưới để tiếp tục:
                  </p>

                  <!-- BUTTON (CENTERED) -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                    <tr>
                      <td align="center">
                        <a
                          href="${resetLink}"
                          style="
                            display:inline-block;
                            padding:12px 20px;
                            background-color:#1877f2;
                            color:#ffffff;
                            text-decoration:none;
                            border-radius:6px;
                            font-weight:600;
                            font-size:14px;
                          "
                        >
                          Đặt lại mật khẩu
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="font-size:14px;">
                    Hoặc mở liên kết sau:
                  </p>

                  <p style="font-size:14px; word-break:break-all;">
                    <a href="${resetLink}" style="color:#1877f2;">
                      ${resetLink}
                    </a>
                  </p>

                  <p style="font-size:13px; color:#65676b; margin-top:16px; font-style:italic; text-align:center;">
                    Liên kết này sẽ hết hạn sau <strong>15 phút</strong>.
                    Không chia sẻ mã này với bất kỳ ai.
                  </p>

                  <br />

                  <p style="font-size:14px;">
                    <strong>Bạn không yêu cầu đổi mật khẩu?</strong><br />
                    Nếu có người yêu cầu liên kết này
                    Đừng chia sẻ liên kết này với bất kỳ ai, kể cả những người tự nhận là
                    nhân viên <strong>VLocker</strong>.
                    Họ có thể đang cố gắng truy cập trái phép vào tài khoản của bạn.
                  </p>

                  <p style="font-size:14px; margin-top:16px;">
                    <strong>Bạn không gửi yêu cầu?</strong><br />
                    Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.
                  </p>

                  <p style="font-size:14px; color:black; margin-top:24px;">
                    Trân trọng,<br />
                    Đội ngũ bảo mật VLocker
                  </p>

                  <hr style="border:none; border-top:1px solid #dadde1; margin:24px 0;" />

                  <p style="font-size:12px; color:#8a8d91; margin:0; text-align:center;">
                    <img src="vlocker.vercel.app/Logo.png" alt="Vlocker" width="70" /><br />
                    © 2024 VLocker - Bảo vệ dữ liệu của bạn là ưu tiên hàng đầu của chúng tôi.<br />
                    Thư này gửi đến ${normalizedEmail}.<br />
                    Email này được gửi tự động. Vui lòng không trả lời.
                  </p>

                </td>
              </tr>
            </table>
            <!-- END CONTAINER -->

          </td>
        </tr>
      </table>
      `
    });

    return NextResponse.json(
      { message: "Đã gửi email khôi phục mật khẩu!" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password error:", error);

    // Cung cấp thông báo lỗi chi tiết hơn trong môi trường development
    if (process.env.NODE_ENV === 'development') {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { message: `Lỗi máy chủ khi gửi email: ${errorMessage}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Lỗi máy chủ. Không thể gửi email." },
      { status: 500 }
    );
  }
}
