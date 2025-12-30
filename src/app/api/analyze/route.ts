import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ REQUIRED: Gemini works only on Node.js runtime
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({
        classification: "SUSPICIOUS",
        risk_score: 50,
        reasons: ["No input provided"],
        recommendation: "Provide a valid input for analysis.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY missing");
      return NextResponse.json({
        classification: "SUSPICIOUS",
        risk_score: 60,
        reasons: ["AI service not configured"],
        recommendation: "Try again later.",
      });
    }

    // ✅ Official Gemini SDK (Node runtime)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
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
    const rawText = result.response.text()?.trim();

    if (!rawText) {
      throw new Error("Empty AI response");
    }

    // 🔐 Parse Gemini JSON safely
    const parsed = JSON.parse(rawText);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("🔥 Gemini error:", error);

    // 🔒 HARD FAILSAFE (UI NEVER BREAKS)
    return NextResponse.json({
      classification: "SUSPICIOUS",
      risk_score: 60,
      reasons: ["AI analysis failed or invalid response"],
      recommendation: "Proceed with caution and verify manually.",
    });
  }
}
