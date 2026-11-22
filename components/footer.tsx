'use client';

import { cn } from '@/lib/utils';

export function Footer() {
  return (
    <footer className={cn('mt-auto border-t bg-background/95 backdrop-blur py-4 px-4 md:px-6 lg:px-8')}>
      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <p className="shrink-0 font-medium text-foreground/80">TaskForge</p>
        <p className="min-w-0 text-xs">Built with Next.js, Tailwind, and shadcn/ui</p>
      </div>
    </footer>
  );
}