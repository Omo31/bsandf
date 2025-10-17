'use client';

import { useMemo } from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function NotificationItem({ notification }: { notification: Notification }) {
  const firestore = useFirestore();

  const handleMarkAsRead = () => {
    if (notification.isRead) return;
    const notifRef = doc(firestore, `users/${notification.userId}/notifications/${notification.id}`);
    updateDoc(notifRef, { isRead: true });
  };

  return (
    <div className={cn(
      "flex items-start gap-4 p-4 border-b transition-colors",
      !notification.isRead && "bg-secondary/50"
    )}>
      <div className={cn(
        "h-2 w-2 rounded-full mt-1.5 shrink-0",
        notification.isRead ? "bg-muted-foreground/50" : "bg-primary"
      )} />
      <div className="flex-grow">
        <p className="font-semibold">{notification.title}</p>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(notification.timestamp).toLocaleString()}
        </p>
      </div>
      {!notification.isRead && (
        <Button variant="ghost" size="sm" onClick={handleMarkAsRead}>
          <Check className="mr-2 h-4 w-4" />
          Mark as Read
        </Button>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const notificationsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/notifications`), orderBy('timestamp', 'desc'));
  }, [user, firestore]);

  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleMarkAllAsRead = () => {
    if (!user || !notifications) return;
    notifications.forEach(notification => {
      if (!notification.isRead) {
        const notifRef = doc(firestore, `users/${user.uid}/notifications/${notification.id}`);
        updateDoc(notifRef, { isRead: true });
      }
    });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Here are the latest updates for your account.
          </p>
        </div>
        {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead}>Mark all as read</Button>
        )}
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Updates</CardTitle>
            <CardDescription>You have {unreadCount} unread notifications.</CardDescription>
          </div>
           <Bell className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {isLoading && (
              <div className="p-4 space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}
            {!isLoading && notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            ) : (
              !isLoading && (
                <div className="p-8 text-center text-muted-foreground">
                  You have no notifications yet.
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
