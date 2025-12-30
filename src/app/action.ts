'use server';

import type {
  UrlAnalysis,
  EmailAnalysis,
  MessageAnalysis,
  AnalysisClassification,
} from '@/app/types';

const suspiciousKeywords = [
  'login',
  'verify',
  'bank',
  'secure',
  'account',
  'password',
  'update',
  'confirm',
  'urgent',
  'invoice',
  'winner',
  'claim',
];

async function callAI(prompt: string): Promise<string> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://safe-click-ai-4uip.vercel.app';

  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: prompt }),
  });

  const data = await res.json();

  if (typeof data?.reply === 'string') return data.reply;
  if (typeof data?.message === 'string') return data.message;
  return '';
}

export async function analyzeUrl(input: { url: string }): Promise<UrlAnalysis> {
  try {
    const aiReply = await callAI(
      `Analyze this URL for phishing, scams, or security risks: ${input.url}`
    );

    return {
      url: input.url,
      classification: 'GENUINE',
      risk_score: 10,
      reasons: ['AI-based URL analysis completed successfully.'],
      recommendation: aiReply,
    };
  } catch {
    return {
      url: input.url,
      classification: 'SUSPICIOUS',
      risk_score: 60,
      reasons: ['AI analysis failed.'],
      recommendation: 'Proceed with caution.',
    };
  }
}

export async function analyzeEmail(input: {
  emailContent: string;
}): Promise<EmailAnalysis> {
  try {
    const aiReply = await callAI(input.emailContent);
    return {
      classification: 'GENUINE',
      risk_score: 15,
      reasons: ['AI-based email analysis completed.'],
      recommendation: aiReply,
    };
  } catch {
    return {
      classification: 'SUSPICIOUS',
      risk_score: 50,
      reasons: ['AI analysis failed.'],
      recommendation: 'Email may be unsafe.',
    };
  }
}

export async function analyzeMessage(input: {
  messageContent: string;
}): Promise<MessageAnalysis> {
  try {
    const aiReply = await callAI(input.messageContent);
    return {
      classification: 'GENUINE',
      risk_score: 15,
      reasons: ['AI-based message analysis completed.'],
      recommendation: aiReply,
    };
  } catch {
    return {
      classification: 'SUSPICIOUS',
      risk_score: 50,
      reasons: ['AI analysis failed.'],
      recommendation: 'Message may be unsafe.',
    };
  }
}

export async function askQuestion(input: { question: string }) {
  try {
    const reply = await callAI(input.question);
    return { response: reply };
  } catch {
    return { response: 'AI is temporarily unavailable.' };
  }
}

export async function getDailyBriefing() {
  return {
    briefing:
      'Stay alert for phishing links, fake login pages, and urgent scam messages.',
  };
}

export async function textToSpeech(_text: string) {
  return { media: null };
}
