import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Check, Kanban } from 'lucide-react';
import LoginForm from './login-form';
import './login.css';

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect(session.user ? '/' : '/setup');

  return (
    <main className='auth-shell'>
      <section className='auth-story' aria-label='About TaskForge'>
        <div className='auth-glow auth-glow-a' aria-hidden='true' />
        <div className='auth-glow auth-glow-b' aria-hidden='true' />

        <div className='auth-story-inner'>
          <div className='auth-brand'>
            <span className='auth-brand-mark'><Kanban className='h-5 w-5' aria-hidden='true' /></span>
            TaskForge
          </div>

          <p className='auth-headline'>Plan the work.<br /><span>Ship the thing.</span></p>
          <p className='auth-story-copy'>
            Tasks, projects, sprints and workload in one calm workspace. Move a card, change a date,
            and the whole team sees it — instantly.
          </p>

          <div className='auth-proof'>
            <span><Check className='h-4 w-4' aria-hidden='true' /> Live Kanban board</span>
            <span><Check className='h-4 w-4' aria-hidden='true' /> Sprints &amp; roadmap</span>
            <span><Check className='h-4 w-4' aria-hidden='true' /> Team workload</span>
          </div>
        </div>

        <div className='auth-preview' aria-hidden='true'>
          <div className='auth-preview-bar'>
            <i /><i /><i />
            <b>Website Redesign · Board</b>
          </div>
          <div className='auth-preview-cols'>
            <div className='auth-preview-col'>
              <p><i style={{ background: '#fbbf24' }} />To do · 2</p>
              <div className='auth-task'>Write documentation<em>LOW</em></div>
              <div className='auth-task'>Add export functionality<em>MEDIUM</em></div>
            </div>
            <div className='auth-preview-col'>
              <p><i style={{ background: '#38bdf8' }} />In progress · 2</p>
              <div className='auth-task'>Build chart components<em>HIGH</em></div>
              <div className='auth-task'>Implement authentication<em>URGENT</em></div>
            </div>
            <div className='auth-preview-col'>
              <p><i style={{ background: '#34d399' }} />Done · 2</p>
              <div className='auth-task'>Design new hero section<em>HIGH</em></div>
              <div className='auth-task'>Design GraphQL schema<em>HIGH</em></div>
            </div>
          </div>
        </div>
      </section>

      <section className='auth-panel' aria-label='Sign in'>
        <div className='auth-orb auth-orb-a' aria-hidden='true' />
        <div className='auth-orb auth-orb-b' aria-hidden='true' />
        <LoginForm />
      </section>
    </main>
  );
}
