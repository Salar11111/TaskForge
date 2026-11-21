'use client';

import { cn } from '@/lib/utils';

export function Footer() {
  return (
    <footer className={cn('mt-auto border-t bg-background/95 backdrop-blur py-4 px-4 md:px-6 lg:px-8')}>
      <div className="mx-auto w-full max-w-7xl flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground/80">TaskForge</p>
        <p className="text-xs">Built with Next.js, Tailwind, and shadcn/ui</p>
      </div>
    </footer>
  );
}