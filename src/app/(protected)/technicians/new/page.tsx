import { TechnicianForm } from '@/components/technicians';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Technician',
  description: 'Create a new technician account with branch assignment',
};

export default function NewTechnicianPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Technician</h1>
        <p className="text-muted-foreground">
          Create a new technician account with branch assignment.
        </p>
      </div>
      <TechnicianForm />
    </div>
  );
}
