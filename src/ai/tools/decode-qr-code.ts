'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import jsqr from 'jsqr';
import { PNG } from 'pngjs';

const DecodeQrCodeInputSchema = z.object({
    photoDataUri: z.string().describe("A photo of a QR code, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

const DecodeQrCodeOutputSchema = z.object({
    decodedData: z.string().optional().describe('The data decoded from the QR code, if successful.'),
});

export const decodeQrCode = ai.defineTool(
  {
    name: 'decodeQrCode',
    description: 'Decodes a QR code from an image data URI and returns the contained data.',
    inputSchema: DecodeQrCodeInputSchema,
    outputSchema: DecodeQrCodeOutputSchema,
  },
  async ({ photoDataUri }) => {
    try {
      const { buffer, mimeType } = dataUriToBuffer(photoDataUri);

      let imageData: { data: Uint8ClampedArray; width: number; height: number; } | null = null;
      
      // We only support PNG for now as it's easier to decode without a full browser canvas environment
      if (mimeType === 'image/png') {
        const png = PNG.sync.read(buffer);
        imageData = {
            data: new Uint8ClampedArray(png.data),
            width: png.width,
            height: png.height,
        };
      } else {
        console.warn(`Unsupported image type for QR code decoding: ${mimeType}. Only PNG is supported on the server.`);
        return { decodedData: undefined };
      }

      if (imageData) {
        const code = jsqr(imageData.data, imageData.width, imageData.height);
        if (code) {
          return { decodedData: code.data };
        }
      }

      return { decodedData: undefined };
    } catch (error) {
      console.error('Error decoding QR code:', error);
      return { decodedData: undefined };
    }
  }
);


function dataUriToBuffer(dataUri: string): { buffer: Buffer; mimeType: string } {
    if (!dataUri.startsWith('data:')) {
        throw new Error('Invalid data URI format');
    }

    const mimeType = dataUri.substring(dataUri.indexOf(':') + 1, dataUri.indexOf(';'));
    const base64 = dataUri.substring(dataUri.indexOf(',') + 1);
    const buffer = Buffer.from(base64, 'base64');
    
    return { buffer, mimeType };
}
