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
import { orders, users } from '@/lib/data';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Shipped':
        case 'Accepted':
            return 'default';
        case 'Processing':
            return 'secondary';
        case 'Canceled':
            return 'destructive';
        case 'Draft':
            return 'outline';
        default:
            return 'secondary';
    }
}

const OrderTable = ({ statusFilter }: { statusFilter?: string[] }) => {
    const filteredOrders = statusFilter ? orders.filter(o => statusFilter.includes(o.status)) : orders;

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
              {filteredOrders.map((order) => {
                const user = users.find(u => u.id === order.userId);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{user?.name || 'Unknown User'}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
    )
}

export default function OrderManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
          <p className="text-muted-foreground">
            Track and manage all customer orders.
          </p>
        </div>
      </div>
       <Tabs defaultValue="all">
        <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <Card className="mt-4">
            <CardContent className="p-0">
                <TabsContent value="all" className="m-0">
                    <OrderTable />
                </TabsContent>
                <TabsContent value="processing" className="m-0">
                    <OrderTable statusFilter={['Processing', 'Draft']} />
                </TabsContent>
                <TabsContent value="shipped" className="m-0">
                    <OrderTable statusFilter={['Shipped']} />
                </TabsContent>
                <TabsContent value="completed" className="m-0">
                    <OrderTable statusFilter={['Accepted', 'Canceled']} />
                </TabsContent>
            </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
