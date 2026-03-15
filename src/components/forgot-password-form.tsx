'use client';

import { useState } from 'react';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (_data: ForgotPasswordFormData) => {
    try {
      // TODO: Implement actual forgot password logic
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmailSent(true);
    } catch {
      // Handle error appropriately in production
      throw new Error('Forgot password failed');
    }
  };

  if (emailSent) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <div className='flex flex-col items-center gap-2 text-center'>
          <h1 className='text-2xl font-bold'>Check your email</h1>
          <p className='text-muted-foreground text-sm text-balance'>
            We&apos;ve sent a password reset link to your email address.
          </p>
        </div>
        <div className='text-center'>
          <Button variant='outline' asChild>
            <Link href='/login'>Back to login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-2xl font-bold'>Forgot your password?</h1>
        <p className='text-muted-foreground text-sm text-balance'>
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
        <div className='grid gap-3'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            placeholder='m@example.com'
            {...register('email')}
          />
          {errors.email && (
            <p className='text-destructive text-sm'>{errors.email.message}</p>
          )}
        </div>
        <Button type='submit' className='w-full' disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>
      <div className='text-center text-sm'>
        Remember your password?{' '}
        <Link href='/login' className='underline underline-offset-4'>
          Back to login
        </Link>
      </div>
    </div>
  );
}
