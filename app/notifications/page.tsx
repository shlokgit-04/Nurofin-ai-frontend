'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function NotificationsPage() {
  const { notifications } = useStore();

  const getNotifColor = (type: string) => {
    if (type === 'error') return 'red';
    if (type === 'warning') return 'orange';
    if (type === 'success') return 'green';
    return 'blue';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: '700' }}>Notifications Timeline</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>System alerts, delayed milestones, and audit triggers.</p>
      </div>

      <Card title="Alert History">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.map(n => (
            <div 
              key={n.id} 
              style={{ 
                padding: '16px', 
                backgroundColor: 'rgba(255,255,255,0.01)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{n.title}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>{n.description}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.time}</span>
              </div>
              <Badge variant={getNotifColor(n.type)}>{n.type}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
