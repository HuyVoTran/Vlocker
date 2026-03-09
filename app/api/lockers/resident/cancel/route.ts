import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Locker from '@/models/Locker';
import mongoose from 'mongoose';
import { broadcastLockerEvent } from '@/lib/lockerEvents';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { bookingId } = await req.json();

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ success: false, message: 'Booking ID không hợp lệ' }, { status: 400 });
    }

    const dbSession = await mongoose.startSession();
    try {
      dbSession.startTransaction();

      const booking = await Booking.findOne({
        _id: bookingId,
        userId: session.user.id,
      }).session(dbSession);

      if (!booking) {
        await dbSession.abortTransaction(); // Hủy transaction
        return NextResponse.json({ success: false, message: 'Không tìm thấy lượt đặt hoặc bạn không có quyền' }, { status: 404 });
      }

      if (booking.status !== 'active') {
        await dbSession.abortTransaction(); // Hủy transaction
        return NextResponse.json({ success: false, message: 'Chỉ có thể hủy lượt đặt đang ở trạng thái "Đã đặt"' }, { status: 400 });
      }

      // Cập nhật trạng thái booking
      booking.status = 'cancelled';
      booking.endTime = new Date();
      await booking.save({ session: dbSession });

      // Cập nhật trạng thái locker
      await Locker.findByIdAndUpdate(
        booking.lockerId,
        { $set: { status: 'available', currentBookingId: null, isLocked: false } },
        { session: dbSession }
      );

      await dbSession.commitTransaction();

      broadcastLockerEvent({
        action: 'cancel',
        lockerId: booking.lockerId?.toString(),
        bookingId: booking._id?.toString(),
      });

      return NextResponse.json({ success: true, message: 'Hủy lượt đặt thành công' });
    } catch (error) {
      if (dbSession.inTransaction()) await dbSession.abortTransaction();
      throw error; // Re-throw to be caught by outer catch block
    } finally {
      dbSession.endSession(); // Luôn đóng session
    }

  } catch (error) {
    console.error('Lỗi hủy lượt đặt của cư dân:', error);
    const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định từ server';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}