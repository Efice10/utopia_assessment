import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { AnimatedPage } from '@/components/ui/animated-page';

export default function ForgotPasswordPage() {
  return (
    <AnimatedPage animation='slide-horizontal'>
      <ForgotPasswordForm />
    </AnimatedPage>
  );
}
