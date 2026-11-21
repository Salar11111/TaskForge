'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SetupForm() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        setError(data.message || 'Failed to create workspace');
      } else {
        router.push('/');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome to TaskForge</CardTitle>
        <CardDescription>Create your first workspace to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Acme Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create workspace'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
