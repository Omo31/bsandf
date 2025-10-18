'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { MoreHorizontal, Eye, Loader2, Send, ShieldAlert } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  collectionGroup,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import type { Order, User, WithId } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusVariant = (status: string) => {
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

function OrderDetailsDialog({ order }: { order: WithId<Order> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customer, setCustomer] = useState<User | null>(null);
  const [shippingFee, setShippingFee] = useState(order.shippingFee || 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && order.userId && firestore) {
      const userRef = doc(firestore, 'users', order.userId);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setCustomer(docSnap.data() as User);
        }
      });
    }
  }, [isOpen, order, firestore]);

  const subTotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const serviceCharge = order.serviceCharge || subTotal * 0.06;
  const totalAmount = subTotal + serviceCharge + shippingFee;

  const handleSubmitQuote = async () => {
    setIsUpdating(true);
    if (!firestore) return;
    try {
      const orderRef = doc(firestore, `users/${order.userId}/orders`, order.id);
      await updateDoc(orderRef, {
        shippingFee: shippingFee,
        totalAmount: totalAmount,
        status: 'Pending User Approval',
        subTotal: subTotal,
        serviceCharge: serviceCharge,
      });
      toast({
        title: 'Quote Sent!',
        description: `The quote has been sent to ${customer?.firstName || 'the user'} for approval.`,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was an error submitting the quote.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsOpen(true); }}>
        <Eye className="mr-2 h-4 w-4" />
        View and Set Fee
      </DropdownMenuItem>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details ({order.id.substring(0,8)}...)</DialogTitle>
          <DialogDescription>
            Review the order, set the shipping fee, and submit the quote to the customer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <h4 className="font-semibold">Customer Details</h4>
            {customer ? (
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {customer.firstName} {customer.lastName}</p>
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Phone:</strong> {customer.phoneNumber}</p>
                <p><strong>Shipping Address:</strong><br />{order.shippingAddress.replace(/, /g, '\n')}</p>
              </div>
            ) : <Skeleton className="h-20 w-full" />}
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Order Summary</h4>
            <div className="space-y-2 text-sm">
                {order.items.map(item => (
                    <div key={item.productId} className="flex justify-between">
                        <span>{item.name} (x{item.quantity})</span>
                        <span>₦{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <Separator />
            <div className="space-y-2 text-sm font-medium">
                 <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{subTotal.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between">
                    <span>Service Charge (6%)</span>
                    <span>₦{serviceCharge.toFixed(2)}</span>
                </div>
            </div>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end pt-4">
            <div>
                <Label htmlFor="shipping-fee" className="font-semibold">Shipping Fee</Label>
                <Input
                    id="shipping-fee"
                    type="number"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(Number(e.target.value))}
                    className="mt-1"
                    placeholder="Enter shipping fee"
                    disabled={order.status !== 'Pending Admin Review'}
                />
            </div>
            <div className="font-bold text-lg text-right">
                <span>Total: ₦{totalAmount.toFixed(2)}</span>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitQuote} 
            disabled={isUpdating || order.status !== 'Pending Admin Review'}
          >
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {order.status === 'Pending Admin Review' ? 'Submit Quote to User' : 'Quote Submitted'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrderTable({ orders, isLoading }: { orders: WithId<Order>[] | null; isLoading: boolean }) {
  const firestore = useFirestore();
  const [customers, setCustomers] = useState<Record<string, User>>({});

  useEffect(() => {
    if (orders && firestore) {
      const userIds = [...new Set(orders.map(o => o.userId))];
      userIds.forEach(userId => {
        if (!customers[userId]) {
          const userRef = doc(firestore, 'users', userId);
          getDoc(userRef).then(docSnap => {
            if (docSnap.exists()) {
              setCustomers(prev => ({ ...prev, [userId]: docSnap.data() as User }));
            }
          });
        }
      });
    }
  }, [orders, customers, firestore]);

  if (isLoading) {
      return (
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {[...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
      )
  }

  if (!orders || orders.length === 0) {
       return (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full min-h-[300px] border-2 border-dashed rounded-lg p-4">
              <ShieldAlert className="h-12 w-12 mb-4" />
              <p className="font-semibold">No Orders Found</p>
              <p className="text-sm">No orders have been placed yet.</p>
          </div>
       )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const customer = customers[order.userId];
          const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Loading...';
          return (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
              <TableCell>{customerName}</TableCell>
              <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {order.totalAmount ? `₦${order.totalAmount.toFixed(2)}` : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {order.status === 'Pending Admin Review' && <OrderDetailsDialog order={order} />}
                     <DropdownMenuItem>View Full Details</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default function OrderManagementPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [canQuery, setCanQuery] = useState(false);

  useEffect(() => {
    if (firestore && user) {
        setCanQuery(true);
    }
  }, [firestore, user]);
  
  const ordersQuery = useMemoFirebase(() => {
    if (!canQuery) return null;
    return query(collectionGroup(firestore, 'orders'));
  }, [canQuery, firestore]);

  const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

  const isLoading = isUserLoading || areOrdersLoading;
  
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
          <p className="text-muted-foreground">Track and manage all customer orders.</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <OrderTable orders={orders} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
