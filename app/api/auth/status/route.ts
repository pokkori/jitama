import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const PAYJP_API = "https://api.pay.jp/v1";

function payjpAuth() {
  return "Basic " + Buffer.from(process.env.PAYJP_SECRET_KEY! + ":").toString("base64");
}

async function checkSubscriptionActive(subId: string): Promise<boolean> {
  try {
    const res = await fetch(`${PAYJP_API}/subscriptions/${subId}`, {
      headers: { Authorization: payjpAuth() },
    });
    const data = await res.json();
    return data.status === "active" || data.status === "trial";
  } catch {
    return true;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jitama_premium")?.value;
  if (token !== "true") return NextResponse.json({ isPremium: false });

  const subId = cookieStore.get("payjp_sub_id")?.value;
  if (subId) {
    const isActive = await checkSubscriptionActive(subId);
    if (!isActive) {
      const res = NextResponse.json({ isPremium: false });
      res.cookies.set("jitama_premium", "", { maxAge: 0, path: "/" });
      res.cookies.set("payjp_sub_id", "", { maxAge: 0, path: "/" });
      return res;
    }
  }

  return NextResponse.json({ isPremium: true });
}
