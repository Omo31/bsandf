'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UtensilsCrossed, PlusCircle, Trash2, Minus, Plus, Loader2, Send } from 'lucide-react';
import { customMeasures, customServices } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

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
  const [additionalServices, setAdditionalServices] = useState<Record<string, {checked: boolean, details: string}>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();


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
  
  const handleServiceChange = (serviceId: string, checked: boolean) => {
    setAdditionalServices(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], checked }
    }));
  };
  
  const handleServiceDetailsChange = (serviceId: string, details: string) => {
     setAdditionalServices(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], details }
    }));
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Please log in',
            description: 'You need to be logged in to submit a custom order.',
        });
        return;
    }
    
    // A simple validation to ensure at least one item has a name
    if (items.some(item => !item.name.trim())) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Order',
        description: 'Please make sure all items have a name.',
      });
      return;
    }

    setIsLoading(true);

    // Create a text-based description of the order for the admin
    const orderDescriptionItems = items.map(item => 
        `${item.quantity} x ${item.name} (${item.measure === 'other' ? item.otherMeasure : item.measure})`
    );
    const selectedServices = Object.entries(additionalServices)
        .filter(([, value]) => value.checked)
        .map(([key, value]) => {
            const serviceLabel = customServices.find(s => s.id === key)?.label || key;
            return `${serviceLabel}: ${value.details || 'No details provided.'}`;
        });
    
    const descriptionForAdmin = `Custom Order Request:\n\nItems:\n- ${orderDescriptionItems.join('\n- ')}\n\nAdditional Services:\n- ${selectedServices.join('\n- ')}`;

    try {
        const ordersRef = collection(firestore, `users/${user.uid}/orders`);
        await addDoc(ordersRef, {
            userId: user.uid,
            orderDate: new Date().toISOString(),
            status: 'Pending Admin Review',
            // For custom orders, the items list is descriptive text.
            // The admin will set the actual price and items later.
            items: [{
                productId: 'custom-order',
                name: 'Custom Order',
                description: descriptionForAdmin,
                price: 0, // Admin will set price
                quantity: 1,
            }],
            shippingAddress: 'To be confirmed by user', // Admin should verify this with user
            subTotal: 0, // To be set by admin
            serviceCharge: 0, // To be set by admin
            totalAmount: 0, // To be set by admin
            shippingFee: 0,
        });

        toast({
            title: 'Custom Order Submitted!',
            description: 'Your request has been sent for admin review. You will be notified with a quote.',
        });

        router.push('/dashboard/history');

    } catch (error) {
        console.error('Error submitting custom order:', error);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'There was an error submitting your request. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="container mx-auto max-w-3xl px-4 md:px-6 py-12">
      <form onSubmit={handleSubmit}>
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
              <h3 className="text-lg font-semibold">Product Requirements</h3>
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-4 relative">
                    {items.length > 1 && (
                      <Button
                          variant="ghost"
                          size="icon"
                          type="button"
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
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            type="button"
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
                            type="button"
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
              <Button variant="outline" type="button" onClick={addItem} className="mt-4">
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
                      <Checkbox 
                        id={service.id} 
                        onCheckedChange={(checked) => handleServiceChange(service.id, checked as boolean)}
                      />
                      <Label htmlFor={service.id} className="font-medium">
                        {service.label}
                      </Label>
                    </div>
                    {additionalServices[service.id]?.checked && (
                       <Textarea
                        placeholder={`Details for ${service.label}...`}
                        className="ml-6"
                        value={additionalServices[service.id]?.details || ''}
                        onChange={(e) => handleServiceDetailsChange(service.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading || !user}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {isLoading ? 'Submitting...' : 'Submit Custom Order Request'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
