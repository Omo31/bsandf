
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
import { Loader2, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const notificationSettings = [
  { id: 'new-offers', label: 'New Special Offers', description: 'Receive notifications about new promotions and discounts.' },
  { id: 'order-updates', label: 'Order Status Updates', description: 'Get updates on your order status, including shipping and delivery.' },
  { id: 'recommendations', label: 'Personalized Recommendations', description: 'Receive product recommendations based on your purchase history.' },
  { id: 'newsletter', label: 'Weekly Newsletter', description: 'Subscribe to our weekly newsletter with recipes and tips.' },
];

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      shippingAddress: '',
      phoneNumber: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);


  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data() as AppUser;
          setProfileData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            shippingAddress: data.shippingAddress || '',
            phoneNumber: data.phoneNumber || '',
          });
        }
      });
    } else if (!isUserLoading && !user) {
        // Set default/empty state if no user is logged in
        setProfileData({
            firstName: 'Guest',
            lastName: 'User',
            email: 'Not logged in',
            shippingAddress: '',
            phoneNumber: ''
        });
    }
  }, [user, firestore, isUserLoading]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({...prev, [id]: value}));
  }

  const handleSaveChanges = () => {
      if(user && firestore) {
          setIsSavingProfile(true);
          const userDocRef = doc(firestore, 'users', user.uid);
          updateDoc(userDocRef, {
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              shippingAddress: profileData.shippingAddress,
              phoneNumber: profileData.phoneNumber
          }).then(() => {
              toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
          }).catch(error => {
              toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
          }).finally(() => {
              setIsSavingProfile(false);
          });
      }
  }

    const handlePasswordReset = async () => {
    if (!user?.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No email address found for your account.',
      });
      return;
    }
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: 'Password Reset Email Sent',
        description: `An email has been sent to ${user.email} with instructions to reset your password.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send Email',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  const isLoading = isUserLoading && !user;

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
          {isLoading ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/80/80`} />
                  <AvatarFallback>{profileData.firstName ? profileData.firstName.charAt(0) : 'U'}</AvatarFallback>
                </Avatar>
                <Button variant="outline" disabled={!user}>Change Photo</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={profileData.firstName} onChange={handleProfileInputChange} disabled={!user}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={profileData.lastName} onChange={handleProfileInputChange} disabled={!user}/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profileData.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" value={profileData.phoneNumber} onChange={handleProfileInputChange} disabled={!user}/>
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Primary Address</Label>
                  <Textarea id="shippingAddress" value={profileData.shippingAddress} onChange={handleProfileInputChange} disabled={!user}/>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveChanges} disabled={isSavingProfile || !user}>
            {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your security settings.</CardDescription>
        </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between rounded-lg border p-4">
                 <div className="space-y-0.5">
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">
                        To change your password, send a reset link to your email.
                    </p>
                 </div>
                <Button onClick={handlePasswordReset} disabled={isSendingReset || !user}>
                    {isSendingReset && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                </Button>
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
              <Switch id={setting.id} defaultChecked={setting.id !== 'newsletter'} disabled={!user}/>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
