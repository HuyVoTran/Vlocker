import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Locker from '@/models/Locker';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Lấy thông tin user đầy đủ để có building và block
    const user = await User.findById(session.user.id).lean();
    if (!user || !user.building || !user.block) {
        return NextResponse.json({ success: false, message: 'Thông tin người dùng không đầy đủ (thiếu Tòa hoặc Block), không thể tìm tủ.' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const size = searchParams.get('size') || 'all';

    const query = {
      building: user.building,
      block: user.block, // Luôn lọc theo block của người dùng
      status: 'available',
      currentBookingId: { $exists: false },
    };

    if (size !== 'all') {
      query.size = size;
    }

    if (search) {
      query.lockerId = { $regex: search, $options: 'i' };
    }

    const lockers = await Locker.find(query)
      .sort({ lockerId: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Locker.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: lockers,
      pagination: {
        total,
        hasMore: (page * limit) < total,
      },
    });
  } catch (err) {
    console.error('Error in /api/lockers/resident/available:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}