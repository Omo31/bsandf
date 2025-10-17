'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import { Github, Chrome, Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase';
import {
  initiateGoogleSignIn,
} from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { setDoc, doc, getDoc, updateProfile } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Checkbox } from '@/components/ui/checkbox';
import { sendPasswordResetEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface UserAuthFormProps {
  formType: 'login' | 'signup';
}

export function UserAuthForm({ formType }: UserAuthFormProps) {
  const isLogin = formType === 'login';
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);


  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleNameChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(capitalizeFirstLetter(e.target.value));
  };

  const handleAuthError = (error: FirebaseError) => {
    let title = 'An error occurred';
    let description = 'Please try again.';

    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        title = 'Invalid Credentials';
        description = 'The email or password you entered is incorrect.';
        break;
      case 'auth/email-already-in-use':
        title = 'Email Already Exists';
        description = 'An account with this email address already exists. Please login instead.';
        break;
      case 'auth/weak-password':
        title = 'Weak Password';
        description = 'Your password must be at least 6 characters long.';
        break;
      case 'auth/invalid-email':
        title = 'Invalid Email';
        description = 'Please enter a valid email address.';
        break;
      case 'auth/popup-closed-by-user':
        title = 'Sign-in Canceled';
        description = 'The Google Sign-in popup was closed before completion.';
        break;
      case 'auth/account-exists-with-different-credential':
        title = 'Account Exists';
        description = 'An account already exists with the same email address but different sign-in credentials.';
        break;
    }
    toast({ variant: 'destructive', title, description });
  };
  
  const handleTraditionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        if (isLogin) {
            if (!email || !password) {
                toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please enter both email and password.' });
                setIsLoading(false);
                return;
            }
            await signInWithEmailAndPassword(auth, email, password);

        } else { // Signup logic
            if (!email || !password || !firstName || !lastName || !agreedToTerms) {
                 toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out all required fields and agree to the terms.' });
                 setIsLoading(false);
                 return;
            }
            // 1. Create the user in Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Set their display name in Auth
            await updateProfile(user, {
                displayName: `${firstName} ${lastName}`
            });

            // 3. Manually save additional info to Firestore. 
            // The Cloud Function will handle the core user document creation.
            const userDocRef = doc(firestore, "users", user.uid);
            await setDoc(userDocRef, {
                shippingAddress: shippingAddress,
                phoneNumber: phoneNumber ? `+234${phoneNumber}` : ''
            }, { merge: true });
        }
        
        toast({
            title: isLogin ? 'Login Successful' : 'Account Created',
            description: isLogin ? 'Welcome back!' : 'Redirecting to your dashboard...',
        });
        router.push('/dashboard');
        
    } catch (error) {
        if (error instanceof FirebaseError) {
            handleAuthError(error);
        } else {
            toast({ variant: 'destructive', title: 'An unexpected error occurred', description: (error as Error).message });
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address to reset your password.',
      });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Password Reset Email Sent',
        description: `If an account exists for ${email}, you will receive an email with instructions to reset your password.`,
      });
    } catch (error) {
      // We generally don't want to reveal if an email exists or not for security reasons.
      // So we show a generic message even on error.
      toast({
        title: 'Password Reset Email Sent',
        description: `If an account exists for ${email}, you will receive an email with instructions to reset your password.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const userCredential = await initiateGoogleSignIn(auth);
      const user = userCredential.user;
       // The onUserCreate function will handle creating the Firestore doc.
       // No need to write to Firestore from the client on Google sign-in.
      toast({
        title: 'Google Sign-In Successful',
        description: 'Welcome! Redirecting to your dashboard...',
      });
      router.push('/dashboard');
    } catch (error) {
       if (error instanceof FirebaseError) {
            handleAuthError(error);
        } else {
            toast({ variant: 'destructive', title: 'An unexpected error occurred', description: (error as Error).message });
        }
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleTraditionalSubmit}>
        <CardHeader className="text-center">
          <Link href="/" className="flex justify-center items-center space-x-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">BeautifulSoup&Food</span>
          </Link>
          <CardTitle className="text-2xl">{isLogin ? 'Welcome back' : 'Create an account'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Enter your email to sign in to your account' : 'Enter your details below to create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!isLogin && (
            <>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" value={firstName} onChange={handleNameChange(setFirstName)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" value={lastName} onChange={handleNameChange(setLastName)} required />
                    </div>
                </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isGoogleLoading}
              required
            />
          </div>

           {!isLogin && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="shippingAddress">Shipping Address (Optional)</Label>
                <Input id="shippingAddress" placeholder="123 Foodie Lane" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-muted-foreground sm:text-sm">+234</span>
                    </div>
                    <Input id="phoneNumber" type="tel" placeholder="801 234 5678" className="pl-14" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>
            </>
          )}

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                    <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={handleForgotPassword}>
                        Forgot password?
                    </Button>
                )}
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || isGoogleLoading}
              required
            />
          </div>

          {!isLogin && (
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} />
              <Label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{' '}
                <Link href="/terms" className="underline hover:text-primary">
                  Terms and Conditions
                </Link>
              </Label>
            </div>
          )}
           
           <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <Button variant="outline" type="button" disabled={true}>
              <Github className="mr-2 h-4 w-4" />
              Github
            </Button>
            <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
              {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
              Google
            </Button>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading || (!isLogin && !agreedToTerms)}>
            {isLoading && <Loader2 className="animate-spin" />}
            {!isLoading && (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link href={isLogin ? '/signup' : '/login'} className="underline hover:text-primary">
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
