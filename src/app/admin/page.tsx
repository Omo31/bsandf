
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart } from 'recharts';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, collectionGroup } from 'firebase/firestore';
import type { Order, User } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
   sales: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  }
};

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const { user: currentUser, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait for user to be loaded
    }
    if (!currentUser) {
      router.push('/login'); // Redirect if not logged in
      return;
    }
    currentUser.getIdTokenResult().then((idTokenResult) => {
      const isAdminClaim = !!idTokenResult.claims.admin;
      if (!isAdminClaim) {
        router.push('/dashboard');
      }
      setIsAdmin(isAdminClaim);
    });
  }, [currentUser, isUserLoading, router]);


  const ordersQuery = useMemoFirebase(() => isAdmin ? query(collectionGroup(firestore, 'orders')) : null, [firestore, isAdmin]);
  const usersQuery = useMemoFirebase(() => isAdmin ? collection(firestore, 'users') : null, [firestore, isAdmin]);

  const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

  const stats = useMemo(() => {
    if (!orders || !users) {
      return {
        totalRevenue: 0,
        sales: 0,
        newUsers: 0,
        salesByMonth: [],
      };
    }

    const completedOrders = orders.filter(o => o.status === 'Accepted' || o.status === 'Shipped' || o.status === 'Processing');
    const totalRevenue = completedOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    const sales = completedOrders.length;
    const newUsers = users.length;

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


    return { totalRevenue, sales, newUsers, salesByMonth };
  }, [orders, users]);
  
  // Render loading state until admin status is confirmed
  if (isUserLoading || isAdmin === null) {
      return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-9 w-1/3" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
             <Skeleton className="h-6 w-1/4" />
             <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="pl-2">
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
      )
  }

  // If isAdmin is false, the redirect is already in progress, render a message.
  if (!isAdmin) {
      return (
          <div className="flex-1 space-y-4 pt-6 text-center">
              <p>Redirecting...</p>
          </div>
      );
  }

  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.newUsers}</div>
             <p className="text-xs text-muted-foreground">Total registered users</p>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
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
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
            <CardDescription>User access by device (mock data).</CardDescription>
          </CardHeader>
          <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <BarChart accessibilityLayer data={[
                    { month: 'January', desktop: 186, mobile: 80 },
                    { month: 'February', desktop: 305, mobile: 200 },
                    { month: 'March', desktop: 237, mobile: 120 },
                    { month: 'April', desktop: 73, mobile: 190 },
                    { month: 'May', desktop: 209, mobile: 130 },
                    { month: 'June', desktop: 214, mobile: 140 },
                ]}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                  <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                </BarChart>
              </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    