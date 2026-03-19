'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Loader2, Lock, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/auth-store';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export function ChangePasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearMustChangePassword = useAuthStore((state) => state.clearMustChangePassword);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(newPassword)) {
      setError('Password must contain uppercase, lowercase, and number');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      // Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      // Update must_change_password flag in users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ must_change_password: false })
        .eq('id', user?.id);

      if (dbError) {
        console.error('Failed to update must_change_password flag:', dbError);
        // Don't block the user, the password was already changed
      }

      // Clear must_change_password from local state and cookie
      clearMustChangePassword();

      toast.success('Password updated successfully', {
        description: 'Your password has been changed. You can now continue.',
      });

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Password change error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {/* Header */}
      <div className='flex flex-col items-center gap-2 text-center'>
        <div className='flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-2'>
          <ShieldCheck className='w-6 h-6 text-primary' />
        </div>
        <h1 className='text-2xl font-bold'>Change Your Password</h1>
        <p className='text-muted-foreground text-sm text-balance'>
          For your security, please create a new password before continuing
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='current-password'>Current Password</Label>
          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              id='current-password'
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder='Enter your current password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className='pl-10 pr-10'
              required
              disabled={loading}
            />
            <button
              type='button'
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
              {showCurrentPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='new-password'>New Password</Label>
          <div className='relative'>
            <KeyRound className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              id='new-password'
              type={showNewPassword ? 'text' : 'password'}
              placeholder='Min 6 chars, with uppercase, lowercase & number'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className='pl-10 pr-10'
              required
              disabled={loading}
            />
            <button
              type='button'
              onClick={() => setShowNewPassword(!showNewPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
              {showNewPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='confirm-password'>Confirm New Password</Label>
          <div className='relative'>
            <KeyRound className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              id='confirm-password'
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='Confirm your new password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='pl-10 pr-10'
              required
              disabled={loading}
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
              {showConfirmPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
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
              Updating password...
            </>
          ) : (
            'Update Password & Continue'
          )}
        </Button>
      </form>
    </div>
  );
}
