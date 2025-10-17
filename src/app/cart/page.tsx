'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cartItems as initialCartItems } from '@/lib/data';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { CreditCard, Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '@/lib/types';

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(initialCartItems);

  const handleQuantityChange = (productId: string, amount: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.productId === productId) {
            const newQuantity = item.quantity + amount;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };
  
  const removeItem = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const serviceCharge = subtotal * 0.06;
  const total = subtotal + serviceCharge;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">Your Cart</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              {cart.length > 0 ? (
                <ul className="divide-y">
                  {cart.map((item) => {
                    const image = placeholderImages.find((p) => p.id.includes(item.productId));
                    return (
                      <li key={item.productId} className="flex items-center p-4">
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
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.productId, -1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-4 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.productId, 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="ml-4 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.productId)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                    <p>Your cart is empty.</p>
                </div>
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
                <span>₦{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge (6%)</span>
                <span>₦{serviceCharge.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₦{total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button className="w-full" disabled={cart.length === 0}>
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Checkout
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
