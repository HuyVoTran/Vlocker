import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

type Period = "all" | "month" | "quarter" | "year";

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
    if (session?.user?.role !== 'manager') {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const period = (searchParams.get("period") as Period) || "all";
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");
    const quarterParam = searchParams.get("quarter");
    const searchTerm = searchParams.get("searchTerm") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || String(ITEMS_PER_PAGE), 10);
    const skip = (page - 1) * limit;

    const now = new Date();
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (period === "year") {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
    } else if (period === "month") {
      const month = monthParam ? parseInt(monthParam, 10) - 1 : now.getMonth();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 1);
    } else if (period === "quarter") {
      const q = quarterParam ? parseInt(quarterParam, 10) : 1;
      const startMonth = (q - 1) * 3;
      startDate = new Date(year, startMonth, 1);
      endDate = new Date(year, startMonth + 3, 1);
    }

    const matchQuery: {
      startTime?: { $gte: Date; $lt: Date };
      status?: string;
    } = {};
    if (startDate && endDate) {
      matchQuery.startTime = { $gte: startDate, $lt: endDate };
    }
    if (status !== "all") {
      matchQuery.status = status;
    }

    // To search on populated fields, we need an aggregation pipeline.
    const pipeline: mongoose.PipelineStage[] = [
      // Initial match for date and status
      { $match: matchQuery },
      // Populate locker and user info
      {
        $lookup: {
          from: 'lockers',
          localField: 'lockerId',
          foreignField: '_id',
          as: 'lockerInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      // Deconstruct the array from lookup
      { $unwind: { path: '$lockerInfo', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
    ];

    if (searchTerm) {
      pipeline.push({
        $match: {
          $or: [
            { 'lockerInfo.lockerId': { $regex: searchTerm, $options: 'i' } },
            { 'userInfo.name': { $regex: searchTerm, $options: 'i' } },
            { 'userInfo.email': { $regex: searchTerm, $options: 'i' } },
            { 'userInfo.phone': { $regex: searchTerm, $options: 'i' } },
          ]
        }
      });
    }

    // We need to count total documents for pagination *before* skip and limit
    const countPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await Booking.aggregate(countPipeline);
    const totalDocs = totalResult.length > 0 ? totalResult[0].total : 0;

    // Add sorting and pagination to the main pipeline
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
          limit,
          hasMore: (page * limit) < totalDocs,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Manager history error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tải lịch sử." },
      { status: 500 }
    );
  }
}
