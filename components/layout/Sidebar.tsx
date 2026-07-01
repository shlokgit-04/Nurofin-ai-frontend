'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Calendar, 
  Users, 
  CheckSquare, 
  Briefcase, 
  FolderOpen, 
  DollarSign, 
  Handshake, 
  Bell, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Executive AI', href: '/chat', icon: BrainCircuit },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Meetings', href: '/meetings', icon: Users },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Projects', href: '/projects', icon: Briefcase },
  { label: 'Knowledge Base', href: '/knowledge', icon: FolderOpen },
  { label: 'Finance', href: '/finance', icon: DollarSign },
  { label: 'Commitments', href: '/commitments', icon: Handshake },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, userProfile, theme } = useStore();
  const logoSrc = theme === 'light' ? '/logo-black.svg' : '/logo-white.svg';

  return (
    <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.logoContainer}>
        {sidebarCollapsed ? (
          <div className={styles.logoSymbolWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={logoSrc} 
              alt="Nurofin Symbol" 
              className={styles.logoSymbol}
            />
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={logoSrc} 
            alt="Nurofin Logo" 
            className={styles.logoFull}
          />
        )}
      </div>

      <nav className={styles.navSection}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.activeNavItem : ''}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className={styles.itemLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div 
            className={styles.avatar} 
            style={{ backgroundImage: `url(${userProfile.avatar})` }}
          />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userProfile.name}</span>
            <span className={styles.userRole}>{userProfile.role}</span>
          </div>
        </div>
        
        <button className={styles.logoutButton}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
