import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from './login-form';

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect(session.user ? '/' : '/setup');

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm />
    </main>
  );
}
