import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  return new Response("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
