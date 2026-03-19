import { ChangePasswordForm } from '@/components/auth/change-password-form';
import { AnimatedPage } from '@/components/ui/animated-page';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Change Password',
  description: 'Update your password to continue.',
};

export default function ChangePasswordPage() {
  return (
    <AnimatedPage animation='slide-horizontal'>
      <ChangePasswordForm />
    </AnimatedPage>
  );
}
