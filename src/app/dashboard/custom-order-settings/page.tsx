
'use client';

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
import { Button } from '@/components/ui/button';
import { customMeasures, customServices } from '@/lib/data';
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CustomOrderSettingsPage() {
  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Custom Order Settings</h2>
          <p className="text-muted-foreground">
            Manage the options available on the custom order form.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Measures Card */}
        <Card>
          <CardHeader>
            <CardTitle>Measurement Units</CardTitle>
            <CardDescription>
              Add or remove units of measure for custom orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex items-end gap-2 mb-6">
                <div className="grid flex-1 gap-2">
                    <Label htmlFor="measure-name">New Unit Name</Label>
                    <Input id="measure-name" placeholder="e.g., pieces, bundle"/>
                </div>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Unit</Button>
            </form>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customMeasures.map((measure) => (
                  <TableRow key={measure.id}>
                    <TableCell className="font-medium">{measure.name}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4 text-muted-foreground"/>
                       </Button>
                       <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive"/>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Services Card */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Services</CardTitle>
            <CardDescription>
              Manage additional services offered for custom orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <form className="flex items-end gap-2 mb-6">
                <div className="grid flex-1 gap-2">
                    <Label htmlFor="service-name">New Service Name</Label>
                    <Input id="service-name" placeholder="e.g., Engraving"/>
                </div>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Service</Button>
            </form>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                   <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.label}</TableCell>
                     <TableCell className="text-right">
                       <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4 text-muted-foreground"/>
                       </Button>
                       <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive"/>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
