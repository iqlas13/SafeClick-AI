'use server';

import { analyzeUrlForRisk, analyzeEmailForRisk, askQuestionAboutUrl, analyzeMessageForRisk } from '@/ai/flows/analyze-url-for-risk';
import { getDailyBriefing as getDailyBriefingFromAI } from '@/ai/flows/daily-briefing-flow';
import { textToSpeech as textToSpeechFromAI } from '@/ai/flows/text-to-speech-flow';
import type { AnalyzeUrlForRiskInput, AnalyzeEmailForRiskInput, AskQuestionAboutUrlInput, AnalyzeMessageForRiskInput } from '@/ai/flows/analyze-url-for-risk';
import type { UrlAnalysis, EmailAnalysis, MessageAnalysis, AnalysisClassification } from '@/app/types';

// Rule-based fallback keywords.
const suspiciousKeywords = ['login', 'verify', 'bank', 'secure', 'account', 'password', 'update', 'confirm', 'unusual', 'activity', 'support', 'invoice', 'urgent', 'prize', 'winner', 'claim'];

export async function analyzeUrl(
  input: AnalyzeUrlForRiskInput
): Promise<UrlAnalysis> {
  try {
    const result = await analyzeUrlForRisk(input);
    return {...result, url: input.url};
  } catch (error) {
    console.error('Gemini URL analysis failed, using fallback:', error);
    
    // Rule-based fallback
    const url = input.url.toLowerCase();
    let risk_score = 10;
    const reasons: string[] = ['AI analysis failed. Using a basic keyword and URL structure check.'];
    let classification: AnalysisClassification = 'GENUINE';

    const keywordFound = suspiciousKeywords.some(keyword => url.includes(keyword));

    if (keywordFound) {
      risk_score = 75;
      reasons.push('URL contains potentially suspicious keywords (e.g., login, bank, password).');
      classification = 'SUSPICIOUS';
    }

    if (url.length > 75) {
        risk_score = Math.min(100, risk_score + 15);
        reasons.push('URL is unusually long, which can be a tactic to hide the true domain.');
    }

    if (!url.startsWith('https://')) {
        risk_score = Math.min(100, risk_score + 20);
        reasons.push('Connection is not secure (uses HTTP instead of HTTPS).');
        classification = 'SUSPICIOUS';
    }
    
    if (/^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
      risk_score = Math.min(100, risk_score + 40);
      reasons.push('URL uses an IP address instead of a domain name, which is highly suspicious.');
      classification = 'SCAM';
    }

    if (risk_score > 70) classification = 'SCAM';
    else if (risk_score > 40) classification = 'SUSPICIOUS';
    else classification = 'GENUINE';

    return {
      classification,
      risk_score,
      reasons,
      recommendation:
        'AI analysis was unavailable. This result is based on a simplified, rule-based check. Please proceed with extreme caution and verify the source independently before clicking or providing any information.',
      url: input.url,
    };
  }
}

export async function analyzeEmail(
  input: AnalyzeEmailForRiskInput
): Promise<EmailAnalysis> {
  try {
    const result = await analyzeEmailForRisk(input);
    return result;
  } catch (error) {
    console.error('Gemini email analysis failed, using fallback:', error);
    
    const emailContent = input.emailContent.toLowerCase();
    let risk_score = 5;
    const reasons: string[] = ['AI analysis failed. Using a basic keyword check.'];
    let classification: AnalysisClassification = 'GENUINE';

    const keywordMatches = suspiciousKeywords.filter(keyword => emailContent.includes(keyword));

    if (keywordMatches.length > 0) {
      risk_score += keywordMatches.length * 15;
      reasons.push(`Email contains suspicious keywords: ${keywordMatches.join(', ')}.`);
    }

    if (emailContent.includes('urgent') || emailContent.includes('immediate action required')) {
      risk_score += 25;
      reasons.push('Email uses language of urgency, a common phishing tactic.');
    }
    
    risk_score = Math.min(100, risk_score);

    if (risk_score > 70) classification = 'SCAM';
    else if (risk_score > 40) classification = 'SUSPICIOUS';
    else classification = 'GENUINE';

    return {
      classification,
      risk_score,
      reasons,
      recommendation:
        'AI analysis was unavailable. This result is based on a simplified, rule-based check. Please proceed with extreme caution and do not click any links or provide personal information.',
    };
  }
}

export async function analyzeMessage(
  input: AnalyzeMessageForRiskInput
): Promise<MessageAnalysis> {
  try {
    const result = await analyzeMessageForRisk(input);
    return result;
  } catch (error) {
    console.error('Gemini message analysis failed, using fallback:', error);
    
    const messageContent = input.messageContent.toLowerCase();
    let risk_score = 10;
    const reasons: string[] = ['AI analysis failed. Using a basic keyword check.'];
    let classification: AnalysisClassification = 'GENUINE';

    const keywordMatches = suspiciousKeywords.filter(keyword => messageContent.includes(keyword));

    if (keywordMatches.length > 0) {
      risk_score += keywordMatches.length * 20;
      reasons.push(`Message contains suspicious keywords: ${keywordMatches.join(', ')}.`);
    }

    if (messageContent.includes('http://')) {
      risk_score += 20;
      reasons.push('Message contains a non-secure link (HTTP).');
    }
    
    risk_score = Math.min(100, risk_score);

    if (risk_score > 70) classification = 'SCAM';
    else if (risk_score > 40) classification = 'SUSPICIOUS';
    else classification = 'GENUINE';

    return {
      classification,
      risk_score,
      reasons,
      recommendation:
        'AI analysis was unavailable. This result is based on a simplified, rule-based check. Please proceed with extreme caution and do not click any links or provide personal information.',
    };
  }
}


export async function askQuestion(input: AskQuestionAboutUrlInput) {
  try {
    const result = await askQuestionAboutUrl(input);
    return result;
  } catch (error) {
    console.error('Chatbot request failed:', error);
    return {
      response: "I'm sorry, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
    };
  }
}

export async function getDailyBriefing() {
  try {
    const result = await getDailyBriefingFromAI();
    return result;
  } catch (error) {
    console.error('Daily briefing request failed:', error);
    return {
      briefing: "I'm sorry, but I was unable to retrieve the daily threat briefing. My intelligence sources might be temporarily unavailable. Please try again in a moment.",
    };
  }
}

export async function textToSpeech(text: string) {
  try {
    const result = await textToSpeechFromAI(text);
    return result;
  } catch (error) {
    console.error('Text-to-speech request failed:', error);
    return {
      media: null,
    };
  }
}
