'use client';

import { useAppStore } from '@/lib/store';
import { Dashboard } from '@/components/dashboard';
import { ProjectsView } from '@/components/projects-view';
import { BoardView } from '@/components/board-view';
import { TeamView } from '@/components/team-view';

export default function Home() {
  const { view } = useAppStore();

  return (
    <>
      {view === 'dashboard' && <Dashboard />}
      {view === 'projects' && <ProjectsView />}
      {view === 'board' && <BoardView />}
      {view === 'team' && <TeamView />}
    </>
  );
}
