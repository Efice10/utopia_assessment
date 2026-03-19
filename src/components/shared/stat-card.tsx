'use client';

import * as React from 'react';

import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

// Animated counter hook for the ticker effect
function useAnimatedCounter(end: number, duration: number = 1000) {
  const [count, setCount] = React.useState(0);
  const countRef = React.useRef(0);
  const frameRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    const startTime = performance.now();
    const startValue = countRef.current;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + (end - startValue) * easeOutQuart);

      setCount(currentValue);
      countRef.current = currentValue;

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration]);

  return count;
}

// Mini sparkline component
function Sparkline({ data, color = 'currentColor', className }: { data: number[]; color?: string; className?: string }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;
  const padding = 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // Create gradient area
  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg width={width} height={height} className={cn('opacity-60', className)}>
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sparkline-gradient-${color})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={width - padding}
        cy={height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2)}
        r="2"
        fill={color}
      />
    </svg>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: StatCardVariant;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  subtitle?: string;
  className?: string;
  /** Enable animated counter effect for numeric values */
  animate?: boolean;
  /** Sparkline data points for mini trend chart */
  sparklineData?: number[];
}

const variantStyles: Record<StatCardVariant, { bg: string; text: string; iconBg: string; sparklineColor: string }> = {
  default: {
    bg: 'bg-muted/50',
    text: 'text-foreground',
    iconBg: 'bg-muted',
    sparklineColor: '#6b7280',
  },
  success: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/20',
    sparklineColor: '#10b981',
  },
  warning: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-500/20',
    sparklineColor: '#f59e0b',
  },
  danger: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-500/20',
    sparklineColor: '#ef4444',
  },
  info: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-500/20',
    sparklineColor: '#3b82f6',
  },
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    iconBg: 'bg-primary/20',
    sparklineColor: '#8b5cf6',
  },
};

// Animated value display component
function AnimatedValue({ value, animate }: { value: string | number; animate?: boolean }) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  const isNumeric = !isNaN(numericValue) && typeof value === 'number';
  const animatedCount = useAnimatedCounter(isNumeric && animate ? numericValue : 0, 1200);

  if (isNumeric && animate) {
    return <>{animatedCount.toLocaleString()}</>;
  }

  return <>{typeof value === 'number' ? value.toLocaleString() : value}</>;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  trend,
  subtitle,
  className,
  animate = true,
  sparklineData,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        'border overflow-hidden group transition-all duration-300',
        'hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5',
        'hover:border-gray-300 dark:hover:border-gray-600',
        styles.bg,
        className
      )}
    >
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1 flex-1 min-w-0'>
            <p className='text-sm text-muted-foreground'>{label}</p>
            <div className='flex items-end gap-3'>
              <p className={cn('text-2xl font-bold tabular-nums', styles.text)}>
                <AnimatedValue value={value} animate={animate} />
              </p>
              {sparklineData && sparklineData.length > 1 && (
                <Sparkline data={sparklineData} color={styles.sparklineColor} />
              )}
            </div>
            {subtitle && (
              <p className='text-xs text-muted-foreground'>{subtitle}</p>
            )}
            {trend && (
              <div className='flex items-center gap-1.5 text-xs'>
                {trend.direction === 'up' ? (
                  <TrendingUp className='h-3.5 w-3.5 text-emerald-500' />
                ) : (
                  <TrendingDown className='h-3.5 w-3.5 text-red-500' />
                )}
                <span
                  className={cn(
                    'font-medium',
                    trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500'
                  )}
                >
                  {trend.value}
                </span>
                <span className='text-muted-foreground'>vs last period</span>
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                'rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110',
                styles.iconBg
              )}
            >
              <Icon className={cn('h-5 w-5', styles.text)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Grid wrapper for consistent stat card layouts
interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function StatCardGrid({
  children,
  columns = 4,
  className,
}: StatCardGridProps) {
  const colsClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-5',
  }[columns];

  return (
    <div className={cn('grid gap-4', colsClass, className)}>{children}</div>
  );
}

// ============================================================================
// BALANCE CARD - For displaying quotas/balances with progress
// Futuristic design with ticker counters, radial progress, glassmorphism
// ============================================================================

type BalanceCardVariant = 'bar' | 'ring';

interface BalanceCardProps {
  /** Main label (e.g., "Annual Leave") */
  label: string;
  /** Secondary label/code (e.g., "AL") */
  code?: string;
  /** Current balance value */
  balance: number;
  /** Total/max value */
  total: number;
  /** Amount used */
  used?: number;
  /** Amount pending */
  pending?: number;
  /** Category badge text */
  category?: string;
  /** Custom value formatter */
  formatValue?: (value: number) => string;
  /** Enable animated counter (ticker effect) */
  animate?: boolean;
  /** Progress display variant: 'bar' (default) or 'ring' (radial) */
  variant?: BalanceCardVariant;
  /** Color theme based on status */
  status?: 'good' | 'warning' | 'critical';
  className?: string;
}

// Animated progress bar component with gradient
function AnimatedProgressBar({
  percentage,
  animate = true,
  status = 'good',
}: {
  percentage: number;
  animate?: boolean;
  status?: 'good' | 'warning' | 'critical';
}) {
  const [width, setWidth] = React.useState(animate ? 0 : percentage);

  React.useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setWidth(percentage);
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [percentage, animate]);

  const gradientClass = {
    good: 'from-emerald-500 to-green-400',
    warning: 'from-amber-500 to-yellow-400',
    critical: 'from-red-500 to-rose-400',
  }[status];

  return (
    <div className='h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-inner'>
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out',
          gradientClass
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// Animated radial progress ring (futuristic)
function AnimatedProgressRing({
  percentage,
  animate = true,
  status = 'good',
  size = 80,
}: {
  percentage: number;
  animate?: boolean;
  status?: 'good' | 'warning' | 'critical';
  size?: number;
}) {
  const [progress, setProgress] = React.useState(animate ? 0 : percentage);

  React.useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setProgress(percentage);
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [percentage, animate]);

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const strokeColor = {
    good: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444',
  }[status];

  return (
    <svg width={size} height={size} className='transform -rotate-90'>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        className='text-gray-100 dark:text-gray-800'
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className='transition-all duration-1000 ease-out'
        style={{
          filter: `drop-shadow(0 0 6px ${strokeColor}40)`,
        }}
      />
    </svg>
  );
}

// Default formatter for days/hours
function defaultFormatValue(value: number): string {
  if (!value || value === 0) return '0';

  const totalHours = Math.round(value * 8);
  const wholeDays = Math.floor(totalHours / 8);
  const remainingHours = totalHours % 8;

  const parts = [];
  if (wholeDays > 0) {
    parts.push(`${wholeDays}d`);
  }
  if (remainingHours > 0) {
    parts.push(`${remainingHours}h`);
  }

  return parts.length > 0 ? parts.join(' ') : '0';
}

// Determine status based on percentage remaining
function getStatus(percentRemaining: number): 'good' | 'warning' | 'critical' {
  if (percentRemaining >= 50) return 'good';
  if (percentRemaining >= 20) return 'warning';
  return 'critical';
}

export function BalanceCard({
  label,
  code,
  balance,
  total,
  used,
  pending,
  category,
  formatValue = defaultFormatValue,
  animate = true,
  variant = 'bar',
  status: statusOverride,
  className,
}: BalanceCardProps) {
  const percentRemaining = total > 0 ? (balance / total) * 100 : 0;
  const animatedBalance = useAnimatedCounter(animate ? balance : 0, 1200);
  const displayBalance = animate ? animatedBalance : balance;
  const status = statusOverride ?? getStatus(percentRemaining);

  const statusBorderClass = {
    good: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    warning: 'hover:border-amber-300 dark:hover:border-amber-700',
    critical: 'hover:border-red-300 dark:hover:border-red-700',
  }[status];

  if (variant === 'ring') {
    // Radial progress ring variant
    return (
      <Card
        className={cn(
          'border overflow-hidden group transition-all duration-300',
          'hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5',
          statusBorderClass,
          'bg-white/80 backdrop-blur-xl dark:bg-gray-900/80 border-white/20 dark:border-gray-700/50',
          className
        )}
      >
        <CardContent className='p-4'>
          <div className='flex items-center gap-4'>
            {/* Radial Ring */}
            <div className='relative flex-shrink-0'>
              <AnimatedProgressRing
                percentage={percentRemaining}
                animate={animate}
                status={status}
                size={72}
              />
              <div className='absolute inset-0 flex items-center justify-center'>
                <span className='text-xs font-bold tabular-nums'>
                  {Math.round(percentRemaining)}%
                </span>
              </div>
            </div>

            {/* Content */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between mb-1'>
                <div>
                  <div className='text-sm font-medium'>{label}</div>
                  {code && <div className='text-xs text-muted-foreground'>({code})</div>}
                </div>
                {category && (
                  <span className='inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground'>
                    {category}
                  </span>
                )}
              </div>
              <div className='flex items-baseline gap-1'>
                <span className='text-2xl font-bold tabular-nums'>
                  {formatValue(displayBalance)}
                </span>
                <span className='text-xs text-muted-foreground'>
                  / {formatValue(total)}
                </span>
              </div>
              {/* Used/Pending */}
              <div className='flex gap-3 mt-1 text-[10px]'>
                {used !== undefined && used > 0 && (
                  <span className='text-red-500'>{formatValue(used)} used</span>
                )}
                {pending !== undefined && pending > 0 && (
                  <span className='text-blue-500'>{formatValue(pending)} pending</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default bar variant
  return (
    <Card
      className={cn(
        'border overflow-hidden group transition-all duration-300',
        'hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5',
        statusBorderClass,
        'bg-white/80 backdrop-blur-xl dark:bg-gray-900/80 border-white/20 dark:border-gray-700/50',
        className
      )}
    >
      <CardContent className='p-4'>
        {/* Header */}
        <div className='flex items-start justify-between mb-3'>
          <div>
            <div className='text-sm font-medium text-muted-foreground'>{label}</div>
            {code && <div className='text-xs text-muted-foreground'>({code})</div>}
          </div>
          {category && (
            <span className='inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground'>
              {category}
            </span>
          )}
        </div>

        {/* Balance Display with Ticker Effect */}
        <div className='space-y-2'>
          <div className='flex items-end justify-between'>
            <span className='text-3xl font-bold tabular-nums'>
              {formatValue(displayBalance)}
            </span>
            <span className='text-sm text-muted-foreground'>
              of {formatValue(total)}
            </span>
          </div>

          {/* Animated Progress Bar */}
          <AnimatedProgressBar
            percentage={percentRemaining}
            animate={animate}
            status={status}
          />

          {/* Used/Pending Labels */}
          {(used !== undefined && used > 0) || (pending !== undefined && pending > 0) ? (
            <div className='flex justify-between text-xs text-muted-foreground'>
              {used !== undefined && used > 0 && (
                <span className='text-red-500'>{formatValue(used)} used</span>
              )}
              {pending !== undefined && pending > 0 && (
                <span className='text-blue-500'>{formatValue(pending)} pending</span>
              )}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
