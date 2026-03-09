import { NextResponse } from "next/server";
import crypto from "crypto";
import { headers } from "next/headers";

const DEFAULT_VNPAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

function formatDate(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function encode(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

export async function POST(req: Request) {
  try {
    const { amount, orderInfo, bookingId, returnUrl } = await req.json();
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ success: false, message: "Số tiền không hợp lệ." }, { status: 400 });
    }

    const vnp_TmnCode = process.env.VNP_TMN_CODE;
    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const vnp_Url = process.env.VNP_URL || DEFAULT_VNPAY_URL;

    if (!vnp_TmnCode || !vnp_HashSecret) {
      return NextResponse.json({ success: false, message: "Thiếu cấu hình VNPay." }, { status: 500 });
    }

    const requestHeaders = await headers();
    const origin = requestHeaders.get("origin") || "";
    const vnp_ReturnUrl = returnUrl || process.env.VNP_RETURN_URL || `${origin}/api/payment/vnpay/return`;
    const vnp_IpAddr = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim()
      || requestHeaders.get("x-real-ip")
      || "127.0.0.1";

    const vnp_TxnRef = bookingId || `${Date.now()}`;
    const vnp_Amount = Math.round(parsedAmount * 100).toString();

    const params: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode,
      vnp_Amount,
      vnp_TxnRef,
      vnp_OrderInfo: orderInfo || `Thanh toán trả tủ ${vnp_TxnRef}`,
      vnp_ReturnUrl,
      vnp_IpAddr,
      vnp_CreateDate: formatDate(new Date()),
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
    };

    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys
      .map((key) => `${encode(key)}=${encode(params[key])}`)
      .join("&");

    const secureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(queryString)
      .digest("hex");

    const paymentUrl = `${vnp_Url}?${queryString}&vnp_SecureHash=${secureHash}`;

    return NextResponse.json({ success: true, paymentUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi máy chủ.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
