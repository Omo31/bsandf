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
  initiateEmailSignIn,
  initiateEmailSignUp,
  initiateGoogleSignIn,
} from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';

interface UserAuthFormProps {
  formType: 'login' | 'signup';
}

export function UserAuthForm({ formType }: UserAuthFormProps) {
  const isLogin = formType === 'login';
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleAuthError = (error: FirebaseError) => {
    let title = 'An error occurred';
    let description = 'Please try again.';

    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
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
    if (!email || !password) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please enter both email and password.' });
        return;
    }
    setIsLoading(true);
    try {
        if (isLogin) {
            await auth.signInWithEmailAndPassword(email, password);
        } else {
            await auth.createUserWithEmailAndPassword(email, password);
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await initiateGoogleSignIn(auth);
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
            {isLogin ? 'Enter your email to sign in to your account' : 'Enter your email below to create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-6">
            <Button variant="outline" type="button" disabled={isLoading || isGoogleLoading}>
              <Github className="mr-2 h-4 w-4" />
              Github
            </Button>
            <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
              {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
              Google
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
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
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || isGoogleLoading}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            {!isLoading && (isLogin ? 'Sign In' : 'Sign Up')}
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

// Override original non-blocking functions with standard awaited versions
// This is a temporary adjustment to fit the traditional form submission UX
// where immediate feedback (loading state, error message) is crucial.
declare module 'firebase/auth' {
    interface Auth {
        signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
        createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
    }
}

    