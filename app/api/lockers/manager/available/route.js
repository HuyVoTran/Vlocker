import { NextResponse } from "next/server";
import Locker from "@/models/Locker";

export async function GET() {
  try {
    const lockers = await Locker.find({
      status: "available",
    }).lean();

    return NextResponse.json({
      success: true,
      count: lockers.length,
      data: lockers,
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
