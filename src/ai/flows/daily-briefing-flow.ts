'use server';

/**
 * @fileOverview Generates a daily cybersecurity threat intelligence briefing.
 *
 * - getDailyBriefing - A function that returns a summary of current cyber threats.
 * - DailyBriefingOutput - The return type for the getDailyBriefing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyBriefingOutputSchema = z.object({
  briefing: z.string().describe('A markdown-formatted summary of the top 3-5 current cybersecurity threats.'),
});
export type DailyBriefingOutput = z.infer<typeof DailyBriefingOutputSchema>;


export async function getDailyBriefing(): Promise<DailyBriefingOutput> {
  return dailyBriefingFlow();
}

const dailyBriefingPrompt = ai.definePrompt({
  name: 'dailyBriefingPrompt',
  output: {schema: DailyBriefingOutputSchema},
  prompt: `You are SafeClick AI, a senior cybersecurity intelligence analyst.
  Your task is to provide a concise, easy-to-understand daily threat briefing for a non-technical audience.
  
  Generate a summary of the top 3-5 most relevant and recent cybersecurity threats, vulnerabilities, or active phishing campaigns.
  
  For each item, provide:
  - A simple, clear headline.
  - A one-sentence explanation of the threat.
  - A one-sentence recommendation for how a regular user can protect themselves.
  
  Format the entire output in Markdown. Use headings for each threat.
  
  Example Format:
  ### New 'FakeBrowserUpdate' Scam
  **Threat:** A widespread campaign is using deceptive pop-ups on websites telling users their browser is out of date to trick them into downloading malware.
  **Action:** Never download software directly from a pop-up. Always go to the official website for the software (e.g., chrome.google.com) to check for updates.
  
  ---
  
  ### Voicemail Phishing (Vishing) on the Rise
  **Threat:** Scammers are leaving urgent-sounding voicemails about your financial accounts, trying to get you to call back a fraudulent number and give up personal information.
  **Action:** If you get a suspicious voicemail from your bank, do not use the number in the message. Look up your bank's official number on their website and call that instead.
  `,
});

const dailyBriefingFlow = ai.defineFlow(
  {
    name: 'dailyBriefingFlow',
    outputSchema: DailyBriefingOutputSchema,
  },
  async () => {
    const {output} = await dailyBriefingPrompt();
    return output!;
  }
);
