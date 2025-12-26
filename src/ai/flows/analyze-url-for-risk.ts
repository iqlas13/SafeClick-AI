'use server';

/**
 * @fileOverview Analyzes a URL, email, or message for risk and provides a conversational chatbot interface.
 *
 * - analyzeUrlForRisk - A function that handles the URL analysis process.
 * - AnalyzeUrlForRiskInput - The input type for the analyzeUrlForRisk function.
 * - AnalyzeUrlForRiskOutput - The return type for the analyzeUrlForRisk function.
 * - analyzeEmailForRisk - A function that handles the email analysis process.
 * - AnalyzeEmailForRiskInput - The input type for the analyzeEmailForRisk function.
 * - AnalyzeEmailForRiskOutput - The return type for the analyzeEmailForRisk function.
 * - analyzeMessageForRisk - A function that handles the message analysis process.
 * - AnalyzeMessageForRiskInput - The input type for the analyzeMessageForRisk function.
 * - AnalyzeMessageForRiskOutput - The return type for the analyzeMessageForRisk function.
 * - askQuestionAboutUrl - A function that handles chatbot questions about a URL analysis.
 * - AskQuestionAboutUrlInput - The input type for the askQuestionAboutUrl function.
 * - AskQuestionAboutUrlOutput - The return type for the askQuestionAboutUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { decodeQrCode } from '../tools/decode-qr-code';

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

// Schema for Email Analysis
const AnalyzeEmailForRiskInputSchema = z.object({
  emailContent: z.string().describe('The full content of the email to analyze.'),
});
export type AnalyzeEmailForRiskInput = z.infer<typeof AnalyzeEmailForRiskInputSchema>;

const AnalyzeEmailForRiskOutputSchema = z.object({
  classification: z
    .enum(['GENUINE', 'SUSPICIOUS', 'SCAM'])
    .describe('The classification of the email.'),
  risk_score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('The risk score of the email (0-100).'),
  reasons: z.array(z.string()).describe('The reasons for the classification.'),
  recommendation: z.string().describe('A recommendation for the user.'),
});
export type AnalyzeEmailForRiskOutput = z.infer<typeof AnalyzeEmailForRiskOutputSchema>;

// Schema for Message Analysis
const AnalyzeMessageForRiskInputSchema = z.object({
    messageContent: z.string().describe('The content of the text message to analyze.'),
});
export type AnalyzeMessageForRiskInput = z.infer<typeof AnalyzeMessageForRiskInputSchema>;

const AnalyzeMessageForRiskOutputSchema = z.object({
    classification: z
        .enum(['GENUINE', 'SUSPICIOUS', 'SCAM'])
        .describe('The classification of the message.'),
    risk_score: z
        .number()
        .int()
        .min(0)
        .max(100)
        .describe('The risk score of the message (0-100).'),
    reasons: z.array(z.string()).describe('The reasons for the classification.'),
    recommendation: z.string().describe('A recommendation for the user.'),
});
export type AnalyzeMessageForRiskOutput = z.infer<typeof AnalyzeMessageForRiskOutputSchema>;


// Schema for Chatbot
const AskQuestionAboutUrlInputSchema = z.object({
  question: z.string().describe("The user's question about cybersecurity."),
  previousUrlAnalysis: z
    .object({
      url: z.string(),
      classification: z.string(),
      risk_score: z.number(),
      reasons: z.array(z.string()),
      recommendation: z.string(),
    })
    .optional()
    .describe('The analysis of the most recently analyzed URL, if any.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AskQuestionAboutUrlInput = z.infer<typeof AskQuestionAboutUrlInputSchema>;

const AskQuestionAboutUrlOutputSchema = z.object({
  response: z.string().describe("The chatbot's response to the user's question."),
});
export type AskQuestionAboutUrlOutput = z.infer<typeof AskQuestionAboutUrlOutputSchema>;


// URL Analysis Implementation
const analyzeUrlTool = ai.defineTool(
    {
        name: 'analyzeUrlForRisk',
        description: 'Analyzes a URL for security risks and classifies it.',
        inputSchema: AnalyzeUrlForRiskInputSchema,
        outputSchema: AnalyzeUrlForRiskOutputSchema,
    },
    async (input) => await analyzeUrlForRiskFlow(input)
);


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

// Email Analysis Implementation
export async function analyzeEmailForRisk(
  input: AnalyzeEmailForRiskInput
): Promise<AnalyzeEmailForRiskOutput> {
  return analyzeEmailForRiskFlow(input);
}

const analyzeEmailPrompt = ai.definePrompt({
  name: 'analyzeEmailForRiskPrompt',
  input: {schema: AnalyzeEmailForRiskInputSchema},
  output: {schema: AnalyzeEmailForRiskOutputSchema},
  prompt: `You are a cybersecurity expert specializing in phishing detection.
  Analyze the content of the following email. Look for common phishing indicators such as:
  - Urgent or threatening language
  - Requests for sensitive information (passwords, social security numbers, etc.)
  - Suspicious links or attachments
  - Generic greetings (e.g., "Dear Customer")
  - Grammatical errors and typos
  - Mismatched sender email addresses.

  Based on your analysis, classify the email as GENUINE, SUSPICIOUS, or SCAM.
  Provide a risk score between 0 and 100.
  List the specific reasons for your classification.
  Provide a clear recommendation to the user on how to proceed.

  Email Content:
  {{{emailContent}}}
  `,
});

const analyzeEmailForRiskFlow = ai.defineFlow(
  {
    name: 'analyzeEmailForRiskFlow',
    inputSchema: AnalyzeEmailForRiskInputSchema,
    outputSchema: AnalyzeEmailForRiskOutputSchema,
  },
  async input => {
    const {output} = await analyzeEmailPrompt(input);
    return output!;
  }
);

// Message Analysis Implementation
export async function analyzeMessageForRisk(
    input: AnalyzeMessageForRiskInput
): Promise<AnalyzeMessageForRiskOutput> {
    return analyzeMessageForRiskFlow(input);
}

const analyzeMessagePrompt = ai.definePrompt({
    name: 'analyzeMessageForRiskPrompt',
    input: { schema: AnalyzeMessageForRiskInputSchema },
    output: { schema: AnalyzeMessageForRiskOutputSchema },
    prompt: `You are a cybersecurity expert specializing in "smishing" (SMS phishing) and social media scam detection.
    Analyze the content of the following short message. Look for common scam indicators such as:
    - Unexpected alerts about package deliveries, account problems, or prize winnings.
    - Urgent calls to action (e.g., "click here immediately").
    - Use of shortened, unfamiliar, or suspicious-looking links.
    - Requests to reply with personal information.
    - Vague sender identification.
    - Unusual grammar, spelling, or capitalization.

    Based on your analysis, classify the message as GENUINE, SUSPICIOUS, or SCAM.
    Provide a risk score between 0 and 100.
    List the specific reasons for your classification.
    Provide a clear recommendation to the user (e.g., "Do not click the link and delete this message.").

    Message Content:
    {{{messageContent}}}
    `,
});

const analyzeMessageForRiskFlow = ai.defineFlow(
    {
        name: 'analyzeMessageForRiskFlow',
        inputSchema: AnalyzeMessageForRiskInputSchema,
        outputSchema: AnalyzeMessageForRiskOutputSchema,
    },
    async (input) => {
        const { output } = await analyzeMessagePrompt(input);
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
    tools: [decodeQrCode, analyzeUrlTool],
    prompt: `You are SafeClick AI, a helpful, beginner-friendly cybersecurity assistant.

    Your Primary Capabilities:
    1.  **QR Code Analysis**: If an image is uploaded and you determine it is a QR code, you MUST use the \`decodeQrCode\` tool to extract the data.
        - If the decoded data is a URL, you MUST then immediately use the \`analyzeUrlForRisk\` tool to assess its security.
        - After analysis, you MUST summarize the findings for the user: state what the QR code was, what URL it contained, the risk analysis result, and your final recommendation.
        - If decoding fails, inform the user that you couldn't read the QR code and ask for a clearer image.

    2.  **Visual Threat Detection**: If an image is uploaded that is NOT a QR code (e.g., a screenshot of a message or email), you are in VISUAL THREAT DETECTOR mode.
        - Analyze the image for signs of phishing, scams, or malware (e.g., deceptive links, urgent language, requests for info, bad grammar).
        - Provide a clear, step-by-step analysis and a final recommendation. Start by stating you are analyzing the screenshot.

    3.  **Context-Aware URL Questions**: If a URL was recently analyzed (provided in \`previousUrlAnalysis\`), use that context to answer follow-up questions about it.

    4.  **General Cybersecurity Assistance**: If no image or previous analysis is provided, answer the user's general cybersecurity question concisely and clearly.

    Interaction Flow:
    - Analyze the user's request and the provided inputs (image, question, previous analysis).
    - Decide which capability to use based on the rules above.
    - If a tool is needed (like \`decodeQrCode\` or \`analyzeUrlForRisk\`), call it.
    - Formulate a response based on the tool's output or your general knowledge.

    User Input:
    - Question: {{{question}}}
    {{#if photoDataUri}}- Photo provided: {{media url=photoDataUri}}{{/if}}
    {{#if previousUrlAnalysis}}
    - Context from previous URL analysis:
        - URL: {{previousUrlAnalysis.url}}
        - Classification: {{previousUrlAnalysis.classification}}
        - Risk Score: {{previousUrlAnalysis.risk_score}}
    {{/if}}
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
