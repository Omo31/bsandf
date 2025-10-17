'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';

const navLinks = [
  { href: '/dashboard', label: 'Summary' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/history', label: 'Purchase History' },
  { href: '/dashboard/notifications', label: 'Notification Management' },
  { href: '/dashboard/wishlist', label: 'Wishlist' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Find the closest matching link for the current path
  const getActiveTab = () => {
    if (pathname === '/dashboard') return '/dashboard';
    const matchingLink = navLinks.find(link => pathname.startsWith(link.href) && link.href !== '/dashboard');
    return matchingLink ? matchingLink.href : '/dashboard';
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 md:gap-4 items-center">
            <Logo className="w-7 h-7 text-primary" />
            <h1 className="text-lg font-semibold">My Dashboard</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                View Store
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="container flex-1 mt-6">
        <Tabs value={getActiveTab()} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {navLinks.map((link) => (
              <TabsTrigger key={link.href} value={link.href} asChild>
                <Link href={link.href}>{link.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
