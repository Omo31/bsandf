
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { Checkbox } from '@/components/ui/checkbox';
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signupSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and conditions." }),
  }),
});


interface UserAuthFormProps {
  formType: 'login' | 'signup';
}

export function UserAuthForm({ formType }: UserAuthFormProps) {
  const isLogin = formType === 'login';
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    defaultValues: isLogin ? { email: '', password: '' } : {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        agreedToTerms: false,
    },
  });

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
      default:
        title = `Auth Error: ${error.code}`;
        description = error.message;
        break;
    }
    toast({ variant: 'destructive', title, description });
  };
  
  const handleAuthSubmit = async (values: any) => {
    setIsLoading(true);
    try {
        if (isLogin) {
            await signInWithEmailAndPassword(auth, values.email, values.password);
        } else { // Signup logic
            // 1. Create the user in Auth
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            
            // 2. Set their display name in Auth. The `createUserDocument` Cloud Function will
            // be triggered on user creation and use this display name to create the Firestore doc.
            await updateProfile(userCredential.user, {
                displayName: `${values.firstName} ${values.lastName}`
            });
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
    const email = form.getValues('email');
    if (!email) {
      form.setError('email', { type: 'manual', message: 'Please enter your email to reset password.' });
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAuthSubmit)}>
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                   <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      {isLogin && (
                          <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={handleForgotPassword}>
                              Forgot password?
                          </Button>
                      )}
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!isLogin && (
               <FormField
                control={form.control}
                name="agreedToTerms"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-muted-foreground">
                                I agree to the{' '}
                                <Link href="/terms" className="underline hover:text-primary">
                                Terms and Conditions
                                </Link>
                            </FormLabel>
                             <FormMessage />
                        </div>
                    </FormItem>
                )}
                />
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
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
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
      </Form>
    </Card>
  );
}
