'use client';

import Link from 'next/link';
import { LayoutDashboard, Kanban, FolderKanban, Users, Settings, X, Menu, Sparkles } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' as const },
  { name: 'Projects', icon: FolderKanban, view: 'projects' as const },
  { name: 'Board', icon: Kanban, view: 'board' as const },
  { name: 'Team', icon: Users, view: 'team' as const },
];

export function MobileSidebar() {
  const { view, setView } = useAppStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="inset-y-0 left-0 h-full w-64 border-r p-0 sm:max-w-sm">
        <SheetHeader className="flex items-center justify-between p-4 border-b">
          <SheetTitle className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </span>
            TaskForge
          </SheetTitle>
          <SheetClose asChild>
            <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <X className="h-5 w-5" />
            </button>
          </SheetClose>
        </SheetHeader>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = view === item.view;
            return (
              <SheetClose asChild key={item.name}>
                <button
                  onClick={() => setView(item.view)}
                  className={cn(
                    'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out',
                    isActive
                      ? 'bg-accent text-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />}
                  <item.icon className={cn('h-4.5 w-4.5 shrink-0', isActive && 'text-emerald-600 dark:text-emerald-400')} aria-hidden="true" />
                  {item.name}
                </button>
              </SheetClose>
            );
          })}
        </nav>

        <div className="px-3 pb-3">
          <div className="rounded-xl border bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Tip
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Drag tasks between columns to update status instantly.
            </p>
          </div>
        </div>

        <div className="border-t p-3">
          <SheetClose asChild>
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 ease-out hover:bg-accent hover:text-accent-foreground"
            >
              <Settings className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              Settings
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}