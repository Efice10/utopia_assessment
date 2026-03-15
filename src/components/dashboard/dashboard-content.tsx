import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardContentProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const DashboardContent = ({
  title,
  description,
  children,
  actions,
}: DashboardContentProps) => {
  return (
    <div className='space-y-6'>
      {/* Header */}
      {(title ?? description ?? actions) && (
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            {title && (
              <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100'>
                {title}
              </h1>
            )}
            {description && (
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className='flex items-center space-x-2'>{actions}</div>
          )}
        </div>
      )}

      {/* Content */}
      <div className='space-y-6'>{children}</div>
    </div>
  );
};

interface StatsGridProps {
  children: React.ReactNode;
}

export const StatsGrid = ({ children }: StatsGridProps) => {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>{children}</div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatCardProps) => {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        {Icon && <Icon className='text-muted-foreground h-4 w-4' />}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {(description ?? trend) && (
          <div className='text-muted-foreground flex items-center space-x-2 text-xs'>
            {trend && (
              <span
                className={trend.isPositive ? 'text-green-600' : 'text-red-600'}
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ContentGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}

export const ContentGrid = ({ children, columns = 2 }: ContentGridProps) => {
  const gridClass = {
    1: 'grid gap-6',
    2: 'grid gap-6 lg:grid-cols-2',
    3: 'grid gap-6 lg:grid-cols-3',
  }[columns];

  return <div className={gridClass}>{children}</div>;
};
