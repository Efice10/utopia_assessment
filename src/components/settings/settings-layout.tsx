'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  AnimatedSettings,
  AnimatedSettingsHeader,
  AnimatedSettingsSection,
} from '@/components/ui/animated-settings';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const settingsNavigation = [
  {
    name: 'General',
    href: '/dashboard/settings',
    icon: '⚙️',
    disabled: true,
  },
  {
    name: 'Profile',
    href: '/dashboard/settings/profile',
    icon: '👤',
    disabled: true,
  },
  {
    name: 'Security',
    href: '/dashboard/settings/security',
    icon: '🔒',
    disabled: true,
  },
  {
    name: 'Notifications',
    href: '/dashboard/settings/notifications',
    icon: '🔔',
    disabled: true,
  },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatedSettings className='space-y-6'>
      <AnimatedSettingsHeader>
        <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences.
        </p>
      </AnimatedSettingsHeader>
      <Separator />
      <div className='flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12'>
        <AnimatedSettingsSection delay={0.1}>
          <aside className='lg:w-1/5'>
            <nav className='flex space-x-2 lg:flex-col lg:space-y-1 lg:space-x-0'>
              {settingsNavigation.map(item => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start transition-all duration-200',
                    pathname === item.href &&
                      'bg-muted text-primary font-medium',
                    item.disabled && 'opacity-50 cursor-not-allowed hover:scale-100 shadow-sm'
                  )}
                  disabled={item.disabled}
                  asChild={!item.disabled}
                >
                  {item.disabled ? (
                    <span className='flex items-center'>
                      <span className='mr-2'>{item.icon}</span>
                      {item.name}
                    </span>
                  ) : (
                    <Link href={item.href}>
                      <span className='mr-2'>{item.icon}</span>
                      {item.name}
                    </Link>
                  )}
                </Button>
              ))}
            </nav>
          </aside>
        </AnimatedSettingsSection>
        <AnimatedSettingsSection delay={0.2} className='flex-1 lg:max-w-2xl'>
          {children}
        </AnimatedSettingsSection>
      </div>
    </AnimatedSettings>
  );
}
