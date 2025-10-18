
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, ListOrdered, Bell, Heart, BarChart, Users, ShoppingCart, Settings, Wand2, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAdmin } from '@/hooks/use-admin';
import { useUser } from '@/firebase';

const userNavLinks = [
  { href: '/dashboard', label: 'Summary', icon: BarChart },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/history', label: 'Purchase History', icon: ListOrdered },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
];

const adminNavLinks = [
  { href: '/dashboard/users', label: 'User Management', icon: Users },
  { href: '/dashboard/inventory', label: 'Inventory', icon: ShoppingCart },
  { href: '/dashboard/orders', label: 'Order Management', icon: ListOrdered },
  { href: '/dashboard/homepage-settings', label: 'Homepage Settings', icon: LayoutDashboard },
  { href: '/dashboard/custom-order-settings', label: 'Custom Orders', icon: Settings },
  { href: '/dashboard/flyer-generator', label: 'AI Flyer Generator', icon: Wand2 },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { isAdmin } = useAdmin();

  const getActiveTab = (linkHref: string) => {
    if (linkHref === '/dashboard') {
      return pathname === linkHref;
    }
    return pathname.startsWith(linkHref);
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <div className="flex items-center gap-2">
            <Logo className="w-7 h-7 text-primary" />
            <span className="text-lg font-semibold">My Dashboard</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {userNavLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton asChild isActive={getActiveTab(link.href)} tooltip={{children: link.label}}>
                  <Link href={link.href}>
                    <link.icon />
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          {user && isAdmin && (
            <>
              <SidebarSeparator />
              <SidebarMenu>
                 <SidebarMenuItem>
                    <div className="px-2 text-xs font-medium text-muted-foreground">Admin Controls</div>
                 </SidebarMenuItem>
                {adminNavLinks.map((link) => (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild isActive={getActiveTab(link.href)} tooltip={{children: link.label}}>
                      <Link href={link.href}>
                        <link.icon />
                        <span>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </>
          )}

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
            <h1 className="text-lg font-semibold">My Dashboard</h1>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
