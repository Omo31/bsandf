
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users } from 'lucide-react';
import { useUser } from '@/firebase';
import { useState, useEffect } from 'react';

export default function UserManagementPage() {
  const { user } = useUser();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage your application users.</p>
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
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full min-h-[300px] border-2 border-dashed rounded-lg p-4">
            <Users className="h-12 w-12 mb-4" />
            <p className="font-semibold">Feature Under Development</p>
            <p className="text-sm">User management and permissions will be built out here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
