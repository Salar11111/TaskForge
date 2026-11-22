'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MemberAvatar } from '@/components/member-avatar';
import { useAppStore } from '@/lib/store';
import { taskApi, commentApi, activityApi, attachmentApi } from '@/lib/api';
import { queryKeys } from '@/lib/query';
import { getColorTokens, getStatusColor, getPriorityColor } from '@/lib/colors';
import { toast } from 'sonner';
import { Send, Paperclip, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Only render http(s) links; never hand a javascript:/data: URL to an anchor. */
function safeHref(url: string) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '#';
  } catch {
    return '#';
  }
}

export function TaskDetail() {
  const detailTaskId = useAppStore((s) => s.detailTaskId);
  const setDetailTaskId = useAppStore((s) => s.setDetailTaskId);
  const queryClient = useQueryClient();
  const taskId = detailTaskId ?? '';
  const enabled = !!detailTaskId;

  const [comment, setComment] = useState('');
  const [description, setDescription] = useState('');
  const [attName, setAttName] = useState('');
  const [attUrl, setAttUrl] = useState('');

  const { data: task } = useQuery({ queryKey: queryKeys.tasks.detail(taskId), queryFn: () => taskApi.get(taskId), enabled });
  const { data: comments } = useQuery({ queryKey: queryKeys.comments(taskId), queryFn: () => commentApi.list(taskId), enabled });
  const { data: activity } = useQuery({ queryKey: queryKeys.activity(taskId), queryFn: () => activityApi.list(taskId), enabled });
  const { data: attachments } = useQuery({ queryKey: queryKeys.attachments(taskId), queryFn: () => attachmentApi.list(taskId), enabled });

  useEffect(() => { setDescription(task?.description ?? ''); }, [task?.description]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.comments(taskId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.activity(taskId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.attachments(taskId) });
  };

  const saveDescription = useMutation({
    mutationFn: (value: string) => taskApi.update(taskId, { description: value }),
    onSuccess: () => { toast.success('Description saved'); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const addComment = useMutation({
    mutationFn: (body: string) => commentApi.create(taskId, body),
    onSuccess: () => { setComment(''); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const addAttachment = useMutation({
    mutationFn: (data: { name: string; url: string }) => attachmentApi.create(taskId, data),
    onSuccess: () => { setAttName(''); setAttUrl(''); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const removeAttachment = useMutation({
    mutationFn: (id: string) => attachmentApi.delete(taskId, id),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Sheet open={!!detailTaskId} onOpenChange={(open) => !open && setDetailTaskId(null)}>
      <SheetContent
        className={cn(
          'inset-y-0 right-0 h-full w-full max-w-md overflow-y-auto p-6',
          'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
        )}
      >
        {task && (
          <>
            <SheetHeader>
              <div className="flex gap-2">
                <Badge variant="outline" className={getColorTokens(getStatusColor(task.status)).badge}>{task.status.replace('_', ' ')}</Badge>
                <Badge variant="outline" className={getColorTokens(getPriorityColor(task.priority)).badge}>{task.priority}</Badge>
              </div>
              <SheetTitle>{task.title}</SheetTitle>
              <SheetDescription>Task details, discussion and history</SheetDescription>
            </SheetHeader>

            <section className="space-y-2 py-4">
              <Label htmlFor="task-description">Description</Label>
              <Textarea id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              <Button size="sm" onClick={() => saveDescription.mutate(description)} disabled={saveDescription.isPending || description === (task.description ?? '')}>Save description</Button>
            </section>

            <section className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-semibold">Comments</h3>
              <div className="space-y-3">
                {(comments ?? []).map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <MemberAvatar name={c.author?.name ?? 'Former member'} avatar={c.author?.image} color={c.author?.color ?? 'slate'} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-medium">{c.author?.name ?? 'Former member'}</span>
                        <span className="text-[0.65rem] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{c.body}</p>
                    </div>
                  </div>
                ))}
                {(comments ?? []).length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => { e.preventDefault(); if (comment.trim()) addComment.mutate(comment.trim()); }}
              >
                <Input aria-label="Write a comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." />
                <Button type="submit" size="icon" disabled={!comment.trim() || addComment.isPending} aria-label="Add comment"><Send className="h-4 w-4" /></Button>
              </form>
            </section>

            <section className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-semibold">Attachments</h3>
              {(attachments ?? []).map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                  <a href={safeHref(a.url)} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2 text-sm text-primary underline-offset-2 hover:underline">
                    <Paperclip className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{a.name}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                  <Button variant="ghost" size="icon" onClick={() => removeAttachment.mutate(a.id)} aria-label={`Remove ${a.name}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <form
                className="grid grid-cols-[1fr_2fr_auto] gap-2"
                onSubmit={(e) => { e.preventDefault(); if (attName.trim() && attUrl.trim()) addAttachment.mutate({ name: attName.trim(), url: attUrl.trim() }); }}
              >
                <Input aria-label="Attachment name" value={attName} onChange={(e) => setAttName(e.target.value)} placeholder="Name" />
                <Input aria-label="Attachment URL" value={attUrl} onChange={(e) => setAttUrl(e.target.value)} placeholder="https://..." />
                <Button type="submit" size="sm" disabled={!attName.trim() || !attUrl.trim() || addAttachment.isPending}>Add</Button>
              </form>
            </section>

            <section className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-semibold">Activity</h3>
              {(activity ?? []).map((a) => (
                <div key={a.id} className="flex items-baseline gap-2 text-xs">
                  <span className="font-medium">{a.actor?.name ?? 'System'}</span>
                  <span className="text-muted-foreground">{a.action}{a.meta ? ` (${a.meta})` : ''}</span>
                  <span className="ml-auto shrink-0 text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
              ))}
              {(activity ?? []).length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
            </section>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
