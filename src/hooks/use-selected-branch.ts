import { useEffect, useMemo } from 'react';

import { useBranches } from '@/hooks/use-branches';
import { useAuthStore } from '@/lib/auth-store';
import { useBranchStore } from '@/lib/stores/branch-store';
import type { Branch } from '@/types/database';

interface UseSelectedBranchReturn {
  selectedBranchId: string | null;
  selectedBranch: Branch | undefined;
  accessibleBranches: Branch[];
  isHQ: boolean;
  setSelectedBranch: (id: string) => void;
  clearSelectedBranch: () => void;
  isLoading: boolean;
  branches: Branch[] | undefined;
}

export function useSelectedBranch(): UseSelectedBranchReturn {
  const { selectedBranchId, setSelectedBranchId, clearSelectedBranch } = useBranchStore();
  const { data: branches, isLoading } = useBranches();
  const { user } = useAuthStore();

  // Find the selected branch object
  const selectedBranch = branches?.find((b: Branch) => b.id === selectedBranchId);

  // Check if user is assigned to HQ (branches are filtered by RLS, so if we see an HQ branch, user has access to it)
  const isHQ = useMemo(() => {
    if (!branches) return false;
    // If user has access to a branch with is_hq = true, they are HQ
    return branches.some((b) => b.is_hq === true);
  }, [branches]);

  // Accessible branches are all branches returned by the API (filtered by RLS)
  const accessibleBranches = useMemo(() => {
    return branches?.filter((b) => b.is_active) ?? [];
  }, [branches]);

  // Auto-select branch on initial load
  useEffect(() => {
    if (isLoading || !branches || branches.length === 0) return;

    // If already has a valid selected branch, verify it still exists
    if (selectedBranchId) {
      const storedBranch = branches.find((b: Branch) => b.id === selectedBranchId);
      if (storedBranch) {
        return; // Valid branch, no change needed
      }
    }

    // Priority for branch selection:
    // 1. Technicians: Their assigned branch
    // 2. Admins/Managers/HQ users: HQ branch (default)
    // 3. Fallback: First active branch or first branch
    const userBranchId = (user as { branch_id?: string }).branch_id;

    // For technicians, use their assigned branch
    const technicianBranch = user?.role === 'technician' && userBranchId
      ? branches.find((b: Branch) => b.id === userBranchId)
      : undefined;

    // For admins/managers, default to HQ branch
    const hqBranch = (user?.role === 'admin' || user?.role === 'manager')
      ? branches.find((b: Branch) => b.is_hq === true)
      : undefined;

    // Fallback options
    const firstActiveBranch = branches.find((b: Branch) => b.is_active);
    const fallbackBranch = branches[0];

    // Selection priority: technician branch > HQ branch (for admin/manager) > first active > fallback
    const branchToSelect = technicianBranch ?? hqBranch ?? firstActiveBranch ?? fallbackBranch;

    if (branchToSelect) {
      setSelectedBranchId(branchToSelect.id);
    }
  }, [branches, isLoading, selectedBranchId, setSelectedBranchId, user]);

  // Ensure technicians can't switch branches
  const setSelectedBranch = (id: string) => {
    if (user?.role === 'technician') {
      console.warn('Technicians cannot switch branches');
      return;
    }
    setSelectedBranchId(id);
  };

  return {
    selectedBranchId,
    selectedBranch,
    accessibleBranches,
    isHQ,
    setSelectedBranch,
    clearSelectedBranch,
    isLoading: isLoading ?? false,
    branches,
  };
}
