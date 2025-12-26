'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-url-for-risk.ts';
import '@/ai/flows/daily-briefing-flow.ts';
import '@/ai/tools/decode-qr-code';
import '@/ai/flows/text-to-speech-flow';
