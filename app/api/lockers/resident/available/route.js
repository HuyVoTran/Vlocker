import { NextResponse } from "next/server";
import Locker from "@/models/Locker";
import { connectDB } from "@/lib/mongodb";

export async function GET(req) {
  console.log("=== Available Lockers API START ===");
  
  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("DB Connected!");

    const { searchParams } = new URL(req.url);
    const building = searchParams.get("building");
    const block = searchParams.get("block");

    console.log("Fetching lockers for building:", building, "block:", block);

    if (!building || !block) {
      console.log("Missing building or block parameters");
      return NextResponse.json(
        { success: false, data: [], message: "Missing building or block" },
        { status: 200 }
      );
    }

    // Debug: Check all lockers with this building/block
    console.log("Querying all lockers with building=" + building + " block=" + block);
    const allLockers = await Locker.find({ building, block })
      .select("_id lockerId building block status")
      .lean();
    
    console.log(`Total lockers for ${building}-${block}:`, allLockers.length);
    
    if (allLockers.length > 0) {
      console.log("Sample locker statuses:");
      allLockers.slice(0, 3).forEach(l => {
        console.log(`  - ${l.lockerId}: status="${l.status}" (type: ${typeof l.status})`);
      });
      
      // Check unique statuses
      const statuses = [...new Set(allLockers.map(l => l.status))];
      console.log("Unique statuses in DB:", statuses);
    }

    // Lấy locker trống theo building + block
    console.log("Querying available lockers...");
    const lockers = await Locker.find({
      status: "available",
      building,
      block,
    })
      .select("_id lockerId building block status")
      .lean();

    console.log(`Found ${lockers.length} available lockers for ${building}-${block}`);

    return NextResponse.json({
      success: true,
      count: lockers.length,
      data: lockers || [],
    });
    
  } catch (err) {
    console.error("❌ Error fetching available lockers:", err.message);
    console.error("Stack:", err.stack);
    return NextResponse.json(
      { success: false, data: [], message: "Server error", error: err.message },
      { status: 200 }
    );
  } finally {
    console.log("=== Available Lockers API END ===");
  }
}
