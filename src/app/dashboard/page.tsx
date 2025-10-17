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
import { orders, users } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UserDashboardPage() {
    const user = users[1]; // Mock user
    const userOrders = orders.filter(o => o.userId === user.id);
    const recentOrder = userOrders[0];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {user.name}!</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userOrders.length}</div>
            <p className="text-xs text-muted-foreground">Across all time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Ready to be purchased</p>
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
            <CardDescription>Tracking for order <span className="font-semibold">{recentOrder.id}</span></CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrder ? (
                <div>
                     <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="font-semibold">Status: <Badge>{recentOrder.status}</Badge></div>
                            <p className="text-sm text-muted-foreground">Date: {new Date(recentOrder.date).toLocaleDateString()}</p>
                        </div>
                        <p className="text-xl font-bold">₦{recentOrder.total.toFixed(2)}</p>
                     </div>
                     <ul className="space-y-2">
                        {recentOrder.items.map(item => (
                            <li key={item.productId} className="flex justify-between items-center text-sm">
                                <span>{item.name} (x{item.quantity})</span>
                                <span>₦{(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                     </ul>
                     <Button asChild variant="outline" className="mt-4 w-full">
                        <Link href={`/dashboard/history`}>View Order Details</Link>
                     </Button>
                </div>
            ) : (
                <p>No recent orders.</p>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>My Preferences</CardTitle>
            <CardDescription>
              Your saved preferences for a faster checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Primary Address</p>
                    <p className="text-sm text-muted-foreground">123 User Street, Yourtown</p>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Payment Method</p>
                    <p className="text-sm text-muted-foreground">Visa ending in 1234</p>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Dietary Notes</p>
                    <p className="text-sm text-muted-foreground">No nuts, gluten-free preference</p>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
