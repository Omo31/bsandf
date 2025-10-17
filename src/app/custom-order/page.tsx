import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UtensilsCrossed } from 'lucide-react';

const services = [
  { id: 'gift-wrapping', label: 'Gift Wrapping' },
  { id: 'special-sourcing', label: 'Special Sourcing' },
  { id: 'bulk-order', label: 'Bulk Order Inquiry' },
  { id: 'dietary-prep', label: 'Dietary Preparation' },
];

export default function CustomOrderPage() {
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
            <div className="space-y-2">
              <Label htmlFor="requirements">Describe the products you're looking for</Label>
              <Textarea
                id="requirements"
                placeholder="e.g., 'A large wheel of Parmesan cheese, approximately 5kg', 'Fresh truffles from Italy', etc."
                rows={5}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Services</h3>
            <p className="text-sm text-muted-foreground">Select any additional services you require and provide details.</p>
            <div className="space-y-4">
              {services.map((service) => (
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
