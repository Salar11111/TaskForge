'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Kanban, Loader2 } from 'lucide-react';

export default function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string; code?: string };
        setError(data.message || data.code || 'Could not create the account');
      } else {
        // New accounts have no workspace yet — /setup creates the first one.
        window.location.assign('/setup');
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

      <p className='auth-eyebrow'>Get started</p>
      <h1 className='auth-title'>Create your account</h1>
      <p className='auth-subtitle'>Set up a workspace and start organizing tasks.</p>

      <form onSubmit={submit} className='auth-form'>
        <div className='auth-field'>
          <Label htmlFor='name' className='auth-label'>Name</Label>
          <Input
            id='name'
            className='auth-input'
            name='name'
            autoComplete='name'
            placeholder='Your name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className='auth-field'>
          <Label htmlFor='email' className='auth-label'>Email</Label>
          <Input
            id='email'
            className='auth-input'
            name='email'
            type='email'
            autoComplete='username'
            placeholder='you@company.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='auth-field'>
          <Label htmlFor='password' className='auth-label'>Password</Label>
          <Input
            id='password'
            className='auth-input'
            name='password'
            type='password'
            autoComplete='new-password'
            minLength={8}
            placeholder='At least 8 characters'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className='text-xs text-muted-foreground'>Use at least 8 characters.</p>
        </div>

        {error && <p className='auth-error' role='alert'>{error}</p>}

        <Button type='submit' className='auth-submit w-full' disabled={submitting}>
          {submitting ? (
            <><Loader2 className='h-4 w-4 auth-spinner' aria-hidden='true' /> Creating...</>
          ) : (
            <>Create account <ArrowRight className='h-4 w-4' aria-hidden='true' /></>
          )}
        </Button>
      </form>

      <p className='auth-footnote'>
        Already have an account? <Link href='/login' className='auth-link'>Sign in</Link>
      </p>
    </div>
  );
}
