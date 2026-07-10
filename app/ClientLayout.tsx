'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import GlobalChat from '@/components/layout/GlobalChat';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed, theme, setTheme } = useStore();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // Instantiate React Query client
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  }));

  // Read persisted theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('nurofin-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  // Synchronize dynamic theme state to HTML document class list
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // If we are on the login page, render full viewport without sidebar/topbar shell
  if (isLoginPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background-primary text-text-primary">
          {children}
        </div>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background-primary text-text-primary font-sans flex">
        {/* Permanent Sidebar */}
        <Sidebar />

        {/* Unified Content Frame */}
        <div 
          className={cn(
            "flex-1 flex flex-col min-h-screen transition-all duration-300",
            sidebarCollapsed ? "pl-16" : "pl-64"
          )}
        >
          {/* Top Navigation */}
          <Topbar />

          {/* Core Content Area */}
          <main className="flex-1 pt-16 p-6 overflow-y-auto">
            {children}
          </main>
          {/* Floating AI Helper overlay */}
          <GlobalChat />
        </div>
      </div>
    </QueryClientProvider>
  );
}
