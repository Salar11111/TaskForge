'use client';

import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Sun, Moon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/lib/store';
import { MemberAvatar } from '@/components/member-avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const viewConfig = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your projects and tasks' },
  projects: { title: 'Projects', subtitle: 'Manage and organize your projects' },
  board: { title: 'Board', subtitle: 'Kanban board for task management' },
  team: { title: 'Team', subtitle: 'Team members and workload' },
};

const createLabels = {
  dashboard: 'New',
  projects: 'New Project',
  board: 'New Task',
  team: 'New Member',
};

export function Header() {
  const { view, searchQuery, setSearchQuery, setTaskDialogOpen, setProjectDialogOpen, setUserDialogOpen } = useAppStore();
  const { theme, setTheme } = useTheme();

  const { data: session } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const response = await fetch('/api/auth/get-session');
      return response.ok ? response.json() : null;
    },
    staleTime: 1000 * 60 * 5,
  });

  const config = viewConfig[view];

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background/85 backdrop-blur-md">
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <MobileSidebar />
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-semibold tracking-tight text-foreground truncate">{config.title}</h1>
            <p className="text-xs text-muted-foreground truncate">{config.subtitle}</p>
          </div>
        </div>

        <div className="hidden md:flex flex-1 justify-center px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full pl-9 pr-4"
              aria-label="Search"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{createLabels[view]}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setProjectDialogOpen(true)}>New Project</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTaskDialogOpen(true)}>New Task</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUserDialogOpen(true)}>New Member</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {session?.user && (
            <div className="hidden lg:flex">
              <MemberAvatar name={session.user.name} avatar={session.user.image} color="emerald" size="sm" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
