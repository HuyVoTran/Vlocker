import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

/* =================================================================
   GET /api/notifications/unread-count
   Mục đích: Lấy số lượng thông báo chưa đọc của người dùng hiện tại.
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

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Đếm các thông báo mà người dùng là người nhận và chưa đọc.
    // Điều này áp dụng cho cả 'mailreceive' và 'notice' được gửi riêng cho họ.
    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      read: false,
    });

    return NextResponse.json({ success: true, data: { unreadCount } });
  } catch (err) {
    console.error("Lỗi nghiêm trọng tại GET /api/notifications/unread-count:", err.message, err.stack);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ", error: err.message },
      { status: 500 }
    );
  }
}