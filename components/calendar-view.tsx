'use client';

import { Task } from '@/lib/api';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { startOfMonth } from 'date-fns/startOfMonth';
import { endOfMonth } from 'date-fns/endOfMonth';

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const now = new Date();
  const days = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => {
        const dayTasks = tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day));
        return (
          <div key={day.toISOString()} className="border rounded-md p-2 min-h-[80px]">
            <div className="text-xs font-medium text-muted-foreground">{format(day, 'd')}</div>
            <div className="mt-1 space-y-1">
              {dayTasks.map((t) => (
                <div key={t.id} className="text-xs truncate bg-primary/10 rounded px-1 py-0.5">{t.title}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}