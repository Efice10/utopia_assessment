'use client';

import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { JobsChartData } from '@/types/kpi';

interface JobsChartProps {
  data: JobsChartData[];
  isLoading?: boolean;
}

export function JobsChart({ data, isLoading }: JobsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>Jobs by Technician</CardTitle>
          <CardDescription className='text-sm text-muted-foreground'>
            Bar chart showing jobs per technician
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
          <CardTitle className='text-lg font-semibold'>Jobs by Technician</CardTitle>
          <CardDescription className='text-sm text-muted-foreground'>
            Bar chart showing jobs per technician
          </CardDescription>
        </CardHeader>
        <CardContent className='h-[300px] flex items-center justify-center'>
          <p className='text-sm text-muted-foreground'>No jobs data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-semibold'>Jobs by Technician</CardTitle>
        <CardDescription className='text-sm text-muted-foreground'>
          Bar chart showing jobs per technician
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <RechartsBarChart data={data} layout='vertical' margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <XAxis type='number' />
              <YAxis
                dataKey='name'
                type='category'
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const data = payload[0].payload;
                    return (
                      <div className='rounded-lg border bg-background p-2 shadow-sm'>
                        <p className='text-sm font-medium'>{data.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          Jobs: {data.jobs} | Completed: {data.completed} | Pending: {data.pending}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey='jobs'
                fill='hsl(var(--primary))'
                radius={[0, 4, 4, 0]}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
