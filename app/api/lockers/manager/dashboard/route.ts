import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Locker from '@/models/Locker';
import Booking from '@/models/Booking';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'manager') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // --- Main Stats ---
    const totalLockers = await Locker.countDocuments();
    const reservedLockers = await Booking.countDocuments({ status: 'active' });
    const inUseLockers = await Booking.countDocuments({ status: 'stored' });
    // Correctly count available lockers from the Locker model itself
    const availableLockers = await Locker.countDocuments({ status: 'available', currentBookingId: null });

    const stats = {
      total: totalLockers,
      inUse: inUseLockers,
      reserved: reservedLockers,
      available: availableLockers,
    };

    // --- Usage Trend (completed bookings in the last 12 months) ---
    const usageData = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      const count = await Booking.countDocuments({
        status: 'completed',
        endTime: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      
      usageData.push({
        month: `T${month + 1}`,
        lockers: count,
      });
    }

    // --- Block/Building Statistics ---
    const allLockers = await Locker.find({}).lean();
    const lockerIds = allLockers.map(l => l._id);
    const allBookings = await Booking.find({ 
        lockerId: { $in: lockerIds },
        status: { $in: ['active', 'stored'] } 
    }).lean();
    
    // Create a map for efficient O(1) lookup instead of O(N) in a loop
    const bookingMap = new Map(allBookings.map(b => [b.lockerId.toString(), b]));
    
    const blockStats: Record<string, { total: number; used: number; reserved: number; empty: number }> = {};

    for (const locker of allLockers) {
        const blockKey = `Tòa ${locker.building}`; // Group by building
        if (!blockStats[blockKey]) {
            blockStats[blockKey] = { total: 0, used: 0, reserved: 0, empty: 0 };
        }
        blockStats[blockKey].total++;

        const booking = bookingMap.get(locker._id.toString());
        if (booking) {
            if (booking.status === 'stored') {
                blockStats[blockKey].used++;
            } else if (booking.status === 'active') {
                blockStats[blockKey].reserved++;
            }
        } else if (locker.status === 'available') {
            // A locker is empty for booking purposes if it has no active/stored booking AND its status is 'available'
            blockStats[blockKey].empty++;
        }
    }

    const blockData = Object.entries(blockStats).map(([blockName, data]) => ({
        block: blockName,
        ...data,
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats,
        usageData,
        blockData,
      },
    });

  } catch (error) {
    console.error('Manager Dashboard API Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}