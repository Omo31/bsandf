'use server';
/**
 * @fileOverview AI-powered flyer and ad generation flow.
 *
 * - generateFlyerAndAd - A function to generate marketing flyers and ads using AI.
 * - GenerateFlyerAndAdInput - The input type for the generateFlyerAndAd function.
 * - GenerateFlyerAndAdOutput - The return type for the generateFlyerAndAd function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlyerAndAdInputSchema = z.object({
  businessDescription: z
    .string()
    .describe('A description of the business, including products or services offered.'),
  callToAction: z.string().describe('The call to action for the flyer or ad (e.g., Visit our website, Call us today).'),
  websiteLink: z.string().describe('The website link to include in the flyer or ad.'),
  targetAudience: z.string().describe('The target audience for the flyer or ad.'),
  adCopyStyle: z
    .string()
    .describe(
      'The desired style of the ad copy (e.g., professional, humorous, energetic). Give a one-word description.'
    ),
});
export type GenerateFlyerAndAdInput = z.infer<typeof GenerateFlyerAndAdInputSchema>;

const GenerateFlyerAndAdOutputSchema = z.object({
  adText: z.string().describe('The generated ad copy.'),
  flyerImageUri: z.string().describe('The data URI of the generated flyer image.'),
  analyticsLink: z.string().describe('A link to track traffic from the ad or flyer.'),
});
export type GenerateFlyerAndAdOutput = z.infer<typeof GenerateFlyerAndAdOutputSchema>;

export async function generateFlyerAndAd(input: GenerateFlyerAndAdInput): Promise<GenerateFlyerAndAdOutput> {
  return generateFlyerAndAdFlow(input);
}

const generateAdTextPrompt = ai.definePrompt({
  name: 'generateAdTextPrompt',
  input: {schema: GenerateFlyerAndAdInputSchema},
  output: {schema: z.object({adText: z.string()})},
  prompt: `You are an expert marketing copywriter. Generate compelling ad copy for the following business, with a tone that is {{adCopyStyle}}.

Business Description: {{{businessDescription}}}
Call to Action: {{{callToAction}}}
Website Link: {{{websiteLink}}}
Target Audience: {{{targetAudience}}}

Ad Copy:`,
});

const generateFlyerImagePrompt = ai.definePrompt({
  name: 'generateFlyerImagePrompt',
  input: {
    schema: z.object({
      businessDescription: z.string(),
      adText: z.string(),
    }),
  },
  output: {schema: z.object({flyerImageUri: z.string()})},
  prompt: `Generate a visually appealing flyer image based on the following business description and ad text.

Business Description: {{{businessDescription}}}
Ad Text: {{{adText}}}

Flyer Image Description: Create an image that is beautiful, eye catching, and modern. Make sure it is relevant to the business description and ad text. Do not include any actual text in the image.

Image: {{ media }}`,
});

const generateFlyerAndAdFlow = ai.defineFlow(
  {
    name: 'generateFlyerAndAdFlow',
    inputSchema: GenerateFlyerAndAdInputSchema,
    outputSchema: GenerateFlyerAndAdOutputSchema,
  },
  async input => {
    const {output: adTextOutput} = await generateAdTextPrompt(input);
    const adText = adTextOutput!.adText;

    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a visually appealing flyer image based on the following business description and ad text.\n\nBusiness Description: ${input.businessDescription}\nAd Text: ${adText}\n\nFlyer Image Description: Create an image that is beautiful, eye catching, and modern. Make sure it is relevant to the business description and ad text. Do not include any actual text in the image.`,    
    });

    // Dummy analytics link - replace with actual implementation
    const analyticsLink = `https://example.com/analytics?ad=${encodeURIComponent(adText)}`;

    return {
      adText: adText,
      flyerImageUri: media.url,
      analyticsLink: analyticsLink,
    };
  }
);
