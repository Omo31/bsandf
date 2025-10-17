'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Search } from 'lucide-react';
import { cn } from '@/lib/utils';


// Mock data for conversations, we will replace this with real data from Firestore
const conversations = [
    { id: 'user-2', name: 'Bob', lastMessage: 'Okay, thank you!', unread: 0, avatar: 'https://picsum.photos/seed/2/40/40' },
    { id: 'user-3', name: 'Charlie', lastMessage: 'I need help with a custom order.', unread: 2, avatar: 'https://picsum.photos/seed/3/40/40' },
    { id: 'user-4', name: 'David', lastMessage: 'When will my order ship?', unread: 1, avatar: 'https://picsum.photos/seed/4/40/40' },
];

const messagesByConversation: Record<string, {author: 'user' | 'admin', message: string}[]> = {
    'user-2': [
        { author: 'user', message: 'I have a question about my order.' },
        { author: 'admin', message: 'I can help with that. What is your order number?' },
        { author: 'user', message: 'It is ORD001.' },
        { author: 'admin', message: 'Thank you. It looks like your order has been shipped and is scheduled for delivery tomorrow.' },
        { author: 'user', message: 'Okay, thank you!' },
    ],
    'user-3': [
        { author: 'user', message: 'I need help with a custom order.' },
        { author: 'user', message: 'I want to order 10kg of wagyu beef, is that possible?' },
    ],
    'user-4': [
        { author: 'user', message: 'When will my order ship?' },
    ],
};


function ChatMessage({ author, message, avatar }: { author: 'user' | 'admin'; message: string, avatar: string }) {
  const isUser = author === 'user';
  return (
    <div className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatar} />
          <AvatarFallback>{'U'}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-lg px-3 py-2 text-sm',
          isUser
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
    const [selectedConversation, setSelectedConversation] = useState(conversations[1].id);
    
    const activeConversation = conversations.find(c => c.id === selectedConversation);
    const activeMessages = messagesByConversation[selectedConversation] || [];

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
                             {conversations.map(convo => (
                                <button
                                    key={convo.id}
                                    className={cn(
                                        "w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors",
                                        selectedConversation === convo.id ? "bg-secondary" : "hover:bg-muted/50"
                                    )}
                                    onClick={() => setSelectedConversation(convo.id)}
                                >
                                    <Avatar>
                                        <AvatarImage src={convo.avatar} />
                                        <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 truncate">
                                        <p className="font-semibold">{convo.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                                    </div>
                                    {convo.unread > 0 && (
                                        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                            {convo.unread}
                                        </div>
                                    )}
                                </button>
                             ))}
                           </div>
                        </ScrollArea>
                    </div>

                    {/* Chat Window */}
                    <div className="md:col-span-2 flex flex-col h-full">
                       {activeConversation ? (
                         <>
                            <div className="p-4 border-b flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={activeConversation.avatar} />
                                    <AvatarFallback>{activeConversation.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{activeConversation.name}</p>
                                    <p className="text-xs text-muted-foreground">Online</p>
                                </div>
                            </div>
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                   {activeMessages.map((msg, index) => (
                                       <ChatMessage key={index} author={msg.author} message={msg.message} avatar={activeConversation.avatar} />
                                   ))}
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t bg-background">
                                <div className="relative">
                                    <Input placeholder="Type a message..." className="pr-12" />
                                    <Button size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                         </>
                       ) : (
                           <div className="flex flex-1 items-center justify-center text-muted-foreground">
                               <p>Select a conversation to start chatting.</p>
                           </div>
                       )}
                    </div>
                </div>
            </Card>
        </div>
    )
}
