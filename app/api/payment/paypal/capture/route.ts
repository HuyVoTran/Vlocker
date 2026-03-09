import { NextResponse } from "next/server";
import { getPayPalAccessToken, getPayPalApiBase } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Thiếu orderId." }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();

    const res = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ success: false, message: json.message || "Thanh toán PayPal thất bại." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: json });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi máy chủ.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
