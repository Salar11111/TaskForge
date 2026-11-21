'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>An unexpected error interrupted this page. Your data is safe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={reset}>Try again</Button>
          {error.digest && <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>}
        </CardContent>
      </Card>
    </main>
  );
}
