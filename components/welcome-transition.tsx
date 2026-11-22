'use client';

import { useEffect, useState } from 'react';
import { Check, Kanban } from 'lucide-react';

type Intent = 'signin' | 'workspace';

const COPY: Record<Intent, { eyebrow: string; title: string; note: string }> = {
  signin: { eyebrow: 'Welcome back', title: 'Opening your workspace', note: 'Getting everything ready' },
  workspace: { eyebrow: 'All set', title: 'Your workspace is ready', note: 'Let’s get to work' },
};

/** Branded curtain shown once after sign-in / workspace creation. */
export function WelcomeTransition() {
  const [intent, setIntent] = useState<Intent | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('tf-intro') as Intent | null;
    sessionStorage.removeItem('tf-intro');
    if (!stored || !COPY[stored]) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setIntent(stored);
    document.body.classList.add('intro-active');
    const timer = window.setTimeout(() => {
      setIntent(null);
      document.body.classList.remove('intro-active');
    }, 1600);
    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove('intro-active');
    };
  }, []);

  if (!intent) return null;
  const copy = COPY[intent];

  return (
    <div className='intro-overlay' aria-hidden='true'>
      <div className='intro-glow' />
      <div className='intro-content'>
        <div className='intro-mark'>
          <Kanban className='h-7 w-7' />
        </div>
        <p className='intro-eyebrow'>{copy.eyebrow}</p>
        <p className='intro-title'>{copy.title}</p>
        <div className='intro-progress'><span /></div>
        <p className='intro-note'><Check className='h-3.5 w-3.5' /> {copy.note}</p>
      </div>
    </div>
  );
}
