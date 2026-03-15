'use client';

import * as React from 'react';

import { motion } from 'framer-motion';
import {
  Calendar,
  FileText,
  Inbox,
  Search,
  Users,
  ClipboardList,
  Bell,
  FolderOpen,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Animated illustration component
function EmptyIllustration({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      {/* Background circles */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='absolute inset-0 flex items-center justify-center'
      >
        <div className='h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5' />
      </motion.div>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='absolute inset-0 flex items-center justify-center'
      >
        <div className='h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10' />
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
        className='relative flex items-center justify-center h-32 w-32'
      >
        <div className='flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl shadow-primary/30'>
          <Icon className='h-8 w-8' />
        </div>
      </motion.div>

      {/* Floating particles */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className='absolute top-2 right-4 h-2 w-2 rounded-full bg-primary/40'
      />
      <motion.div
        animate={{
          y: [0, 8, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.5 }}
        className='absolute bottom-4 left-6 h-3 w-3 rounded-full bg-primary/30'
      />
      <motion.div
        animate={{
          y: [0, -6, 0],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 1 }}
        className='absolute top-8 left-2 h-2 w-2 rounded-full bg-primary/20'
      />
    </div>
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <EmptyIllustration icon={icon} className='mb-6' />

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='text-lg font-semibold text-gray-900 dark:text-gray-100'
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='mt-2 text-sm text-muted-foreground max-w-sm'
        >
          {description}
        </motion.p>
      )}

      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='mt-6 flex items-center gap-3'
        >
          {action && (
            <Button onClick={action.onClick} className='gap-2'>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant='outline' onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Pre-configured empty states for common scenarios
export function NoResultsState({
  query,
  onClear,
}: {
  query?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      icon={Search}
      title='No results found'
      description={
        query
          ? `We couldn't find anything matching "${query}". Try adjusting your search or filters.`
          : "We couldn't find any matching results. Try adjusting your search criteria."
      }
      action={onClear ? { label: 'Clear search', onClick: onClear } : undefined}
    />
  );
}

export function NoDataState({
  type = 'items',
  onCreate,
}: {
  type?: string;
  onCreate?: () => void;
}) {
  return (
    <EmptyState
      icon={FolderOpen}
      title={`No ${type} yet`}
      description={`You haven't created any ${type} yet. Get started by creating your first one.`}
      action={onCreate ? { label: `Create ${type}`, onClick: onCreate } : undefined}
    />
  );
}

export function NoLeaveState({ onApply }: { onApply?: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title='No leave requests'
      description="You haven't submitted any leave requests yet. Need some time off?"
      action={onApply ? { label: 'Apply for leave', onClick: onApply } : undefined}
    />
  );
}

export function NoEmployeesState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title='No employees found'
      description='Start building your team by adding your first employee.'
      action={onAdd ? { label: 'Add employee', onClick: onAdd } : undefined}
    />
  );
}

export function NoDocumentsState({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title='No documents'
      description="You haven't uploaded any documents yet. Keep your important files organized here."
      action={onUpload ? { label: 'Upload document', onClick: onUpload } : undefined}
    />
  );
}

export function NoNotificationsState() {
  return (
    <EmptyState
      icon={Bell}
      title="You're all caught up!"
      description="No new notifications. We'll let you know when something important happens."
    />
  );
}

export function NoTasksState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={ClipboardList}
      title='No pending tasks'
      description='All tasks have been completed. Great work!'
      action={onCreate ? { label: 'Create task', onClick: onCreate } : undefined}
    />
  );
}
