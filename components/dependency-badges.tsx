'use client';

import { Badge } from '@/components/ui/badge';

export function DependencyBadges({ blockedBy, blocks }: { blockedBy: string[]; blocks: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {blockedBy.map((id) => (<Badge key={id} variant="outline" className="text-rose-600">Blocked by {id}</Badge>))}
      {blocks.map((id) => (<Badge key={id} variant="outline" className="text-amber-600">Blocks {id}</Badge>))}
    </div>
  );
}