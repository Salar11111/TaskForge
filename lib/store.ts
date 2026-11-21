import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type View = 'dashboard' | 'projects' | 'board' | 'team';

interface AppState {
  view: View;
  selectedProjectId: string | null;
  setView: (view: View) => void;
  setSelectedProjectId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: 'dashboard',
      selectedProjectId: null,
      setView: (view) => set({ view }),
      setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
    }),
    {
      name: 'taskforge-store',
      partialize: (state) => ({
        view: state.view,
        selectedProjectId: state.selectedProjectId,
      }),
    }
  )
);