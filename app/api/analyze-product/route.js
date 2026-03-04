import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAx4Pug2a5bHynmlpYMtn6pQ4VOCdnB6Wc";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const ANALYSIS_PROMPT = `You are an AI system specialized in second-hand product valuation and circular economy decisions.

TASK:
Analyze the uploaded product image to extract detailed features for accurate price prediction.

ANALYZE AND DETERMINE:
1. Product identification (name, brand, model, category)
2. Physical condition assessment (condition score, damage level, scratches)
3. Age estimation based on visual wear and model generation
4. Market value estimation considering brand reputation and demand
5. Repair feasibility and cost estimation
6. Recycling/scrap value based on materials
7. Best recommendation: Repair, Resell, or Recycle

CONDITION SCORING GUIDE:
- new: 0.95 (unopened/mint)
- excellent: 0.90 (like new, minimal use)
- good: 0.80 (normal wear, fully functional)
- fair: 0.65 (visible wear, works well)
- average: 0.60 (moderate wear)
- used: 0.55 (significant wear)
- poor: 0.40 (heavy wear, may have issues)
- damaged: 0.30 (needs repair)
- broken: 0.15 (non-functional)

DAMAGE LEVEL GUIDE:
- none: No visible damage
- minor: Small scratches/scuffs
- moderate: Noticeable damage, still usable
- major: Significant damage affecting function
- severe: Heavily damaged, barely usable

RETURN OUTPUT IN STRICT JSON FORMAT ONLY:
{
  "productName": "string",
  "brand": "string (identified brand or 'Generic')",
  "model": "string (model name/number if visible)",
  "category": "string (electronics/mobile/laptop/appliances/furniture/clothing/toys/sports/books)",
  "estimatedAge": "string (e.g. 6 months, 2 years)",
  "ageInYears": number (numeric age in years, e.g. 1.5),
  "condition": "string (new/excellent/good/fair/average/used/poor/damaged/broken)",
  "conditionScore": number (0.15 to 0.95 based on guide above),
  "damageLevel": "string (none/minor/moderate/major/severe)",
  "scratchLevel": "string (none/minor/moderate/heavy)",
  "missingParts": boolean,
  "originalPrice": number (estimated original retail price in ₹),
  "sellPrice": number (current resale value in ₹),
  "repairCost": number (estimated repair cost in ₹),
  "sparePartCost": number (parts cost only in ₹),
  "repairDifficulty": "string (easy/simple/moderate/complex/expert)",
  "recycleValue": number (scrap value in ₹),
  "materialType": "string (aluminum/copper/steel/plastic/glass/lithium_battery/circuit_board/mixed_electronics/fabric/wood)",
  "materialWeight": number (estimated weight in kg),
  "marketDemand": number (0.3 to 1.0, where 1.0 is high demand),
  "brandPopularity": number (0.8 to 1.3, premium brands higher),
  "bestAction": "Sell | Repair | Recycle",
  "reason": "short explanation",
  "sustainabilityNote": "brief eco-friendly insight"
}

IMPORTANT:
- Do not include extra text outside JSON
- Be realistic with prices in Indian Rupees (₹)
- Consider brand value (Apple, Samsung, Sony command premiums)
- Factor in current market demand for used goods
- Estimate material composition for accurate scrap value
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

    // Normalize and validate fields with extended features
    const normalized = {
      // Basic product info
      productName: String(analysisResult.productName || "Unknown Product"),
      brand: String(analysisResult.brand || "Generic"),
      model: String(analysisResult.model || ""),
      category: String(analysisResult.category || "electronics").toLowerCase(),
      
      // Age and condition
      estimatedAge: String(analysisResult.estimatedAge || "Unknown"),
      ageInYears: Number(analysisResult.ageInYears) || 2,
      condition: String(analysisResult.condition || "used").toLowerCase(),
      conditionScore: Number(analysisResult.conditionScore) || 0.6,
      damageLevel: String(analysisResult.damageLevel || "none").toLowerCase(),
      scratchLevel: String(analysisResult.scratchLevel || "minor").toLowerCase(),
      missingParts: Boolean(analysisResult.missingParts),
      
      // Price values
      originalPrice: Number(analysisResult.originalPrice) || 10000,
      sellPrice: Number(analysisResult.sellPrice) || 0,
      repairCost: Number(analysisResult.repairCost) || 0,
      sparePartCost: Number(analysisResult.sparePartCost) || 0,
      repairDifficulty: String(analysisResult.repairDifficulty || "moderate").toLowerCase(),
      recycleValue: Number(analysisResult.recycleValue) || 0,
      
      // Material info
      materialType: String(analysisResult.materialType || "mixed_electronics").toLowerCase(),
      materialWeight: Number(analysisResult.materialWeight) || 1,
      
      // Market factors
      marketDemand: Number(analysisResult.marketDemand) || 0.7,
      brandPopularity: Number(analysisResult.brandPopularity) || 1.0,
      
      // Recommendation
      bestAction: String(analysisResult.bestAction || "Recycle"),
      reason: String(analysisResult.reason || ""),
      sustainabilityNote: String(analysisResult.sustainabilityNote || ""),
      
      // Meta
      aiSource: "gemini-enhanced",
      analysisVersion: "2.0"
    };

    return NextResponse.json(normalized, {
      status: 200,
      headers: {
        'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error("[analyze-product] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error", message: err.message },
      { status: 500 }
    );
  }
}
