'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const workloadData = [
  { name: 'Sarah', tasks: 8 },
  { name: 'Bob', tasks: 12 },
  { name: 'Alice', tasks: 5 },
  { name: 'John', tasks: 9 }
];

const performanceData = [
  { week: 'W1', completed: 4 },
  { week: 'W2', completed: 8 },
  { week: 'W3', completed: 11 },
  { week: 'W4', completed: 15 }
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: '700' }}>Analytics Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Performance monitoring, employee workload metrics, and throughput.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card title="Employee Workload" description="Total active items assigned by member.">
          <div style={{ width: '100%', height: '240px', marginTop: '16px' }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--text-secondary)' }}
                  />
                  <Bar dataKey="tasks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card title="Task Velocity" description="Tasks completed over last 4 weeks.">
          <div style={{ width: '100%', height: '240px', marginTop: '16px' }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--text-secondary)' }}
                  />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
