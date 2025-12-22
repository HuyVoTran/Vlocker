import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Locker from '@/models/Locker';
import Booking from '@/models/Booking';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'manager') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
     await connectDB();

    // --- Main Stats ---
    const totalLockers = await Locker.countDocuments();
    const bookedLockers = await Booking.countDocuments({ status: 'active' });
    const inUseLockers = await Booking.countDocuments({ status: 'stored' });
    
    // Calculate available by subtracting booked and in-use from total.
    // This is a simplification and assumes lockers not in 'active' or 'stored' bookings are available.
    // It doesn't account for 'maintenance' or 'locked' statuses from the Locker model itself.
    const availableLockers = totalLockers - bookedLockers - inUseLockers;

    const stats = {
      total: totalLockers,
      inUse: inUseLockers,
      reserved: bookedLockers,
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
    const allBookings = await Booking.find({ status: { $in: ['active', 'stored'] } }).lean();
    
    const blockStats: Record<string, { total: number; used: number; reserved: number; empty: number }> = {};

    for (const locker of allLockers) {
        const blockKey = `Tòa ${locker.building}`; // Group by building
        if (!blockStats[blockKey]) {
            blockStats[blockKey] = { total: 0, used: 0, reserved: 0, empty: 0 };
        }
        blockStats[blockKey].total++;

        const booking = allBookings.find(b => b.lockerId.toString() === locker._id.toString());
        if (booking) {
            if (booking.status === 'stored') {
                blockStats[blockKey].used++;
            } else if (booking.status === 'active') {
                blockStats[blockKey].reserved++;
            }
        }
    }
    
    // Adjust empty count to be more accurate based on total
    Object.keys(blockStats).forEach(key => {
        const block = blockStats[key];
        block.empty = block.total - block.used - block.reserved;
    });

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