'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';
import { 
  Shield, 
  Users, 
  Key, 
  Briefcase, 
  UserCheck, 
  Plus, 
  Lock, 
  CheckSquare, 
  UserPlus 
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
}

const mockUsers: AdminUser[] = [
  { id: 'usr-1', name: 'Vincent N.', email: 'vincent@nurofin.com', role: 'CEO / Admin', status: 'active' },
  { id: 'usr-2', name: 'Sarah Connor', email: 'sarah@nurofin.com', role: 'Project Manager', status: 'active' },
  { id: 'usr-3', name: 'John Doe', email: 'john@nurofin.com', role: 'Lead Architect', status: 'active' },
  { id: 'usr-4', name: 'Aryan Dev', email: 'aryan@nurofin.com', role: 'Frontend Engineer', status: 'active' },
];

export default function AdminPanelPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [activeRole, setActiveRole] = useState<'ceo' | 'pm' | 'engineer'>('ceo');

  // Role permissions checklist mapping
  const permissionsList = [
    { key: 'read_finance', label: 'View Enterprise Budgets & Invoices' },
    { key: 'write_finance', label: 'Approve Payouts & Adjust Budgets' },
    { key: 'edit_tasks', label: 'Create, Reassign and Delete Work Tasks' },
    { key: 'access_ai', label: 'Interact with AI Copilot & Upload Files' },
    { key: 'manage_users', label: 'Configure Users & Role Permissions' },
  ];

  const rolePermissions = {
    ceo: ['read_finance', 'write_finance', 'edit_tasks', 'access_ai', 'manage_users'],
    pm: ['read_finance', 'edit_tasks', 'access_ai'],
    engineer: ['edit_tasks', 'access_ai'],
  };

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-text-primary">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background-secondary p-4 rounded-lg border border-border-subtle shadow-md">
        <div>
          <h2 className="text-base font-bold font-sans">System Administration Panel</h2>
          <p className="text-2xs text-text-secondary mt-0.5">Control enterprise user credentials, team access groups, and role permissions checklist.</p>
        </div>
      </div>

      <Tabs defaultValue="users">
        <div className="border-b border-border-subtle pb-2">
          <TabsList>
            <TabsTrigger value="users">User Database</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="teams">Teams & Access groups</TabsTrigger>
          </TabsList>
        </div>

        {/* 1. User Database Tab */}
        <TabsContent value="users" className="mt-4">
          <div className="bg-background-secondary border border-border-subtle rounded-lg overflow-hidden shadow-md">
            <div className="p-4 border-b border-border-subtle bg-surface-card/10 flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary">System Users</span>
              <button 
                onClick={() => alert('New user registration screen placeholder.')}
                className="flex items-center gap-1 px-2.5 py-1 bg-accent-blue hover:bg-accent-blue-hover text-white text-2xs font-semibold rounded"
              >
                <UserPlus className="w-3.5 h-3.5" /> Invite User
              </button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>System Role</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold text-xs py-3.5">{u.name}</TableCell>
                    <TableCell className="text-2xs text-text-secondary">{u.email}</TableCell>
                    <TableCell className="text-2xs text-text-primary font-medium">{u.role}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "text-2xs font-bold px-2 py-0.5 rounded-full border",
                        u.status === 'active' ? "text-accent-green bg-accent-green/10 border-accent-green/20" : "text-accent-red bg-accent-red/10 border-accent-red/20"
                      )}>
                        {u.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className="text-2xs text-accent-blue hover:underline font-semibold"
                      >
                        Toggle Status
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* 2. Roles & Permissions Tab */}
        <TabsContent value="roles" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Roles Selector list */}
            <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 h-fit shadow-md space-y-3">
              <h3 className="text-2xs font-bold text-text-secondary uppercase tracking-wider mb-2">Select Target Role</h3>
              <button
                onClick={() => setActiveRole('ceo')}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded text-left",
                  activeRole === 'ceo' ? "bg-accent-blue/15 text-accent-blue" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                )}
              >
                CEO / System Admin
              </button>
              <button
                onClick={() => setActiveRole('pm')}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded text-left",
                  activeRole === 'pm' ? "bg-accent-blue/15 text-accent-blue" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                )}
              >
                Project Manager (PM)
              </button>
              <button
                onClick={() => setActiveRole('engineer')}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded text-left",
                  activeRole === 'engineer' ? "bg-accent-blue/15 text-accent-blue" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                )}
              >
                Frontend Developer
              </button>
            </div>

            {/* Right permissions grid panel */}
            <div className="md:col-span-2 bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md space-y-4">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5 pb-2 border-b border-border-subtle/50">
                <Lock className="w-4 h-4 text-text-muted" /> Access Control List: {activeRole.toUpperCase()}
              </h3>
              <div className="space-y-4 pt-1">
                {permissionsList.map((perm) => {
                  const hasAccess = rolePermissions[activeRole].includes(perm.key);
                  return (
                    <div key={perm.key} className="flex items-center gap-3 bg-background-primary p-3 rounded border border-border-subtle/50">
                      <input 
                        type="checkbox" 
                        checked={hasAccess} 
                        readOnly 
                        className="w-4 h-4 text-accent-blue rounded bg-background-secondary border-border-subtle focus:ring-accent-blue"
                      />
                      <label className="text-xs text-text-primary font-medium">{perm.label}</label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 3. Teams & Access groups Tab */}
        <TabsContent value="teams" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Engineering Team */}
            <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-text-primary">Engineering Group</h3>
                <span className="text-[10px] bg-accent-blue/15 text-accent-blue px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  3 Members
                </span>
              </div>
              <p className="text-2xs text-text-secondary leading-relaxed">
                General backend ledger sharding, CORS guidelines configuration, and vector search connections.
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-border-subtle/50">
                {['usr-3', 'usr-4'].map(uid => {
                  const userObj = users.find(u => u.id === uid);
                  return (
                    <span key={uid} className="text-2xs bg-background-primary border border-border-subtle px-2 py-1 rounded">
                      {userObj?.name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Management Team */}
            <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-text-primary">Executive Board</h3>
                <span className="text-[10px] bg-accent-blue/15 text-accent-blue px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  2 Members
                </span>
              </div>
              <p className="text-2xs text-text-secondary leading-relaxed">
                Approve vendor invoices, set corporate budgets limits, and lead Q3/Q4 strategy reviewers.
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-border-subtle/50">
                {['usr-1', 'usr-2'].map(uid => {
                  const userObj = users.find(u => u.id === uid);
                  return (
                    <span key={uid} className="text-2xs bg-background-primary border border-border-subtle px-2 py-1 rounded">
                      {userObj?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
