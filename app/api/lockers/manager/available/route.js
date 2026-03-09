import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Locker from "@/models/Locker";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { broadcastLockerEvent } from "@/lib/lockerEvents";

// GET handler to fetch all lockers not currently in use by a resident
export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập." }, { status: 403 });
    }

    // Find all lockers that are not assigned to a booking
    const lockers = await Locker.find({ currentBookingId: null })
      .sort({ building: 1, block: 1, lockerId: 1 })
      .lean();

    return NextResponse.json({ success: true, data: lockers });
  } catch (error) {
    console.error("Error fetching available lockers:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ.", error: error.message }, { status: 500 });
  }
}

// POST handler to create a new locker
export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập." }, { status: 403 });
    }

    const body = await req.json();
    const { building, block, size, floor, price } = body;

    if (!building || !block || !size) {
      return NextResponse.json({ success: false, message: "Tòa, block và kích thước là bắt buộc." }, { status: 400 });
    }

    const newLocker = new Locker({
      building: building.trim(),
      block: block.trim(),
      size,
      floor: floor ? floor.trim() : undefined,
      price: Number(price) || 10000,
      status: 'available', // Default status
      isLocked: true,      // Default to locked state
    });

    await newLocker.save();

    broadcastLockerEvent({
      action: "create",
      lockerId: newLocker._id?.toString(),
      status: newLocker.status,
    });

    return NextResponse.json({ success: true, data: newLocker, message: "Tủ mới đã được tạo thành công." }, { status: 201 });

  } catch (error) {
    console.error("Error creating new locker:", error);
    if (error.name === 'ValidationError') {
        return NextResponse.json({ success: false, message: "Dữ liệu không hợp lệ.", error: error.message }, { status: 400 });
    }
    // Handle potential race condition for unique lockerId
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: "Lỗi tạo mã tủ tự động. Vui lòng thử lại." }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Lỗi máy chủ khi tạo tủ mới.", error: error.message }, { status: 500 });
  }
}

// DELETE handler to remove a locker
export async function DELETE(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập." }, { status: 403 });
    }

    const { lockerId } = await req.json();

    if (!lockerId) {
      return NextResponse.json({ success: false, message: "Thiếu ID của tủ." }, { status: 400 });
    }

    // Check if the locker is part of an active booking before deleting
    const locker = await Locker.findById(lockerId);
    if (!locker) {
        return NextResponse.json({ success: false, message: "Không tìm thấy tủ." }, { status: 404 });
    }
    if (locker.currentBookingId) {
        return NextResponse.json({ success: false, message: "Không thể xóa tủ đang có lượt đặt." }, { status: 409 });
    }

    await Locker.findByIdAndDelete(lockerId);

    broadcastLockerEvent({
      action: "delete",
      lockerId: lockerId?.toString(),
    });

    return NextResponse.json({ success: true, message: "Tủ đã được xóa thành công." });

  } catch (error) {
    console.error("Error deleting locker:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ khi xóa tủ.", error: error.message }, { status: 500 });
  }
}