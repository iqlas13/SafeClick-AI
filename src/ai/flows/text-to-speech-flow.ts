'use server';

/**
 * @fileOverview Converts text to speech using an AI model.
 * 
 * - textToSpeech - A function that takes text and returns audio data.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const TextToSpeechOutputSchema = z.object({
  media: z.string().nullable().describe("A base64 encoded WAV audio file as a data URI."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(text: string): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(text);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: z.string(),
    outputSchema: TextToSpeechOutputSchema,
  },
  async (query) => {
    if (!query.trim()) {
        return { media: null };
    }
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: query,
    });

    if (!media) {
      throw new Error('No audio media returned from the TTS model.');
    }
    
    // The model returns raw PCM data, we need to wrap it in a WAV container.
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavData = await toWav(audioBuffer);
    
    return {
      media: 'data:audio/wav;base64,' + wavData,
    };
  }
);

/**
 * Converts raw PCM audio data into a WAV formatted base64 string.
 * @param pcmData Buffer containing the raw PCM audio.
 * @param channels Number of audio channels.
 * @param rate Sample rate.
 * @param sampleWidth Bytes per sample.
 * @returns A promise that resolves to the base64 encoded WAV data.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000, // Gemini TTS model outputs at 24kHz
  sampleWidth = 2 // 16-bit audio
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
