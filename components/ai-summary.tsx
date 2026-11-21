'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AiSummary({ tasks }: { tasks: { title: string; status: string }[] }) {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      const done = tasks.filter((t) => t.status === 'DONE').length;
      const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
      const todo = tasks.filter((t) => t.status === 'TODO').length;
      setSummary(`This week: ${done} tasks completed, ${inProgress} in progress, ${todo} remaining. Focus on unblocking in-progress items.`);
      setLoading(false);
    }, 600);
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">AI Weekly Summary</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Button size="sm" onClick={generate} disabled={loading}>{loading ? 'Generating...' : 'Generate Summary'}</Button>
        {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
      </CardContent>
    </Card>
  );
}