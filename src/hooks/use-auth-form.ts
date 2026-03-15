'use client';

import { useState } from 'react';

import type { LoadingState } from '@/types/ui';

export function useAuthForm(): LoadingState & {
  handleSubmit: (submitFn: () => Promise<void>) => Promise<void>;
  clearError: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (submitFn: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await submitFn();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { loading, error, handleSubmit, clearError };
}
