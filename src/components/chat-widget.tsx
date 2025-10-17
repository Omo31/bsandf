'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MessageSquare, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const firstVisit = !localStorage.getItem('bsf_visited');
    if (firstVisit) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem('bsf_visited', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if(showPopup) setShowPopup(false);
  };
  
  const closePopup = () => {
    setShowPopup(false);
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {showPopup && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
              className="mb-2 w-72 rounded-lg bg-card p-4 shadow-lg border relative"
            >
              <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={closePopup}>
                <X className="h-4 w-4" />
              </Button>
              <p className="text-sm font-medium">Welcome to BeautifulSoup&Food!</p>
              <p className="text-sm text-muted-foreground">Need help? Chat with us!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={toggleChat}
          aria-label="Toggle chat"
        >
           <AnimatePresence>
            {isOpen ? (
              <motion.div key="close" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><X /></motion.div>
            ) : (
              <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><MessageSquare /></motion.div>
            )}
           </AnimatePresence>
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
            className="fixed bottom-20 right-4 z-50"
          >
            <Card className="w-80 h-[500px] flex flex-col shadow-2xl">
              <CardHeader className="flex flex-row items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://picsum.photos/seed/support/40/40" />
                  <AvatarFallback>BS</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base">Support</CardTitle>
                  <p className="text-xs text-muted-foreground">We'll reply as soon as possible</p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    <ChatMessage author="support" message="Hello! How can I help you today?" />
                    <ChatMessage author="user" message="I have a question about my order." />
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="pt-4">
                <div className="relative w-full">
                  <Input placeholder="Type a message..." className="pr-12" />
                  <Button size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatMessage({ author, message }: { author: 'user' | 'support'; message: string }) {
  const isUser = author === 'user';
  return (
    <div className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://picsum.photos/seed/support/32/32" />
          <AvatarFallback>BS</AvatarFallback>
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
