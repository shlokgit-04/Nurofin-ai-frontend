'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useStore } from '@/lib/store';
import styles from './Topbar.module.css';

export default function Topbar() {
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    searchQuery, 
    setSearchQuery, 
    notifications, 
    markAllNotificationsAsRead, 
    aiStatus 
  } = useStore();

  const [timeString, setTimeString] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={`${styles.topbar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={toggleSidebar} 
          className={styles.menuToggleButton}
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tasks, meetings, payments..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.rightContainer}>
        {/* AI Status Indicator */}
        <div className={styles.aiStatus}>
          <span className={`${styles.aiDot} ${aiStatus !== 'idle' ? styles.aiDotThinking : ''}`} />
          <span>AI Assistant: {aiStatus === 'idle' ? 'Ready' : aiStatus === 'analyzing' ? 'Analyzing' : 'Thinking'}</span>
        </div>

        {/* Current Time Clock */}
        <div className={styles.clock}>
          {timeString}
        </div>

        {/* Notification Bell */}
        <div className={styles.bellContainer} ref={dropdownRef}>
          <button 
            className={styles.iconButton} 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>

          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllNotificationsAsRead} className={styles.clearAllBtn}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className={styles.dropdownContent}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotifications}>No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`${styles.notificationItem} ${!notif.read ? styles.notificationItemUnread : ''}`}
                    >
                      <div className={styles.notifHeader}>
                        <span className={`${styles.notifTitle} ${
                          notif.type === 'success' ? styles.notifTitleSuccess :
                          notif.type === 'warning' ? styles.notifTitleWarning :
                          notif.type === 'error' ? styles.notifTitleError :
                          styles.notifTitleInfo
                        }`}>
                          {notif.title}
                        </span>
                        <span className={styles.notifTime}>{notif.time}</span>
                      </div>
                      <p className={styles.notifDesc}>{notif.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
