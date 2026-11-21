'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function GlobalSearch({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState('');
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input className="pl-8" placeholder="Search tasks..." value={q} onChange={(e) => { setQ(e.target.value); onSearch(e.target.value); }} />
    </div>
  );
}