import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

// Define a more specific type for the booking object after `lean()` and `populate()`
// This helps avoid using `any`.
interface PopulatedLocker {
  price?: string | number;
}

interface PopulatedBooking {
  status?: string;
  paymentStatus?: string;
  startTime?: string | Date;
  lockerId?: PopulatedLocker;
  cost?: number;
  // Allow other properties since lean() returns a plain object
  [key: string]: unknown;
}

const ITEMS_PER_PAGE = 10;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("searchTerm") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || String(ITEMS_PER_PAGE), 10);
    const skip = (page - 1) * limit;

    await connectDB();

    const matchQuery: {
      userId: mongoose.Types.ObjectId;
      status?: string;
    } = { userId: new mongoose.Types.ObjectId(userId) };
    if (status !== 'all') {
      matchQuery.status = status;
    }

    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'lockers',
          localField: 'lockerId',
          foreignField: '_id',
          as: 'lockerInfo'
        }
      },
      { $unwind: { path: '$lockerInfo', preserveNullAndEmptyArrays: true } },
    ];

    if (searchTerm) {
      pipeline.push({
        $match: { 'lockerInfo.lockerId': { $regex: searchTerm, $options: 'i' } }
      });
    }

    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userInfo'
      }
    });
    pipeline.push({ $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } });

    const countPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await Booking.aggregate(countPipeline);
    const totalDocs = totalResult.length > 0 ? totalResult[0].total : 0;

    pipeline.push({ $sort: { startTime: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Rename fields to match original populate structure
    pipeline.push({
      $addFields: {
        lockerId: '$lockerInfo',
        userId: '$userInfo'
      }
    });
    pipeline.push({
      $project: {
        lockerInfo: 0,
        userInfo: 0
      }
    });

    const bookings: PopulatedBooking[] = await Booking.aggregate(pipeline);

    const now = new Date();
    const calculatedBookings = bookings.map((booking) => {
      // Tính toán lại chi phí cho các booking đang ở trạng thái 'stored' và 'pending'
      if (booking.status === 'stored' && booking.paymentStatus === 'pending' && booking.startTime) {
        const dailyRate = Number(booking.lockerId?.price) || 10000; // Lấy giá từ tủ, mặc định 10000
        const startTime = new Date(booking.startTime);
        const timeDiff = now.getTime() - startTime.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        const calculatedCost = Math.max(1, daysDiff) * dailyRate;

        return { ...booking, cost: calculatedCost };
      }
      return booking;
    });

    return NextResponse.json(
      {
        success: true,
        data: calculatedBookings,
        pagination: {
          total: totalDocs,
          page,
          hasMore: (page * limit) < totalDocs,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resident history error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tải lịch sử." },
      { status: 500 }
    );
  }
}
