'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi, type Member } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/progress-bar';
import { MemberAvatar } from '@/components/member-avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Plus, MoreHorizontal, Trash2, Edit, User } from 'lucide-react';
import { getColorTokens, getPriorityColor, getProjectAccent } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query';
import { Skeleton, SkeletonCard } from '@/components/skeleton';
import { useAppStore } from '@/lib/store';

export function TeamView() {
  const queryClient = useQueryClient();
  const { setMemberDialogOpen, searchQuery } = useAppStore();
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  const { data: members, isLoading } = useQuery({
    queryKey: queryKeys.members.list(),
    queryFn: () => memberApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: memberApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
      toast.success('Member removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleDelete = () => {
    if (deletingMember) {
      deleteMutation.mutate(deletingMember.id);
      setDeletingMember(null);
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-48' variant='rectangular' />
          <Skeleton className='h-10 w-32' variant='rectangular' />
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Team</h1>
          <p className='text-sm text-muted-foreground'>Team members and workload</p>
        </div>
        <Button onClick={() => setMemberDialogOpen(true)}>
          <Plus className='h-4 w-4 mr-2' /> Add Member
        </Button>
      </div>

      {(members || []).filter((m) =>
        !searchQuery.trim() ||
        m.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ).length === 0 ? (
        <Card className="animate-in fade-in-0 zoom-in-95 duration-200">
          <CardContent className='py-12 text-center'>
            <User className='h-12 w-12 mx-auto text-muted-foreground/40 mb-4' />
            <h2 className='text-lg font-semibold tracking-tight mb-1'>No team members yet</h2>
            <p className='text-sm text-muted-foreground mb-4'>Add your first team member to get started</p>
            <Button onClick={() => setMemberDialogOpen(true)}>
              <Plus className='h-4 w-4 mr-2' /> Add Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {(members || []).filter((m) =>
            !searchQuery.trim() ||
            m.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.trim().toLowerCase())
          ).map((member) => {
            const accent = getProjectAccent(member.color);
            return (
              <Card key={member.id} className='group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 p-0'>
                <div className='h-1.5 w-full' style={{ backgroundColor: accent.css }} />
                <div className='p-5'>
                  <div className='flex items-start justify-between gap-2 mb-4'>
                    <div className='flex items-center gap-3 min-w-0'>
                      <MemberAvatar name={member.name} avatar={member.avatar} color={member.color} size='lg' />
                      <div className='min-w-0'>
                        <h3 className='text-base font-semibold tracking-tight truncate'>{member.name}</h3>
                        <p className='text-xs text-muted-foreground truncate'>{member.email}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => setMemberDialogOpen(true, member.id)}>
                          <Edit className='h-4 w-4 mr-2' /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='text-destructive' onClick={() => setDeletingMember(member)}>
                          <Trash2 className='h-4 w-4 mr-2' /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className='space-y-3'>
                    <div>
                      <div className='flex items-center justify-between text-sm mb-1.5'>
                        <span className='text-muted-foreground'>Task Load</span>
                        <span className='font-medium tabular-nums text-xs'>{member._count?.tasks || 0} tasks</span>
                      </div>
                      <ProgressBar value={member._count?.tasks || 0} max={20} color={member.color} size='sm' />
                    </div>
                    <div className='flex flex-wrap gap-1.5'>
                      {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(priority => {
                        const count = member.tasksByPriority?.[priority] || 0;
                        if (count === 0) return null;
                        const tokens = getColorTokens(getPriorityColor(priority));
                        return (
                          <Badge key={priority} variant='outline' className={cn('text-[0.65rem] px-1.5 py-0', tokens.badge)}>
                            {priority} <span className="tabular-nums ml-0.5">{count}</span>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deletingMember} onOpenChange={(open) => !open && setDeletingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to remove &quot;{deletingMember?.name}&quot; from the team? Their assigned tasks will be unassigned. This action cannot be undone.
          </AlertDialogDescription>
          <AlertDialogAction onClick={handleDelete} className='bg-rose-600 hover:bg-rose-700 text-white'>
            Remove
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
