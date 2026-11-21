'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Plus, LayoutDashboard, FolderKanban, Users, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input placeholder="Type a command or search..." className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
            <Command.Group heading="Navigation">
              <Command.Item onSelect={() => { router.push('/dashboard'); setOpen(false); }} className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Command.Item>
              <Command.Item onSelect={() => { router.push('/projects'); setOpen(false); }} className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                <FolderKanban className="h-4 w-4" /> Projects
              </Command.Item>
              <Command.Item onSelect={() => { router.push('/team'); setOpen(false); }} className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                <Users className="h-4 w-4" /> Team
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Actions">
              <Command.Item onSelect={() => { setOpen(false); }} className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                <Plus className="h-4 w-4" /> Create task
              </Command.Item>
              <Command.Item onSelect={() => { setOpen(false); }} className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                <Settings className="h-4 w-4" /> Settings
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}