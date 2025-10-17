'use server';

/**
 * @fileOverview An AI agent for providing product recommendations based on user behavior and preferences.
 *
 * - provideAiProductRecommendations - A function that generates product recommendations.
 * - AiProductRecommendationsInput - The input type for the provideAiProductRecommendations function.
 * - AiProductRecommendationsOutput - The return type for the provideAiProductRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiProductRecommendationsInputSchema = z.object({
  userHistory: z.string().describe('The user purchase history and preferences.'),
  productCatalog: z.string().describe('A list of available products.'),
});
export type AiProductRecommendationsInput = z.infer<typeof AiProductRecommendationsInputSchema>;

const AiProductRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('A list of product recommendations based on user history and preferences.'),
});
export type AiProductRecommendationsOutput = z.infer<typeof AiProductRecommendationsOutputSchema>;

export async function provideAiProductRecommendations(input: AiProductRecommendationsInput): Promise<AiProductRecommendationsOutput> {
  return aiProductRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiProductRecommendationsPrompt',
  input: {schema: AiProductRecommendationsInputSchema},
  output: {schema: AiProductRecommendationsOutputSchema},
  prompt: `You are an expert recommendation system. Based on the user's past purchase history and preferences, provide a list of product recommendations from the available product catalog.

User History and Preferences:
{{userHistory}}

Product Catalog:
{{productCatalog}}

Recommendations:
`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const aiProductRecommendationsFlow = ai.defineFlow(
  {
    name: 'aiProductRecommendationsFlow',
    inputSchema: AiProductRecommendationsInputSchema,
    outputSchema: AiProductRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
