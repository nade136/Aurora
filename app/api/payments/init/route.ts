import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "";

export async function POST(req: NextRequest) {
  if (!PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: "Missing PAYSTACK_SECRET_KEY" }, { status: 500 });
  }
  try {
    const body = await req.json();
    const {
      amount, // in NGN major units
      currency = "NGN",
      email,
      cohort,
      first_name,
      last_name,
      institution,
      current_position,
      role_category,
      social_url,
      callback_url,
    } = body || {};

    if (!email || !amount) {
      return NextResponse.json({ error: "email and amount are required" }, { status: 400 });
    }

    // Convert to kobo
    const amount_kobo = Math.round(Number(amount) * 100);

    const txRef = `AUR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount_kobo,
        currency,
        reference: txRef,
        callback_url: callback_url || (NEXT_PUBLIC_APP_URL ? `${NEXT_PUBLIC_APP_URL}/book-slot` : undefined),
        metadata: {
          integration: "aurora",
          cohort,
          first_name,
          last_name,
          institution,
          current_position,
          role_category,
          social_url,
        },
      }),
    });

    const initJson = await initRes.json();
    if (!initRes.ok || !initJson?.status) {
      return NextResponse.json({ error: initJson?.message || "Failed to initialize transaction" }, { status: 400 });
    }

    return NextResponse.json({ authorization_url: initJson.data.authorization_url, reference: txRef });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
