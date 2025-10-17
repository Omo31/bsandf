'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ShoppingCart, ListOrdered, Settings, Wand2, BarChart, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';

const navLinks = [
  { href: '/admin', label: 'Summary', icon: BarChart },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: ShoppingCart },
  { href: '/admin/orders', label: 'Order Management', icon: ListOrdered },
  { href: '/admin/homepage-settings', label: 'Homepage Settings', icon: LayoutDashboard },
  { href: '/admin/custom-order-settings', label: 'Custom Orders', icon: Settings },
  { href: '/admin/flyer-generator', label: 'AI Flyer Generator', icon: Wand2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="w-7 h-7 text-primary" />
            <span className="text-lg font-semibold">Admin Panel</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === link.href}
                  tooltip={{ children: link.label }}
                >
                  <Link href={link.href}>
                    <link.icon />
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button asChild variant="outline" className="w-full justify-start gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>View Store</span>
            </Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 p-2 flex items-center gap-2 md:hidden">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Admin Panel</h1>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
