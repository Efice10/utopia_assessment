import { JobsContent } from '@/components/technician/jobs-content';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Jobs',
  description: 'View and complete your assigned jobs',
};

export default function JobsPage() {
  return <JobsContent />;
}
