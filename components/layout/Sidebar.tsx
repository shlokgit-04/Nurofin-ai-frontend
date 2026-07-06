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
  Bell, 
  Settings, 
  ShieldAlert, 
  UserCircle,
  Menu,
  Sparkles
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: Briefcase },
  { label: 'Work Center', href: '/tasks', icon: CheckSquare },
  { label: 'Planner', href: '/planner', icon: Calendar },
  { label: 'Meetings', href: '/meetings', icon: Users },
  { label: 'Knowledge Hub', href: '/knowledge', icon: FolderOpen },
  { label: 'Issue Center', href: '/issues', icon: ShieldAlert },
  { label: 'Finance', href: '/finance', icon: DollarSign },
  { label: 'AI Assistant', href: '/chat', icon: BrainCircuit },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Profile', href: '/profile', icon: UserCircle },
  { label: 'Admin Panel', href: '/admin', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, userProfile, theme, notifications } = useStore();
  const logoSrc = theme === 'light' ? '/logo-black.svg' : '/logo-white.svg';

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <aside 
      className={cn(
        "h-screen bg-background-secondary border-r border-border-subtle flex flex-col fixed left-0 top-0 z-40 transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Logo Container */}
      <div 
        className={cn(
          "h-16 flex items-center border-b border-border-subtle overflow-hidden",
          sidebarCollapsed ? "justify-center px-0" : "px-6"
        )}
      >
        {sidebarCollapsed ? (
          <div className="w-8 h-8 relative overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={logoSrc} 
              alt="N" 
              className="h-8 max-w-none absolute left-0"
              style={{ clipPath: 'inset(0px 102px 0px 0px)' }} // Crops the N symbol of Nurofin
            />
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={logoSrc} 
            alt="Nurofin Logo" 
            className="h-7 w-auto block"
          />
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group relative",
                isActive 
                  ? "bg-accent-blue/10 text-accent-blue font-semibold" 
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              
              {!sidebarCollapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}

              {/* Notification Badges inside nav items */}
              {item.label === 'Notifications' && unreadNotificationsCount > 0 && (
                <span 
                  className={cn(
                    "flex-shrink-0 rounded-full text-2xs px-1.5 py-0.5 font-bold leading-none",
                    sidebarCollapsed 
                      ? "absolute -top-1 -right-1 bg-accent-red text-white"
                      : "bg-accent-red/20 text-accent-red"
                  )}
                >
                  {unreadNotificationsCount}
                </span>
              )}

              {/* Tooltip for Collapsed Sidebar */}
              {sidebarCollapsed && (
                <span className="absolute left-14 scale-0 group-hover:scale-100 transition-all rounded bg-surface-card border border-border-subtle p-2 text-xs text-text-primary z-50 shadow-md font-sans whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile Profile */}
      <div className="p-4 border-t border-border-subtle flex flex-col gap-2">
        <div className={cn("flex items-center gap-3", sidebarCollapsed ? "justify-center" : "")}>
          <div 
            className="w-8 h-8 rounded-full bg-cover bg-center border border-border-subtle flex-shrink-0"
            style={{ backgroundImage: `url(${userProfile.avatar})` }}
          />
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-text-primary truncate">{userProfile.name}</span>
              <span className="text-[10px] text-text-muted">{userProfile.role}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
