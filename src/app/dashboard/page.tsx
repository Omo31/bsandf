
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
import { collection, query, orderBy, limit, collectionGroup } from 'firebase/firestore';
import type { Order, WithId } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdmin } from '@/hooks/use-admin';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { DollarSign, CreditCard, Activity } from 'lucide-react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';


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

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
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

function AdminSummary({ orders, isLoading } : { orders: WithId<Order>[] | null, isLoading: boolean }) {
    const stats = useMemo(() => {
        if (!orders) {
          return {
            totalRevenue: 0,
            sales: 0,
            salesByMonth: [],
          };
        }

        const completedOrders = orders.filter(o => o.status === 'Accepted' || o.status === 'Shipped' || o.status === 'Processing');
        const totalRevenue = completedOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
        const sales = completedOrders.length;

        const salesByMonth = completedOrders.reduce((acc, order) => {
            const month = new Date(order.orderDate).toLocaleString('default', { month: 'short', year: 'numeric' });
            const existing = acc.find(item => item.date === month);
            if (existing) {
                existing.sales += order.totalAmount;
            } else {
                acc.push({ date: month, sales: order.totalAmount });
            }
            return acc;
        }, [] as { date: string; sales: number }[]).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());


        return { totalRevenue, sales, salesByMonth };
      }, [orders]);
    
      if (isLoading) {
          return (
            <div className="space-y-4">
              <Skeleton className="h-9 w-1/3" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-3 w-1/2 mt-1" />
                        </CardContent>
                    </Card>
                ))}
              </div>
              <div className="grid gap-4">
                <Card className="col-span-4">
                  <CardHeader>
                     <Skeleton className="h-6 w-1/4" />
                     <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="pl-2">
                    <Skeleton className="h-[350px] w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          )
      }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From completed sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.sales}</div>
            <p className="text-xs text-muted-foreground">Total completed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour (mock)</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
             <CardDescription>Monthly revenue trends from completed orders.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <LineChart
                  accessibilityLayer
                  data={stats.salesByMonth}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => new Date(value).toLocaleString('default', { month: 'short' })}
                  />
                  <YAxis
                    tickFormatter={(value) => `₦${Number(value) / 1000}k`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent
                        formatter={(value) => `₦${Number(value).toFixed(2)}`}
                    />}
                  />
                  <Line
                    dataKey="sales"
                    type="monotone"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{
                      fill: "hsl(var(--primary))",
                      r: 4
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </LineChart>
              </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function UserDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { isAdmin, isCheckingAdmin } = useAdmin();

    // Common query for both user and admin
    const ordersQuery = useMemoFirebase(() => {
        if (!user) return null;
        if (isAdmin) {
             // Admin fetches all orders
            return query(collectionGroup(firestore, 'orders'));
        } else {
            // User fetches only their own orders, limited for summary view
            return query(collection(firestore, `users/${user.uid}/orders`), orderBy('orderDate', 'desc'), limit(5));
        }
    }, [user, firestore, isAdmin]);
    
    const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

    const isLoading = isUserLoading || areOrdersLoading || isCheckingAdmin;

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
            {isAdmin ? 
                <AdminSummary orders={orders} isLoading={isLoading} /> : 
                <UserSummary user={user} orders={orders} isLoading={isLoading} />
            }
        </div>
    );
}
