import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ClientShell from './client-shell';
import { AppChrome } from '@/components/app-chrome';
import { WelcomeTransition } from '@/components/welcome-transition';
import './intro.css';

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) redirect('/setup');

  return (
    <>
      <WelcomeTransition />
      <AppChrome>
        <ClientShell />
      </AppChrome>
    </>
  );
}
