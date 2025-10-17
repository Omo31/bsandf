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
import { orders } from '@/lib/data';
import { MoreHorizontal, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Accepted':
            return 'default';
        case 'Canceled':
            return 'destructive';
        case 'Draft':
            return 'outline';
        default:
            return 'secondary';
    }
}

const HistoryTable = ({ statusFilter }: { statusFilter: ('Accepted' | 'Canceled' | 'Draft')[] }) => {
    const userOrders = orders.filter(o => o.userId === '2' && statusFilter.includes(o.status));

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
                        {userOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    {order.status === 'Draft' ? (
                                        <Button variant="outline" size="sm">
                                            <Edit className="mr-2 h-4 w-4"/> Edit
                                        </Button>
                                    ) : (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Re-order</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
       <Tabs defaultValue="accepted">
        <TabsList>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="canceled">Canceled</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
        <div className="mt-4">
            <TabsContent value="accepted">
                <HistoryTable statusFilter={['Accepted']} />
            </TabsContent>
            <TabsContent value="canceled">
                <HistoryTable statusFilter={['Canceled']} />
            </TabsContent>
            <TabsContent value="drafts">
                <HistoryTable statusFilter={['Draft']} />
            </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
