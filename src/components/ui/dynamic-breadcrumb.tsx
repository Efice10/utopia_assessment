'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Home,
  type LucideIcon,
  Settings,
  User,
  FileText,
  Users,
  Bell,
} from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================================================
// ROUTE CONFIGURATION - Icons and Labels for each route
// ============================================================================

interface RouteConfig {
  label: string;
  icon?: LucideIcon;
  siblings?: { label: string; href: string; icon?: LucideIcon }[];
}

// Define route configurations with icons and proper labels
const routeConfig: Record<string, RouteConfig> = {
  // Main routes
  dashboard: { label: 'Dashboard', icon: Home },
  documents: { label: 'Documents', icon: FileText },
  team: { label: 'Team', icon: Users },
  notifications: { label: 'Notifications', icon: Bell },

  // Settings
  settings: { label: 'Settings', icon: Settings },
  general: { label: 'General', icon: Settings },
  profile: { label: 'Profile', icon: User },
  security: { label: 'Security', icon: Settings },

  // Common actions
  new: { label: 'New' },
  create: { label: 'Create' },
  edit: { label: 'Edit' },
};

// ============================================================================
// BREADCRUMB SEGMENT INTERFACE
// ============================================================================

interface BreadcrumbSegment {
  label: string;
  href?: string;
  icon?: LucideIcon;
  isCurrentPage?: boolean;
  siblings?: { label: string; href: string; icon?: LucideIcon }[];
}

// ============================================================================
// GENERATE BREADCRUMBS FROM PATHNAME
// ============================================================================

function generateBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbSegment[] = [];

  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    const isLast = i === segments.length - 1;
    const config = routeConfig[segment];

    // Check if this is a dynamic segment (like [id])
    const isDynamicSegment = /^[a-f0-9-]{8,}$|^\d+$/.test(segment);

    let label = config?.label || segment;
    let icon = config?.icon;

    // Handle dynamic segments
    if (isDynamicSegment) {
      label = 'Details';
      icon = undefined;
    } else if (!config) {
      // Transform segment names to proper labels
      label = segment
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      icon,
      isCurrentPage: isLast,
    });
  }

  return breadcrumbs;
}

// ============================================================================
// ANIMATED BREADCRUMB ITEM
// ============================================================================

function AnimatedBreadcrumbItem({
  segment,
  index,
}: {
  segment: BreadcrumbSegment;
  index: number;
}) {
  const Icon = segment.icon;
  const hasSiblings = segment.siblings && segment.siblings.length > 0;

  const content = (
    <span className="inline-flex items-center gap-1.5">
      {Icon && (
        <Icon className="h-3.5 w-3.5 opacity-70" />
      )}
      <span>{segment.label}</span>
    </span>
  );

  // Current page - no link
  if (segment.isCurrentPage) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
      >
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium text-foreground flex items-center gap-1.5">
            {Icon && (
              <Icon className="h-3.5 w-3.5" />
            )}
            {segment.label}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </motion.div>
    );
  }

  // With dropdown for siblings
  if (hasSiblings) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
      >
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-colors group">
              {content}
              <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
              {segment.siblings!.map((sibling) => {
                const SiblingIcon = sibling.icon;
                return (
                  <DropdownMenuItem key={sibling.href} asChild>
                    <Link href={sibling.href} className="flex items-center gap-2">
                      {SiblingIcon && <SiblingIcon className="h-4 w-4 opacity-70" />}
                      {sibling.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
      </motion.div>
    );
  }

  // Regular link
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link
            href={segment.href!}
            className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            {Icon && (
              <Icon className="h-3.5 w-3.5 opacity-70" />
            )}
            {segment.label}
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DynamicBreadcrumb() {
  const pathname = usePathname();

  // Skip breadcrumbs for auth and public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname === '/'
  ) {
    return null;
  }

  const breadcrumbs = generateBreadcrumbs(pathname);

  // Don't show breadcrumbs if there's only one segment
  if (breadcrumbs.length <= 1) {
    return null;
  }

  // For mobile: collapse middle segments if more than 3
  const shouldCollapse = breadcrumbs.length > 3;

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap">
        <AnimatePresence mode="wait">
          {breadcrumbs.map((segment, index) => {
            // On mobile, show ellipsis for middle segments
            if (shouldCollapse && index > 0 && index < breadcrumbs.length - 1) {
              // Only show ellipsis once (for the second item)
              if (index === 1) {
                return (
                  <React.Fragment key={`ellipsis-${index}`}>
                    <BreadcrumbSeparator className="hidden sm:flex" />
                    <div className="hidden sm:flex">
                      <AnimatedBreadcrumbItem segment={segment} index={index} />
                    </div>
                    {/* Show ellipsis on mobile only */}
                    <BreadcrumbSeparator className="flex sm:hidden" />
                    <BreadcrumbItem className="flex sm:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground">
                          <BreadcrumbEllipsis className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {breadcrumbs.slice(1, -1).map((collapsedSegment) => {
                            const CollapsedIcon = collapsedSegment.icon;
                            return (
                              <DropdownMenuItem key={collapsedSegment.label} asChild>
                                <Link href={collapsedSegment.href || '#'} className="flex items-center gap-2">
                                  {CollapsedIcon && <CollapsedIcon className="h-4 w-4 opacity-70" />}
                                  {collapsedSegment.label}
                                </Link>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              }
              // Skip middle items on mobile, but show on desktop
              return (
                <React.Fragment key={segment.label}>
                  <BreadcrumbSeparator className="hidden sm:flex" />
                  <div className="hidden sm:flex">
                    <AnimatedBreadcrumbItem segment={segment} index={index} />
                  </div>
                </React.Fragment>
              );
            }

            return (
              <React.Fragment key={segment.label}>
                {index > 0 && <BreadcrumbSeparator />}
                <AnimatedBreadcrumbItem segment={segment} index={index} />
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
