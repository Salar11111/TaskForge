'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MemberAvatar } from '@/components/member-avatar';
import { type User } from '@/lib/api';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsForm({ user }: { user: User }) {
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  const signOut = async () => {
    setSigningOut(true);
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
      router.push('/login');
    } catch {
      setSigningOut(false);
      toast.error('Could not sign out. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your profile and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <MemberAvatar name={user.name} avatar={user.image} color={user.color} size="lg" />
          <div className="min-w-0">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <Button variant="destructive" className="gap-2" onClick={signOut} disabled={signingOut}>
          <LogOut className="h-4 w-4" /> {signingOut ? 'Signing out...' : 'Sign out'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Sign out here, then sign in again at the login page to re-enter your workspace.
        </p>
      </CardContent>
    </Card>
  );
}
