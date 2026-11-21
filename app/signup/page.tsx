import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import SignUpForm from './signup-form';

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect('/');

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <SignUpForm />
    </main>
  );
}
