
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
    if (isUserLoading) {
      return; // Wait until the initial user state is loaded.
    }

    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Force a refresh of the ID token to get the latest custom claims.
    // This is crucial to ensure the 'admin' claim set by a Cloud Function is available.
    currentUser.getIdTokenResult(true) 
      .then((idTokenResult) => {
        const isAdminClaim = !!idTokenResult.claims.admin;
        setIsAdmin(isAdminClaim);
        
        if (!isAdminClaim) {
          // If not an admin, redirect to the user dashboard.
          router.push('/dashboard');
        }
      })
      .catch(error => {
        console.error("Error getting user token or checking admin claim:", error);
        setIsAdmin(false);
        router.push('/dashboard');
      });

  }, [currentUser, isUserLoading, router]);

  // While we are checking for the user and their claims, show a loading skeleton.
  // This prevents the "flicker" of the admin panel appearing and disappearing.
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

  // If the checks are complete and the user is an admin, render the children.
  // Otherwise, this will be null while the redirection occurs.
  return isAdmin ? <>{children}</> : null;
}
