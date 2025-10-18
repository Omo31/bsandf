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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, doc, getDoc } from 'firebase/firestore';
import type { Order, User, WithId } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

const getStatusVariant = (status: Order['status']) => {
  switch (status) {
    case 'Accepted':
    case 'Shipped':
      return 'default';
    case 'Pending Admin Review':
      return 'secondary';
    case 'Pending User Approval':
      return 'outline';
    case 'Rejected':
    case 'Canceled':
      return 'destructive';
    default:
      return 'secondary';
  }
};


function OrderHistoryTable({ userId }: { userId: string }) {
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!userId) return null;
        return query(collection(firestore, `users/${userId}/orders`));
    }, [userId, firestore]);
    
    const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

    if (isLoading) {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }
    
    if (!orders || orders.length === 0) {
        return <p className="text-center text-muted-foreground py-8">This user has no order history.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                        <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {order.totalAmount ? `₦${order.totalAmount.toFixed(2)}` : 'N/A'}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}


export default function UserPurchaseHistoryPage({ params }: { params: { userId: string } }) {
    const { userId } = params;
    const firestore = useFirestore();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userId && firestore) {
            setIsLoading(true);
            const userDocRef = doc(firestore, 'users', userId);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists()) {
                    setUser(docSnap.data() as User);
                }
            }).finally(() => setIsLoading(false));
        }
    }, [userId, firestore]);

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    {isLoading ? <Skeleton className="h-9 w-64" /> : `History for ${user?.firstName} ${user?.lastName}`}
                </h2>
                <p className="text-muted-foreground">
                    A list of all orders placed by this user.
                </p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                    <CardDescription>
                        {isLoading ? <Skeleton className="h-4 w-80" /> : `Viewing all orders for ${user?.email}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <OrderHistoryTable userId={userId} />
                </CardContent>
            </Card>
        </div>
    );
}
