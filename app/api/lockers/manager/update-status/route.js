import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Locker from "@/models/Locker";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { broadcastLockerEvent } from "@/lib/lockerEvents";

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'manager') {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { lockerId, newStatus } = await req.json();

    if (!lockerId || !newStatus) {
      return NextResponse.json(
        { success: false, message: "Missing lockerId or newStatus" },
        { status: 400 }
      );
    }

    // Validate newStatus against allowed values
    const allowedStatuses = ['available', 'maintenance', 'locked'];
    if (!allowedStatuses.includes(newStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid status provided" },
        { status: 400 }
      );
    }

    const updatedLocker = await Locker.findByIdAndUpdate(
      lockerId,
      { status: newStatus },
      { new: true } // Trả về document đã được cập nhật
    );

    if (!updatedLocker) {
      return NextResponse.json({ success: false, message: "Locker not found" }, { status: 404 });
    }

    broadcastLockerEvent({
      action: "status-update",
      lockerId: updatedLocker._id?.toString(),
      status: updatedLocker.status,
    });

    return NextResponse.json({ success: true, data: updatedLocker }, { status: 200 });
  } catch (err) {
    console.error("Error updating locker status:", err);
    return NextResponse.json({ success: false, message: "Server error", error: err.message }, { status: 500 });
  }
}
