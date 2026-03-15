'use client';

import { cn } from '@/lib/utils';

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className }: AppFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'mt-auto border-t bg-card/50 backdrop-blur-sm',
        'px-4 py-4',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          &copy; {currentYear} Your Company. All rights reserved.
        </p>
        <p className="text-xs">
          Version v1.0.0 <span className="text-primary">beta</span>
        </p>
      </div>
    </footer>
  );
}
