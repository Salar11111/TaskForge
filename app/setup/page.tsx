import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import SetupForm from './setup-form';
import '../auth.css';

export default async function SetupPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
  });
  if (membership) redirect('/');

  return (
    <main className='auth-shell auth-shell-single'>
      <section className='auth-panel' aria-label='Set up your workspace'>
        <div className='auth-orb auth-orb-a' aria-hidden='true' />
        <div className='auth-orb auth-orb-b' aria-hidden='true' />
        <SetupForm />
      </section>
    </main>
  );
}
