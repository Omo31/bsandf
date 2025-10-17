'use server';

/**
 * @fileOverview An AI-enhanced search flow that understands user intent to provide more relevant search results.
 *
 * - aiEnhancedSearch - A function that takes a search query and returns relevant product recommendations.
 * - AiEnhancedSearchInput - The input type for the aiEnhancedSearch function.
 * - AiEnhancedSearchOutput - The return type for the aiEnhancedSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiEnhancedSearchInputSchema = z.object({
  query: z.string().describe('The user search query.'),
});
export type AiEnhancedSearchInput = z.infer<typeof AiEnhancedSearchInputSchema>;

const AiEnhancedSearchOutputSchema = z.object({
  relevantProducts: z
    .array(z.string())
    .describe('A list of relevant product names based on the search query.'),
  refinedQuery: z.string().describe('A refined version of the original query.'),
});
export type AiEnhancedSearchOutput = z.infer<typeof AiEnhancedSearchOutputSchema>;

export async function aiEnhancedSearch(input: AiEnhancedSearchInput): Promise<AiEnhancedSearchOutput> {
  return aiEnhancedSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiEnhancedSearchPrompt',
  input: {schema: AiEnhancedSearchInputSchema},
  output: {schema: AiEnhancedSearchOutputSchema},
  prompt: `You are an AI-powered search assistant designed to understand user intent and provide relevant product recommendations.

  The user has entered the following search query: {{{query}}}

  Based on the query, identify a list of relevant product names and provide a refined version of the original query that captures the user's intent more accurately.

  Ensure that the product names are specific and descriptive.
  Respond in JSON format.
  `,
});

const aiEnhancedSearchFlow = ai.defineFlow(
  {
    name: 'aiEnhancedSearchFlow',
    inputSchema: AiEnhancedSearchInputSchema,
    outputSchema: AiEnhancedSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
