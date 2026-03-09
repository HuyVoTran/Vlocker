const DEFAULT_PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

export function getPayPalApiBase() {
  return process.env.PAYPAL_API_BASE || DEFAULT_PAYPAL_API_BASE;
}

export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Thiếu cấu hình PayPal.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(json.message || "Không thể lấy access token PayPal.");
  }

  return json.access_token as string;
}
