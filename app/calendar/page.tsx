'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import styles from './calendar.module.css';

export default function CalendarPage() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('month');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Calendar</h1>
          <p>Schedule, operational deadlines, and conflict monitoring.</p>
        </div>
        <div className={styles.actions}>
          <div className={styles.toggleGroup}>
            <button className={`${styles.toggleBtn} ${view === 'day' ? styles.activeToggle : ''}`} onClick={() => setView('day')}>Day</button>
            <button className={`${styles.toggleBtn} ${view === 'week' ? styles.activeToggle : ''}`} onClick={() => setView('week')}>Week</button>
            <button className={`${styles.toggleBtn} ${view === 'month' ? styles.activeToggle : ''}`} onClick={() => setView('month')}>Month</button>
          </div>
          <Button variant="primary">Add Event</Button>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.calendarArea}>
          <div className={styles.calendarHeader}>
            <h2>July 2026</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={styles.navBtn}><ChevronLeft className="w-4 h-4" /></button>
              <button className={styles.navBtn}><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className={styles.gridHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className={styles.gridHeaderCell}>{d}</div>)}
          </div>
          <div className={styles.grid}>
            {Array.from({ length: 35 }).map((_, idx) => {
              const dayNum = idx - 2; 
              const isValid = dayNum > 0 && dayNum <= 31;
              const hasMeeting = dayNum === 1; 
              
              return (
                <div key={idx} className={`${styles.cell} ${!isValid ? styles.cellEmpty : ''}`}>
                  {isValid && (
                    <>
                      <span className={styles.dayLabel}>{dayNum}</span>
                      {hasMeeting && (
                        <div className={styles.eventPill}>
                          <span className={styles.eventDot} />
                          <span>Financial Review</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.sidebar}>
          <Card title="Conflict Monitoring" description="AI detected schedule issues">
            <div className={styles.conflictItem}>
              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" style={{ color: 'var(--accent-orange)' }} />
              <div>
                <strong>Overlap detected:</strong> Investor Pitch Review overlaps with Project Alpha alignment on July 10 at 14:00.
              </div>
            </div>
          </Card>

          <Card title="Deadlines This Week">
            <div className={styles.deadlineList}>
              <div className={styles.deadlineItem}>
                <span className={styles.deadlineBarRed} />
                <div>
                  <strong>July 03:</strong> Q2 Tax Submissions
                </div>
              </div>
              <div className={styles.deadlineItem}>
                <span className={styles.deadlineBarOrange} />
                <div>
                  <strong>July 05:</strong> Alpha QA Verification
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
