'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UtensilsCrossed, PlusCircle, Trash2, Minus, Plus } from 'lucide-react';
import { customMeasures, customServices } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

type CustomOrderItem = {
  id: number;
  name: string;
  quantity: number;
  measure: string;
  otherMeasure: string;
};

export default function CustomOrderPage() {
  const [items, setItems] = useState<CustomOrderItem[]>([
    { id: 1, name: '', quantity: 1, measure: '', otherMeasure: '' },
  ]);

  const handleItemChange = (id: number, field: keyof Omit<CustomOrderItem, 'id'>, value: string | number) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };
  
  const handleMeasureChange = (id: number, value: string) => {
     setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, measure: value, otherMeasure: '' } : item))
    );
  }

  const handleQuantityChange = (id: number, amount: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
      )
    );
  };

  const addItem = () => {
    setItems((prevItems) => [
      ...prevItems,
      { id: Date.now(), name: '', quantity: 1, measure: '', otherMeasure: '' },
    ]);
  };

  const removeItem = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 md:px-6 py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-headline">Create a Custom Order</CardTitle>
              <CardDescription>Tell us what you need, and we'll make it happen.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Requirements</h3>
            <div className="space-y-6">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-4 relative">
                   {items.length > 1 && (
                     <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                   )}
                  <div className="space-y-2">
                    <Label htmlFor={`item-name-${item.id}`}>Item Name</Label>
                    <Input
                      id={`item-name-${item.id}`}
                      placeholder="e.g., Parmesan cheese, Fresh truffles"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                       <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => handleQuantityChange(item.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          className="w-16 text-center"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value, 10) || 1)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label>Unit of Measure</Label>
                        <div className="grid grid-cols-2 gap-2">
                           <Select value={item.measure} onValueChange={(value) => handleMeasureChange(item.id, value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a measure" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customMeasures.map(measure => (
                                        <SelectItem key={measure.id} value={measure.name}>{measure.name}</SelectItem>
                                    ))}
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {item.measure === 'other' && (
                                <Input
                                    placeholder="Specify measure"
                                    value={item.otherMeasure}
                                    onChange={(e) => handleItemChange(item.id, 'otherMeasure', e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={addItem} className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Item
            </Button>
          </div>
          
          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Services</h3>
            <p className="text-sm text-muted-foreground">Select any additional services you require and provide details.</p>
            <div className="space-y-4">
              {customServices.map((service) => (
                <div key={service.id} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id={service.id} />
                    <Label htmlFor={service.id} className="font-medium">
                      {service.label}
                    </Label>
                  </div>
                  <Textarea
                    placeholder={`Details for ${service.label}...`}
                    className="ml-6"
                  />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">Submit Custom Order Request</Button>
        </CardContent>
      </Card>
    </div>
  );
}
