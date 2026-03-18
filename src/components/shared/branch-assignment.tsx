'use client';

import { useState, useEffect } from 'react';

import { Building2, Check, X, Star, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBranches, useUserBranches, useUpdateUserBranches } from '@/hooks';
import { cn } from '@/lib/utils';
import type { Branch } from '@/types/database';

interface BranchAssignmentProps {
  userId: string;
  disabled?: boolean;
}

export function BranchAssignment({ userId, disabled = false }: BranchAssignmentProps) {
  const [selectedBranchIds, setSelectedBranchIds] = useState<Set<string>>(new Set());
  const [primaryBranchId, setPrimaryBranchId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { data: branches, isLoading: branchesLoading } = useBranches();
  const { data: userBranches, isLoading: userBranchesLoading } = useUserBranches(userId);
  const updateBranches = useUpdateUserBranches();

  const isLoading = branchesLoading || userBranchesLoading;

  // Initialize selected branches from user's current assignments
  useEffect(() => {
    if (userBranches) {
      const branchIds = new Set(userBranches.map((ub) => ub.branch_id));
      setSelectedBranchIds(branchIds);

      const primary = userBranches.find((ub) => ub.is_primary);
      setPrimaryBranchId(primary?.branch_id ?? null);
    }
  }, [userBranches]);

  // Check for changes
  useEffect(() => {
    if (userBranches) {
      const originalIds = new Set(userBranches.map((ub) => ub.branch_id));
      const originalPrimary = userBranches.find((ub) => ub.is_primary)?.branch_id;

      const idsChanged =
        originalIds.size !== selectedBranchIds.size ||
        !Array.from(originalIds).every((id) => selectedBranchIds.has(id));
      const primaryChanged = originalPrimary !== primaryBranchId;

      setHasChanges(idsChanged || primaryChanged);
    }
  }, [selectedBranchIds, primaryBranchId, userBranches]);

  const handleToggleBranch = (branchId: string) => {
    const newSet = new Set(selectedBranchIds);
    if (newSet.has(branchId)) {
      newSet.delete(branchId);
      // If removing the primary branch, clear primary
      if (branchId === primaryBranchId) {
        setPrimaryBranchId(null);
      }
    } else {
      newSet.add(branchId);
      // If this is the first branch added, make it primary
      if (newSet.size === 1) {
        setPrimaryBranchId(branchId);
      }
    }
    setSelectedBranchIds(newSet);
  };

  const handleSetPrimary = (branchId: string) => {
    if (selectedBranchIds.has(branchId)) {
      setPrimaryBranchId(branchId);
    }
  };

  const handleSave = async () => {
    await updateBranches.mutateAsync({
      userId,
      branchIds: Array.from(selectedBranchIds),
      primaryBranchId: primaryBranchId ?? undefined,
    });
    setHasChanges(false);
  };

  const handleCancel = () => {
    // Reset to original values
    if (userBranches) {
      setSelectedBranchIds(new Set(userBranches.map((ub) => ub.branch_id)));
      const primary = userBranches.find((ub) => ub.is_primary);
      setPrimaryBranchId(primary?.branch_id ?? null);
    }
    setHasChanges(false);
  };

  const getBranchById = (branchId: string): Branch | undefined => {
    return branches?.find((b) => b.id === branchId);
  };

  const selectedBranchesList = Array.from(selectedBranchIds)
    .map((id) => getBranchById(id))
    .filter(Boolean) as Branch[];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading branches...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Branch Assignments</Label>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" disabled={disabled}>
              <Building2 className="mr-2 h-4 w-4" />
              Add Branch
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search branches..." />
              <CommandList>
                <CommandEmpty>No branches found.</CommandEmpty>
                <CommandGroup>
                  {branches?.map((branch) => (
                    <CommandItem
                      key={branch.id}
                      onSelect={() => handleToggleBranch(branch.id)}
                      className="cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedBranchIds.has(branch.id)}
                        className="mr-2"
                        onCheckedChange={() => handleToggleBranch(branch.id)}
                      />
                      <div className="flex-1">
                        <span>{branch.name}</span>
                        {branch.is_hq && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            HQ
                          </Badge>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected branches list */}
      {selectedBranchesList.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No branches assigned. Add branches to allow access.
        </p>
      ) : (
        <div className="space-y-2">
          {selectedBranchesList.map((branch) => (
            <div
              key={branch.id}
              className={cn(
                'flex items-center justify-between rounded-lg border p-3',
                primaryBranchId === branch.id && 'border-primary bg-primary/5'
              )}
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{branch.name}</span>
                {branch.is_hq && (
                  <Badge variant="secondary" className="text-xs">
                    HQ
                  </Badge>
                )}
                {primaryBranchId === branch.id && (
                  <Badge variant="default" className="text-xs gap-1">
                    <Star className="h-3 w-3" />
                    Primary
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {selectedBranchesList.length > 1 && primaryBranchId !== branch.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetPrimary(branch.id)}
                    disabled={disabled}
                    title="Set as primary"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleBranch(branch.id)}
                  disabled={disabled || (selectedBranchIds.size === 1 && primaryBranchId === branch.id)}
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save/Cancel buttons */}
      {hasChanges && !disabled && (
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateBranches.isPending}
          >
            {updateBranches.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
