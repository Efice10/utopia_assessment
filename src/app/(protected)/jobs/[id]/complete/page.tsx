import { JobCompletionForm } from '@/components/technician/job-completion-form';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Job',
  description: 'Complete service job and record work done',
};

export default function JobCompletionPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className='p-4'>
      <JobCompletionForm orderId={params.id} />
    </div>
  );
}
