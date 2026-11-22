'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Kanban, Loader2 } from 'lucide-react';

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
    <div className='auth-card'>
      <div className='auth-mobile-brand'>
        <span className='auth-brand-mark'><Kanban className='h-5 w-5' aria-hidden='true' /></span>
      </div>

      <p className='auth-eyebrow'>One last step</p>
      <h1 className='auth-title'>Welcome to TaskForge</h1>
      <p className='auth-subtitle'>Create your first workspace to get started.</p>

      <form onSubmit={submit} className='auth-form'>
        <div className='auth-field'>
          <Label htmlFor='name' className='auth-label'>Workspace name</Label>
          <Input
            id='name'
            className='auth-input'
            name='name'
            placeholder='Acme Team'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <p className='text-xs text-muted-foreground'>You can rename it later in settings.</p>
        </div>

        {error && <p className='auth-error' role='alert'>{error}</p>}

        <Button type='submit' className='auth-submit w-full' disabled={submitting}>
          {submitting ? (
            <><Loader2 className='h-4 w-4 auth-spinner' aria-hidden='true' /> Creating...</>
          ) : (
            <>Create workspace <ArrowRight className='h-4 w-4' aria-hidden='true' /></>
          )}
        </Button>
      </form>
    </div>
  );
}
