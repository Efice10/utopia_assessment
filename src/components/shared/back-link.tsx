'use client';

import Link from 'next/link';

import { ChevronLeft } from 'lucide-react';

import { cn } from '@/lib/utils';

interface BackLinkProps {
  href: string;
  label?: string;
  className?: string;
  /** Use 'light' variant on dark/colored backgrounds */
  variant?: 'default' | 'light';
}

export function BackLink({ href, label = 'Back', className, variant = 'default' }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-1 text-sm transition-colors',
        variant === 'default' && 'text-muted-foreground hover:text-foreground',
        variant === 'light' && 'text-white/70 hover:text-white',
        className
      )}
    >
      <ChevronLeft className='h-4 w-4 transition-transform group-hover:-translate-x-0.5' />
      <span className='relative'>
        {label}
        <span className='absolute inset-x-0 -bottom-0.5 h-px bg-current scale-x-0 group-hover:scale-x-100 transition-transform origin-left' />
      </span>
    </Link>
  );
}
