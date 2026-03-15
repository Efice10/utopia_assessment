// Unified shared components library

// Core components
export { PageHeader } from './page-header';
export { BackLink } from './back-link';
export { StatCard, StatCardGrid, BalanceCard } from './stat-card';
export { StatusBadge, getStatusType } from './status-badge';
export { FilterBar, SimpleSearchBar } from './filter-bar';
export type { FilterConfig, FilterOption } from './filter-bar';

// Futuristic UI components
export { GlassCard, SimpleGlassCard } from './glass-card';
export { LiveActivityTimeline } from './live-activity-timeline';
export type { Activity, ActivityType } from './live-activity-timeline';
export { NavBubbleContainer, NavBubbleItem } from './nav-bubble';

// Skeleton loading components
export {
  Skeleton,
  StatCardSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  CardSkeleton,
  AvatarSkeleton,
  TextSkeleton,
  DashboardStatsSkeleton,
  PageSkeleton,
  ListItemSkeleton,
  FormSkeleton,
} from './skeleton-loading';

// Page transitions
export {
  PageTransition,
  FadeTransition,
  ScaleTransition,
  SlideTransition,
  StaggerContainer,
  StaggerItem,
  AnimatedNumber,
} from './page-transition';

// Empty states
export {
  EmptyState,
  NoResultsState,
  NoDataState,
  NoLeaveState,
  NoEmployeesState,
  NoDocumentsState,
  NoNotificationsState,
  NoTasksState,
} from './empty-state';

// Notification bell
export { NotificationBell } from './notification-bell';

// Modern Table (for main modules)
export { ModernTable } from './modern-table';
export type {
  TableViewMode,
  TableDensity,
  RowHighlight,
  ColumnDef,
  RowAction,
  QuickAction,
  SortState,
  ModernTableProps,
} from './modern-table';
