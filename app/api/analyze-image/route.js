import { NextResponse } from "next/server";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function computeMetricsFromBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  const sampleSize = Math.min(bytes.length, 2048);
  if (!sampleSize) {
    return {
      brightness: 0.1,
      sharpness: 0.1,
      contrast: 0.1,
      edgeDensity: 0.1,
      damageScore: 80,
    };
  }

  let sum = 0;
  for (let i = 0; i < sampleSize; i += 1) {
    sum += bytes[i];
  }
  const mean = sum / sampleSize;

  let varianceSum = 0;
  for (let i = 0; i < sampleSize; i += 1) {
    const diff = bytes[i] - mean;
    varianceSum += diff * diff;
  }
  const variance = varianceSum / sampleSize;

  const brightness = clamp(mean / 255, 0.1, 0.95);
  const contrast = clamp(Math.sqrt(variance) / 255, 0.1, 0.95);
  const sharpness = clamp(contrast + (bytes.length % 97) / 400, 0.1, 0.95);
  const edgeDensity = clamp((contrast + brightness) / 2, 0.1, 0.95);
  const damageScore = clamp(Math.round((1 - sharpness) * 100), 5, 95);

  return { brightness, sharpness, contrast, edgeDensity, damageScore };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "No image file received." }, { status: 400 });
    }

    if (!file.size) {
      return NextResponse.json({ error: "Image file is empty." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    console.log("[API] Received image", {
      name: file.name,
      type: file.type,
      size: file.size,
      bufferSize: buffer.byteLength,
    });

    const features = computeMetricsFromBuffer(buffer);

    return NextResponse.json({ ok: true, features });
  } catch (error) {
    console.error("[API] Image analysis error", error);
    return NextResponse.json(
      { error: "Unable to analyze this image. Please try a clearer photo." },
      { status: 500 }
    );
  }
}
