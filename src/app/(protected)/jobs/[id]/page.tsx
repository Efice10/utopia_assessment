import { JobDetailContent } from '@/components/technician/job-detail-content';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Details',
  description: 'View job details and complete the job',
};

export default function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <JobDetailContent id={params.id} />;
}
