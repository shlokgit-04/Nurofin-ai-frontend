'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { month: 'Jan', spending: 24000 },
  { month: 'Feb', spending: 28000 },
  { month: 'Mar', spending: 22000 },
  { month: 'Apr', spending: 35000 },
  { month: 'May', spending: 31000 },
  { month: 'Jun', spending: 42000 }
];

export default function FinancePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: '700' }}>Finance Module</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Ledger summary, subscriptions, cloud costs, and spend trajectories.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <Card title="Outstanding Invoices" description="Due for settlement">
          <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>$45,200</div>
          <span style={{ fontSize: '11px', color: 'var(--accent-red)' }}>3 invoices overdue</span>
        </Card>
        <Card title="Cloud Infrastructure" description="AWS & Vercel bills">
          <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>$12,450</div>
          <span style={{ fontSize: '11px', color: 'var(--accent-orange)' }}>+14% vs Q1 estimates</span>
        </Card>
        <Card title="Salaries & Overhead" description="Monthly staff payroll">
          <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>$118,000</div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Disbursed on 28th</span>
        </Card>
        <Card title="Remaining Q2 Budget" description="Total available cache">
          <div style={{ fontSize: '24px', fontWeight: '700', fontFamily: 'Outfit', color: 'var(--accent-green)' }}>$382,500</div>
          <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>Healthy state</span>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <Card title="Monthly Spend Analytics" description="Consolidated expense tracking across departments.">
          <div style={{ width: '100%', height: '240px', marginTop: '16px' }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }} 
                    labelStyle={{ color: 'var(--text-secondary)' }}
                  />
                  <Area type="monotone" dataKey="spending" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#spendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card title="Vendor Breakdown" description="Core cost allocations">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
              <span>Amazon Web Services</span>
              <strong>$9,840</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
              <span>Vercel Platform</span>
              <strong>$2,610</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
              <span>Slack Technologies</span>
              <strong>$1,850</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>GitHub Enterprise</span>
              <strong>$1,120</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
