import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/login-form';
import { AnimatedPage } from '@/components/ui/animated-page';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description:
    'Sign in to your account to access your dashboard and manage your settings.',
};

export default function LoginPage() {
  return (
    <AnimatedPage animation='slide-horizontal'>
      <Suspense fallback={<div className='flex items-center justify-center min-h-[400px]'>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </AnimatedPage>
  );
}
