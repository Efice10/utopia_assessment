'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';
import {
  Archive,
  FileText,
  FolderKanban,
  Layers,
  Plus,
} from 'lucide-react';

import { BackLink } from '@/components/shared';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface SelectionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

function SelectionCard({ title, description, href, icon: Icon, color, bgColor }: SelectionCardProps) {
  return (
    <Link href={href}>
      <motion.div
        variants={item}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg cursor-pointer h-[200px]',
          'flex flex-col justify-between'
        )}
      >
        {/* Background decoration */}
        <div className={cn('absolute -right-8 -bottom-8 h-40 w-40 rounded-full opacity-10', bgColor)} />

        {/* Content */}
        <div className="relative z-10">
          <div className={cn('inline-flex rounded-xl p-3 mb-4', bgColor)}>
            <Icon className={cn('h-6 w-6', color)} />
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Decorative icon */}
        <div className="absolute right-6 bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon className="h-24 w-24" />
        </div>
      </motion.div>
    </Link>
  );
}

const projectOptions: SelectionCardProps[] = [
  {
    title: 'Active Projects',
    description: 'View and manage all currently active projects and tasks',
    href: '/projects/active',
    icon: Layers,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
  },
  {
    title: 'Create New Project',
    description: 'Start a new project with team assignments and milestones',
    href: '/projects/new',
    icon: Plus,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Project Reports',
    description: 'Generate progress reports and analytics',
    href: '/projects/reports',
    icon: FileText,
    color: 'text-violet-600',
    bgColor: 'bg-violet-500/10',
  },
  {
    title: 'Archived Projects',
    description: 'Access completed and archived projects',
    href: '/projects/archived',
    icon: Archive,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
  },
];

export default function ProjectsPage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Back Link */}
      <motion.div variants={item}>
        <BackLink href="/dashboard" label="Back to Dashboard" />
      </motion.div>

      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-xl bg-emerald-500/10 p-2.5">
            <FolderKanban className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        </div>
        <p className="text-muted-foreground">Select an option to manage projects</p>
      </motion.div>

      {/* Selection Cards */}
      <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {projectOptions.map((option) => (
          <SelectionCard key={option.href} {...option} />
        ))}
      </motion.div>
    </motion.div>
  );
}
