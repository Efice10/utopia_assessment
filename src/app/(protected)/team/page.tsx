'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Users,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

import {
  PageHeader,
  PageTransition,
  StatCard,
  StatCardGrid,
  ModernTable,
  StatusBadge,
  type ColumnDef,
  type RowAction,
  type RowHighlight,
} from '@/components/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Demo data types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  joinedAt: string;
}

// Demo data
const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: '',
    role: 'Senior Developer',
    department: 'Engineering',
    status: 'Active',
    joinedAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    avatar: '',
    role: 'Product Manager',
    department: 'Product',
    status: 'Active',
    joinedAt: '2023-03-20',
  },
  {
    id: '3',
    name: 'Carol White',
    email: 'carol@example.com',
    avatar: '',
    role: 'Designer',
    department: 'Design',
    status: 'On Leave',
    joinedAt: '2023-06-01',
  },
  {
    id: '4',
    name: 'David Brown',
    email: 'david@example.com',
    avatar: '',
    role: 'Backend Developer',
    department: 'Engineering',
    status: 'Active',
    joinedAt: '2023-08-10',
  },
  {
    id: '5',
    name: 'Eva Martinez',
    email: 'eva@example.com',
    avatar: '',
    role: 'QA Engineer',
    department: 'Engineering',
    status: 'Inactive',
    joinedAt: '2022-11-05',
  },
  {
    id: '6',
    name: 'Frank Wilson',
    email: 'frank@example.com',
    avatar: '',
    role: 'DevOps Engineer',
    department: 'Engineering',
    status: 'Active',
    joinedAt: '2023-09-01',
  },
  {
    id: '7',
    name: 'Grace Lee',
    email: 'grace@example.com',
    avatar: '',
    role: 'Marketing Manager',
    department: 'Marketing',
    status: 'Active',
    joinedAt: '2023-02-15',
  },
];

// Helper functions
function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function TeamPage() {
  const router = useRouter();

  // Table columns
  const columns: ColumnDef<TeamMember>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={row.avatar} alt={row.name} />
            <AvatarFallback className="text-xs">{getInitials(row.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      id: 'role',
      header: 'Role',
      accessorKey: 'role',
      sortable: true,
    },
    {
      id: 'department',
      header: 'Department',
      accessorKey: 'department',
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.status.toLowerCase().replace(' ', '_')} />,
      sortable: true,
    },
    {
      id: 'joinedAt',
      header: 'Joined',
      cell: ({ row }) => formatDate(row.joinedAt),
      sortable: true,
    },
  ];

  // Row actions - navigate to pages, NOT modals
  const rowActions: RowAction<TeamMember>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: row => router.push(`/team/${row.id}`),
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Pencil,
      onClick: row => router.push(`/team/${row.id}/edit`),
    },
    { id: 'divider', divider: true },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: row => router.push(`/team/${row.id}/delete`),
    },
  ];

  // Row highlight function
  function getRowHighlight(row: TeamMember): RowHighlight {
    if (row.status === 'Active') return 'success';
    if (row.status === 'On Leave') return 'warning';
    if (row.status === 'Inactive') return 'danger';
    return null;
  }

  // Stats
  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'Active').length,
    onLeave: teamMembers.filter(m => m.status === 'On Leave').length,
    inactive: teamMembers.filter(m => m.status === 'Inactive').length,
  };

  return (
    <PageTransition>
      <div className="space-y-8">
      {/* Page Header with Add Button - navigates to /team/new page */}
      <PageHeader
        title="Team Members"
        description="Manage your team members and their roles"
      >
        <Link href="/team/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </Link>
      </PageHeader>

      {/* Stats Cards */}
      <StatCardGrid columns={4}>
        <StatCard
          label="Total Members"
          value={stats.total}
          icon={Users}
          variant="info"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          label="On Leave"
          value={stats.onLeave}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          icon={AlertCircle}
          variant="danger"
        />
      </StatCardGrid>

      {/* Team Table */}
      <ModernTable
        data={teamMembers}
        columns={columns}
        keyExtractor={row => row.id}
        rowActions={rowActions}
        getRowHighlight={getRowHighlight}
        enableRowHighlight
        onRowClick={row => router.push(`/team/${row.id}`)}
        searchable
        searchPlaceholder="Search team members..."
        emptyTitle="No team members"
        emptyDescription="Add your first team member to get started"
        emptyIcon={Users}
      />
      </div>
    </PageTransition>
  );
}
