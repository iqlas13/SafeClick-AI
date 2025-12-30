import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ REQUIRED: Gemini SDK works only on Node.js runtime
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          classification: "SUSPICIOUS",
          risk_score: 50,
          reasons: ["No valid input provided"],
          recommendation: "Provide a valid input for analysis.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY missing");
      return NextResponse.json(
        {
          classification: "SUSPICIOUS",
          risk_score: 60,
          reasons: ["AI service not configured"],
          recommendation: "Try again later.",
        },
        { status: 500 }
      );
    }

    // ✅ Correct SDK usage (NO gemini/ prefix, NO -latest suffix)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // ✅ Latest recommended stable model
    });

    const prompt = `
You are a cybersecurity expert.

Return ONLY valid JSON.
DO NOT include markdown or extra text.

FORMAT:
{
  "classification": "SAFE | SUSPICIOUS | MALICIOUS",
  "risk_score": number (0-100),
  "reasons": string[],
  "recommendation": string
}

INPUT:
${message}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("🔥 Gemini error:", error);

    // 🔒 Hard fallback (UI never breaks)
    return NextResponse.json({
      classification: "SUSPICIOUS",
      risk_score: 60,
      reasons: ["AI analysis failed or invalid response"],
      recommendation: "Proceed with caution and verify manually.",
    });
  }
}
