
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2, Send } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CartItem, User, WithId } from '@/lib/types';
import { collection, doc, addDoc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

function CheckoutForm() {
  const router = useRouter();
  const { user, isUserLoading, areServicesAvailable } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [shippingAddress, setShippingAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cartItemsQuery = useMemoFirebase(
    () => (user && areServicesAvailable ? collection(firestore, `users/${user.uid}/cart_items`) : null),
    [user, firestore, areServicesAvailable]
  );
  const { data: cartItems, isLoading: isCartLoading } = useCollection<CartItem>(cartItemsQuery);

  useEffect(() => {
    if (user && areServicesAvailable) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          setShippingAddress(userData.shippingAddress || '');
        }
      });
    }
  }, [user, firestore, areServicesAvailable]);

  const handleSubmitOrder = async () => {
    if (!user || !cartItems || cartItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in and have items in your cart.',
      });
      return;
    }

    if (!shippingAddress.trim()) {
       toast({
        variant: 'destructive',
        title: 'Missing Address',
        description: 'Please provide a shipping address.',
      });
      return;
    }

    setIsLoading(true);

    const subTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const serviceCharge = subTotal * 0.06;
    const totalAmount = subTotal + serviceCharge; // Shipping is added later by admin

    try {
      // 1. Create the new order document
      const ordersRef = collection(firestore, `users/${user.uid}/orders`);
      await addDoc(ordersRef, {
        userId: user.uid,
        orderDate: new Date().toISOString(),
        status: 'Pending Admin Review',
        items: cartItems.map(({ id, userId, ...rest }) => rest), // pass full item data, remove firestore and user id
        shippingAddress: shippingAddress,
        subTotal: subTotal,
        serviceCharge: serviceCharge,
        totalAmount: totalAmount, // Initial total without shipping
        shippingFee: 0,
      });

      // 2. Clear the user's cart
      const batch = writeBatch(firestore);
      cartItems.forEach((item) => {
        const itemRef = doc(firestore, `users/${user.uid}/cart_items`, item.id);
        batch.delete(itemRef);
      });
      await batch.commit();

      toast({
        title: 'Order Submitted!',
        description: 'Your order has been sent for admin review.',
      });

      // 3. Redirect to purchase history
      router.push('/dashboard/history');

    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'There was an error submitting your order. Please try again.',
      });
      setIsLoading(false);
    }
  };
  
  if (isUserLoading || isCartLoading) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    )
  }
  
  if (!isUserLoading && !user) {
    // Gracefully handle no user, maybe show a message but don't block render.
     return (
          <p className="text-center text-muted-foreground">Create an account to checkout.</p>
      )
  }

  if (!cartItems || cartItems.length === 0) {
      return (
          <p className="text-center text-muted-foreground">Your cart is empty. Add items to checkout.</p>
      )
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Confirm Checkout</CardTitle>
        <CardDescription>
          Confirm your shipping address and submit your order for admin review. No payment is needed at this time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Shipping Address</Label>
            <Textarea
              id="shippingAddress"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your full shipping address"
              rows={4}
              disabled={isLoading}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            An admin will review your order and add a shipping fee. You will be notified to approve the final quote before payment.
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmitOrder} disabled={isLoading || !user}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Submitting...' : 'Submit Order for Review'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CheckoutPage() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12 flex items-center justify-center min-h-[60vh]">
           <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <CheckoutForm />
           </Suspense>
        </div>
    )
}
