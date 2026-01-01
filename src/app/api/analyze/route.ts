import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // ✅ 1. Parse request body safely
    const body = await req.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message (URL/text) is required" },
        { status: 400 }
      );
    }

    // ✅ 2. Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY missing");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // ✅ 3. Initialize Gemini
    const ai = new GoogleGenAI({ apiKey });

    const model = "gemini-3-flash-preview";

    // ✅ 4. Call Gemini
    const result = await ai.models.generateContent({
      model,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: "LOW" },
        systemInstruction: [
          {
            text:
              "You are a cybersecurity expert. " +
              "Analyze the given URL or text for security risks. " +
              "Return ONLY valid raw JSON (no markdown, no explanation) in this format:\n" +
              "{ \"classification\": \"SAFE | SUSPICIOUS | DANGEROUS\", \"risk_score\": number, \"reasons\": string[], \"recommendation\": \"string\" }"
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ]
    });

    // ✅ 5. Extract response text safely
    const responseText = result?.text;

    console.log("🧠 Raw AI Response:", responseText);

    if (!responseText) {
      throw new Error("Gemini returned an empty response");
    }

    // ✅ 6. Clean & parse JSON defensively
    const cleaned = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // ✅ 7. Validate expected shape (VERY IMPORTANT)
    if (
      typeof parsed !== "object" ||
      !parsed.classification ||
      typeof parsed.risk_score !== "number"
    ) {
      throw new Error("Invalid JSON structure returned by AI");
    }

    // ✅ 8. Always return proper JSON
    return NextResponse.json(parsed, { status: 200 });

  } catch (error: any) {
    console.error("🔥 Analyze API Error:", error);

    const statusCode = error?.status ?? 500;

    // Rate limit
    if (statusCode === 429) {
      return NextResponse.json(
        { error: "Rate limit reached. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        classification: "ERROR",
        risk_score: 100,
        reasons: [error?.message || "AI analysis failed"],
        recommendation: "Please try again later."
      },
      { status: statusCode }
    );
  }
}
