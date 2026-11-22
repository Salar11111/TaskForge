import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SettingsForm } from './settings-form';
import { AppChrome } from '@/components/app-chrome';

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, color: true },
  });
  if (!user) redirect('/login');

  return (
    <AppChrome>
      <main className="mx-auto max-w-md space-y-4 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <SettingsForm user={user} />
      </main>
    </AppChrome>
  );
}
