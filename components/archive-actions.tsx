'use client';

import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw } from 'lucide-react';

export function ArchiveActions({ onArchive, onRestore }: { onArchive: () => void; onRestore: () => void }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onArchive}><Trash2 className="h-4 w-4 mr-1" /> Archive</Button>
      <Button variant="outline" size="sm" onClick={onRestore}><RotateCcw className="h-4 w-4 mr-1" /> Restore</Button>
    </div>
  );
}