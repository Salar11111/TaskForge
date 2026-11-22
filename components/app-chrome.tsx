'use client';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';

/** Authenticated-app navigation shell. Auth pages render outside this wrapper. */
export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <div className='flex flex-1 min-w-0'>
        <Sidebar />
        <main className='flex-1 flex flex-col min-w-0'>
          <div className='flex-1 px-4 py-6 md:px-6 lg:px-8 min-w-0'>
            <div className='mx-auto w-full max-w-7xl min-w-0 space-y-6'>{children}</div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
