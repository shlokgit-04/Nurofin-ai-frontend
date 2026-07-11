'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight
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
  { label: 'Account Settings', href: '/profile', icon: UserCircle },
  { label: 'User Management', href: '/admin', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, userProfile, theme, notifications, toggleSidebar } = useStore();
  const logoSrc = theme === 'light' ? '/logo-black.svg' : '/logo-white.svg';

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  return (
    <aside 
      className={cn(
        "h-screen border-r border-border-subtle dark:border-[#1e2030] flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 text-text-secondary dark:text-slate-300 animate-sidebar-gradient",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      <style>{`
        @keyframes sidebar-gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-sidebar-gradient {
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.15), 
            rgba(99, 102, 241, 0.15), 
            rgba(168, 85, 247, 0.15), 
            rgba(59, 130, 246, 0.15)
          );
          background-size: 300% 300%;
          animation: sidebar-gradient-move 12s ease infinite;
        }
        .dark .animate-sidebar-gradient {
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.25), 
            rgba(99, 102, 241, 0.25), 
            rgba(168, 85, 247, 0.25), 
            rgba(59, 130, 246, 0.25)
          );
        }
      `}</style>

      {/* Sidebar toggle button sitting on the right border line */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-background-secondary dark:bg-[#12131c] border border-border-subtle dark:border-[#1e2030] flex items-center justify-center shadow-md hover:bg-surface-hover dark:hover:bg-slate-800 text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white z-50 transition-all duration-200"
        title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Brand Logo Container */}
      <div 
        className={cn(
          "h-16 flex items-center border-b border-border-subtle dark:border-[#1e2030]/60 overflow-hidden",
          sidebarCollapsed ? "justify-center px-0" : "px-6"
        )}
      >
        {sidebarCollapsed ? (
          <div className="w-9 h-9 relative overflow-hidden flex items-center justify-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={logoSrc} 
              alt="N" 
              className="h-9 max-w-none absolute left-0 top-0"
            />
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={logoSrc} 
            alt="Nurofin Logo" 
            className="h-9 w-auto block"
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
                  ? "bg-accent-blue/10 text-accent-blue font-semibold border-l-2 border-accent-blue dark:bg-accent-blue/15 dark:text-white" 
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-white"
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
                <span className="absolute left-14 scale-0 group-hover:scale-100 transition-all rounded bg-background-secondary dark:bg-[#12131c] border border-border-subtle dark:border-[#1e2030] p-2 text-xs text-text-primary dark:text-white z-50 shadow-md font-sans whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-border-subtle dark:border-[#1e2030]/60 flex flex-col gap-2">
        <div className={cn("flex items-center gap-3", sidebarCollapsed ? "justify-center" : "justify-between")}>
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="w-8 h-8 rounded-full bg-cover bg-center border border-border-subtle dark:border-[#1e2030]/80 flex-shrink-0"
              style={{ backgroundImage: `url(${userProfile.avatar})` }}
            />
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-text-primary dark:text-white truncate">{userProfile.name}</span>
                <span className="text-[10px] text-text-muted dark:text-slate-500">{userProfile.role}</span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button 
              onClick={handleLogout}
              className="text-text-secondary hover:text-accent-red dark:text-slate-400 dark:hover:text-accent-red p-1.5 rounded-md hover:bg-accent-red/10 transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        {sidebarCollapsed && (
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center text-text-secondary hover:text-accent-red dark:text-slate-400 dark:hover:text-accent-red p-1.5 rounded-md hover:bg-accent-red/10 transition-colors w-full"
            title="Logout"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </aside>
  );
}
