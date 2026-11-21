import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type View = 'dashboard' | 'projects' | 'board' | 'team';
export type Status = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

interface AppState {
  view: View;
  selectedProjectId: string | null;
  /** Workspace selected via the switcher; null means the user's default. */
  activeWorkspaceId: string | null;
  /** Global header search query — filters the current view's list. */
  searchQuery: string;
  setView: (view: View) => void;
  setSelectedProjectId: (id: string | null) => void;
  setActiveWorkspaceId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;

  // Shared dialog state — opened from the Header, the CommandPalette, or views.
  taskDialogOpen: boolean;
  taskDialogEditingId: string | null;
  taskDialogInitialStatus?: Status;
  setTaskDialogOpen: (open: boolean, editingId?: string | null, initialStatus?: Status) => void;

  projectDialogOpen: boolean;
  projectDialogEditingId: string | null;
  setProjectDialogOpen: (open: boolean, editingId?: string | null) => void;

  userDialogOpen: boolean;
  userDialogEditingId: string | null;
  setUserDialogOpen: (open: boolean, editingId?: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: 'dashboard',
      selectedProjectId: null,
      activeWorkspaceId: null,
      searchQuery: '',
      setView: (view) => set({ view }),
      setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
      setActiveWorkspaceId: (activeWorkspaceId) => set({ activeWorkspaceId, selectedProjectId: null, searchQuery: '' }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      taskDialogOpen: false,
      taskDialogEditingId: null,
      taskDialogInitialStatus: undefined,
      setTaskDialogOpen: (open, editingId = null, initialStatus) =>
        set({ taskDialogOpen: open, taskDialogEditingId: editingId, taskDialogInitialStatus: initialStatus ?? undefined }),

      projectDialogOpen: false,
      projectDialogEditingId: null,
      setProjectDialogOpen: (open, editingId = null) => set({ projectDialogOpen: open, projectDialogEditingId: editingId }),

      userDialogOpen: false,
      userDialogEditingId: null,
      setUserDialogOpen: (open, editingId = null) => set({ userDialogOpen: open, userDialogEditingId: editingId }),
    }),
    {
      name: 'taskforge-store',
      partialize: (state) => ({
        view: state.view,
        selectedProjectId: state.selectedProjectId,
        activeWorkspaceId: state.activeWorkspaceId,
      }),
    }
  )
);
