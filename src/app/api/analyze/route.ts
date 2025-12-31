import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    // Initialize with the new SDK
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Configuration from your snippet
    const config = {
      thinkingConfig: {
        thinkingLevel: 'HIGH', // Enables the deep reasoning you saw in AI Studio
      },
      systemInstruction: [
        {
          text: `You are a cybersecurity expert. Your job is to analyze URLs for potential risks.
          CRITICAL RULES:
          Return ONLY valid JSON.
          Do NOT include markdown formatting like \` \` \` json.
          Do NOT provide any explanations outside of the JSON object.
          FORMAT:
          {
            "classification": "SAFE | SUSPICIOUS | MALICIOUS",
            "risk_score": number,
            "reasons": string[],
            "recommendation": string
          }`
        }
      ],
      // Force JSON output to prevent parsing errors
      responseMimeType: "application/json" 
    };

    // Use the specific model from your snippet
    const model = 'gemini-3-pro-preview'; 

    const result = await ai.models.generateContent({
      model,
      config,
      contents: [{ role: 'user', parts: [{ text: message }] }],
    });

    // Parse and return the response
    const outputText = result.text;
    const parsedData = JSON.parse(outputText);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("🔥 Gemini API Error:", error);
    return NextResponse.json({
      classification: "ERROR",
      reasons: [error.message || "Failed to analyze URL"],
    }, { status: 500 });
  }
}
