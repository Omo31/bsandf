

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  User,
  ListOrdered,
  Bell,
  Heart,
  BarChart,
  Users,
  ShoppingCart,
  Settings,
  Wand2,
  LayoutDashboard,
  Copyright,
  Shield,
  ChevronDown,
} from 'lucide-react';
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

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
  { href: '/dashboard/footer-settings', label: 'Footer Settings', icon: Copyright },
  { href: '/dashboard/custom-order-settings', label: 'Custom Orders', icon: Settings },
  { href: '/dashboard/flyer-generator', label: 'AI Flyer Generator', icon: Wand2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(true);
  const [shouldShowAdminPanel, setShouldShowAdminPanel] = useState(false);
  
  const adminsQuery = useMemoFirebase(() => query(collection(firestore, 'users'), where('role', '==', 'admin')), [firestore]);
  const { data: admins, isLoading: loadingAdmins } = useCollection(adminsQuery as any);

  useEffect(() => {
    if (user) {
        user.getIdTokenResult().then(idTokenResult => {
            const userIsAdmin = !!idTokenResult.claims.admin;
            setIsAdmin(userIsAdmin);
            
            // Show admin panel if user is admin OR if there are no admins in the system yet
            if (userIsAdmin || (!loadingAdmins && admins && admins.length === 0)) {
                setShouldShowAdminPanel(true);
            } else {
                setShouldShowAdminPanel(false);
            }
        });
    } else {
      // Not logged in, don't show admin panel
      setShouldShowAdminPanel(false);
    }
  }, [user, admins, loadingAdmins]);

  const getActiveTab = (linkHref: string) => {
    if (linkHref === '/dashboard') {
      return pathname === linkHref;
    }
    return pathname.startsWith(linkHref);
  };

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
                <SidebarMenuButton asChild isActive={getActiveTab(link.href)} tooltip={{ children: link.label }}>
                  <Link href={link.href}>
                    <link.icon />
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          {shouldShowAdminPanel && (
            <>
              <SidebarSeparator />
              <Collapsible open={isAdminOpen} onOpenChange={setIsAdminOpen} className="w-full">
                 <SidebarMenu>
                    <SidebarMenuItem>
                         <CollapsibleTrigger asChild>
                            <SidebarMenuButton variant="ghost" className="w-full justify-between">
                               <div className="flex items-center gap-2">
                                  <Shield />
                                  <span>Admin Panel</span>
                               </div>
                               <ChevronDown className={cn("h-4 w-4 transition-transform", isAdminOpen && "rotate-180")} />
                            </SidebarMenuButton>
                         </CollapsibleTrigger>
                    </SidebarMenuItem>
                 </SidebarMenu>
                <CollapsibleContent>
                    <SidebarMenu className="pl-4 border-l ml-4">
                        {adminNavLinks.map((link) => (
                        <SidebarMenuItem key={link.href}>
                            <SidebarMenuButton asChild isActive={getActiveTab(link.href)} tooltip={{ children: link.label }}>
                            <Link href={link.href}>
                                <link.icon />
                                <span>{link.label}</span>
                            </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
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
