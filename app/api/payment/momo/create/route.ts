import { NextResponse } from "next/server";
import crypto from "crypto";
import { headers } from "next/headers";

const MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";

export async function POST(req: Request) {
  try {
    const { amount, orderInfo, orderId: providedOrderId, redirectUrl: providedRedirectUrl, extraData: providedExtraData } = await req.json();
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ success: false, message: "Số tiền không hợp lệ." }, { status: 400 });
    }

    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;

    if (!partnerCode || !accessKey || !secretKey) {
      return NextResponse.json({ success: false, message: "Thiếu cấu hình MoMo." }, { status: 500 });
    }

    const requestId = `${partnerCode}_${Date.now()}`;
    const orderId = providedOrderId || requestId;
    const requestType = "captureWallet";
    const extraData = typeof providedExtraData === "string" ? providedExtraData : "";

    const origin = (await headers()).get("origin") || "";
    const redirectUrl = providedRedirectUrl || `${origin}/resident/my-lockers`;
    const ipnUrl = `${origin}/api/payment/momo/notify`;

    const rawSignature = `accessKey=${accessKey}&amount=${parsedAmount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo || "Thanh toán MoMo"}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    const payload = {
      partnerCode,
      accessKey,
      requestId,
      amount: parsedAmount.toString(),
      orderId,
      orderInfo: orderInfo || "Thanh toán MoMo",
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    const momoRes = await fetch(MOMO_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const momoJson = await momoRes.json();
    if (!momoRes.ok || !momoJson?.payUrl) {
      return NextResponse.json({ success: false, message: momoJson?.message || "Không thể tạo thanh toán." }, { status: 500 });
    }

    return NextResponse.json({ success: true, payUrl: momoJson.payUrl, data: momoJson });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi máy chủ.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
