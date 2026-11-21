import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>404 — Page not found</CardTitle>
          <CardDescription>That page does not exist in TaskForge.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild><Link href="/">Back to dashboard</Link></Button>
        </CardContent>
      </Card>
    </main>
  );
}
