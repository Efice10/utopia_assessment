'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { format } from 'date-fns';
import {
  Activity,
  User,
  FileText,
  Building2,
  LogIn,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  ShieldX,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/lib/auth-store';
import type { AuditLog, AuditAction, AuditEntity } from '@/types/audit';

const ACTION_CONFIG: Record<AuditAction, { label: string; icon: typeof Plus; color: string }> = {
  create: { label: 'Create', icon: Plus, color: 'bg-emerald-500' },
  update: { label: 'Update', icon: Edit, color: 'bg-blue-500' },
  delete: { label: 'Delete', icon: Trash2, color: 'bg-red-500' },
  login: { label: 'Login', icon: LogIn, color: 'bg-green-500' },
  logout: { label: 'Logout', icon: LogOut, color: 'bg-gray-500' },
  view: { label: 'View', icon: Eye, color: 'bg-slate-500' },
  export: { label: 'Export', icon: Download, color: 'bg-purple-500' },
  import: { label: 'Import', icon: Upload, color: 'bg-indigo-500' },
};

const ENTITY_CONFIG: Record<AuditEntity, { label: string; icon: typeof User }> = {
  user: { label: 'User', icon: User },
  order: { label: 'Order', icon: FileText },
  service_record: { label: 'Service Record', icon: FileText },
  branch: { label: 'Branch', icon: Building2 },
  auth: { label: 'Auth', icon: LogIn },
  system: { label: 'System', icon: Activity },
};

interface ApiResponse {
  data: AuditLog[];
  error?: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function AuditLogsContent() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Refresh trigger for manual refetch
  const [refreshKey, setRefreshKey] = useState(0);

  // Admin-only access check
  useEffect(() => {
    if (initialized && user?.role !== 'admin') {
      router.push('/orders');
    }
  }, [initialized, user, router]);

  // Fetch logs effect - must be before any early returns
  useEffect(() => {
    if (!initialized || user?.role !== 'admin') return;

    const fetchLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '50');
        if (actionFilter && actionFilter !== 'all') {
          params.set('action', actionFilter);
        }
        if (entityFilter && entityFilter !== 'all') {
          params.set('entity', entityFilter);
        }
        if (search) {
          params.set('search', search);
        }
        if (dateFrom) {
          params.set('date_from', dateFrom);
        }
        if (dateTo) {
          params.set('date_to', dateTo);
        }

        const response = await fetch(`/api/audit-logs?${params.toString()}`);
        const data: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch audit logs');
        }

        setLogs(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, user, page, actionFilter, entityFilter, dateFrom, dateTo, refreshKey]);

  // Show loading while checking auth
  if (!initialized || user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <ShieldX className="w-16 h-16 text-muted-foreground/50" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  const handleSearch = () => {
    setPage(1);
    setRefreshKey((k) => k + 1);
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'dd MMM yyyy, HH:mm:ss');
  };

  const ActionBadge = ({ action }: { action: AuditAction }) => {
    const config = ACTION_CONFIG[action];

    return (
      <Badge variant="outline" className="gap-1 font-normal">
        <span className={`w-2 h-2 rounded-full ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const EntityBadge = ({ entity }: { entity: AuditEntity }) => {
    const config = ENTITY_CONFIG[entity];
    const EntityIcon = config.icon;

    return (
      <Badge variant="secondary" className="gap-1 font-normal">
        <EntityIcon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all user actions and system events
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by description, user, or entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="export">Export</SelectItem>
            <SelectItem value="import">Import</SelectItem>
          </SelectContent>
        </Select>

        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="order">Order</SelectItem>
            <SelectItem value="service_record">Service Record</SelectItem>
            <SelectItem value="branch">Branch</SelectItem>
            <SelectItem value="auth">Auth</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-[150px]"
          placeholder="From"
        />

        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-[150px]"
          placeholder="To"
        />

        <Button onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[120px]">User</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
              <TableHead className="w-[100px]">Entity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px]">Entity ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">Loading audit logs...</p>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground mt-2">No audit logs found</p>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">
                    {formatTimestamp(log.created_at)}
                  </TableCell>
                  <TableCell>
                    {log.user_name ? (
                      <div>
                        <p className="font-medium">{log.user_name}</p>
                        <p className="text-xs text-muted-foreground">{log.user_email}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">System</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <ActionBadge action={log.action} />
                  </TableCell>
                  <TableCell>
                    <EntityBadge entity={log.entity} />
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {log.description}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.entity_name || log.entity_id || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages || loading}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
