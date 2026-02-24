import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const ANALYSIS_PROMPT = `You are an AI product analysis assistant.

TASK:
Analyze the uploaded product image and determine:
1. What the product is
2. The estimated age/condition of the product
3. The approximate market price
4. The best action: Sell, Buy (Repair), or Recycle

INSTRUCTIONS:
- Identify the product category (electronics, plastic, metal, etc.)
- Estimate condition (new, lightly used, damaged, broken)
- Guess product age based on visible wear and model type
- Estimate resale price in local currency (₹ or $)
- Decide the best option:
  - SELL → if product is in good condition
  - REPAIR/BUY → if fixable and usable
  - RECYCLE → if damaged or waste material

RETURN OUTPUT IN STRICT JSON FORMAT ONLY:
{
  "productName": "string",
  "category": "string",
  "estimatedAge": "string (e.g. 6 months, 2 years)",
  "condition": "string (new / good / used / damaged)",
  "sellPrice": number,
  "repairCost": number,
  "recycleValue": number,
  "bestAction": "Sell | Repair | Recycle",
  "reason": "short explanation"
}

IMPORTANT:
- Do not include extra text
- Do not explain outside JSON
- Be realistic with prices in Indian Rupees (₹)
- Assume user wants an eco-friendly and fair market decision
- Return ONLY the raw JSON object, no markdown, no code blocks`;

export async function POST(request) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Add it to your .env.local file." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { imageBase64, mimeType = "image/jpeg" } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "imageBase64 is required" },
        { status: 400 }
      );
    }

    // Strip data URL prefix if present
    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

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
            {
              text: ANALYSIS_PROMPT,
            },
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
      console.error("[analyze-product] Gemini API error:", errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const geminiData = await response.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response (handle any accidental markdown wrapping)
    let jsonText = rawText.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    // Remove any leading/trailing non-JSON characters
    const startIdx = jsonText.indexOf("{");
    const endIdx = jsonText.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1) {
      jsonText = jsonText.slice(startIdx, endIdx + 1);
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(jsonText);
    } catch {
      console.error("[analyze-product] Failed to parse AI JSON:", rawText);
      return NextResponse.json(
        { error: "AI returned invalid JSON", rawText },
        { status: 500 }
      );
    }

    // Normalize and validate fields
    const normalized = {
      productName: String(analysisResult.productName || "Unknown Product"),
      category: String(analysisResult.category || "Unknown"),
      estimatedAge: String(analysisResult.estimatedAge || "Unknown"),
      condition: String(analysisResult.condition || "used").toLowerCase(),
      sellPrice: Number(analysisResult.sellPrice) || 0,
      repairCost: Number(analysisResult.repairCost) || 0,
      recycleValue: Number(analysisResult.recycleValue) || 0,
      bestAction: String(analysisResult.bestAction || "Recycle"),
      reason: String(analysisResult.reason || ""),
      aiSource: "gemini",
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (err) {
    console.error("[analyze-product] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", message: err.message },
      { status: 500 }
    );
  }
}
