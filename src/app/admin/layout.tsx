'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/admin', label: 'Summary' },
  { href: '/admin/users', label: 'User Management' },
  { href: '/admin/inventory', label: 'Inventory' },
  { href: '/admin/orders', label: 'Order Management' },
  { href: '/admin/custom-order-settings', label: 'Custom Orders'},
  { href: '/admin/flyer-generator', label: 'AI Flyer Generator' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
             <h1 className="text-lg font-semibold">Admin Panel</h1>
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
        <Tabs value={pathname} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
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
