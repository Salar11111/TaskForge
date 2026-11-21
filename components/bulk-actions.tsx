'use client';

import { Button } from '@/components/ui/button';

export function BulkActions({ count, onDelete, onStatusChange }: { count: number; onDelete: () => void; onStatusChange: (s: string) => void }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
      <span className="text-sm">{count} selected</span>
      <Button size="sm" variant="outline" onClick={() => onStatusChange('DONE')}>Mark Done</Button>
      <Button size="sm" variant="destructive" onClick={onDelete}>Delete</Button>
    </div>
  );
}