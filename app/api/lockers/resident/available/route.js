import { NextResponse } from "next/server";
import Locker from "@/models/Locker";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const building = searchParams.get("building");
    const block = searchParams.get("block");

    if (!building || !block) {
      return NextResponse.json(
        { success: false, error: "Missing building or block" },
        { status: 400 }
      );
    }

    const lockers = await Locker.find({
      status: "available",
      building,
      block,
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
