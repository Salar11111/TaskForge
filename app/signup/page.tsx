import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import SignUpForm from './signup-form';
import '../auth.css';

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect('/');

  return (
    <main className='auth-shell auth-shell-single'>
      <section className='auth-panel' aria-label='Create an account'>
        <div className='auth-orb auth-orb-a' aria-hidden='true' />
        <div className='auth-orb auth-orb-b' aria-hidden='true' />
        <SignUpForm />
      </section>
    </main>
  );
}
