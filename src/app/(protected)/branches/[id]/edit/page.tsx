import { BranchEditContent } from '@/components/branches';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Branch',
  description: 'Edit branch details',
};

export default function BranchEditPage({
  params,
}: {
  params: { id: string };
}) {
  return <BranchEditContent id={params.id} />;
}
