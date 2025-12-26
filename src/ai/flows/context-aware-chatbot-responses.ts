'use server';

/**
 * @fileOverview Analyzes a URL for risk and provides a conversational chatbot interface.
 *
 * - analyzeUrlForRisk - A function that handles the URL analysis process.
 * - AnalyzeUrlForRiskInput - The input type for the analyzeUrlForRisk function.
 * - AnalyzeUrlForRiskOutput - The return type for the analyzeUrlForRisk function.
 * - askQuestionAboutUrl - A function that handles chatbot questions about a URL analysis.
 * - AskQuestionAboutUrlInput - The input type for the askQuestionAboutUrl function.
 * - AskQuestionAboutUrlOutput - The return type for the askQuestionAboutUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema for URL Analysis
const AnalyzeUrlForRiskInputSchema = z.object({
  url: z.string().url().describe('The URL to analyze.'),
});
export type AnalyzeUrlForRiskInput = z.infer<typeof AnalyzeUrlForRiskInputSchema>;

const AnalyzeUrlForRiskOutputSchema = z.object({
  classification: z
    .enum(['GENUINE', 'SUSPICIOUS', 'SCAM'])
    .describe('The classification of the URL.'),
  risk_score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('The risk score of the URL (0-100).'),
  reasons: z.array(z.string()).describe('The reasons for the classification.'),
  recommendation: z.string().describe('A recommendation for the user.'),
});
export type AnalyzeUrlForRiskOutput = z.infer<typeof AnalyzeUrlForRiskOutputSchema>;

// Schema for Chatbot
const AskQuestionAboutUrlInputSchema = z.object({
    question: z.string().describe("The user's question about cybersecurity."),
    previousUrlAnalysis: z.object({
        url: z.string(),
        classification: z.string(),
        risk_score: z.number(),
        reasons: z.array(z.string()),
        recommendation: z.string(),
    }).optional().describe("The analysis of the most recently analyzed URL, if any."),
});
export type AskQuestionAboutUrlInput = z.infer<typeof AskQuestionAboutUrlInputSchema>;

const AskQuestionAboutUrlOutputSchema = z.object({
  response: z.string().describe("The chatbot's response to the user's question."),
});
export type AskQuestionAboutUrlOutput = z.infer<typeof AskQuestionAboutUrlOutputSchema>;


// URL Analysis Implementation
export async function analyzeUrlForRisk(
  input: AnalyzeUrlForRiskInput
): Promise<AnalyzeUrlForRiskOutput> {
  return analyzeUrlForRiskFlow(input);
}

const analyzeUrlPrompt = ai.definePrompt({
  name: 'analyzeUrlForRiskPrompt',
  input: {schema: AnalyzeUrlForRiskInputSchema},
  output: {schema: AnalyzeUrlForRiskOutputSchema},
  prompt: `You are a cybersecurity expert analyzing URLs for risk.
  Analyze the following URL and classify it as GENUINE, SUSPICIOUS, or SCAM.
  Provide a risk score between 0 and 100.
  List the reasons for your classification.
  Provide a recommendation to the user.

  URL: {{{url}}}
  `,
});

const analyzeUrlForRiskFlow = ai.defineFlow(
  {
    name: 'analyzeUrlForRiskFlow',
    inputSchema: AnalyzeUrlForRiskInputSchema,
    outputSchema: AnalyzeUrlForRiskOutputSchema,
  },
  async input => {
    const {output} = await analyzeUrlPrompt(input);
    return output!;
  }
);


// Chatbot Implementation
export async function askQuestionAboutUrl(input: AskQuestionAboutUrlInput): Promise<AskQuestionAboutUrlOutput> {
  return askQuestionAboutUrlFlow(input);
}

const chatbotPrompt = ai.definePrompt({
    name: 'askQuestionAboutUrlPrompt',
    input: { schema: AskQuestionAboutUrlInputSchema },
    output: { schema: AskQuestionAboutUrlOutputSchema },
    prompt: `You are a cybersecurity expert answering user questions in simple, beginner-friendly terms.

    {{#if previousUrlAnalysis}}
    A URL was recently analyzed. Here is the information:
    URL: {{previousUrlAnalysis.url}}
    Classification: {{previousUrlAnalysis.classification}}
    Risk Score: {{previousUrlAnalysis.risk_score}}
    Reasons: {{#each previousUrlAnalysis.reasons}}- {{this}}\n{{/each}}
    Recommendation: {{previousUrlAnalysis.recommendation}}
    Use this information to provide context-aware answers.
    {{/if}}

    Question: {{{question}}}
    `,
});

const askQuestionAboutUrlFlow = ai.defineFlow(
  {
    name: 'askQuestionAboutUrlFlow',
    inputSchema: AskQuestionAboutUrlInputSchema,
    outputSchema: AskQuestionAboutUrlOutputSchema,
  },
  async (input) => {
    const { output } = await chatbotPrompt(input);
    return output!;
  }
);