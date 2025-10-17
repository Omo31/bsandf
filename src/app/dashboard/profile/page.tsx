'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useUser, useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { User as AppUser } from '@/lib/types';


const notificationSettings = [
  { id: 'new-offers', label: 'New Special Offers', description: 'Receive notifications about new promotions and discounts.' },
  { id: 'order-updates', label: 'Order Status Updates', description: 'Get updates on your order status, including shipping and delivery.' },
  { id: 'recommendations', label: 'Personalized Recommendations', description: 'Receive product recommendations based on your purchase history.' },
  { id: 'newsletter', label: 'Weekly Newsletter', description: 'Subscribe to our weekly newsletter with recipes and tips.' },
];

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
      name: '',
      email: '',
      shippingAddress: '123 User Street, Yourtown',
      paymentMethod: 'Visa ending in 1234',
      dietaryNotes: 'No nuts, gluten-free preference'
  });

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            shippingAddress: data.shippingAddress || '123 User Street, Yourtown',
            paymentMethod: 'Visa ending in 1234', // This would come from a payments collection
            dietaryNotes: 'No nuts, gluten-free preference' // This could be another field
          });
        }
      });
    }
  }, [user, firestore]);

  const handlePasswordReset = () => {
    if (user && user.email) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => {
          toast({
            title: 'Password Reset Email Sent',
            description: 'Check your inbox for a link to reset your password.',
          });
        })
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Error Sending Email',
            description: error.message,
          });
        });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({...prev, [id]: value}));
  }
  
  const handleSaveChanges = () => {
      if(user && firestore) {
          const userDocRef = doc(firestore, 'users', user.uid);
          const [firstName, ...lastName] = profileData.name.split(' ');
          updateDoc(userDocRef, {
              firstName,
              lastName: lastName.join(' '),
              shippingAddress: profileData.shippingAddress,
              // Other fields would be updated here
          }).then(() => {
              toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
          }).catch(error => {
              toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
          });
      }
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Update your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/80/80`} />
              <AvatarFallback>{profileData.name ? profileData.name.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Photo</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={profileData.name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profileData.email} disabled />
            </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="shippingAddress">Primary Address</Label>
              <Input id="shippingAddress" value={profileData.shippingAddress} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input id="paymentMethod" value={profileData.paymentMethod} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietaryNotes">Dietary Notes</Label>
              <Textarea id="dietaryNotes" value={profileData.dietaryNotes} onChange={handleInputChange} />
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveChanges}>Save Profile</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your security settings.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                 <div>
                    <Label className="text-base">Password</Label>
                    <p className="text-sm text-muted-foreground">
                        Change your password by requesting a reset email.
                    </p>
                 </div>
                 <Button variant="outline" onClick={handlePasswordReset}>Send Reset Link</Button>
             </div>
        </CardContent>
      </Card>

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
