import { NextResponse } from "next/server";
import crypto from "crypto";

function buildSignaturePayload(body: Record<string, string>) {
  const fields = [
    "accessKey",
    "amount",
    "extraData",
    "message",
    "orderId",
    "orderInfo",
    "orderType",
    "partnerCode",
    "payType",
    "requestId",
    "responseTime",
    "resultCode",
    "transId",
  ];
  return fields
    .filter((key) => body[key] !== undefined)
    .map((key) => `${key}=${body[key]}`)
    .join("&");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, string>;
    const signature = body.signature;

    const secretKey = process.env.MOMO_SECRET_KEY;
    if (secretKey && signature) {
      const raw = buildSignaturePayload(body);
      const expected = crypto.createHmac("sha256", secretKey).update(raw).digest("hex");
      if (expected !== signature) {
        return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: "Notify received" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi máy chủ.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
