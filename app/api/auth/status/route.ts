import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  // Komoju sets "premium" cookie; legacy PAY.JP set "jitama_premium"
  const komojuPremium = cookieStore.get("premium")?.value === "1";
  const legacyPremium = cookieStore.get("jitama_premium")?.value === "true";

  if (komojuPremium || legacyPremium) {
    return NextResponse.json({ isPremium: true });
  }

  return NextResponse.json({ isPremium: false });
}
