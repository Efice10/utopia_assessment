import { BranchesContent } from '@/components/branches';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Branches',
  description: 'Manage branch locations',
};

export default function BranchesPage() {
  return <BranchesContent />;
}
