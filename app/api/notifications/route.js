import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/* =================================================================
   GET /api/notifications
   Mục đích: Lấy danh sách thông báo.
   - Manager: Lấy tất cả thông báo và danh sách cư dân.
   - Resident: Chỉ lấy thông báo của chính mình.
================================================================= */
export async function GET() {
  try {
    await connectDB();

    // Lấy thông tin phiên làm việc từ server để đảm bảo an toàn
    const session = await getServerSession(authOptions);

    // Nếu không có session hoặc user, từ chối truy cập
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Không có quyền truy cập" },
        { status: 401 }
      );
    }

    const { id, role } = session.user;
    let query = {};
    let residents = [];

    // Phân quyền: Manager có thể xem tất cả, Resident chỉ xem của mình
    if (role === "manager") {
      // Lấy danh sách cư dân để manager có thể chọn người nhận khi gửi thông báo
      residents = await User.find({ role: "resident" })
        .select("name email _id")
        .lean();
    } else {
      query = { recipientId: id };
    }

    // Truy vấn cơ sở dữ liệu để lấy thông báo
    let notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .lean();

    if (role === 'manager') {
        // Đối với manager, tất cả thông báo được xem như đã đọc để không hiển thị
        // số lượng trên icon chuông. Trạng thái đọc/chưa đọc là của người nhận.
        // Thao tác này chỉ thay đổi dữ liệu trả về, không ảnh hưởng đến database.
        notifications = notifications.map(n => ({ ...n, read: true }));
    }

    return NextResponse.json({
      success: true,
      data: { notifications, residents },
    });
  } catch (err) {
    console.error("Lỗi nghiêm trọng tại GET /api/notifications:", err.message, err.stack);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ", error: err.message },
      { status: 500 }
    );
  }
}

/* =================================================================
   POST /api/notifications
   Mục đích: Cho phép Manager gửi thông báo đến nhiều cư dân.
================================================================= */
export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "manager") {
      console.log("❌ Forbidden");
      return NextResponse.json(
        { success: false, message: "Không có quyền thực hiện hành động này" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, message, recipientIds } = body;

    if (!title || !message || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Vui lòng cung cấp đầy đủ thông tin" },
        { status: 400 }
      );
    }

    const notificationsToCreate = recipientIds.map((id) => ({
      recipientId: id,
      type: "admin_message",
      title,
      message,
    }));

    await Notification.insertMany(notificationsToCreate);

    return NextResponse.json({
      success: true,
      message: "Gửi thông báo thành công",
    });
  } catch (err) {
    console.error("Lỗi nghiêm trọng tại POST /api/notifications:", err.message, err.stack);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ", error: err.message },
      { status: 500 }
    );
  }
}

/* =================================================================
   PATCH /api/notifications
   Mục đích: Đánh dấu một hoặc nhiều thông báo là đã đọc.
================================================================= */
export async function PATCH(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Không có quyền truy cập" },
        { status: 401 }
      );
    }

    const { notificationIds, read } = await req.json();

    if (!Array.isArray(notificationIds) || notificationIds.length === 0 || typeof read !== 'boolean') {
      return NextResponse.json(
        { success: false, message: "Cần có ID thông báo và trạng thái 'read'." },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái `read` của các thông báo được chỉ định
    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipientId: session.user.id,
      },
      { $set: { read: read } }
    );

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật trạng thái thông báo.",
    });
  } catch (err) {
    console.error("Lỗi nghiêm trọng tại PATCH /api/notifications:", err.message, err.stack);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ", error: err.message },
      { status: 500 }
    );
  }
}

/* =================================================================
   DELETE /api/notifications
   Mục đích: Xóa một hoặc nhiều thông báo.
================================================================= */
export async function DELETE(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Không có quyền truy cập" },
        { status: 401 }
      );
    }

    const { notificationIds } = await req.json();

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ success: false, message: "Cần có ID của thông báo để xóa" }, { status: 400 });
    }

    const { id, role } = session.user;

    // Phân quyền xóa:
    // - Manager có thể "unsend" (xóa) bất kỳ thông báo nào.
    // - Resident chỉ có thể xóa thông báo ở phía họ.
    const query = {
      _id: { $in: notificationIds },
    };

    if (role === 'resident') {
      // Resident chỉ có thể xóa thông báo của chính mình.
      query.recipientId = id;
    } else if (role !== 'manager') {
      // Chặn các vai trò không xác định khác thực hiện hành động này.
      return NextResponse.json({ success: false, message: "Vai trò không hợp lệ." }, { status: 403 });
    }
    // Nếu là manager, không cần thêm điều kiện `recipientId`, cho phép xóa bất kỳ thông báo nào (unsend).

    const result = await Notification.deleteMany(query);

    const message = role === 'manager' ? "Đã thu hồi thông báo thành công." : "Đã xóa thông báo thành công.";
    return NextResponse.json({ success: true, message, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Lỗi nghiêm trọng tại DELETE /api/notifications:", err.message, err.stack);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
