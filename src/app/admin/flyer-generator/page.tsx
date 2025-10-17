'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Copy, Download } from 'lucide-react';
import {
  generateFlyerAndAd,
  GenerateFlyerAndAdOutput,
} from '@/ai/flows/generate-flyers-and-ads';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function FlyerGeneratorPage() {
  const [formData, setFormData] = useState({
    businessDescription: 'A local organic grocery store specializing in fresh produce, artisanal bread, and gourmet cheeses.',
    callToAction: 'Shop Now and Get 15% Off Your First Order!',
    websiteLink: 'https://www.beautifulsoup.food',
    targetAudience: 'Health-conscious families and foodies.',
    adCopyStyle: 'Energetic',
  });
  const [result, setResult] = useState<GenerateFlyerAndAdOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateFlyerAndAd(formData);
      setResult(response);
    } catch (error) {
      console.error('Error generating flyer:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'There was an error generating the ad. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Flyer & Ad Generator</h2>
          <p className="text-muted-foreground">
            Create marketing materials for your business in seconds.
          </p>
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Ad Details</CardTitle>
              <CardDescription>
                Provide the AI with details to generate your ad.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description</Label>
                <Textarea
                  id="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                  placeholder="e.g., A cozy cafe serving artisanal coffee..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callToAction">Call to Action</Label>
                <Input
                  id="callToAction"
                  value={formData.callToAction}
                  onChange={handleInputChange}
                  placeholder="e.g., Visit us today!"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteLink">Website Link</Label>
                <Input
                  id="websiteLink"
                  type="url"
                  value={formData.websiteLink}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    placeholder="e.g., Young professionals"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adCopyStyle">Ad Style</Label>
                  <Input
                    id="adCopyStyle"
                    value={formData.adCopyStyle}
                    onChange={handleInputChange}
                    placeholder="e.g., Professional, Humorous"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isLoading ? 'Generating...' : 'Generate Ad'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Generated Assets</CardTitle>
            <CardDescription>
              Your AI-generated flyer and ad copy will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading && (
              <div className="space-y-6">
                <Skeleton className="w-full h-64 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            )}
            {result && (
              <>
                <div>
                  <h3 className="font-semibold mb-2">Flyer Image</h3>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                    <Image
                      src={result.flyerImageUri}
                      alt="Generated Flyer"
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <a href={result.flyerImageUri} download="flyer.png">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Ad Copy</h3>
                  <div className="relative rounded-lg border bg-muted p-4">
                    <p className="text-sm">{result.adText}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => handleCopy(result.adText)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Analytics Link</h3>
                  <div className="relative rounded-lg border bg-muted p-4">
                    <p className="text-sm truncate">{result.analyticsLink}</p>
                     <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => handleCopy(result.analyticsLink)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
            {!result && !isLoading && (
                 <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full min-h-[300px] border-2 border-dashed rounded-lg p-4">
                    <Wand2 className="h-12 w-12 mb-4" />
                    <p className="font-semibold">Your ad will appear here</p>
                    <p className="text-sm">Fill out the form and click "Generate Ad"</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
