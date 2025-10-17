'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Download, UserPlus, UserMinus, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, deleteDoc, setDoc } from 'firebase/firestore';
import type { User, WithId } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

function UserActions({ user: targetUser }: { user: WithId<User> }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(targetUser.role === 'admin');
  }, [targetUser.role]);

  const handleToggleAdmin = async () => {
    const adminRoleRef = doc(firestore, 'roles_admin', targetUser.uid);
    try {
      if (isAdmin) {
        await deleteDoc(adminRoleRef);
        toast({ title: 'Admin Revoked', description: `${targetUser.firstName} is no longer an admin.` });
      } else {
        await setDoc(adminRoleRef, { uid: targetUser.uid }); // Add any relevant data
        toast({ title: 'Admin Granted', description: `${targetUser.firstName} is now an admin.` });
      }
      // Note: A full implementation would wait for the cloud function to update the user's `role` field.
      // For optimistic UI, we can toggle it here.
      setIsAdmin(!isAdmin);
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not change admin status.' });
    }
  };

  const handleDeleteUser = () => {
    // This is a placeholder. A real implementation would require a Cloud Function
    // to delete the user from Auth and all their associated data in Firestore.
    toast({
      variant: 'destructive',
      title: 'Action Not Implemented',
      description: 'Securely deleting a user requires a backend function.',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-haspopup="true" size="icon" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>View Order History</DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleAdmin}>
          {isAdmin ? (
            <UserMinus className="mr-2 h-4 w-4" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          {isAdmin ? 'Revoke Admin' : 'Make Admin'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action is not reversible. This will permanently delete the user's account and
                all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function UserManagementPage() {
  const firestore = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // This effect handles security. It checks for admin claims and redirects if necessary.
  useEffect(() => {
    if (isUserLoading) return; // Wait until user status is resolved

    if (!currentUser) {
      router.push('/login'); // Not logged in, redirect to login
      return;
    }

    currentUser.getIdTokenResult().then((idTokenResult) => {
      const isAdminClaim = !!idTokenResult.claims.admin;
      setIsAdmin(isAdminClaim);
      if (!isAdminClaim) {
        router.push('/dashboard'); // Not an admin, redirect to user dashboard
      }
    });
  }, [currentUser, isUserLoading, router]);

  // The query is now memoized and will be null until isAdmin is true.
  const usersQuery = useMemoFirebase(
    () => (firestore && isAdmin ? collection(firestore, 'users') : null),
    [firestore, isAdmin]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

  // Show loading state until we know if the user is an admin.
  const isLoading = isUserLoading || !isAdmin || isLoadingUsers;

  if (!isAdmin && !isUserLoading) {
    // Render a loading state or null while redirecting to avoid flashing content
    return (
       <div className="flex-1 space-y-4 pt-6 flex items-center justify-center">
          <p className="text-muted-foreground">Verifying permissions...</p>
       </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 pt-6">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32 mt-1" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              {users &&
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://picsum.photos/seed/${user.uid}/40/40`} />
                          <AvatarFallback>
                            {user.firstName?.charAt(0)}
                            {user.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{`${user.firstName || ''} ${user.lastName || ''}`.trim()}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {currentUser?.uid !== user.uid && <UserActions user={user} />}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
