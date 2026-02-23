import { NextResponse } from "next/server";

const OPENAI_MODEL = "gpt-4o-mini";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function extractOutputText(payload) {
  return String(payload?.choices?.[0]?.message?.content || "").trim();
}

export async function POST(request) {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  console.log("[API] /api/analyze-product reached", { keyDetected: Boolean(apiKey) });
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (error) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const file = formData.get("image");
  const description = String(formData.get("description") || "").trim();
  const hasDescription = description.length > 0;
  const hasImage = file && typeof file.arrayBuffer === "function" && file.size > 0;

  if (!hasDescription && !hasImage) {
    return NextResponse.json({ error: "Missing product data." }, { status: 400 });
  }

  if (hasImage && file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image file is too large." }, { status: 400 });
  }

  const content = [];
  if (hasDescription) {
    content.push({
      type: "text",
      text: `Product details:\n${description}`,
    });
  }

  if (hasImage) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/jpeg";
    const imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    content.push({
      type: "image_url",
      image_url: { url: imageUrl },
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "You are an expert product condition analyst. Return strictly valid JSON only, no markdown and no extra text.",
          },
          {
            role: "user",
            content,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "product_analysis",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                action: {
                  type: "string",
                  enum: ["Sell", "Repair", "Recycle"],
                },
                ecoScore: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                },
                priceEstimate: {
                  type: "string",
                },
                reason: {
                  type: "string",
                },
              },
              required: ["action", "ecoScore", "priceEstimate", "reason"],
            },
            strict: true,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API] OpenAI response error", response.status, errorText);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const payload = await response.json();
    const outputText = extractOutputText(payload);
    if (!outputText) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    let result;
    try {
      result = JSON.parse(outputText);
    } catch (error) {
      console.error("[API] Invalid AI JSON", outputText);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const action = String(result?.action || "").trim();
    const allowedActions = new Set(["Sell", "Repair", "Recycle"]);
    const ecoScore = clamp(Number(result?.ecoScore), 0, 100);
    const priceEstimate = String(result?.priceEstimate || "").trim();
    const reason = String(result?.reason || "").trim();

    if (!allowedActions.has(action) || Number.isNaN(ecoScore) || !priceEstimate || !reason) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    return NextResponse.json({ action, ecoScore, priceEstimate, reason });
  } catch (error) {
    console.error("[API] OpenAI request failed", error);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
  }
}
