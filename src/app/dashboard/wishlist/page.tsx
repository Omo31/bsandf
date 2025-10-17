'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { recommendedProducts } from '@/lib/data';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import { ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Wishlist</h2>
          <p className="text-muted-foreground">
            Your favorite items, saved for later.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendedProducts.map((product) => {
          const image = placeholderImages.find((p) => p.id === product.imagePlaceholderId);
          return (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative">
                {image && (
                  <Image
                    src={image.imageUrl}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="object-cover w-full h-auto aspect-[4/3]"
                    data-ai-hint={image.imageHint}
                  />
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">₦{product.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter className="flex-col items-stretch space-y-2">
                <Button>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
                <Button variant="outline">
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
