
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ProductCard } from '@/components/shop/product-card';
import { placeholderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';
import { useUser, useCollection, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { Product, WithId, HomePageSettings } from '@/lib/types';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useMemo } from 'react';

export default function Home() {
  const flyerImage = placeholderImages.find(p => p.id === 'flyer-1');
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Fetch homepage settings only when firestore is available
  const settingsDocRef = useMemoFirebase(() => (firestore ? doc(firestore, 'settings', 'home_page') : null), [firestore]);
  const { data: settings, isLoading: isLoadingSettings } = useDoc<HomePageSettings>(settingsDocRef);
  
  // Fetch all products only when firestore is available
  const productsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'products') : null), [firestore]);
  const { data: allProducts, isLoading: areProductsLoading } = useCollection<Product>(productsQuery);

  // Determine featured products
  const featuredProducts = useMemo(() => {
    if (!settings || !settings.featuredProductIds || !allProducts) {
      // Fallback to first 8 products if no settings
      return allProducts?.slice(0, 8);
    }
    return allProducts.filter(p => settings.featuredProductIds.includes(p.id));
  }, [settings, allProducts]);

  const defaultHero = {
    title: "BeautifulSoup & Food",
    subtitle: "Fresh ingredients, unforgettable meals. Explore our shop or create a custom order.",
    imageUrl: placeholderImages.find(p => p.id === 'hero-1')?.imageUrl
  }

  const heroTitle = !isLoadingSettings && settings?.heroTitle ? settings.heroTitle : defaultHero.title;
  const heroSubtitle = !isLoadingSettings && settings?.heroSubtitle ? settings.heroSubtitle : defaultHero.subtitle;
  const heroImageUrl = !isLoadingSettings && settings?.heroImageUrl ? settings.heroImageUrl : defaultHero.imageUrl;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[80vh] bg-primary/10">
          {isLoadingSettings && <Skeleton className="absolute inset-0" />}
          {heroImageUrl && (
             <Image
                src={heroImageUrl}
                alt="Hero image"
                fill
                className="object-cover"
                priority
              />
          )}
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative container mx-auto px-4 md:px-6 h-full flex flex-col items-center justify-center text-center text-primary-foreground">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline animate-fade-in-down">
              {heroTitle}
            </h1>
            <p className="mt-4 max-w-[700px] text-lg md:text-xl animate-fade-in-up">
              {heroSubtitle}
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row animate-fade-in-up">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="#shop">Shop Now</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/custom-order">Custom Order</Link>
              </Button>
            </div>
          </div>
        </section>

        {user && (
          <section id="flyer" className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container mx-auto px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">AI-Generated Ad</div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">This Week's Special Offer</h2>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                      Discover our latest promotion, crafted just for you by our AI. Don't miss out on these exclusive deals, available for a limited time only!
                    </p>
                  </div>
                  <Button asChild className="self-start">
                    <Link href="/admin/flyer-generator">
                      Generate Your Own Ad
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-0">
                    {flyerImage ? (
                      <Image
                        src={flyerImage.imageUrl}
                        alt={flyerImage.description}
                        width={600}
                        height={400}
                        className="object-cover w-full h-auto aspect-[3/2]"
                        data-ai-hint={flyerImage.imageHint}
                      />
                    ) : (
                       <div className="w-full aspect-[3/2] bg-muted animate-pulse" />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}


        <section id="shop" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl font-headline mb-12">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {areProductsLoading && [...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="w-full aspect-[4/3]" />
                  </CardContent>
                  <CardFooter className="p-4 flex-col items-start space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between items-center w-full pt-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
              {featuredProducts && featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
