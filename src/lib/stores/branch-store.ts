import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const BRANCH_STORAGE_KEY = 'selected-branch-id';

interface BranchState {
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string) => void;
  clearSelectedBranch: () => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      selectedBranchId: null,
      setSelectedBranchId: (id: string) => set({ selectedBranchId: id }),
      clearSelectedBranch: () => set({ selectedBranchId: null }),
    }),
    {
      name: BRANCH_STORAGE_KEY,
      partialize: (state) => ({
        selectedBranchId: state.selectedBranchId,
      }),
    }
  )
);
