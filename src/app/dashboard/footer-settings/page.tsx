
'use client';

import { useState, useEffect } from 'react';
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
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { FooterSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Copyright, Link, Youtube } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FooterSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const settingsDocRef = useMemoFirebase(() => doc(firestore, 'settings', 'footer_settings'), [firestore]);
  const { data: settings, isLoading: isLoadingSettings } = useDoc<FooterSettings>(settingsDocRef);
  
  const [formData, setFormData] = useState<Partial<FooterSettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await setDoc(settingsDocRef, formData, { merge: true });
      toast({
        title: 'Settings Saved',
        description: 'Your footer settings have been updated.',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingSettings;

  if (isLoading) {
      return (
          <div className="flex-1 space-y-8">
             <Skeleton className="h-10 w-1/3" />
             <Skeleton className="h-6 w-2/3" />
             <div className="space-y-8">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))}
             </div>
             <Skeleton className="h-10 w-32" />
          </div>
      )
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Footer Settings</h2>
          <p className="text-muted-foreground">
            Control the content displayed in your store's footer.
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Company Info & Tagline</CardTitle>
            <CardDescription>Basic information about your business.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                    id="tagline"
                    value={formData.tagline || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Delivering freshness and quality..."
                />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutUs">About Us</Label>
              <Textarea
                id="aboutUs"
                value={formData.aboutUs || ''}
                onChange={handleInputChange}
                placeholder="Write a short description about your company..."
              />
            </div>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>How customers can reach you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                placeholder="e.g., 123 Fresh Lane, Foodie City, 10101"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., contact@bsfood.com"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  type="tel"
                  value={formData.whatsappNumber || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 2348012345678"
                />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="openingHours">Opening Hours</Label>
              <Textarea
                id="openingHours"
                value={formData.openingHours || ''}
                onChange={handleInputChange}
                placeholder="e.g., Mon - Fri: 9am - 7pm"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follow Us On</CardTitle>
            <CardDescription>Links to your social media profiles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input id="facebookUrl" value={formData.facebookUrl || ''} onChange={handleInputChange} placeholder="https://facebook.com/yourpage" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input id="instagramUrl" value={formData.instagramUrl || ''} onChange={handleInputChange} placeholder="https://instagram.com/yourprofile" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube Channel URL</Label>
              <Input id="youtubeUrl" value={formData.youtubeUrl || ''} onChange={handleInputChange} placeholder="https://youtube.com/yourchannel" />
            </div>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Product Video</CardTitle>
            <CardDescription>Feature a specific YouTube video in the footer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="productVideoId">YouTube Video ID</Label>
            <Input id="productVideoId" value={formData.productVideoId || ''} onChange={handleInputChange} placeholder="e.g., dQw4w9WgXcQ" />
             <p className="text-sm text-muted-foreground">
                Paste only the ID from the YouTube URL. For example, if the URL is `https://www.youtube.com/watch?v=dQw4w9WgXcQ`, the ID is `dQw4w9WgXcQ`.
            </p>
          </CardContent>
        </Card>
      </div>
       <Button onClick={handleSaveChanges} disabled={isSaving}>
        {isSaving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save All Changes
      </Button>
    </div>
  );
}

    