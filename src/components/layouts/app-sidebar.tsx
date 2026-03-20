'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Activity,
  Building2,
  ClipboardList,
  LayoutDashboard,
  type LucideIcon,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';

import { BranchSwitcher } from '@/components/layouts/branch-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

// Types
interface NavItemType {
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: string;
  roles: ('admin' | 'technician' | 'manager')[];
}

interface NavSection {
  label: string;
  items: NavItemType[];
}

// All navigation items based on PRD Access Control Matrix
const allNavSections: NavSection[] = [
  {
    label: 'Operations',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'manager', 'technician'], // Available to all roles
      },
      {
        title: 'Orders',
        url: '/orders',
        icon: ClipboardList,
        badge: 'New',
        roles: ['admin'], // Admin: Create Order = Yes
      },
      {
        title: 'My Jobs',
        url: '/jobs',
        icon: Wrench,
        roles: ['technician'], // Technician: View Own Jobs = Yes
      },
      {
        title: 'All Jobs',
        url: '/jobs',
        icon: ClipboardList,
        roles: ['manager'], // Manager: View All Jobs = Yes
      },
      {
        title: 'Technicians',
        url: '/technicians',
        icon: Users,
        roles: ['admin'], // Admin: Assign Technician = Yes
      },
      {
        title: 'Branches',
        url: '/branches',
        icon: Building2,
        roles: ['admin'], // Admin: Manage Branches = Yes
      },
    ],
  },
];

// AI Feature - Available to Admin and Manager
const aiFeatureItem: NavItemType = {
  title: 'AI Assistant',
  url: '/ai-assistant',
  icon: Sparkles,
  roles: ['admin', 'manager'], // Admin & Manager: AI Queries = Yes
};

// Audit Logs - Admin only
const auditLogsItem: NavItemType = {
  title: 'Audit Logs',
  url: '/audit-logs',
  icon: Activity,
  roles: ['admin'],
};

// Get navigation filtered by role
const getNavigationForRole = (userRole: string): NavSection[] => {
  return allNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(userRole as 'admin' | 'technician' | 'manager')),
    }))
    .filter((section) => section.items.length > 0);
};

// Nav Item Component
function NavItem({ item }: { item: NavItemType }) {
  const pathname = usePathname();
  const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
      >
        <Link href={item.url}>
          {item.icon && <item.icon className='h-4 w-4' />}
          <span>{item.title}</span>
          {item.badge && (
            <span className='ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded'>
              {item.badge}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// AI Feature Button
function AIFeatureButton({ item }: { item: NavItemType }) {
  const pathname = usePathname();
  const isActive = pathname === item.url;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={cn(
          'group relative overflow-hidden',
          'bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10',
          'hover:from-violet-500/20 hover:via-fuchsia-500/20 hover:to-violet-500/20',
          'border border-violet-500/20'
        )}
      >
        <Link href={item.url}>
          {item.icon && (
            <item.icon className='h-4 w-4 text-violet-500 dark:text-violet-400' />
          )}
          <span className='text-violet-600 dark:text-violet-400 font-medium'>
            {item.title}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();
  const userRole = (user?.role as 'admin' | 'technician' | 'manager') ?? 'admin';

  // Get navigation based on role
  const navigationSections = getNavigationForRole(userRole);

  // Admin and Manager can see AI
  const showAI = ['admin', 'manager'].includes(userRole);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BranchSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {/* Role indicator */}
        {/* <div className='px-4 py-2'>
          <span className='text-xs text-muted-foreground'>
            Logged in as: <span className='font-medium capitalize'>{userRole}</span>
          </span>
        </div> */}

        {/* Main Navigation */}
        {navigationSections.map((section, index) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => (
                <NavItem key={item.url} item={item} />
              ))}
            </SidebarMenu>
            {index < navigationSections.length - 1 && <SidebarSeparator />}
          </SidebarGroup>
        ))}

        {/* AI Feature - Only Manager */}
        {showAI && (
          <SidebarGroup>
            <SidebarGroupLabel>AI Features</SidebarGroupLabel>
            <SidebarMenu>
              <AIFeatureButton item={aiFeatureItem} />
            </SidebarMenu>
          </SidebarGroup>
        )}

        <SidebarSeparator />

        {/* Audit Logs - Admin Only */}
        {userRole === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarMenu>
              <NavItem item={auditLogsItem} />
            </SidebarMenu>
          </SidebarGroup>
        )}

      </SidebarContent>

      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
