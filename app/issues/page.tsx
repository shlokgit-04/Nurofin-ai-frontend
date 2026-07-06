'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { Issue } from '@/types';
import { 
  ShieldAlert, 
  Plus, 
  Filter, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const issueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  severity: z.enum(['low', 'medium', 'high', 'critical'] as const),
  assignedTo: z.string().min(1, 'Assignment is required'),
});

type IssueFormValues = z.infer<typeof issueSchema>;

export default function IssueCenterPage() {
  const { issues, addIssue, updateIssue } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical': return 'text-accent-red bg-accent-red/10 border-accent-red/30 font-extrabold animate-pulse';
      case 'high': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20 font-bold';
      case 'medium': return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      default: return 'text-text-secondary bg-surface-card border-border-subtle';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle2 className="w-4 h-4 text-accent-green" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-accent-blue" />;
      default: return <AlertCircle className="w-4 h-4 text-accent-red" />;
    }
  };

  // Form Submit handler
  const onSubmit = (data: IssueFormValues) => {
    const newIssue: Issue = {
      ...data,
      id: `iss-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
    };
    addIssue(newIssue);
    reset({
      title: '',
      description: '',
      severity: 'medium',
      assignedTo: 'Aryan Dev',
    });
    setCreateOpen(false);
  };

  // Filtered issues list
  const filteredIssues = issues.filter(issue => {
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-text-primary">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background-secondary p-4 rounded-lg border border-border-subtle shadow-md">
        <div>
          <h2 className="text-base font-bold font-sans">Nurofin Issue & Bug Center</h2>
          <p className="text-2xs text-text-secondary mt-0.5">Track system errors, CORS policies, security alerts, and engineering patches.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold rounded-md shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Report Issue
        </button>
      </div>

      {/* Filter and stats Toolbar */}
      <div className="bg-background-secondary p-4 rounded-lg border border-border-subtle flex flex-wrap gap-4 items-center justify-between shadow-sm text-xs">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-background-primary border border-border-subtle rounded px-2.5 py-1 text-xs text-text-primary outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-text-secondary font-semibold">Severity:</span>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value as any)}
              className="bg-background-primary border border-border-subtle rounded px-2.5 py-1 text-xs text-text-primary outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 text-2xs text-text-secondary font-bold">
          <span>Open: {issues.filter(i => i.status === 'open').length}</span>
          <span className="text-accent-blue">In Progress: {issues.filter(i => i.status === 'in_progress').length}</span>
          <span className="text-accent-green">Resolved: {issues.filter(i => i.status === 'resolved').length}</span>
        </div>
      </div>

      {/* Issue Table list */}
      <div className="bg-background-secondary border border-border-subtle rounded-lg overflow-hidden shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Issue Title</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Assigned Developer</TableHead>
              <TableHead>Status Tracker</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIssues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="font-semibold text-xs py-4">
                  <div className="space-y-1">
                    <span>{issue.title}</span>
                    <span className="text-[10px] text-text-secondary block font-normal leading-relaxed">
                      {issue.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-2xs text-text-secondary">{issue.createdAt}</TableCell>
                <TableCell>
                  <span className={cn("px-2 py-0.5 rounded border text-[9px] uppercase font-bold tracking-wider", getSeverityBadge(issue.severity))}>
                    {issue.severity}
                  </span>
                </TableCell>
                <TableCell>
                  <select
                    value={issue.assignedTo}
                    onChange={(e) => updateIssue(issue.id, { assignedTo: e.target.value })}
                    className="bg-background-primary border border-border-subtle text-xs rounded p-1 text-text-primary outline-none cursor-pointer"
                  >
                    <option value="Aryan Dev">Aryan Dev</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Sarah Connor">Sarah Connor</option>
                  </select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(issue.status)}
                    <select
                      value={issue.status}
                      onChange={(e) => updateIssue(issue.id, { status: e.target.value as any })}
                      className="bg-background-primary border border-border-subtle text-xs rounded p-1 text-text-primary font-bold outline-none cursor-pointer"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredIssues.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-text-muted italic">
                  No issues matching selected filter parameters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Report New Issue Dialog Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report System Issue</DialogTitle>
            <DialogDescription>
              Submit system bugs, database compliance warnings, or security patches to engineering.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-text-secondary uppercase">Issue Title</label>
              <Input
                type="text"
                placeholder="e.g. Ledger DB preflight CORS blockage"
                {...register('title')}
                className={errors.title ? 'border-accent-red' : ''}
              />
              {errors.title && <span className="text-[10px] text-accent-red">{errors.title.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-text-secondary uppercase">Description & Reproduction Steps</label>
              <Textarea
                placeholder="Detail database schemas, request payloads, and API status codes..."
                rows={3}
                {...register('description')}
                className={errors.description ? 'border-accent-red' : ''}
              />
              {errors.description && <span className="text-[10px] text-accent-red">{errors.description.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-text-secondary uppercase">Severity Level</label>
                <select
                  className="w-full h-10 bg-background-secondary border border-border-subtle rounded-md px-3 text-sm text-text-primary outline-none"
                  {...register('severity')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-text-secondary uppercase">Assign Engineer</label>
                <select
                  className="w-full h-10 bg-background-secondary border border-border-subtle rounded-md px-3 text-sm text-text-primary outline-none"
                  {...register('assignedTo')}
                >
                  <option value="Aryan Dev">Aryan Dev (Frontend)</option>
                  <option value="John Doe">John Doe (Ledger Arch)</option>
                  <option value="Sarah Connor">Sarah Connor (Project PM)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="px-3 py-1.5 border border-border-subtle text-text-secondary hover:text-text-primary text-2xs font-semibold rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-accent-blue hover:bg-accent-blue-hover text-white text-2xs font-semibold rounded shadow transition-all"
              >
                Submit Issue
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
