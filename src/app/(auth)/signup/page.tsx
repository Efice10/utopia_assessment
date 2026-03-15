import { SignupForm } from '@/components/auth/signup-form';
import { AnimatedPage } from '@/components/ui/animated-page';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new account to get started with our platform.',
};

export default function SignupPage() {
  return (
    <AnimatedPage animation='slide-horizontal'>
      <SignupForm />
    </AnimatedPage>
  );
}
