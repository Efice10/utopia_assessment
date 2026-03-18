import { BranchDetailContent } from '@/components/branches';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Branch Details',
  description: 'View and manage branch details',
};

export default function BranchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <BranchDetailContent id={params.id} />;
}
