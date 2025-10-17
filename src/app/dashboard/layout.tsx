'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import {
  LayoutGrid,
  ListOrdered,
  Heart,
  User,
  LogOut,
  Home
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const menuItems = [
  { href: '/dashboard', label: 'Summary', icon: LayoutGrid },
  { href: '/dashboard/history', label: 'Purchase History', icon: ListOrdered },
  { href: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
           <div className="flex items-center gap-2" data-collapsible="true">
                <Logo className="w-7 h-7 text-primary" />
                <span className="text-lg font-semibold">BeautifulSoup</span>
            </div>
        </SidebarHeader>
        <SidebarContent className="p-4">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
            <SidebarSeparator />
            <div className="flex items-center gap-3 mt-4" data-collapsible="true">
                <Avatar>
                    <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="text-sm font-semibold">User Name</p>
                    <p className="text-xs text-muted-foreground">user@bsfood.com</p>
                </div>
                <Button variant="ghost" size="icon">
                    <LogOut className="h-4 w-4"/>
                </Button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">My Dashboard</h1>
             <div className="flex-1" />
            <Button asChild variant="outline">
                <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Store
                </Link>
            </Button>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
