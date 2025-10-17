
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user: currentUser, isUserLoading } = useUser();
  const [authStatus, setAuthStatus] = useState<'loading' | 'admin' | 'non-admin' | 'no-user'>('loading');
  const router = useRouter();

  useEffect(() => {
    // If the initial user check is still happening, we wait.
    if (isUserLoading) {
      setAuthStatus('loading');
      return;
    }

    // If no user is logged in, redirect them to the login page.
    if (!currentUser) {
      setAuthStatus('no-user');
      router.push('/login');
      return;
    }

    // User is logged in, now check their admin claim.
    // We force a refresh of the token to get the latest custom claims.
    currentUser.getIdTokenResult(true) 
      .then((idTokenResult) => {
        const isAdminClaim = !!idTokenResult.claims.admin;
        if (isAdminClaim) {
          setAuthStatus('admin');
        } else {
          // User is logged in but not an admin.
          setAuthStatus('non-admin');
          router.push('/dashboard');
        }
      })
      .catch(error => {
        console.error("Error verifying admin status:", error);
        // On error, treat as a non-admin for security and redirect.
        setAuthStatus('non-admin');
        router.push('/dashboard');
      });

  }, [currentUser, isUserLoading, router]);

  // While we are verifying, show a full-page loading skeleton.
  // This prevents any "flicker" of content.
  if (authStatus !== 'admin') {
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

  // If status is 'admin', render the admin content.
  return <>{children}</>;
}
