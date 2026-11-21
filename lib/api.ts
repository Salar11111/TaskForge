import { ColorName } from './colors';
import { ProjectInput, TaskInput, MemberInput } from './validations';

export type Status = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: ColorName;
  _count?: { tasks: { completed: number; total: number } };
  tasks?: Array<{ status: Status }>;
  members?: Member[];
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
  assignee?: { name: string; avatar: string | null; color: ColorName };
}

export interface TaskWithProjectName extends Task {
  projectName: string;
  overdue?: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  color: ColorName;
  _count?: { tasks: number };
  tasksByPriority?: Record<string, number>;
  tasks?: Task[];
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
  upcomingDeadlines: TaskWithProjectName[];
}

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
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
};

export const memberApi = {
  list: () => request<Member[]>('/members'),
  get: (id: string) => request<Member>(`/members/${id}`),
  create: (data: MemberInput) => request<Member>('/members', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<MemberInput>) => request<Member>(`/members/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/members/${id}`, { method: 'DELETE' }),
};

export const statsApi = {
  get: () => request<Stats>('/stats'),
};