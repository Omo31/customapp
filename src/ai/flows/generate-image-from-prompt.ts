'use server';

/**
 * @fileOverview Generates an image from a text prompt using the Imagen 4 model.
 *
 * - generateImageFromPrompt - A function that generates an image from a prompt.
 * - GenerateImageFromPromptInput - The input type for the generateImageFromPrompt function.
 * - GenerateImageFromPromptOutput - The return type for the generateImageFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageFromPromptInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate an image from.'),
});
export type GenerateImageFromPromptInput = z.infer<
  typeof GenerateImageFromPromptInputSchema
>;

const GenerateImageFromPromptOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe('The generated image as a data URI (base64 encoded).'),
});
export type GenerateImageFromPromptOutput = z.infer<
  typeof GenerateImageFromPromptOutputSchema
>;

export async function generateImageFromPrompt(
  input: GenerateImageFromPromptInput
): Promise<GenerateImageFromPromptOutput> {
  return generateImageFromPromptFlow(input);
}

const generateImageFromPromptFlow = ai.defineFlow(
  {
    name: 'generateImageFromPromptFlow',
    inputSchema: GenerateImageFromPromptInputSchema,
    outputSchema: GenerateImageFromPromptOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: input.prompt,
    });

    if (!media) {
      throw new Error('No image was generated.');
    }

    return {imageUrl: media.url!};
  }
);
