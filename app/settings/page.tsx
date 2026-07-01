'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useStore } from '@/lib/store';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'ai' | 'integrations' | 'theme'>('profile');
  const { theme, setTheme } = useStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: '700' }}>Settings</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>System overrides, security protocols, API keys, and configurations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px' }}>
        <Card title="Categories">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            {([
              { id: 'profile', name: 'User Profile' },
              { id: 'security', name: 'Security' },
              { id: 'ai', name: 'AI Models & API Keys' },
              { id: 'integrations', name: 'Connected Services' },
              { id: 'theme', name: 'Theme & Customization' }
            ] as const).map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ 
                  textAlign: 'left', 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  backgroundColor: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.id ? '600' : '500'
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </Card>

        <div>
          {activeTab === 'profile' && (
            <Card title="User Profile">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Full Name</label>
                  <input type="text" defaultValue="Vincent N." style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px 12px', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Email Address</label>
                  <input type="email" defaultValue="vincent@nurofin.com" style={{ width: '100%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px 12px', color: 'white' }} />
                </div>
                <Button variant="primary">Save Changes</Button>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card title="Security Protocols">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                <p>Verify or rotate enterprise certificates and multi-factor auth devices.</p>
                <Button variant="danger">Enable MFA</Button>
              </div>
            </Card>
          )}

          {activeTab === 'ai' && (
            <Card title="AI Models & Keys">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                <p>Nurofin Executive OS maps queries to custom neural networks. Select model providers below.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)' }}>Primary Agent Provider</label>
                  <select style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px 12px', color: 'white', width: '100%' }}>
                    <option>Gemini 1.5 Pro (Custom Finetuned)</option>
                    <option>GPT-4o Enterprise</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card title="Connected Integrations">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                  <span>Google Workspace Calendar & Meet</span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>CONNECTED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                  <span>Jira Cloud</span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>CONNECTED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>AWS Ledger Logs</span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>CONNECTED</span>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'theme' && (
            <Card title="Theme Settings" description="Toggle primary and secondary layout colors.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                <p>Select your workspace appearance theme:</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button 
                    variant={theme === 'dark' ? 'primary' : 'secondary'} 
                    onClick={() => setTheme('dark')}
                  >
                    Dark Mode
                  </Button>
                  <Button 
                    variant={theme === 'light' ? 'primary' : 'secondary'} 
                    onClick={() => setTheme('light')}
                  >
                    Light Mode
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
