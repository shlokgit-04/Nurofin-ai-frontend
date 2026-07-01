'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function CommitmentsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: '700' }}>Commitments Tracker</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Automated tracker matching operational promises made in emails and meetings.</p>
      </div>

      <Card title="Commitment Ledger">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '8px 4px' }}>Customer</th>
              <th style={{ padding: '8px 4px' }}>Owner</th>
              <th style={{ padding: '8px 4px' }}>Deadline</th>
              <th style={{ padding: '8px 4px' }}>Source</th>
              <th style={{ padding: '8px 4px' }}>Risk</th>
              <th style={{ padding: '8px 4px' }}>Priority</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
              <td style={{ padding: '12px 4px' }}><strong>Acme Corp</strong></td>
              <td>Sarah Connor</td>
              <td>2026-07-15</td>
              <td>Email thread #492</td>
              <td><Badge variant="green">Low</Badge></td>
              <td><Badge variant="blue">Medium</Badge></td>
            </tr>
            <tr>
              <td style={{ padding: '12px 4px' }}><strong>Globex Corp</strong></td>
              <td>Bob Proctor</td>
              <td>2026-07-08</td>
              <td>Meeting: Project Alignment</td>
              <td><Badge variant="orange">High</Badge></td>
              <td><Badge variant="red">High</Badge></td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
