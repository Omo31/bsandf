
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
import { Checkbox } from '@/components/ui/checkbox';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import type { HomePageSettings, Product, WithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomepageSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const settingsDocRef = useMemoFirebase(() => doc(firestore, 'settings', 'home_page'), [firestore]);
  const { data: settings, isLoading: isLoadingSettings } = useDoc<HomePageSettings>(settingsDocRef);
  
  const productsCollectionRef = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const { data: allProducts, isLoading: isLoadingProducts } = useCollection<Product>(productsCollectionRef);

  const [formData, setFormData] = useState<Partial<HomePageSettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        heroImageUrl: settings.heroImageUrl,
        featuredProductIds: settings.featuredProductIds || [],
      });
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleFeaturedProductChange = (productId: string, checked: boolean) => {
    setFormData(prev => {
        const currentFeatured = prev.featuredProductIds || [];
        if (checked) {
            return { ...prev, featuredProductIds: [...currentFeatured, productId] };
        } else {
            return { ...prev, featuredProductIds: currentFeatured.filter(id => id !== productId) };
        }
    });
  }

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await setDoc(settingsDocRef, formData, { merge: true });
      toast({
        title: 'Settings Saved',
        description: 'Your homepage settings have been updated.',
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

  const isLoading = isLoadingSettings || isLoadingProducts;

  if (isLoading) {
      return (
          <div className="flex-1 space-y-8">
             <Skeleton className="h-10 w-1/3" />
             <Skeleton className="h-6 w-2/3" />
             <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </CardContent>
                </Card>
             </div>
             <Skeleton className="h-10 w-32" />
          </div>
      )
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Homepage Settings</h2>
          <p className="text-muted-foreground">
            Control the content displayed on your store's main landing page.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>Customize the main banner on your home page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Hero Title</Label>
              <Input
                id="heroTitle"
                value={formData.heroTitle || ''}
                onChange={handleInputChange}
                placeholder="e.g., BeautifulSoup & Food"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <Textarea
                id="heroSubtitle"
                value={formData.heroSubtitle || ''}
                onChange={handleInputChange}
                placeholder="e.g., Fresh ingredients, unforgettable meals."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroImageUrl">Hero Image URL</Label>
              <Input
                id="heroImageUrl"
                value={formData.heroImageUrl || ''}
                onChange={handleInputChange}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Featured Products</CardTitle>
            <CardDescription>Select which products to showcase on the home page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {allProducts && allProducts.map((product) => (
              <div key={product.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                <Checkbox
                  id={`featured-${product.id}`}
                  checked={(formData.featuredProductIds || []).includes(product.id)}
                  onCheckedChange={(checked) => handleFeaturedProductChange(product.id, checked as boolean)}
                />
                <Label htmlFor={`featured-${product.id}`} className="font-medium flex-1 cursor-pointer">
                  {product.name}
                </Label>
              </div>
            ))}
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

    