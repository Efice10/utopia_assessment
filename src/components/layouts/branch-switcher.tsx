'use client';

import * as React from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Building2, ChevronsUpDown, Plus, Check, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useSelectedBranch } from '@/hooks/use-selected-branch';
import { useAuthStore } from '@/lib/auth-store';

export function BranchSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const {
    selectedBranchId,
    selectedBranch,
    setSelectedBranch,
    accessibleBranches,
    isHQ,
    isLoading: isLoadingSelected,
  } = useSelectedBranch();

  const isLoading = isLoadingSelected;

  // Check for URL parameter on mount
  React.useEffect(() => {
    const branchParam = searchParams.get('branch');
    if (branchParam && accessibleBranches?.some((b) => b.id === branchParam)) {
      setSelectedBranch(branchParam);
      // Clean up URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('branch');
      router.replace(`${window.location.pathname}?${newParams.toString()}`, { scroll: false });
    }
  }, [searchParams, accessibleBranches, setSelectedBranch, router]);

  // Handle branch change with toast notification
  const handleBranchChange = (branchId: string) => {
    if (user?.role === 'technician') {
      toast.error('Technicians cannot switch branches');
      return;
    }

    const branch = accessibleBranches?.find((b) => b.id === branchId);
    if (branch) {
      setSelectedBranch(branchId);
      toast.success(`Switched to ${branch.name}`);
    }
  };

  // Technicians see a simplified view (locked to their branch)
  if (user?.role === 'technician') {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <Building2 className='size-4' />
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>{selectedBranch?.name ?? 'My Branch'}</span>
              <span className='truncate text-xs text-muted-foreground'>Assigned Branch</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <Loader2 className='size-4 animate-spin' />
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>Loading...</span>
              <span className='truncate text-xs'>Branches</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!selectedBranch) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' asChild>
            <Link href='/branches/new'>
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <Plus className='size-4' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>No Branch</span>
                <span className='truncate text-xs'>Create a branch to get started</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                <Building2 className='size-4' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>
                  {selectedBranch.name}
                  {selectedBranch.is_hq && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      HQ
                    </Badge>
                  )}
                </span>
                <span className='truncate text-xs'>
                  {isHQ ? 'All branches access' : selectedBranch.is_active ? 'Active Branch' : 'Inactive'}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              {isHQ ? 'All Branches (HQ Access)' : 'Switch Branch'}
            </DropdownMenuLabel>
            {accessibleBranches.length === 0 ? (
              <div className='px-2 py-4 text-center text-sm text-muted-foreground'>
                No branches available
              </div>
            ) : (
              accessibleBranches.map((branch, index) => (
                <DropdownMenuItem
                  key={branch.id}
                  onClick={() => handleBranchChange(branch.id)}
                  className='gap-2 p-2'
                >
                  <div className='flex size-6 items-center justify-center rounded-md border'>
                    <Building2 className='size-3.5 shrink-0' />
                  </div>
                  <span className='flex-1 truncate'>{branch.name}</span>
                  {branch.is_hq && (
                    <Badge variant="secondary" className="text-xs">
                      HQ
                    </Badge>
                  )}
                  {branch.id === selectedBranchId && (
                    <Check className='size-4 text-primary' />
                  )}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className='gap-2 p-2'>
              <Link href='/branches/new'>
                <div className='flex size-6 items-center justify-center rounded-md border bg-transparent'>
                  <Plus className='size-4' />
                </div>
                <div className='text-muted-foreground font-medium'>Add branch</div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
