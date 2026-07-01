'use client';

import React from 'react';
import { Folder, File, Upload, Sparkles } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function KnowledgePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: '700' }}>Knowledge Base</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Google Drive and executive records search query index.</p>
        </div>
        <Button variant="primary" leftIcon={<Upload className="w-4 h-4" />}>Upload File</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px' }}>
        {/* Left panel - Folder Tree */}
        <Card title="Folders">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontWeight: '600' }}>
              <Folder className="w-4 h-4" />
              <span>Finance Records</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px' }}>
              <Folder className="w-4 h-4" />
              <span>Tax Audits</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Folder className="w-4 h-4" />
              <span>Project Artifacts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Folder className="w-4 h-4" />
              <span>Legal Contracts</span>
            </div>
          </div>
        </Card>

        {/* Right panel - Document Grid & List */}
        <Card title="Documents" description="Filter and preview documents. Use AI to query any file.">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '8px 4px' }}>Name</th>
                <th style={{ padding: '8px 4px' }}>Category</th>
                <th style={{ padding: '8px 4px' }}>Version</th>
                <th style={{ padding: '8px 4px' }}>Size</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '12px 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <File className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                  <span>Q2-Tax-Audit-Submissions.pdf</span>
                </td>
                <td style={{ padding: '12px 4px' }}>Compliance</td>
                <td style={{ padding: '12px 4px' }}>v1.2</td>
                <td style={{ padding: '12px 4px' }}>4.2 MB</td>
                <td style={{ padding: '12px 4px', textAlign: 'right' }}>
                  <Button size="sm" variant="secondary" leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-400" />}>Ask AI</Button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '12px 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <File className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                  <span>AWS-Scaling-Proposals.docx</span>
                </td>
                <td style={{ padding: '12px 4px' }}>Infrastructure</td>
                <td style={{ padding: '12px 4px' }}>v2.0</td>
                <td style={{ padding: '12px 4px' }}>1.8 MB</td>
                <td style={{ padding: '12px 4px', textAlign: 'right' }}>
                  <Button size="sm" variant="secondary" leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-400" />}>Ask AI</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
