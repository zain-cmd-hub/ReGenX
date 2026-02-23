import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  console.log("[API] /api/test-ai reached", { keyDetected: Boolean(apiKey) });
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
