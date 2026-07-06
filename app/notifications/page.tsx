'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertCircle, 
  Briefcase, 
  Users, 
  DollarSign, 
  Info 
} from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'grouped'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'finance': return <DollarSign className="w-4 h-4 text-accent-red" />;
      case 'meetings': return <Users className="w-4 h-4 text-accent-blue" />;
      case 'tasks': return <Briefcase className="w-4 h-4 text-accent-orange" />;
      default: return <Info className="w-4 h-4 text-accent-green" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'finance': return 'border-accent-red/20 bg-accent-red/5 text-accent-red';
      case 'meetings': return 'border-accent-blue/20 bg-accent-blue/5 text-accent-blue';
      case 'tasks': return 'border-accent-orange/20 bg-accent-orange/5 text-accent-orange';
      default: return 'border-accent-green/20 bg-accent-green/5 text-accent-green';
    }
  };

  // Group notifications by category if "grouped" tab is selected
  const categoriesList = ['finance', 'meetings', 'tasks', 'alerts', 'general'] as const;

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans text-text-primary">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background-secondary p-4 rounded-lg border border-border-subtle shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent-red/10 rounded-lg text-accent-red">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-sans">Notification Center</h2>
            <p className="text-2xs text-text-secondary mt-0.5">Manage transaction alerts, workspace syncs, and system health tickers.</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-background-primary border border-border-subtle hover:text-text-primary text-xs font-semibold rounded-md text-text-secondary transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Roster Filter tabs */}
      <div className="flex border-b border-border-subtle gap-4 text-xs font-semibold pb-1.5">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "pb-2 border-b-2 px-1 transition-all",
            filter === 'all' ? "border-accent-blue text-accent-blue font-bold" : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          All Stream ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            "pb-2 border-b-2 px-1 transition-all flex items-center gap-1.5",
            filter === 'unread' ? "border-accent-blue text-accent-blue font-bold" : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          Unread Alerts
          {unreadCount > 0 && (
            <span className="bg-accent-red text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter('grouped')}
          className={cn(
            "pb-2 border-b-2 px-1 transition-all",
            filter === 'grouped' ? "border-accent-blue text-accent-blue font-bold" : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          Grouped Category List
        </button>
      </div>

      {/* Render notifications list based on tab */}
      {filter !== 'grouped' ? (
        <div className="bg-background-secondary border border-border-subtle rounded-lg overflow-hidden divide-y divide-border-subtle shadow-md">
          {filteredNotifs.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted italic">No notifications inside this folder.</div>
          ) : (
            filteredNotifs.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                className={cn(
                  "p-4 flex gap-4 items-start text-xs transition-colors cursor-pointer hover:bg-surface-hover/50 text-left",
                  !notif.read ? "bg-accent-blue/[0.02]" : ""
                )}
              >
                <div className={cn("p-2 border rounded-md h-fit mt-0.5", getCategoryColor(notif.category))}>
                  {getCategoryIcon(notif.category)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-bold text-text-primary text-xs truncate">{notif.title}</h4>
                    <span className="text-[9px] text-text-muted flex-shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{notif.description}</p>
                </div>

                {/* Read / Unread indicator dot */}
                <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                  {!notif.read ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-blue" />
                  ) : (
                    <Check className="w-4 h-4 text-text-muted" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Render Grouped Category List folders */
        <div className="space-y-4">
          {categoriesList.map((cat) => {
            const catNotifs = notifications.filter(n => n.category === cat);
            if (catNotifs.length === 0) return null;
            return (
              <div key={cat} className="bg-background-secondary border border-border-subtle rounded-lg overflow-hidden shadow-md">
                <div className="p-3 border-b border-border-subtle bg-surface-card/10 flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-wider text-text-primary">{cat} Alerts</span>
                  <span className="text-2xs bg-background-primary border border-border-subtle px-2 py-0.5 rounded text-text-secondary font-bold">
                    {catNotifs.length}
                  </span>
                </div>
                <div className="divide-y divide-border-subtle">
                  {catNotifs.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                      className={cn(
                        "p-4 flex gap-4 items-start text-xs transition-colors cursor-pointer hover:bg-surface-hover/50 text-left",
                        !notif.read ? "bg-accent-blue/[0.02]" : ""
                      )}
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-bold text-text-primary text-xs truncate">{notif.title}</h4>
                          <span className="text-[9px] text-text-muted flex-shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed">{notif.description}</p>
                      </div>
                      <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                        {!notif.read ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-accent-blue" />
                        ) : (
                          <Check className="w-4 h-4 text-text-muted" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
