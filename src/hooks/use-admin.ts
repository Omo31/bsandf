
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    // Don't start checking until the user state is resolved.
    if (isUserLoading) {
      return;
    }

    // If there's no user, they can't be an admin.
    if (!user) {
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return;
    }

    // Force a refresh of the token to get the latest custom claims.
    // The `true` argument is essential here.
    user.getIdTokenResult(true)
      .then((idTokenResult) => {
        // Check for the 'owner' role claim.
        if (idTokenResult.claims.role === 'owner') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      })
      .catch((error) => {
        console.error("Error getting admin token result:", error);
        setIsAdmin(false);
      })
      .finally(() => {
        setIsCheckingAdmin(false);
      });
  }, [user, isUserLoading]);

  return { isAdmin, isCheckingAdmin };
}
