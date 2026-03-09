import { NextResponse } from "next/server";
import { getPayPalAccessToken, getPayPalApiBase } from "@/lib/paypal";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const { amount, orderInfo, bookingId, returnUrl, cancelUrl } = await req.json();
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ success: false, message: "Số tiền không hợp lệ." }, { status: 400 });
    }

    const origin = (await headers()).get("origin") || "";
    const finalReturnUrl = returnUrl || `${origin}/resident/my-lockers?paypal=success&bookingId=${bookingId || ""}`;
    const finalCancelUrl = cancelUrl || `${origin}/resident/my-lockers?paypal=cancel`;

    const accessToken = await getPayPalAccessToken();

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: (parsedAmount / 25000).toFixed(2),
          },
          description: orderInfo || "Thanh toán trả tủ",
          custom_id: bookingId || "",
        },
      ],
      application_context: {
        return_url: finalReturnUrl,
        cancel_url: finalCancelUrl,
        user_action: "PAY_NOW",
      },
    };

    const res = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ success: false, message: json.message || "Không thể tạo đơn PayPal." }, { status: 500 });
    }

    const approveLink = Array.isArray(json.links)
      ? json.links.find((link: { rel: string }) => link.rel === "approve")
      : null;

    if (!approveLink?.href) {
      return NextResponse.json({ success: false, message: "Không tìm thấy link thanh toán PayPal." }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId: json.id, approveUrl: approveLink.href, data: json });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi máy chủ.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
