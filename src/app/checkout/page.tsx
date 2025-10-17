'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePaystackPayment } from 'react-paystack';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { CreditCard, Loader2 } from 'lucide-react';

// IMPORTANT: You must replace this with your actual Paystack public key
const PAYSTACK_PUBLIC_KEY = 'pk_test_821db0e7dee446a85dc46266e9be8999b3009a73'; // <--- REPLACE THIS

function CheckoutForm() {
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const amount = searchParams.get('amount');
  const amountInKobo = amount ? Math.round(parseFloat(amount) * 100) : 0;

  const config = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || 'guest@example.com',
    amount: amountInKobo,
    publicKey: PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference: any) => {
    // IMPORTANT: Here you would typically call a Firebase Cloud Function 
    // to verify the transaction reference with Paystack's API on the backend
    // and then create the order in Firestore.
    console.log('Payment successful. Reference:', reference);
    toast({
      title: "Payment Successful!",
      description: "Your order has been placed.",
    });
    // Redirect to a success page or dashboard, e.g., router.push('/dashboard/history');
  };

  const onClose = () => {
    console.log('Payment modal closed.');
    toast({
      variant: 'destructive',
      title: 'Payment Canceled',
      description: 'The payment process was not completed.',
    });
  };

  const handlePayment = () => {
    if (PAYSTACK_PUBLIC_KEY === 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx') {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'Please replace the placeholder Paystack public key.',
      });
      return;
    }
    initializePayment({onSuccess, onClose});
  };

  if (isUserLoading) {
    return <Loader2 className="mx-auto h-8 w-8 animate-spin" />;
  }
  
  if (!amount || amountInKobo <= 0) {
      return (
          <p className="text-center text-muted-foreground">Invalid checkout amount.</p>
      )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
        <CardDescription>Review your order and proceed with payment.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount to Pay</span>
            <span className="font-bold text-2xl">₦{amount}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            You will be redirected to Paystack to complete your payment securely.
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handlePayment}>
          <CreditCard className="mr-2 h-4 w-4" /> Pay with Paystack
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
