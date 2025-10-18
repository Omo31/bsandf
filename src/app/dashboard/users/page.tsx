
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, ShieldAlert } from 'lucide-react';
import { useUser } from '@/firebase';
import { useState, useEffect } from 'react';

export default function UserManagementPage() {
    const [isOwner, setIsOwner] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        if (user) {
        user.getIdTokenResult().then(idTokenResult => {
            setIsOwner(idTokenResult.claims.role === 'owner');
        });
        } else {
        setIsOwner(false);
        }
    }, [user]);

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage your users and their roles.</p>
        </div>
        <Button disabled>
          <Download className="mr-2 h-4 w-4" />
          Download User Info
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all the users in your application.</CardDescription>
        </CardHeader>
        <CardContent>
           {isOwner ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full min-h-[300px] border-2 border-dashed rounded-lg p-4">
                    <Users className="h-12 w-12 mb-4" />
                    <p className="font-semibold">Feature Under Development</p>
                    <p className="text-sm">Secure user management is being implemented and will be available soon.</p>
                </div>
           ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full min-h-[300px] border-2 border-dashed rounded-lg p-4">
                    <ShieldAlert className="h-12 w-12 mb-4" />
                    <p className="font-semibold">Access Denied</p>
                    <p className="text-sm">You do not have permission to view this page.</p>
                </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}

    