'use client';

import { useState } from 'react';

import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { DashboardSidebar } from './dashboard-sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            className='fixed top-4 left-4 z-50 lg:hidden'
          >
            <Menu className='h-4 w-4' />
            <span className='sr-only'>Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-64 p-0'>
          <DashboardSidebar onItemClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className='lg:flex'>
        {/* Desktop sidebar */}
        <div className='hidden w-64 shrink-0 lg:block'>
          <DashboardSidebar />
        </div>

        {/* Main content */}
        <div className='flex-1 lg:ml-0'>
          <main className='min-h-screen p-4 pt-16 lg:p-8 lg:pt-8'>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
