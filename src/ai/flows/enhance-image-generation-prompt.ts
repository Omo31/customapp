// This file is the image prompt enhancer.
// It takes the user's initial prompt and enhances it to be more detailed and higher quality.
// It exports enhanceImagePrompt, EnhanceImagePromptInput, and EnhanceImagePromptOutput.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceImagePromptInputSchema = z.object({
  prompt: z.string().describe('The initial text prompt for image generation.'),
});
export type EnhanceImagePromptInput = z.infer<typeof EnhanceImagePromptInputSchema>;

const EnhanceImagePromptOutputSchema = z.object({
  enhancedPrompt: z.string().describe('The enhanced text prompt for image generation.'),
});
export type EnhanceImagePromptOutput = z.infer<typeof EnhanceImagePromptOutputSchema>;

export async function enhanceImagePrompt(input: EnhanceImagePromptInput): Promise<EnhanceImagePromptOutput> {
  return enhanceImagePromptFlow(input);
}

const enhancePrompt = ai.definePrompt({
  name: 'enhanceImagePromptPrompt',
  input: {schema: EnhanceImagePromptInputSchema},
  output: {schema: EnhanceImagePromptOutputSchema},
  prompt: `You are an expert prompt engineer. Your job is to take the user's initial prompt and enhance it to be more detailed and higher quality.  The enhanced prompt should include specific details about the scene, the characters, the environment, the lighting, and the style. Use your creativity to make the prompt as descriptive as possible.

Original Prompt: {{{prompt}}}`,
});

const enhanceImagePromptFlow = ai.defineFlow(
  {
    name: 'enhanceImagePromptFlow',
    inputSchema: EnhanceImagePromptInputSchema,
    outputSchema: EnhanceImagePromptOutputSchema,
  },
  async input => {
    const {output} = await enhancePrompt(input);
    return output!;
  }
);
