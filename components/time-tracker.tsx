'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';

export function TimeTracker({ onLog }: { onLog: (minutes: number, note?: string) => void }) {
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');
  return (
    <div className="flex gap-2 items-center">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <Input type="number" placeholder="Minutes" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="w-24" />
      <Input placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
      <Button size="sm" onClick={() => { if (minutes) { onLog(parseInt(minutes), note || undefined); setMinutes(''); setNote(''); } }}>Log</Button>
    </div>
  );
}