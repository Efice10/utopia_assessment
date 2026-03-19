'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  CheckCircle2,
  Clock,
  Eye,
  FolderKanban,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';

import {
  PageHeader,
  PageTransition,
  StatCard,
  StatCardGrid,
  ModernTable,
  StatusBadge,
  BackLink,
  type ColumnDef,
  type RowAction,
  type RowHighlight,
} from '@/components/shared';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Demo data types
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'On Hold' | 'Completed';
  progress: number;
  dueDate: string;
  team: string[];
  priority: 'High' | 'Medium' | 'Low';
}

// Demo data
const projects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website',
    status: 'Active',
    progress: 75,
    dueDate: '2024-02-15',
    team: ['Alice J', 'Bob S'],
    priority: 'High',
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Build cross-platform mobile application',
    status: 'Active',
    progress: 45,
    dueDate: '2024-03-30',
    team: ['Carol W', 'David B', 'Eva M'],
    priority: 'High',
  },
  {
    id: '3',
    name: 'API Integration',
    description: 'Third-party API integrations',
    status: 'On Hold',
    progress: 30,
    dueDate: '2024-04-10',
    team: ['Frank W'],
    priority: 'Medium',
  },
  {
    id: '4',
    name: 'Security Audit',
    description: 'Annual security compliance review',
    status: 'Active',
    progress: 90,
    dueDate: '2024-01-31',
    team: ['Grace L', 'Bob S'],
    priority: 'High',
  },
  {
    id: '5',
    name: 'Documentation Update',
    description: 'Update technical documentation',
    status: 'Completed',
    progress: 100,
    dueDate: '2024-01-15',
    team: ['Alice J'],
    priority: 'Low',
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

export default function ActiveProjectsPage() {
  const router = useRouter();

  // Table columns
  const columns: ColumnDef<Project>[] = [
    {
      id: 'name',
      header: 'Project',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{row.description}</p>
        </div>
      ),
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.status.toLowerCase().replace(' ', '_')} />,
      sortable: true,
    },
    {
      id: 'progress',
      header: 'Progress',
      cell: ({ row }) => (
        <div className="w-32">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>{row.progress}%</span>
          </div>
          <Progress value={row.progress} className="h-2" />
        </div>
      ),
      sortable: true,
    },
    {
      id: 'team',
      header: 'Team',
      cell: ({ row }) => (
        <div className="flex -space-x-2">
          {row.team.slice(0, 3).map((member, i) => (
            <Avatar key={i} className="h-8 w-8 border-2 border-background">
              <AvatarFallback className="text-xs">{getInitials(member)}</AvatarFallback>
            </Avatar>
          ))}
          {row.team.length > 3 && (
            <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
              +{row.team.length - 3}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => formatDate(row.dueDate),
      sortable: true,
    },
    {
      id: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          row.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
          row.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {row.priority}
        </span>
      ),
      sortable: true,
    },
  ];

  // Row actions
  const rowActions: RowAction<Project>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: row => router.push(`/projects/${row.id}`),
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Pencil,
      onClick: row => router.push(`/projects/${row.id}/edit`),
    },
    { id: 'divider', divider: true },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: row => router.push(`/projects/${row.id}/delete`),
    },
  ];

  // Row highlight function
  function getRowHighlight(row: Project): RowHighlight {
    if (row.status === 'Completed') return 'success';
    if (row.status === 'On Hold') return 'warning';
    if (row.priority === 'High' && row.progress < 50) return 'danger';
    return null;
  }

  // Stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'Active').length,
    onHold: projects.filter(p => p.status === 'On Hold').length,
    completed: projects.filter(p => p.status === 'Completed').length,
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Back Link */}
        <BackLink href="/projects" label="Back to Projects" />

        {/* Page Header */}
        <PageHeader
          title="Active Projects"
          description="View and manage all currently active projects"
        >
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </PageHeader>

        {/* Stats Cards */}
        <StatCardGrid columns={4}>
          <StatCard
            label="Total Projects"
            value={stats.total}
            icon={FolderKanban}
            variant="info"
          />
          <StatCard
            label="Active"
            value={stats.active}
            icon={Layers}
            variant="success"
          />
          <StatCard
            label="On Hold"
            value={stats.onHold}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            variant="primary"
          />
        </StatCardGrid>

        {/* Projects Table */}
        <ModernTable
          data={projects}
          columns={columns}
          keyExtractor={row => row.id}
          rowActions={rowActions}
          getRowHighlight={getRowHighlight}
          enableRowHighlight
          onRowClick={row => router.push(`/projects/${row.id}`)}
          searchable
          searchPlaceholder="Search projects..."
          emptyTitle="No projects"
          emptyDescription="Create your first project to get started"
          emptyIcon={FolderKanban}
        />
      </div>
    </PageTransition>
  );
}
