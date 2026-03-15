'use client';

import { Line, LineChart as RechartsLineChart, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RevenueChartData } from '@/types/kpi';

interface RevenueChartProps {
  data: RevenueChartData[];
  isLoading?: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Revenue Over Time</CardTitle>
          <CardDescription className='text-sm text-muted-foreground'>
            Line chart showing revenue trends
          </CardDescription>
        </CardHeader>
        <CardContent className='h-[300px] flex items-center justify-center'>
          <div className='animate-pulse text-muted-foreground'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Revenue Over Time</CardTitle>
          <CardDescription className='text-sm text-muted-foreground'>
            Line chart showing revenue trends
          </CardDescription>
        </CardHeader>
        <CardContent className='h-[300px] flex items-center justify-center'>
          <p className='text-sm text-muted-foreground'>No revenue data available</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-semibold'>Revenue Over Time</CardTitle>
        <CardDescription className='text-sm text-muted-foreground'>
          Line chart showing revenue trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <RechartsLineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
              <XAxis
                dataKey='label'
                tick={{ fontSize: 12 }}
                className='text-muted-foreground'
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `RM ${value}`}
                className='text-muted-foreground'
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const data = payload[0].payload;
                    return (
                      <div className='rounded-lg border bg-background p-2 shadow-sm'>
                        <p className='text-sm font-medium'>{data.label || data.date}</p>
                        <p className='text-xs text-muted-foreground'>
                          Revenue: {formatCurrency(data.revenue)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type='monotone'
                dataKey='revenue'
                stroke='hsl(var(--primary))'
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
