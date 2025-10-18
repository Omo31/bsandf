
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Check, X, Loader2, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, updateDoc } from 'firebase/firestore';
import type { Order, WithId } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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

function ReviewQuoteDialog({ order }: { order: WithId<Order> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleUpdateStatus = async (newStatus: 'Accepted' | 'Rejected') => {
    setIsUpdating(true);
    try {
      const orderRef = doc(firestore, `users/${order.userId}/orders`, order.id);
      await updateDoc(orderRef, { status: newStatus });
      
      toast({
        title: `Quote ${newStatus}`,
        description: `You have ${newStatus.toLowerCase()} the quote.`,
      });

      if (newStatus === 'Accepted') {
        router.push(`/checkout?amount=${order.totalAmount.toFixed(2)}`);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was an error updating the order status.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)} size="sm">Review Quote</Button>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Quote for Order #{order.id.substring(0, 8)}</DialogTitle>
          <DialogDescription>
            An admin has updated your order with shipping costs. Please review and approve.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
            <div className="space-y-2">
                <h4 className="font-semibold">Order Items</h4>
                {order.items.map(item => (
                    <div key={item.productId} className="flex justify-between text-sm">
                        <span>{item.name} (x{item.quantity})</span>
                        <span>₦{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <Separator />
            <div className="space-y-2 font-medium">
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₦{order.subTotal.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Charge (6%)</span>
                    <span>₦{(order.serviceCharge || 0).toFixed(2)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping Fee</span>
                    <span>₦{(order.shippingFee || 0).toFixed(2)}</span>
                </div>
            </div>
            <Separator />
             <div className="flex justify-between font-bold text-xl">
                <span>Total Amount</span>
                <span>₦{(order.totalAmount || 0).toFixed(2)}</span>
            </div>
        </div>
        <DialogFooter className="grid grid-cols-2 gap-4">
          <Button variant="destructive" onClick={() => handleUpdateStatus('Rejected')} disabled={isUpdating}>
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
            Reject Quote
          </Button>
          <Button onClick={() => handleUpdateStatus('Accepted')} disabled={isUpdating}>
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Accept & Pay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const HistoryTable = ({ orders, isLoading, statusFilter }: { orders: WithId<Order>[] | null; isLoading: boolean; statusFilter: Order['status'][] }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  const filteredOrders = orders?.filter(o => statusFilter.includes(o.status)) || [];
  
  if (filteredOrders.length === 0) {
      return (
          <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>No orders in this category.</p>
          </div>
      )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {order.totalAmount ? `₦${order.totalAmount.toFixed(2)}` : 'N/A'}
                </TableCell>
                <TableCell className="text-center">
                  {order.status === 'Pending User Approval' ? (
                    <ReviewQuoteDialog order={order} />
                  ) : order.status === 'Pending Admin Review' ? (
                    <span className="text-xs text-muted-foreground italic">Awaiting admin</span>
                  ) : (
                    <Button variant="ghost" size="sm">View Details</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};


export default function PurchaseHistoryPage() {
  const { user, areServicesAvailable } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!user || !areServicesAvailable || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/orders`));
  }, [user, firestore, areServicesAvailable]);
  
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const pendingApprovalCount = useMemo(() => {
    if (!orders) return 0;
    return orders.filter(o => o.status === 'Pending User Approval').length;
  }, [orders]);

  if (!user && !isLoading) {
    return (
       <div className="flex-1 space-y-4 p-8 pt-6">
         <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Purchase History</h2>
              <p className="text-muted-foreground">
                Please log in to view your order history.
              </p>
            </div>
          </div>
       </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase History</h2>
          <p className="text-muted-foreground">
            View and manage your past and current orders.
          </p>
        </div>
      </div>
       <Tabs defaultValue="all">
        <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="approval">
                Awaiting Approval
                {pendingApprovalCount > 0 && 
                    <Badge className="ml-2 bg-primary text-primary-foreground">{pendingApprovalCount}</Badge>
                }
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="canceled">Canceled/Rejected</TabsTrigger>
        </TabsList>
        <div className="mt-4">
            <TabsContent value="all">
                <HistoryTable orders={orders} isLoading={isLoading} statusFilter={['Pending Admin Review', 'Pending User Approval', 'Accepted', 'Processing', 'Shipped', 'Canceled', 'Rejected']} />
            </TabsContent>
            <TabsContent value="approval">
                <HistoryTable orders={orders} isLoading={isLoading} statusFilter={['Pending User Approval']} />
            </TabsContent>
            <TabsContent value="completed">
                <HistoryTable orders={orders} isLoading={isLoading} statusFilter={['Accepted', 'Processing', 'Shipped']} />
            </TabsContent>
            <TabsContent value="canceled">
                <HistoryTable orders={orders} isLoading={isLoading} statusFilter={['Canceled', 'Rejected']} />
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
