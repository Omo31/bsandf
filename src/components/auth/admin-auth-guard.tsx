'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user: currentUser, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // If auth state is still loading, do nothing yet.
    if (isUserLoading) {
      return;
    }

    // If there's no user, redirect to login.
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // User exists, now check their admin claim. Forcing a refresh (true) gets the latest claims.
    currentUser.getIdTokenResult(true) 
      .then((idTokenResult) => {
        const isAdminClaim = !!idTokenResult.claims.admin;
        setIsAdmin(isAdminClaim);
        
        // If they are not an admin, redirect them away.
        if (!isAdminClaim) {
          router.push('/dashboard');
        }
      })
      .catch(error => {
        console.error("Error getting user token:", error);
        setIsAdmin(false);
        router.push('/dashboard');
      });

  }, [currentUser, isUserLoading, router]);

  // While we are checking, show a loading skeleton.
  if (isUserLoading || isAdmin === null) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-4xl space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <Skeleton className="h-9 w-1/3" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  // If the user is an admin, render the actual admin content.
  // If not, this will be null while the redirection happens.
  return isAdmin ? <>{children}</> : null;
}
