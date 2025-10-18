
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ListOrdered,
  User,
  Heart,
  Truck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Order, WithId } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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


function UserSummary({ user, orders, isLoading } : { user: any, orders: WithId<Order>[] | null, isLoading: boolean }) {
    const recentOrder = useMemo(() => orders?.[0], [orders]);

    return (
        <div className="space-y-4">
             <h2 className="text-3xl font-bold tracking-tight">Welcome, {user?.displayName?.split(' ')[0] || 'User'}!</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ListOrdered className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{orders?.length || 0}</div>}
                    <p className="text-xs text-muted-foreground">Across all time</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Your saved items (coming soon)</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Complete</div>
                    <p className="text-xs text-muted-foreground">All details are up to date</p>
                </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Order</CardTitle>
                    {isLoading ? <Skeleton className="h-4 w-2/3" /> :
                    recentOrder && <CardDescription>Tracking for order <span className="font-semibold">#{recentOrder.id.substring(0,8)}...</span></CardDescription>
                    }
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-40 w-full" /> : recentOrder ? (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <div className="font-semibold">Status: <Badge variant={getStatusVariant(recentOrder.status)}>{recentOrder.status}</Badge></div>
                                    <p className="text-sm text-muted-foreground">Date: {new Date(recentOrder.orderDate).toLocaleDateString()}</p>
                                </div>
                                {recentOrder.totalAmount > 0 && <p className="text-xl font-bold">₦{recentOrder.totalAmount.toFixed(2)}</p>}
                            </div>
                            <ul className="space-y-2">
                                {recentOrder.items.map((item, index) => (
                                    <li key={item.productId + index} className="flex justify-between items-center text-sm">
                                        <span>{item.name} (x{item.quantity})</span>
                                        {item.price > 0 && <span>₦{(item.price * item.quantity).toFixed(2)}</span>}
                                    </li>
                                ))}
                            </ul>
                            <Button asChild variant="outline" className="mt-4 w-full">
                                <Link href={`/dashboard/history`}>View All Orders</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center p-8 text-muted-foreground">No recent orders found.</div>
                    )}
                </CardContent>
                </Card>
                <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>
                    Your saved preferences for a faster checkout.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Primary Address</p>
                            <p className="text-sm text-muted-foreground">{user ? 'View in profile' : '...'}</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild><Link href="/dashboard/profile">Edit</Link></Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Payment Method</p>
                            <p className="text-sm text-muted-foreground">Coming Soon</p>
                        </div>
                        <Button variant="ghost" size="sm" disabled>Edit</Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Dietary Notes</p>
                            <p className="text-sm text-muted-foreground">Set your preferences</p>
                        </div>
                        <Button variant="ghost" size="sm" disabled>Edit</Button>
                    </div>
                </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function UserDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!user) return null;
        // User fetches only their own orders, limited for summary view
        return query(collection(firestore, `users/${user.uid}/orders`), orderBy('orderDate', 'desc'), limit(5));
    }, [user, firestore]);
    
    const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

    const isLoading = isUserLoading || areOrdersLoading;

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Skeleton className="h-9 w-1/3" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-8">
             <UserSummary user={user} orders={orders} isLoading={isLoading} />
        </div>
    );
}
