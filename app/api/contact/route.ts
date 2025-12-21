import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    // Kiểm tra các trường bắt buộc
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, message: 'Vui lòng điền đầy đủ thông tin.' }, { status: 400 });
    }

    // Cấu hình transporter để gửi email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Cấu hình nội dung email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'noreply.vlocker@gmail.com',
      subject: `[VLocker Contact Form] ${subject}`,
      html: `
        <h3>Thông tin liên hệ:</h3>
        <ul>
          <li>Họ và tên: ${name}</li>
          <li>Email: ${email}</li>
          <li>Số điện thoại: ${phone}</li>
        </ul>
        <h3>Nội dung tin nhắn:</h3>
        <p>${message}</p>
      `,
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Gửi tin nhắn thành công!' }, { status: 200 });

  } catch (error) {
    console.error('Lỗi gửi email:', error);
    return NextResponse.json({ success: false, message: 'Đã xảy ra lỗi khi gửi tin nhắn.' }, { status: 500 });
  }
}

/**
 * GET /api/contact
 * Nếu bạn muốn vô hiệu hóa phương thức GET, bạn có thể trả về một lỗi 405.
 */
export async function GET() {
  return NextResponse.json({ message: 'Phương thức GET không được hỗ trợ' }, { status: 405 });
}


/*
### Cấu hình các biến môi trường (quan trọng):

Để chức năng gửi email hoạt động, bạn cần phải thiết lập các biến môi trường sau trong file .env.local:

- `EMAIL_USER`: Địa chỉ email Gmail của bạn (ví dụ: noreply.vlocker@gmail.com).
- `EMAIL_PASS`: App Password cho tài khoản Gmail của bạn.

Lưu ý quan trọng về bảo mật:

Bạn nên sử dụng Gmail App Password thay vì mật khẩu tài khoản Gmail thông thường để bảo mật.
*/


/*
Lưu ý:

Đảm bảo rằng tài khoản Gmail của bạn đã được bật quyền truy cập "Less secure app access" (tùy chọn này có thể không còn khả dụng hoặc cần xác thực 2 bước).
*/