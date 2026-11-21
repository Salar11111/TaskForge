import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import SetupForm from './setup-form';

export default async function SetupPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
  });
  if (membership) redirect('/');

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <SetupForm />
    </main>
  );
}
