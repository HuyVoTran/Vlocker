import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Locker from "@/models/Locker";

function encode(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

export async function GET(req: Request) {
  try {
    const { searchParams, origin } = new URL(req.url);

    const secureHash = searchParams.get("vnp_SecureHash") || "";
    searchParams.get("vnp_SecureHashType");
    const responseCode = searchParams.get("vnp_ResponseCode") || "";
    const txnRef = searchParams.get("vnp_TxnRef") || "";

    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    if (!vnp_HashSecret || !secureHash || !txnRef) {
      return NextResponse.redirect(`${origin}/resident/my-lockers?vnpay=failed`);
    }

    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== "vnp_SecureHash" && key !== "vnp_SecureHashType") {
        params[key] = value;
      }
    });

    const sortedKeys = Object.keys(params).sort();
    const signData = sortedKeys
      .map((key) => `${encode(key)}=${encode(params[key])}`)
      .join("&");

    const calculatedHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(signData)
      .digest("hex");

    if (calculatedHash !== secureHash) {
      return NextResponse.redirect(`${origin}/resident/my-lockers?vnpay=failed`);
    }

    if (responseCode !== "00") {
      return NextResponse.redirect(`${origin}/resident/my-lockers?vnpay=failed&bookingId=${txnRef}`);
    }

    await connectDB();

    const booking = await Booking.findById(txnRef).populate("lockerId");
    if (!booking) {
      return NextResponse.redirect(`${origin}/resident/my-lockers?vnpay=failed&bookingId=${txnRef}`);
    }

    if (booking.status === "stored" && booking.paymentStatus === "pending") {
      const dailyRate = Number(booking.lockerId?.price) || 10000;
      const startTime = booking.startTime || new Date();
      const endTime = new Date();
      const daysDiff = Math.ceil((endTime.getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60 * 24));
      const finalCost = Math.max(1, daysDiff) * dailyRate;

      booking.paymentStatus = "paid";
      booking.endTime = endTime;
      booking.cost = finalCost;
      booking.pickupExpiryTime = new Date(endTime.getTime() + 30 * 60 * 1000);
      await booking.save();

      await Locker.findByIdAndUpdate(booking.lockerId, { isLocked: false });
    }

    return NextResponse.redirect(`${origin}/resident/my-lockers?vnpay=success&bookingId=${txnRef}`);
  } catch {
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(`${origin}/resident/my-lockers?vnpay=failed`);
  }
}
