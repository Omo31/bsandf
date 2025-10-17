'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const notificationSettings = [
  { id: 'new-offers', label: 'New Special Offers', description: 'Receive notifications about new promotions and discounts.' },
  { id: 'order-updates', label: 'Order Status Updates', description: 'Get updates on your order status, including shipping and delivery.' },
  { id: 'recommendations', label: 'Personalized Recommendations', description: 'Receive product recommendations based on your purchase history.' },
  { id: 'newsletter', label: 'Weekly Newsletter', description: 'Subscribe to our weekly newsletter with recipes and tips.' },
];

export default function NotificationsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notification Management</h2>
          <p className="text-muted-foreground">
            Control how we communicate with you.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose which emails you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationSettings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between space-x-4 rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor={setting.id} className="text-base">
                  {setting.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                    {setting.description}
                </p>
              </div>
              <Switch id={setting.id} defaultChecked={setting.id !== 'newsletter'}/>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
