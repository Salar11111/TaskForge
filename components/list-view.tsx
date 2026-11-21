'use client';

import { Task } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export function ListView({ tasks }: { tasks: Task[] }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-2 font-medium">Title</th>
            <th className="text-left px-4 py-2 font-medium">Status</th>
            <th className="text-left px-4 py-2 font-medium">Priority</th>
            <th className="text-left px-4 py-2 font-medium">Due</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id} className="border-t hover:bg-muted/30">
              <td className="px-4 py-2">{t.title}</td>
              <td className="px-4 py-2"><Badge variant="outline">{t.status}</Badge></td>
              <td className="px-4 py-2"><Badge variant="outline">{t.priority}</Badge></td>
              <td className="px-4 py-2 text-muted-foreground">{t.dueDate ? format(new Date(t.dueDate), 'MMM d') : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}