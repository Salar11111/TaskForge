import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional().nullable(),
  color: z.enum([
    'emerald',
    'violet',
    'amber',
    'rose',
    'cyan',
    'orange',
    'teal',
    'pink',
    'sky',
    'slate',
  ]),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  projectId: z.string().min(1, 'Project is required'),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  order: z.number().int().nonnegative().optional(),
  labelIds: z.array(z.string()).optional(),
  sprintId: z.string().optional().nullable(),
});

export const taskReorderSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
      order: z.number().int().nonnegative(),
    })
  ),
});

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  image: z.string().url('Invalid avatar URL').optional().nullable().or(z.literal('')),
  color: z.enum([
    'emerald',
    'violet',
    'amber',
    'rose',
    'cyan',
    'orange',
    'teal',
    'pink',
    'sky',
    'slate',
  ]),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type TaskReorderInput = z.infer<typeof taskReorderSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type LabelInput = { name: string; color?: ColorName };

type ColorName = 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan' | 'orange' | 'teal' | 'pink' | 'sky' | 'slate';
