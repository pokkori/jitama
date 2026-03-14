import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jitama_premium")?.value;
  return NextResponse.json({ isPremium: token === "true" });
}
