'use client';

import { useState } from 'react';

import { Loader2, Mail, KeyRound, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setEmailSent(true);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <div className='flex flex-col items-center gap-2 text-center'>
          <div className='flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-2'>
            <Mail className='w-6 h-6 text-primary' />
          </div>
          <h1 className='text-2xl font-bold'>Check your email</h1>
          <p className='text-muted-foreground text-sm text-balance'>
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
        </div>
        <div className='text-center'>
          <Button variant='outline' asChild>
            <a href='/login'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to login
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {/* Header */}
      <div className='flex flex-col items-center gap-2 text-center'>
        <div className='flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-2'>
          <KeyRound className='w-6 h-6 text-primary' />
        </div>
        <h1 className='text-2xl font-bold'>Forgot password?</h1>
        <p className='text-muted-foreground text-sm text-balance'>
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='email'>Email</Label>
          <div className='relative'>
            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              id='email'
              type='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='pl-10'
              required
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className='text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg'>
            {error}
          </div>
        )}

        <Button type='submit' className='w-full h-11' disabled={loading}>
          {loading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Sending...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className='text-center text-sm text-muted-foreground'>
        <p>
          Remember your password?{' '}
          <a href='/login' className='text-primary hover:underline'>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
