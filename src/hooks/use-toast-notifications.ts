'use client';

import { toast } from 'sonner';

import type { ToastOptions } from '@/types/ui';

export function useToastNotifications() {
  const showSuccess = (message: string, title?: string) => {
    toast.success(title ?? 'Success', {
      description: message,
    });
  };

  const showError = (message: string, title?: string) => {
    toast.error(title ?? 'Error', {
      description: message,
    });
  };

  const showInfo = (message: string, title?: string) => {
    toast.info(title ?? 'Info', {
      description: message,
    });
  };

  const showCustom = ({
    title,
    description,
    variant = 'default',
    duration,
  }: ToastOptions) => {
    if (variant === 'destructive') {
      toast.error(title ?? 'Error', {
        description,
        duration,
      });
    } else {
      toast(title ?? 'Notification', {
        description,
        duration,
      });
    }
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showCustom,
  };
}
