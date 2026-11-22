import { ColorName } from './colors';
import { ProjectInput, TaskInput, UserInput, LabelInput } from './validations';
import { useAppStore } from './store';

export type Status = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: ColorName;
  _count?: { tasks: { completed: number; total: number } };
  tasks?: Array<{ status: Status }>;
  members?: User[];
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
}

export interface Comment {
  id: string;
  body: string;
  taskId: string;
  createdAt: string;
  author: { id: string; name: string; image: string | null; color: string } | null;
}

export interface Activity {
  id: string;
  action: string;
  meta: string | null;
  createdAt: string;
  actor: { id: string; name: string; image: string | null; color: string } | null;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number | null;
  createdAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  _count?: { tasks: number };
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  taskId: string | null;
  read: boolean;
  createdAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string | null;
  startDate: string;
  endDate: string;
  taskCount: number;
  completed: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  color: string;
}

export interface WorkspaceUser extends User {
  taskCount: number;
  tasksByPriority: Record<string, number>;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  projectId: string;
  assigneeId: string | null;
  dueDate: string | null;
  order: number;
  project?: { name: string };
  assignee?: { name: string; image: string | null; color: ColorName };
  labels?: Array<{ label: { id: string; name: string; color: string } }>;
  sprintId?: string | null;
  sprint?: { id: string; name: string } | null;
  deletedAt?: string | null;
}

export interface TaskWithProjectName extends Task {
  projectName: string;
  overdue?: boolean;
}

export interface ProjectProgress {
  id: string;
  name: string;
  color: ColorName;
  total: number;
  completed: number;
  inProgress: number;
  review: number;
  todo: number;
}

export interface Stats {
  totalTasks: number;
  statusBreakdown: Record<Status, number>;
  priorityBreakdown: Record<Priority, number>;
  projectProgress: ProjectProgress[];
  overdueCount: number;
  /** Previous-week buckets used to compute dashboard trends. */
  lastWeek: { completed: number; overdue: number };
  upcomingDeadlines: TaskWithProjectName[];
}

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // In server contexts (e.g. Server Components), `fetch` needs an absolute URL.
  const base = typeof window === 'undefined' ? process.env.NEXT_PUBLIC_APP_URL || '' : '';
  const activeWorkspaceId = useAppStore.getState().activeWorkspaceId;
  const { headers: extraHeaders, ...rest } = options;
  const response = await fetch(`${base}${API_BASE}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(activeWorkspaceId ? { 'x-workspace-id': activeWorkspaceId } : {}),
      ...extraHeaders,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const projectApi = {
  list: (stats?: boolean) => request<Project[]>(`/projects${stats ? '?stats=true' : ''}`),
  get: (id: string) => request<Project>(`/projects/${id}`),
  create: (data: ProjectInput) => request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ProjectInput>) => request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
};

export const taskApi = {
  list: (projectId?: string) => request<Task[]>(`/tasks${projectId ? `?projectId=${projectId}` : ''}`),
  get: (id: string) => request<Task>(`/tasks/${id}`),
  create: (data: TaskInput) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<TaskInput>) => request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  reorder: (tasks: Array<{ id: string; status: Status; order: number }>) =>
    request<void>('/tasks/reorder', { method: 'PATCH', body: JSON.stringify({ tasks }) }),
  trash: () => request<Task[]>('/tasks/trash'),
  restore: (id: string) => request<void>(`/tasks/${id}/restore`, { method: 'POST' }),
  bulk: (ids: string[], action: 'delete' | 'restore' | 'status', status?: Status) =>
    request<{ success: boolean; affected: number }>('/tasks/bulk', { method: 'PATCH', body: JSON.stringify({ ids, action, status }) }),
};

export const userApi = {
  list: () => request<WorkspaceUser[]>('/users'),
  get: (id: string) => request<User>(`/users/${id}`),
  create: (data: UserInput) => request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<UserInput>) => request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),
};

export const statsApi = {
  get: () => request<Stats>('/stats'),
};

export const workspaceApi = {
  list: () => request<Workspace[]>('/workspaces'),
};

export const commentApi = {
  list: (taskId: string) => request<Comment[]>(`/tasks/${taskId}/comments`),
  create: (taskId: string, body: string) => request<Comment>(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ body }) }),
};

export const activityApi = {
  list: (taskId: string) => request<Activity[]>(`/tasks/${taskId}/activity`),
};

export const sprintApi = {
  list: () => request<Sprint[]>('/sprints'),
  create: (data: { name: string; goal?: string | null; startDate: string; endDate: string }) =>
    request<Sprint>('/sprints', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ name: string; goal: string | null }>) =>
    request<Sprint>(`/sprints/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/sprints/${id}`, { method: 'DELETE' }),
};

export const notificationApi = {
  list: () => request<Notification[]>('/notifications'),
  markRead: (id: string) => request<void>(`/notifications/${id}`, { method: 'PATCH', body: JSON.stringify({ read: true }) }),
  markAllRead: () => request<void>('/notifications/read-all', { method: 'POST' }),
  delete: (id: string) => request<void>(`/notifications/${id}`, { method: 'DELETE' }),
};

export const labelApi = {
  list: () => request<Label[]>('/labels'),
  create: (data: LabelInput) => request<Label>('/labels', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<LabelInput>) => request<Label>(`/labels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/labels/${id}`, { method: 'DELETE' }),
};

export const attachmentApi = {
  list: (taskId: string) => request<Attachment[]>(`/tasks/${taskId}/attachments`),
  create: (taskId: string, data: { name: string; url: string; size?: number }) =>
    request<Attachment>(`/tasks/${taskId}/attachments`, { method: 'POST', body: JSON.stringify(data) }),
  delete: (taskId: string, attachmentId: string) => request<void>(`/tasks/${taskId}/attachments/${attachmentId}`, { method: 'DELETE' }),
};