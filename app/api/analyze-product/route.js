import { NextResponse } from "next/server";

const OPENAI_MODEL = "gpt-4o-mini";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function extractOutputText(payload) {
  const outputItems = Array.isArray(payload?.output) ? payload.output : [];
  const chunks = [];

  outputItems.forEach((item) => {
    const content = Array.isArray(item?.content) ? item.content : [];
    content.forEach((part) => {
      if (part?.type === "output_text" && part.text) {
        chunks.push(part.text);
      }
    });
  });

  return chunks.join("\n").trim();
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
      type: "input_text",
      text: `Product details:\n${description}`,
    });
  }

  if (hasImage) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/jpeg";
    const imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    content.push({
      type: "input_image",
      image_url: imageUrl,
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        instructions:
          "You are an expert product condition analyst. Analyze the product image and details. Return the best action and a short reason for the choice.",
        input: [
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
                reason: {
                  type: "string",
                },
              },
              required: ["action", "ecoScore", "reason"],
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
    const reason = String(result?.reason || "").trim();

    if (!allowedActions.has(action) || Number.isNaN(ecoScore) || !reason) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    return NextResponse.json({ action, ecoScore, reason });
  } catch (error) {
    console.error("[API] OpenAI request failed", error);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
  }
}
