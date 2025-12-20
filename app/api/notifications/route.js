import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/* =========================
   GET: Lấy notifications
========================= */
export async function GET(req) {
  console.log("=== Notifications API GET START ===");

  try {
    console.log("Connecting DB...");
    await connectDB();
    console.log("DB Connected!");

    console.log("Getting session...");
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session || !session.user) {
      console.log("❌ Unauthorized");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, role } = session.user;
    let query = {};
    let residents = [];

    if (role === "manager") {
      console.log("Role: manager → lấy tất cả notifications");
      residents = await User.find({ role: "resident" })
        .select("name email _id")
        .lean();
    } else {
      console.log("Role: resident → chỉ lấy notification của user:", id);
      query = { recipientId: id };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .lean();

    console.log("Notifications count:", notifications.length);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        residents,
      },
    });
  } catch (err) {
    console.error("❌ Error GET /api/notifications:", err.message);
    console.error(err.stack);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  } finally {
    console.log("=== Notifications API GET END ===");
  }
}

/* =========================
   POST: Manager gửi thông báo
========================= */
export async function POST(req) {
  console.log("=== Notifications API POST START ===");

  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "manager") {
      console.log("❌ Forbidden");
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, message, recipientIds } = body;

    if (!title || !message || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const notifications = recipientIds.map((id) => ({
      recipientId: id,
      type: "admin_message",
      title,
      message,
    }));

    await Notification.insertMany(notifications);

    console.log("Notifications sent:", notifications.length);

    return NextResponse.json({
      success: true,
      message: "Notifications sent successfully",
    });
  } catch (err) {
    console.error("❌ Error POST /api/notifications:", err.message);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  } finally {
    console.log("=== Notifications API POST END ===");
  }
}

/* =========================
   PATCH: Đánh dấu đã đọc
========================= */
export async function PATCH(req) {
  console.log("=== Notifications API PATCH START ===");

  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { notificationIds } = await req.json();

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Notification IDs are required" },
        { status: 400 }
      );
    }

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipientId: session.user.id,
      },
      { $set: { read: true } }
    );

    console.log("Marked as read:", notificationIds.length);

    return NextResponse.json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (err) {
    console.error("❌ Error PATCH /api/notifications:", err.message);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  } finally {
    console.log("=== Notifications API PATCH END ===");
  }
}
