'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Loader2, Mail, Lock, UserPlus, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);
  const loading = useAuthStore((state) => state.loading);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const result = await signUp(email, password, name);

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/orders');
      router.refresh();
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {/* Header */}
      <div className='flex flex-col items-center gap-2 text-center'>
        <div className='flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-2'>
          <UserPlus className='w-6 h-6 text-primary' />
        </div>
        <h1 className='text-2xl font-bold'>Create an account</h1>
        <p className='text-muted-foreground text-sm text-balance'>
          Enter your details to get started
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='name'>Full Name</Label>
          <div className='relative'>
            <User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              id='name'
              type='text'
              placeholder='John Doe'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='pl-10'
              required
              disabled={loading}
            />
          </div>
        </div>

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

        <div className='flex flex-col gap-2'>
          <Label htmlFor='password'>Password</Label>
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              id='password'
              type='password'
              placeholder='Create a password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='pl-10'
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='confirmPassword'>Confirm Password</Label>
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              id='confirmPassword'
              type='password'
              placeholder='Confirm your password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className='text-center text-sm text-muted-foreground'>
        <p>
          Already have an account?{' '}
          <a href='/login' className='text-primary hover:underline'>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
