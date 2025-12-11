import { NextResponse } from "next/server";
import Locker from "@/models/Locker";
import { connectDB } from "@/lib/mongodb";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const building = searchParams.get("building");
    const block = searchParams.get("block");

    if (!building || !block) {
      return NextResponse.json(
        { success: false, error: "Missing building or block" },
        { status: 400 }
      );
    }

    // Lấy locker trống theo building + block
    const lockers = await Locker.find({
      status: "available",
      building,
      block,
    })
      .select("_id lockerId building block size price status") // chỉ lấy các field cần thiết
      .lean();

    return NextResponse.json({
      success: true,
      count: lockers.length,
      data: lockers,
    });
    
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
