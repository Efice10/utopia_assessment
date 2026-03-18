import { BranchForm } from '@/components/branches';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Branch',
  description: 'Create a new branch',
};

export default function NewBranchPage() {
  return (
    <div className="p-6">
      <BranchForm />
    </div>
  );
}
