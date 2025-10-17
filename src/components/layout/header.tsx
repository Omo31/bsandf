
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  ShoppingCart,
  User,
  LayoutGrid,
  Heart,
  ListOrdered,
  LogOut,
  Menu,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { Logo } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { useAdmin } from '@/hooks/use-admin';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#shop', label: 'Shop' },
  { href: '/custom-order', label: 'Custom Order' },
  { href: '/dashboard/wishlist', label: 'For You' },
];

export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const { user, isUserLoading } = useUser();
  const { isAdmin } = useAdmin();
  const auth = useAuth();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };
  
  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  const isAuthenticated = !!user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">BeautifulSoup&Food</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        
        {isClient && (
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                 <Link href="/" className="flex items-center space-x-2 mb-6" onClick={handleLinkClick}>
                    <Logo className="h-6 w-6 text-primary" />
                    <span className="font-bold">BeautifulSoup&Food</span>
                </Link>
                <div className="flex flex-col space-y-4">
                   {navLinks.map(({ href, label }) => (
                    <Link key={label} href={href} className="text-sm font-medium" onClick={handleLinkClick}>
                      {label}
                    </Link>
                  ))}
                  <DropdownMenuSeparator />
                  {isAuthenticated ? (
                    <>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <Link href="/dashboard" className="text-sm font-medium pl-2" onClick={handleLinkClick}>
                        Dashboard
                      </Link>
                       <DropdownMenuSeparator />
                       <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Logout</span>
                      </Button>
                    </>
                  ) : (
                     <Button asChild onClick={handleLinkClick}>
                        <Link href="/login">Login</Link>
                      </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
        
        <Link href="/" className="flex items-center space-x-2 md:hidden ml-2">
          <Logo className="h-6 w-6 text-primary" />
          <span className="font-bold">BS&F</span>
        </Link>


        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="relative w-full max-w-sm items-center hidden md:flex">
            <Input type="search" placeholder="AI-Enhanced Search..." className="pl-10" />
            <span className="absolute inset-y-0 left-0 flex items-center justify-center pl-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </span>
          </div>
           
          {isClient && isAuthenticated && (
            <>
              <Button asChild variant="ghost" size="icon">
                <Link href="/dashboard/notifications">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>

              <Button asChild variant="ghost" size="icon">
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Shopping Cart</span>
                </Link>
              </Button>
            </>
          )}

          {isClient && !isUserLoading && (
            isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutGrid className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/history">
                      <ListOrdered className="mr-2 h-4 w-4" />
                      <span>Order History</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/wishlist">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="hidden md:inline-flex">
                <Link href="/login">Login</Link>
              </Button>
            )
          )}

        </div>
      </div>
       <div className="container md:hidden pb-2">
           <nav className="flex items-center justify-around text-sm font-medium bg-background rounded-full p-1 border shadow-sm">
            {navLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="transition-colors hover:text-foreground/80 text-foreground/60 px-3 py-1.5 rounded-full"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
    </header>
  );
}
