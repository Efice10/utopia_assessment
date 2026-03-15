'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BarChart3, FileText, Home, Settings, Users, Zap } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
  },
  {
    title: 'Integrations',
    href: '/dashboard/integrations',
    icon: Zap,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

interface DashboardSidebarProps {
  onItemClick?: () => void;
}

export const DashboardSidebar = ({ onItemClick }: DashboardSidebarProps) => {
  const pathname = usePathname();

  return (
    <div className='flex h-screen flex-col border-r bg-white dark:bg-gray-800'>
      {/* Logo/Brand */}
      <div className='flex h-16 items-center border-b px-6'>
        <Link href='/dashboard' className='flex items-center space-x-2'>
          <div className='bg-primary flex h-8 w-8 items-center justify-center rounded-lg'>
            <Zap className='text-primary-foreground h-4 w-4' />
          </div>
          <span className='text-lg font-semibold'>Dashboard</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className='flex-1 space-y-1 p-4'>
        {sidebarItems.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
              )}
            >
              <Icon className='h-4 w-4' />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className='border-t p-4'>
        <div className='flex items-center space-x-3 px-3 py-2'>
          <div className='h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600' />
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-gray-900 dark:text-gray-100'>
              John Doe
            </p>
            <p className='truncate text-xs text-gray-500 dark:text-gray-400'>
              john@example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
