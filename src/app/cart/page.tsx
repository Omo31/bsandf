
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { CreditCard, Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import type { CartItem, WithId } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';

function CartItemRow({ item }: { item: WithId<CartItem> }) {
  const firestore = useFirestore();
  const image = placeholderImages.find((p) => p.id.includes(item.productId));
  
  if (!firestore || !item.userId) return null; // Don't render if firestore or user is not available

  const itemRef = doc(firestore, `users/${item.userId}/cart_items`, item.id);

  const handleQuantityChange = (amount: number) => {
    const newQuantity = item.quantity + amount;
    if (newQuantity > 0) {
      updateDocumentNonBlocking(itemRef, { quantity: newQuantity });
    } else {
      deleteDocumentNonBlocking(itemRef);
    }
  };

  const removeItem = () => {
    deleteDocumentNonBlocking(itemRef);
  };

  return (
    <li className="flex items-center p-4">
      {image && (
        <Image
          src={image.imageUrl}
          alt={item.name}
          width={80}
          height={80}
          className="rounded-md object-cover mr-4"
          data-ai-hint={image.imageHint}
        />
      )}
      <div className="flex-grow">
        <p className="font-semibold">{item.name}</p>
        <p className="text-sm text-muted-foreground">₦{item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(-1)}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-4 text-center">{item.quantity}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(1)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button variant="ghost" size="icon" className="ml-4 text-muted-foreground hover:text-destructive" onClick={removeItem}>
        <Trash2 className="h-5 w-5" />
      </Button>
    </li>
  );
}


export default function CartPage() {
  const { user, isUserLoading, areServicesAvailable } = useUser();
  const firestore = useFirestore();
  
  const cartItemsQuery = useMemoFirebase(
    () => (user && areServicesAvailable ? collection(firestore, `users/${user.uid}/cart_items`) : null),
    [user, firestore, areServicesAvailable]
  );
  const { data: cart, isLoading: isCartLoading } = useCollection<CartItem>(cartItemsQuery);

  const subtotal = cart?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  const serviceCharge = subtotal * 0.06;
  const total = subtotal + serviceCharge;
  
  const isLoading = isUserLoading || isCartLoading;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">Your Cart</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              {isLoading && (
                <div className="p-4 space-y-4">
                  {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              )}
              {!isLoading && cart && cart.length > 0 ? (
                <ul className="divide-y">
                  {cart.map((item) => <CartItemRow key={item.id} item={item} />)}
                </ul>
              ) : (
                !isLoading && (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>Your cart is empty.</p>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{isLoading ? <Skeleton className="h-5 w-20" /> : `₦${subtotal.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge (6%)</span>
                <span>{isLoading ? <Skeleton className="h-5 w-16" /> : `₦${serviceCharge.toFixed(2)}`}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Estimated Total</span>
                <span>{isLoading ? <Skeleton className="h-6 w-24" /> : `₦${total.toFixed(2)}`}</span>
              </div>
               <p className="text-xs text-muted-foreground">Shipping fee will be calculated by an admin after you submit your order.</p>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button className="w-full" disabled={!cart || cart.length === 0 || isLoading} asChild>
                <Link href="/checkout">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Checkout
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
