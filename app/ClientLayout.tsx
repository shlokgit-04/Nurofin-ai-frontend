'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { useStore } from '@/lib/store';
import styles from './layout.module.css';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed, theme } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <Topbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
