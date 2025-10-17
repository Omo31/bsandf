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
import {
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { User as AppUser } from '@/lib/types';
import { Loader2 } from 'lucide-react';

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
      firstName: '',
      lastName: '',
      email: '',
      shippingAddress: '',
      phoneNumber: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);


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
    }
  }, [user, firestore]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({...prev, [id]: value}));
  }
  
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({...prev, [id]: value}));
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
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please ensure your new password and confirmation match.',
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
        toast({
            variant: 'destructive',
            title: 'Weak Password',
            description: 'Your new password must be at least 6 characters long.',
        });
        return;
    }

    setIsChangingPassword(true);

    try {
        const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, passwordData.newPassword);
        
        toast({
            title: 'Password Updated',
            description: 'Your password has been successfully changed.',
        });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (error: any) {
        let title = 'An error occurred';
        let description = 'Could not change password. Please try again.';

        if (error.code === 'auth/wrong-password') {
            title = 'Incorrect Password';
            description = 'The current password you entered is incorrect.';
        } else if (error.code === 'auth/too-many-requests') {
            title = 'Too Many Attempts';
            description = 'You have tried to change your password too many times. Please try again later.';
        }

        toast({
            variant: 'destructive',
            title: title,
            description: description,
        });
    } finally {
        setIsChangingPassword(false);
    }
  };


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
              <AvatarFallback>{profileData.firstName ? profileData.firstName.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
            <Button variant="outline" disabled>Change Photo</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={profileData.firstName} onChange={handleProfileInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={profileData.lastName} onChange={handleProfileInputChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profileData.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" value={profileData.phoneNumber} onChange={handleProfileInputChange} />
            </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="shippingAddress">Primary Address</Label>
              <Textarea id="shippingAddress" value={profileData.shippingAddress} onChange={handleProfileInputChange} />
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveChanges} disabled={isSavingProfile}>
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
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordInputChange} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordInputChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordInputChange} required />
                </div>
              </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isChangingPassword}>
                 {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Change Password
            </Button>
          </CardFooter>
        </form>
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
              <Switch id={setting.id} defaultChecked={setting.id !== 'newsletter'} disabled/>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
