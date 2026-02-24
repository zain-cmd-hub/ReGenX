import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * POST /api/analyze-image
 * Multimodal image analysis endpoint.
 * Accepts: { imageBase64, mimeType, prompt? }
 * Returns:  { productName, category, estimatedAge, condition, sellPrice, repairCost, recycleValue, bestAction, reason }
 */
export async function POST(request) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Add it to your .env.local file." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      imageBase64,
      mimeType = "image/jpeg",
      prompt,
    } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "imageBase64 is required" },
        { status: 400 }
      );
    }

    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    const analysisPrompt =
      prompt ||
      `Analyze this product image and return a JSON object with these fields:
{
  "productName": "string",
  "category": "string (electronics/plastic/metal/glass/fabric/other)",
  "estimatedAge": "string (e.g. 1 year, 3 months)",
  "condition": "string (new/good/used/damaged)",
  "sellPrice": number (in INR ₹),
  "repairCost": number (in INR ₹),
  "recycleValue": number (in INR ₹),
  "bestAction": "Sell | Repair | Recycle",
  "reason": "string (short explanation)"
}
Return ONLY the raw JSON object. No markdown, no code blocks, no extra text.`;

    const geminiPayload = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
            { text: analysisPrompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 512,
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[analyze-image] Gemini API error:", errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const geminiData = await response.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let jsonText = rawText.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonText = jsonMatch[1].trim();
    const startIdx = jsonText.indexOf("{");
    const endIdx = jsonText.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1) {
      jsonText = jsonText.slice(startIdx, endIdx + 1);
    }

    let result;
    try {
      result = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON", rawText },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        productName: String(result.productName || "Unknown Product"),
        category: String(result.category || "Unknown"),
        estimatedAge: String(result.estimatedAge || "Unknown"),
        condition: String(result.condition || "used").toLowerCase(),
        sellPrice: Number(result.sellPrice) || 0,
        repairCost: Number(result.repairCost) || 0,
        recycleValue: Number(result.recycleValue) || 0,
        bestAction: String(result.bestAction || "Recycle"),
        reason: String(result.reason || ""),
        aiSource: "gemini",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[analyze-image] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", message: err.message },
      { status: 500 }
    );
  }
}
