import { AuditLogsContent } from '@/components/audit/audit-logs-content';

import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Audit Logs',
  description: 'View and track all user actions and system events.',
};

export default function AuditLogsPage() {
  return (
    <div className="p-6">
      <AuditLogsContent />
    </div>
  );
}
