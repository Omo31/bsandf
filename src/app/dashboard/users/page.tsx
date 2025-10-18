
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Users, MoreHorizontal, Eye } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { User, WithId } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

function UserTable({ users, isLoading }: { users: WithId<User>[] | null; isLoading: boolean }) {
    const router = useRouter();

    if (isLoading) {
        return (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    }

    if (!users || users.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full min-h-[300px] border-2 border-dashed rounded-lg p-4">
                <Users className="h-12 w-12 mb-4" />
                <p className="font-semibold">No Users Found</p>
                <p className="text-sm">There are no users in your application yet.</p>
            </div>
        );
    }

    const handleViewHistory = (userId: string) => {
        router.push(`/dashboard/users/${userId}/history`);
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.uid}>
                        <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">User Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleViewHistory(user.uid)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View History
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

}

export default function UserManagementPage() {
    const firestore = useFirestore();
    const { areServicesAvailable } = useUser();
    
    // Fetch all users. This requires open security rules for development.
    const usersQuery = useMemoFirebase(
        () => (firestore && areServicesAvailable
            ? query(collection(firestore, 'users'))
            : null),
        [firestore, areServicesAvailable]
    );

    const { data: users, isLoading } = useCollection<User>(usersQuery);

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
                <UserTable users={users} isLoading={isLoading} />
            </CardContent>
        </Card>
        </div>
    );
}
