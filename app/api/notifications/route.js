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

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Không có quyền truy cập" },
        { status: 401 }
      );
    }
 
    const { id, role } = session.user;
    let query = {};
    let residents = [];
    let notifications = [];
 
    if (role === "manager") {
      // Manager lấy danh sách thư đã gửi (mailsend) và các thông báo hệ thống (notice)
      // Đồng thời lấy danh sách cư dân để phục vụ cho việc gửi thông báo mới
      query = {
        $or: [
          { type: "mailsend", senderId: id },
          { type: "notice" } // Manager cũng có thể xem các thông báo hệ thống
        ]
      };
      residents = await User.find({ role: "resident" })
        .select("name email _id")
        .lean();
    } else if (role === "resident") {
      // Resident lấy các thư nhận được (mailreceive) và thông báo hệ thống (notice) cho chính họ
      query = { recipientId: id };
    } else {
        return NextResponse.json({ success: false, message: "Vai trò không hợp lệ." }, { status: 403 });
    }
 
    notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .lean();
 
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

    // 1. Tạo một thông báo gốc (parent) cho manager
    const parentNotification = new Notification({
      senderId: session.user.id,
      type: 'mailsend', // Thư gửi đi từ manager
      title,
      message,
      read: true, // Thư gửi đi mặc định là đã đọc đối với manager
    });
    await parentNotification.save();

    // 2. Tạo các thông báo con (child) cho từng người nhận
    const childNotifications = recipientIds.map((id) => ({
      parentId: parentNotification._id,
      recipientId: id,
      type: 'mailreceive', // Thư nhận được bởi resident
      title,
      message,
      // `read` sẽ là false theo mặc định của schema
    }));

    await Notification.insertMany(childNotifications);

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
    let result;

    if (role === 'resident') {
      // Resident chỉ xóa thông báo của chính mình (mailreceive, notice)
      const query = {
        _id: { $in: notificationIds },
        recipientId: id,
      };
      result = await Notification.deleteMany(query);
      return NextResponse.json({ success: true, message: "Đã xóa thông báo thành công.", deletedCount: result.deletedCount });

    } else if (role === 'manager') {
      // Manager "thu hồi" thư đã gửi. Thao tác này sẽ xóa cả thư gốc (mailsend)
      // và tất cả các thư con (mailreceive) đã được gửi tới cư dân.
      // notificationIds ở đây là ID của các thư gốc (mailsend).
      
      // 1. Đảm bảo manager chỉ có thể xóa thư do chính mình gửi
      const parentNotifications = await Notification.find({
        _id: { $in: notificationIds },
        senderId: id,
        type: 'mailsend'
      }).select('_id').lean();

      const parentIdsToDelete = parentNotifications.map(n => n._id);

      if (parentIdsToDelete.length === 0) {
        return NextResponse.json({ success: false, message: "Không tìm thấy thông báo hoặc không có quyền thu hồi." }, { status: 404 });
      }

      // 2. Xóa tất cả các thư con (mailreceive) liên quan
      await Notification.deleteMany({ parentId: { $in: parentIdsToDelete } });

      // 3. Xóa thư gốc (mailsend)
      result = await Notification.deleteMany({ _id: { $in: parentIdsToDelete } });
      
      return NextResponse.json({ success: true, message: "Đã thu hồi thông báo thành công.", deletedCount: result.deletedCount });

    } else {
      // Chặn các vai trò không xác định khác
      return NextResponse.json({ success: false, message: "Vai trò không hợp lệ." }, { status: 403 });
    }
  } catch (err) {
    console.error("Lỗi nghiêm trọng tại DELETE /api/notifications:", err.message, err.stack);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
