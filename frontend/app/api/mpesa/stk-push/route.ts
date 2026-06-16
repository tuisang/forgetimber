import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SHORTCODE = process.env.MPESA_SHORTCODE ?? "174379";
const PASSKEY = process.env.MPESA_PASSKEY ?? "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL ?? "https://tuistech.co.ke/api/mpesa/callback";
const IS_PRODUCTION = process.env.MPESA_ENVIRONMENT === "production";
const MPESA_BASE = IS_PRODUCTION
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const res = await fetch(`${MPESA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { phone, bookingId } = await req.json();

    if (!phone || !bookingId) {
      return NextResponse.json({ error: "Phone and bookingId are required." }, { status: 400 });
    }

    const formattedPhone = phone.replace(/^0/, "254").replace(/^\+/, "").replace(/\s/g, "");
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");

    // Get booking to get amount
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    const amount = IS_PRODUCTION ? 5000 : 1; // KES 5000 consultation fee

    const stkRes = await fetch(`${MPESA_BASE}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        AccountReference: `FT-${bookingId}`,
        TransactionDesc: "Forge & Timber Consultation Fee",
      }),
    });

    const stkData = await stkRes.json();

    if (stkData.ResponseCode !== "0") {
      return NextResponse.json(
        { error: stkData.ResponseDescription ?? "STK push failed." },
        { status: 400 }
      );
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "awaiting_payment", mpesaCheckoutId: stkData.CheckoutRequestID },
    });

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkData.CheckoutRequestID,
      message: "STK push sent. Check your phone.",
    });
  } catch (error) {
    console.error("STK push error:", error);
    return NextResponse.json({ error: "Failed to initiate payment." }, { status: 500 });
  }
}
