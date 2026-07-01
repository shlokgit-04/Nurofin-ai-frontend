'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function ProjectsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: '700' }}>Projects</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Enterprise milestones, deliverables, and progress tracking.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <Card title="Project Alpha" description="Core platform expansion rewrite">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Completion:</span>
              <strong>64%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Health Status:</span>
              <Badge variant="orange">Delayed</Badge>
            </div>
          </div>
        </Card>

        <Card title="Cloud Scaling" description="AWS architecture budget restructuring">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Completion:</span>
              <strong>40%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Health Status:</span>
              <Badge variant="blue">On Track</Badge>
            </div>
          </div>
        </Card>

        <Card title="Series A Audit Prep" description="Compliance records and legal audits">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Completion:</span>
              <strong>100%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Health Status:</span>
              <Badge variant="green">Completed</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
