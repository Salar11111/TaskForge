'use client';

import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/lib/api';
import { DonutChart } from '@/components/donut-chart';
import { BarChart } from '@/components/bar-chart';
import { StatCard } from '@/components/stat-card';
import { ProgressBar } from '@/components/progress-bar';
import { SkeletonCard } from '@/components/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeDate } from '@/lib/dates';
import { getColorTokens, getStatusColor, getPriorityColor } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';

export function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.get,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statusData = [
    { name: 'To Do', value: stats.statusBreakdown?.TODO || 0, color: getColorTokens('slate').css },
    { name: 'In Progress', value: stats.statusBreakdown?.IN_PROGRESS || 0, color: getColorTokens('amber').css },
    { name: 'Review', value: stats.statusBreakdown?.REVIEW || 0, color: getColorTokens('violet').css },
    { name: 'Done', value: stats.statusBreakdown?.DONE || 0, color: getColorTokens('emerald').css },
  ];

  const priorityData = [
    { name: 'Low', value: stats.priorityBreakdown?.LOW || 0, color: getColorTokens('slate').css },
    { name: 'Medium', value: stats.priorityBreakdown?.MEDIUM || 0, color: getColorTokens('sky').css },
    { name: 'High', value: stats.priorityBreakdown?.HIGH || 0, color: getColorTokens('orange').css },
    { name: 'Urgent', value: stats.priorityBreakdown?.URGENT || 0, color: getColorTokens('rose').css },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tasks" value={stats.totalTasks || 0} description="All tasks across projects" icon={ListTodo} color="slate" />
        <StatCard title="Completed" value={stats.statusBreakdown?.DONE || 0} description="Tasks marked as done" icon={CheckCircle2} color="emerald" trend={{ value: 12, label: 'vs last week' }} />
        <StatCard title="In Progress" value={stats.statusBreakdown?.IN_PROGRESS || 0} description="Currently being worked on" icon={Clock} color="amber" />
        <StatCard title="Overdue" value={stats.overdueCount || 0} description="Past due date" icon={AlertCircle} color="rose" trend={{ value: -5, label: 'vs last week' }} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={statusData} total={stats.totalTasks || 0} />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle>Task Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={priorityData} />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(stats.projectProgress || []).length > 0 ? stats.projectProgress.map((project) => (
              <div key={project.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate pr-2">{project.name}</span>
                  <span className="text-muted-foreground tabular-nums text-xs">{project.completed}/{project.total}</span>
                </div>
                <ProgressBar value={project.completed} max={project.total || 1} color={project.color} size="sm" />
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-6">No projects yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-md hover:-translate-y-0.5">
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.upcomingDeadlines?.length > 0 ? (
            <div className="space-y-2">
              {stats.upcomingDeadlines.map((task) => (
                <div key={task.id} className={cn('flex items-center justify-between gap-4 rounded-lg border p-3 transition-all duration-200 hover:shadow-sm', task.overdue && 'border-rose-500/30 bg-rose-500/5')}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={cn('h-2 w-2 shrink-0 rounded-full', getColorTokens(getPriorityColor(task.priority)).dot)} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{task.projectName}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn('rounded-full border px-2 py-0.5 text-[0.65rem] font-medium', getColorTokens(getPriorityColor(task.priority)).badge)}>
                      {task.priority}
                    </span>
                    <span className={cn('rounded-full border px-2 py-0.5 text-[0.65rem] font-medium', getColorTokens(getStatusColor(task.status)).badge)}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className={cn('tabular-nums text-xs font-medium', task.overdue ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground')}>
                      {task.dueDate ? formatRelativeDate(task.dueDate) : 'No due date'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">No upcoming deadlines</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}