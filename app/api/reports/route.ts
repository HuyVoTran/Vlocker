import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
// authOptions được định nghĩa trong file route của NextAuth
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; 
// Hàm tiện ích để kết nối DB được định nghĩa trong /lib/mongodb
import { connectDB } from '@/lib/mongodb'; 
// Giả sử bạn có model Mongoose cho Report và User
import Report from '@/models/Report'; 
import User from '@/models/User'; 
import Locker from '@/models/Locker';

/**
 * GET /api/reports
 * Lấy danh sách báo cáo dựa trên vai trò của người dùng.
 * - Manager: Lấy tất cả báo cáo.
 * - Resident: Chỉ lấy các báo cáo của chính họ.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { role, id: userId } = session.user;
    let reports;

    if (role === 'manager') {
      // Manager thấy tất cả báo cáo, populate thông tin người gửi
      reports = await Report.find({})
        .populate({
          path: 'userId',
          model: User,
          select: 'name email', // Chỉ lấy tên và email
        })
        .populate({
          path: 'lockerId',
          model: Locker,
          select: 'lockerId building block',
        })
        .sort({ createdAt: -1 });
    } else {
      // Resident chỉ thấy báo cáo của mình
      reports = await Report.find({ userId })
        .populate({
          path: 'lockerId',
          model: Locker,
          select: 'lockerId building block',
        }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/reports
 * Tạo một báo cáo mới (chỉ dành cho resident).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { title, description, category, priority, lockerId } = body;

    if (!title || !description || !category || !priority) {
      return NextResponse.json({ success: false, message: 'Thiếu các trường bắt buộc' }, { status: 400 });
    }

    const newReport = new Report({
      // reportId sẽ được tự động tạo bởi Mongoose pre-save hook
      title,
      description,
      category,
      priority, // Độ ưu tiên giờ do người dùng thiết lập
      lockerId: lockerId || null, // Gắn ID của tủ vào báo cáo nếu có
      userId: session.user.id,
      status: 'pending',
    });

    await newReport.save();

    // Sau khi lưu, tìm lại báo cáo để populate thông tin người dùng.
    // Điều này đảm bảo dữ liệu trả về cho client có cùng cấu trúc với dữ liệu từ API GET,
    // tránh lỗi ở giao diện khi cập nhật danh sách báo cáo.
    const populatedReport = await Report.findById(newReport._id).populate({
      path: 'userId',
      model: User,
      select: 'name email',
    }).populate({
      path: 'lockerId',
      model: Locker,
      select: 'lockerId building block',
    });

    // Trả về báo cáo mới để client có thể cập nhật UI ngay lập tức
    return NextResponse.json({ success: true, data: populatedReport }, { status: 201 });

  } catch (error) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/reports
 * Cập nhật trạng thái của một báo cáo (chỉ dành cho manager).
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'manager') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    // Client gửi lên `_id` của document, nhưng đặt tên key là `reportId`.
    const { reportId: _id, status } = body; 

    if (!_id || !status) {
      return NextResponse.json({ success: false, message: 'Thiếu ID báo cáo hoặc status' }, { status: 400 });
    }

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Trạng thái không hợp lệ' }, { status: 400 });
    }

    // Sử dụng findByIdAndUpdate để tìm bằng _id.
    // Client đang gửi `_id` của report trong trường `reportId` của body.
    const updatedReport = await Report.findByIdAndUpdate(_id, { status }, { new: true })
      .populate({
        path: 'userId',
        model: User,
        select: 'name email',
      })
      .populate({
        path: 'lockerId',
        model: Locker,
        select: 'lockerId building block',
      });

    if (!updatedReport) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy báo cáo' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedReport });
  } catch (error) {
    console.error('PATCH /api/reports error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}