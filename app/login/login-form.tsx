'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Kanban, Loader2 } from 'lucide-react';
import { playAuthExit } from '@/lib/auth-transition';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string; code?: string };
        setError(data.message || data.code || 'Invalid email or password');
      } else {
        await playAuthExit(event.currentTarget, 'signin');
        window.location.assign('/');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div className='auth-card'>
      <div className='auth-mobile-brand'>
        <span className='auth-brand-mark'><Kanban className='h-5 w-5' aria-hidden='true' /></span>
      </div>

      <p className='auth-eyebrow'>Welcome back</p>
      <h1 className='auth-title'>Sign in to TaskForge</h1>
      <p className='auth-subtitle'>Pick up where your team left off.</p>

      <form onSubmit={submit} className='auth-form'>
        <div className='auth-field'>
          <Label htmlFor='email' className='auth-label'>Email</Label>
          <Input
            id='email'
            className='auth-input'
            type='email'
            name='email'
            autoComplete='username'
            placeholder='you@company.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className='auth-field'>
          <Label htmlFor='password' className='auth-label'>Password</Label>
          <Input
            id='password'
            className='auth-input'
            type='password'
            name='password'
            autoComplete='current-password'
            placeholder='Your password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className='auth-error' role='alert'>{error}</p>}

        <Button type='submit' className='auth-submit w-full' disabled={submitting}>
          {submitting ? (
            <><Loader2 className='h-4 w-4 auth-spinner' aria-hidden='true' /> Signing in...</>
          ) : (
            <>Sign in <ArrowRight className='h-4 w-4' aria-hidden='true' /></>
          )}
        </Button>
      </form>

      <p className='auth-footnote'>
        New here? <Link href='/signup' className='auth-link'>Create an account</Link>
      </p>
    </div>

    <div className='auth-exit-veil' aria-hidden='true'>
      <span className='auth-veil-mark'><Kanban className='h-7 w-7' /></span>
    </div>
    </>
  );
}
