'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import type { ChatMessage, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


function ChatMessageDisplay({ author, message, avatar, currentAdminId }: { author: string; message: string, avatar: string, currentAdminId: string }) {
  const isAdmin = author === currentAdminId;
  return (
    <div className={cn('flex items-end gap-2', !isAdmin ? 'justify-start' : 'justify-end')}>
       {!isAdmin && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatar} />
          <AvatarFallback>{'U'}</AvatarFallback>
        </Avatar>
       )}
      <div
        className={cn(
          'max-w-[75%] rounded-lg px-3 py-2 text-sm',
          isAdmin
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted rounded-bl-none'
        )}
      >
        {message}
      </div>
    </div>
  );
}


export default function AdminChatPage() {
    const { user: adminUser, isUserLoading: isAdminLoading } = useUser();
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'user'))
    }, [firestore]);

    const { data: users, isLoading: areUsersLoading } = useCollection<User>(usersQuery);

    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');

    const sentMessagesQuery = useMemoFirebase(() => {
        if (!adminUser || !selectedUserId || !firestore) return null;
        return query(
            collection(firestore, 'chat_messages'),
            where('senderId', '==', adminUser.uid),
            where('receiverId', '==', selectedUserId)
        );
    }, [adminUser, selectedUserId, firestore]);

    const receivedMessagesQuery = useMemoFirebase(() => {
        if (!adminUser || !selectedUserId || !firestore) return null;
        return query(
            collection(firestore, 'chat_messages'),
            where('senderId', '==', selectedUserId),
            where('receiverId', '==', adminUser.uid)
        );
    }, [adminUser, selectedUserId, firestore]);
    
    const { data: sentMessages, isLoading: isLoadingSent } = useCollection<ChatMessage>(sentMessagesQuery);
    const { data: receivedMessages, isLoading: isLoadingReceived } = useCollection<ChatMessage>(receivedMessagesQuery);

    const areMessagesLoading = isLoadingSent || isLoadingReceived;

    const activeMessages = useMemo(() => {
        if (!sentMessages && !receivedMessages) return [];
        const allMessages = [...(sentMessages || []), ...(receivedMessages || [])];
        return allMessages.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
    }, [sentMessages, receivedMessages]);
    
    const activeConversationUser = useMemo(() => users?.find(u => u.uid === selectedUserId), [users, selectedUserId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !adminUser || !selectedUserId || !firestore) return;

        const messageData = {
            senderId: adminUser.uid,
            receiverId: selectedUserId,
            message: newMessage,
            timestamp: serverTimestamp(),
            senderName: `${adminUser.displayName}`,
            receiverName: `${activeConversationUser?.firstName} ${activeConversationUser?.lastName}`,
        };

        try {
            await addDoc(collection(firestore, 'chat_messages'), messageData);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    
    useEffect(() => {
        if (users && users.length > 0 && !selectedUserId) {
            setSelectedUserId(users[0].uid);
        }
    }, [users, selectedUserId]);

    if (isAdminLoading) {
      return (
        <div className="flex-1 space-y-4 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Customer Chat</h2>
                    <p className="text-muted-foreground">
                        Respond to customer inquiries in real-time.
                    </p>
                </div>
            </div>
            <Card className="h-[calc(100vh-12rem)]">
                <Skeleton className="h-full w-full" />
            </Card>
        </div>
      );
    }
    
    if (!adminUser) {
        return (
             <div className="flex-1 space-y-4 pt-6">
                <h2 className="text-3xl font-bold tracking-tight">Access Denied</h2>
                <p className="text-muted-foreground">
                    You must be logged in as an administrator to view this page.
                </p>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                <h2 className="text-3xl font-bold tracking-tight">Customer Chat</h2>
                <p className="text-muted-foreground">
                    Respond to customer inquiries in real-time.
                </p>
                </div>
            </div>

            <Card className="h-[calc(100vh-12rem)]">
                <div className="grid grid-cols-1 md:grid-cols-3 h-full">
                    {/* Conversations List */}
                    <div className="border-r flex flex-col">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold">Conversations</h3>
                             <div className="relative mt-2">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search..." className="pl-8" />
                            </div>
                        </div>
                        <ScrollArea className="flex-1">
                           <div className="p-2">
                             {areUsersLoading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mt-4" />}
                             {users?.map(user => (
                                <button
                                    key={user.uid}
                                    className={cn(
                                        "w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors",
                                        selectedUserId === user.uid ? "bg-secondary" : "hover:bg-muted/50"
                                    )}
                                    onClick={() => setSelectedUserId(user.uid)}
                                >
                                    <Avatar>
                                        <AvatarImage src={`https://picsum.photos/seed/${user.uid}/40/40`} />
                                        <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 truncate">
                                        <p className="font-semibold">{user.firstName} {user.lastName}</p>
                                        <p className="text-sm text-muted-foreground truncate">Customer</p>
                                    </div>
                                </button>
                             ))}
                           </div>
                        </ScrollArea>
                    </div>

                    {/* Chat Window */}
                    <div className="md:col-span-2 flex flex-col h-full">
                       {activeConversationUser && adminUser ? (
                         <>
                            <div className="p-4 border-b flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={`https://picsum.photos/seed/${activeConversationUser.uid}/40/40`} />
                                    <AvatarFallback>{activeConversationUser.firstName?.charAt(0)}{activeConversationUser.lastName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{activeConversationUser.firstName} {activeConversationUser.lastName}</p>
                                    <p className="text-xs text-muted-foreground">Online</p>
                                </div>
                            </div>
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                   {areMessagesLoading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />}
                                   {activeMessages.map((msg) => (
                                       <ChatMessageDisplay key={msg.id} author={msg.senderId} message={msg.message} avatar={`https://picsum.photos/seed/${activeConversationUser.uid}/32/32`} currentAdminId={adminUser.uid}/>
                                   ))}
                                </div>
                            </ScrollArea>
                            <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
                                <div className="relative">
                                    <Input 
                                        placeholder="Type a message..." 
                                        className="pr-12" 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <Button type="submit" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                         </>
                       ) : (
                           <div className="flex flex-1 items-center justify-center text-muted-foreground">
                               {areUsersLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : <p>Select a conversation to start chatting.</p>}
                           </div>
                       )}
                    </div>
                </div>
            </Card>
        </div>
    )
}
