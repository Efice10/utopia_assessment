'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Enable hover tilt effect */
  tilt?: boolean;
  /** Enable glow effect on hover */
  glow?: boolean;
  /** Glow color (tailwind color) */
  glowColor?: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan';
  /** Enable hover lift animation */
  hover?: boolean;
}

const glowColors = {
  blue: 'hover:shadow-blue-500/20',
  violet: 'hover:shadow-violet-500/20',
  emerald: 'hover:shadow-emerald-500/20',
  amber: 'hover:shadow-amber-500/20',
  rose: 'hover:shadow-rose-500/20',
  cyan: 'hover:shadow-cyan-500/20',
};

export function GlassCard({
  children,
  className,
  tilt = false,
  glow = false,
  glowColor = 'violet',
  hover = true,
  ...props
}: GlassCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [transform, setTransform] = React.useState('');

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt || !cardRef.current) return;

      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    },
    [tilt]
  );

  const handleMouseLeave = React.useCallback(() => {
    if (!tilt) return;
    setTransform('');
  }, [tilt]);

  return (
    <div
      ref={cardRef}
      className={cn(
        'rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-xl dark:bg-gray-900/80 dark:border-gray-700/50',
        hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl',
        glow && glowColors[glowColor],
        className
      )}
      style={{
        transform: tilt ? transform : undefined,
        transition: tilt ? 'transform 0.1s ease-out' : undefined,
      }}
      onMouseMove={tilt ? handleMouseMove : undefined}
      onMouseLeave={tilt ? handleMouseLeave : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

// Simpler version for basic usage
export function SimpleGlassCard({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-xl dark:bg-gray-900/80 dark:border-gray-700/50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
