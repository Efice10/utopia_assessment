'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { AppFooter } from '@/components/layouts/app-footer';
import { AppSidebar } from '@/components/layouts/app-sidebar';
import { HeaderUser } from '@/components/layouts/header-user';
import { ThemeToggle } from '@/components/theme-toggle';
import { DynamicBreadcrumb } from '@/components/ui/dynamic-breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuthStore, useUser, useAuthInitialized } from '@/lib/auth-store';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useUser();
  const initialized = useAuthInitialized();
  const initialize = useAuthStore((state) => state.initialize);
  const signOut = useAuthStore((state) => state.signOut);

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect if not authenticated after initialization
  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [initialized, user, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  // Show loading spinner while initializing
  if (!initialized) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    );
  }

  // Don't render if no user
  if (!user) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-card/80 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
          <div className='flex items-center gap-2 px-4'>
            <div className='transition-transform duration-150 ease-out hover:scale-110 active:scale-95'>
              <SidebarTrigger className='-ml-1' />
            </div>
            <Separator
              orientation='vertical'
              className='mr-2 data-[orientation=vertical]:h-4'
            />
            <DynamicBreadcrumb />
          </div>
          <div className='flex items-center gap-2 px-4'>
            {/* <NotificationBell /> */}
            <ThemeToggle />
            <HeaderUser
              user={{
                name: user.name,
                email: user.email,
                avatar: user.avatar,
              }}
              onLogout={handleLogout}
            />
          </div>
        </header>
        <main className='flex flex-1 flex-col gap-4 p-4 pb-8'>{children}</main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
