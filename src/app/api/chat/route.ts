import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse request body
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array required" },
        { status: 400 }
      );
    }

    // 2️⃣ Initialize Gemini Client
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    /** * ✅ CORRECTED SDK ACCESS:
     * In the new SDK, use ai.models.generateContent or ai.models.get()
     * For chat sessions, we prepare the history and send via generateContent 
     * or use the specific Chat methods if using the older library.
     */
    const modelId = "gemini-3-flash-preview";

    // 3️⃣ Map chat history to Gemini format (role: "user" | "model")
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const latestMessage = messages[messages.length - 1].content;

    // 4️⃣ Generate Content with thinking level support for Gemini 3
    const result = await ai.models.generateContent({
      model: modelId,
      contents: [
        ...history,
        { role: "user", parts: [{ text: latestMessage }] }
      ],
      config: {
        // System instructions move into the config object
        systemInstruction: `
          You are Aegis AI, a friendly and professional cybersecurity assistant.
          Rules:
          - Answer user questions directly and conversationally.
          - Explain concepts clearly (e.g., "What is Google?").
          - If the question is about cybersecurity, provide helpful insights.
          - Do NOT say things like "query is safe to process".
        `,
        // Gemini 3 exclusive thinking levels (low, medium, high)
        thinkingConfig: {
          thinkingLevel: "low", 
        },
        temperature: 0.4,
        maxOutputTokens: 500,
        responseMimeType: "text/plain",
      } as any
    });

    // 5️⃣ Return response text
    return NextResponse.json({
      text: result.text,
    });

  } catch (error: any) {
    console.error("❌ Chat API error:", error);
    
    // Handle specific status codes
    const status = error.status || 500;
    const message = error.status === 429 ? "Rate limit reached" : "Chat failed";

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}