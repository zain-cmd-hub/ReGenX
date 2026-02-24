import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * GET /api/test-ai
 * Tests connectivity to the Gemini AI API.
 * Returns: { status, model, response, keyConfigured }
 */
export async function GET() {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      {
        status: "error",
        keyConfigured: false,
        error:
          "GEMINI_API_KEY is not set. Add GEMINI_API_KEY=your_key to .env.local and restart the dev server.",
      },
      { status: 500 }
    );
  }

  try {
    const payload = {
      contents: [
        {
          parts: [
            {
              text: 'Reply with exactly: {"status":"ok","model":"gemini-1.5-flash"}',
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 64,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          status: "error",
          keyConfigured: true,
          httpStatus: response.status,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json(
      {
        status: "ok",
        keyConfigured: true,
        model: "gemini-1.5-flash",
        rawResponse: text.trim(),
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        keyConfigured: true,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
