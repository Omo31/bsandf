'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import { Github, Chrome } from 'lucide-react';

interface UserAuthFormProps {
  formType: 'login' | 'signup';
}

export function UserAuthForm({ formType }: UserAuthFormProps) {
  const isLogin = formType === 'login';

  return (
    <Card className="w-full max-w-sm">
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
          <Button variant="outline">
            <Github className="mr-2 h-4 w-4" />
            Github
          </Button>
          <Button variant="outline">
            <Chrome className="mr-2 h-4 w-4" />
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
          <Input id="email" type="email" placeholder="m@example.com" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button className="w-full">{isLogin ? 'Sign In' : 'Sign Up'}</Button>
        <p className="text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link href={isLogin ? '/signup' : '/login'} className="underline hover:text-primary">
            {isLogin ? 'Sign up' : 'Sign in'}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
