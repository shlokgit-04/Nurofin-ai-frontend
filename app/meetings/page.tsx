'use client';

import React from 'react';
import { Video, FileText, CheckSquare } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function MeetingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: '700' }}>Meetings</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>View recordings, summaries, and automated action lists.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card title="Q2 Financial Review" description="July 01, 2026 • 09:30 - 10:30">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Participants:</strong> Vincent, Sarah Connor, Dave (VP Finance)
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button size="sm" leftIcon={<Video className="w-4 h-4" />}>Watch Recording</Button>
                <Button size="sm" leftIcon={<FileText className="w-4 h-4" />}>View Minutes</Button>
              </div>
            </div>
          </Card>

          <Card title="Project Alpha Status Alignment" description="June 29, 2026 • 11:30 - 12:00">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong>Participants:</strong> Vincent, Alice (PM), Bob (Architect)
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button size="sm" leftIcon={<Video className="w-4 h-4" />}>Watch Recording</Button>
                <Button size="sm" leftIcon={<FileText className="w-4 h-4" />}>View Minutes</Button>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card title="AI Transcribed Action Items" description="Assigned during meetings">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px' }}>
                <CheckSquare className="w-4 h-4 flex-shrink-0" style={{ marginTop: '2px', color: 'var(--accent-blue)' }} />
                <div>
                  <strong>Audit AWS Cost Centers</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Sarah Connor • Due in 2 days</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px' }}>
                <CheckSquare className="w-4 h-4 flex-shrink-0" style={{ marginTop: '2px', color: 'var(--accent-blue)' }} />
                <div>
                  <strong>Resolve QA blocking tickets</strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Bob Proctor • Due in 4 days</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
