export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    list: (stats?: boolean) => ['projects', 'list', stats] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (projectId?: string) => ['tasks', 'list', projectId] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
  },
  members: {
    all: ['members'] as const,
    list: () => ['members', 'list'] as const,
    detail: (id: string) => ['members', 'detail', id] as const,
  },
  stats: {
    all: ['stats'] as const,
  },
};
