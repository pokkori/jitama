import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    const secret = process.env.PAYJP_SECRET_KEY ?? "";
    const plan = process.env.PAYJP_PLAN_STD ?? "";
    const auth = Buffer.from(secret + ":").toString("base64");

    // Create customer
    const custRes = await fetch("https://api.pay.jp/v1/customers", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ card: token }),
    });
    const cust = await custRes.json();
    if (cust.error) throw new Error(cust.error.message);

    // Create subscription
    const subRes = await fetch("https://api.pay.jp/v1/subscriptions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ customer: cust.id, plan }),
    });
    const sub = await subRes.json();
    if (sub.error) throw new Error(sub.error.message);

    const cookieStore = await cookies();
    cookieStore.set("jitama_premium", "true", {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 366,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "エラーが発生しました";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
