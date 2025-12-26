'use server';

/**
 * @fileOverview A cybersecurity guidance chatbot that answers user questions related to cybersecurity.
 *
 * - `askCybersecurityQuestion` - A function that handles the process of asking a cybersecurity question and getting an answer.
 * - `CybersecurityQuestionInput` - The input type for the `askCybersecurityQuestion` function.
 * - `CybersecurityQuestionOutput` - The return type for the `askCybersecurityQuestion` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CybersecurityQuestionInputSchema = z.object({
  question: z.string().describe('The cybersecurity question the user wants to ask.'),
  urlAnalysisResult: z.string().optional().describe('The JSON string result of the previously analyzed URL, if any.'),
});
export type CybersecurityQuestionInput = z.infer<typeof CybersecurityQuestionInputSchema>;

const CybersecurityQuestionOutputSchema = z.object({
  answer: z.string().describe('The chatbot answer to the cybersecurity question.'),
});
export type CybersecurityQuestionOutput = z.infer<typeof CybersecurityQuestionOutputSchema>;

const provideUrlAnalysisTool = ai.defineTool({
  name: 'provideUrlAnalysis',
  description: 'Provides the URL analysis result if it is relevant to the question.',
  inputSchema: z.object({
    urlAnalysisResult: z.string().describe('The JSON string result of the previously analyzed URL.'),
  }),
  outputSchema: z.string(),
}, async (input) => {
  return input.urlAnalysisResult;
});

export async function askCybersecurityQuestion(input: CybersecurityQuestionInput): Promise<CybersecurityQuestionOutput> {
  return cybersecurityGuidanceChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cybersecurityGuidanceChatbotPrompt',
  input: {schema: CybersecurityQuestionInputSchema},
  output: {schema: CybersecurityQuestionOutputSchema},
  tools: [provideUrlAnalysisTool],
  prompt: `You are a cybersecurity expert chatbot designed to provide clear, beginner-friendly explanations to users.

  Answer the user's question to the best of your ability, but keep the response concise.

  If the user has provided a URL analysis result with their question, call the provideUrlAnalysis tool to get the context and use it to enrich your answer and offer context-aware assistance.

  Question: {{{question}}}`,
});

const cybersecurityGuidanceChatbotFlow = ai.defineFlow(
  {
    name: 'cybersecurityGuidanceChatbotFlow',
    inputSchema: CybersecurityQuestionInputSchema,
    outputSchema: CybersecurityQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
