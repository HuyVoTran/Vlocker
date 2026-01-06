import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

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
    const userId = new mongoose.Types.ObjectId(id);
    let query = {};
    let residents = [];
    let notifications = [];
 
    if (role === "manager") {
      // Manager cần một pipeline phức tạp để lấy thông tin người nhận cho các thư đã gửi
      notifications = await Notification.aggregate([
        // 1. Lọc các thông báo cho manager: thư đã gửi hoặc thông báo hệ thống
        {
          $match: {
            $or: [
              { type: "mailsend", senderId: userId },
              { type: "notice" },
            ],
          },
        },
        // 2. Dùng $lookup để lấy thông tin chi tiết của người nhận từ collection 'users'
        {
          $lookup: {
            from: "users",
            localField: "recipientIds", // Trường chứa mảng ID người nhận trong Notification
            foreignField: "_id", // Trường ID trong User
            as: "recipientsInfo", // Tên của mảng mới chứa thông tin người nhận
          },
        },
        // 3. Sắp xếp theo ngày tạo mới nhất
        { $sort: { createdAt: -1 } },
      ]);
      residents = await User.find({ role: "resident" })
        .select("name email _id")
        .lean();
    } else if (role === "resident") {
      // Resident cần một pipeline để lấy thông tin người gửi
      notifications = await Notification.aggregate([
        // 1. Lọc các thông báo cho resident
        {
          $match: {
            $or: [
              { recipientId: userId }, // Thư hoặc thông báo được gửi trực tiếp
              { type: "notice", recipientId: { $exists: false } }, // Thông báo chung
            ],
          },
        },
        // 2. Dùng $lookup để lấy thông tin người gửi từ collection 'users'
        {
          $lookup: {
            from: "users",
            localField: "senderId",
            foreignField: "_id",
            as: "senderInfo",
          },
        },
        // 3. Chuyển senderInfo từ mảng thành object, giữ lại các thông báo không có người gửi
        {
          $unwind: {
            path: "$senderInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      // --- BƯỚC DEBUG ---
    } else {
      return NextResponse.json(
        { success: false, message: "Vai trò không hợp lệ." },
        { status: 403 }
      );
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

    const senderObjectId = new mongoose.Types.ObjectId(session.user.id);
    const recipientObjectIds = recipientIds.map(id => new mongoose.Types.ObjectId(id));

    // 1. Tạo một thông báo gốc (parent) cho manager
    const parentNotification = new Notification({
      senderId: senderObjectId,
      type: 'mailsend', // Thư gửi đi từ manager
      title,
      message,
      read: true, // Thư gửi đi mặc định là đã đọc đối với manager
      recipientIds: recipientObjectIds, // Lưu lại ID của những người nhận dưới dạng ObjectId
    });
    await parentNotification.save();

    // 2. Tạo các thông báo con (child) cho từng người nhận
    const childNotifications = recipientObjectIds.map((id) => ({
      parentId: parentNotification._id,
      senderId: senderObjectId, // Thêm ID người gửi vào thông báo của người nhận
      recipientId: id,
      type: 'mailreceive', // Thư nhận được bởi resident
      title,
      message,
      // `read` sẽ là false theo mặc định của schema
    }));

    await Notification.insertMany(childNotifications);

    // Lấy lại thông báo vừa tạo và populate thông tin người nhận để trả về cho client.
    // Điều này giúp client cập nhật UI ngay lập tức mà không cần gọi lại API GET.
    const newSentMail = await Notification.aggregate([
        { $match: { _id: parentNotification._id } },
        {
          $lookup: {
            from: "users",
            localField: "recipientIds",
            foreignField: "_id",
            as: "recipientsInfo", // Giữ cấu trúc nhất quán với API GET
          },
        },
    ]);

    return NextResponse.json({
      success: true,
      message: "Gửi thông báo thành công",
      data: newSentMail[0], // aggregate trả về một mảng, ta lấy phần tử đầu tiên
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

    const userId = new mongoose.Types.ObjectId(session.user.id);
    // Cập nhật trạng thái `read` của các thông báo được chỉ định
    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipientId: userId,
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
    const userId = new mongoose.Types.ObjectId(id);
    let result;

    if (role === 'resident') {
      // Resident chỉ xóa thông báo của chính mình (mailreceive, notice)
      const query = {
        _id: { $in: notificationIds },
        recipientId: userId,
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
        senderId: userId,
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
