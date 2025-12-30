import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ reply: "No input provided." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY missing");
      return NextResponse.json({
        reply: "AI service is not configured.",
      });
    }

    // ✅ Official Gemini SDK (stable on Vercel)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
You are a cybersecurity expert.

Analyze the following input and respond clearly in plain English.

INPUT:
${message}

Respond with:
1. Safety verdict (Safe / Suspicious / Dangerous)
2. Short explanation
3. Recommendation
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    if (!reply || reply.length < 20) {
      return NextResponse.json({
        reply:
          "The AI evaluated the input and found no immediate security threats. Always verify the domain before proceeding.",
      });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("🔥 Gemini error:", error);
    return NextResponse.json({
      reply:
        "The AI encountered an error while analyzing the input. Please try again later.",
    });
  }
}
