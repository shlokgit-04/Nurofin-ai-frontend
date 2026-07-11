'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { projectsService } from '@/services/projects';
import { usersService } from '@/services/users';
import { UserProfile as User } from '@/types';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  Percent, 
  Activity, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Plus,
  Loader2,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'completed']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  budget: z.number().optional(),
  gitUrl: z.string().optional(),
  members: z.array(z.string()).optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function ProjectsPage() {
  const { projects, setProjects, addProject } = useStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Quick Task states
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskPriority, setQuickTaskPriority] = useState('medium');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { 
      status: 'planning', 
      startDate: new Date().toISOString().split('T')[0], 
      endDate: '', 
      priority: 'medium',
      budget: 0,
      gitUrl: '',
      members: [] 
    }
  });

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [projectsData, usersData] = await Promise.all([
          projectsService.getProjects(),
          usersService.getUsers()
        ]);
        if (active) {
          setProjects(projectsData);
          setAvailableUsers(usersData);
          if (projectsData.length > 0) {
            setSelectedProjectId(projectsData[0].id);
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to load projects');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [setProjects]);

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      const { members, ...projectData } = data;
      const created = await projectsService.createProject({
        ...projectData,
        progress: 0
      });
      
      // Add selected members to the project
      if (members && members.length > 0) {
        for (const userId of members) {
          await projectsService.addMember(created.id, userId);
        }
        // Refresh project to get full members list
        const refreshedProjects = await projectsService.getProjects();
        setProjects(refreshedProjects);
        setSelectedProjectId(created.id);
      } else {
        addProject(created);
        setSelectedProjectId(created.id);
      }
      
      setModalOpen(false);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedProjectId) return;
    try {
      await projectsService.addMember(selectedProjectId, userId);
      const data = await projectsService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedProjectId) return;
    try {
      await projectsService.removeMember(selectedProjectId, userId);
      const data = await projectsService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !quickTaskTitle.trim()) return;
    try {
      await fetch('/api/v1/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          title: quickTaskTitle,
          priority: quickTaskPriority,
          project_id: parseInt(selectedProjectId)
        })
      });
      setQuickTaskTitle('');
      setQuickTaskOpen(false);
      const refreshed = await projectsService.getProjects();
      setProjects(refreshed);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      case 'planning': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
      case 'completed': return 'text-accent-green bg-accent-green/10 border-accent-green/20';
      default: return 'text-accent-red bg-accent-red/10 border-accent-red/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-accent-red bg-accent-red/10 border-accent-red/20';
      case 'high': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
      case 'medium': return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      default: return 'text-text-muted bg-surface-card border-border-subtle/50';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
        <span className="text-sm font-medium">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 max-w-md mx-auto text-center">
        <AlertCircle className="w-10 h-10 text-accent-red" />
        <div>
          <h3 className="text-sm font-bold text-text-primary mb-1">Failed to Load Projects</h3>
          <p className="text-xs text-text-muted leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold rounded-md shadow transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto font-sans text-text-primary">
      
      {/* Left Column: Project Directory List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-background-secondary p-4 rounded-lg border border-border-subtle">
          <h3 className="text-xs font-bold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-text-secondary" />
            Project Roster ({projects.length})
          </h3>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold rounded-md shadow transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>

        <div className="space-y-3">
          {projects.map((proj) => {
            const isSelected = proj.id === selectedProjectId;
            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={cn(
                  "relative p-4 rounded-lg border cursor-pointer text-left transition-all duration-300 hover:border-accent-blue/50 overflow-hidden",
                  isSelected 
                    ? "border-accent-blue bg-gradient-to-r from-accent-blue/[0.03] to-indigo-600/[0.03] shadow-md border-l-4 border-l-accent-blue" 
                    : "border-border-subtle bg-background-secondary hover:shadow-sm"
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className={cn("text-xs font-bold line-clamp-1 transition-colors", isSelected ? "text-accent-blue" : "text-text-primary")}>
                    {proj.name}
                  </h4>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <span className={cn("text-[8px] uppercase font-extrabold tracking-wider border px-1.5 py-0.5 rounded", getPriorityColor(proj.priority || 'medium'))}>
                      {proj.priority || 'medium'}
                    </span>
                    <span className={cn("text-[8px] uppercase font-extrabold tracking-wider border px-1.5 py-0.5 rounded", getStatusColor(proj.status))}>
                      {proj.status}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2 mb-3">
                  {proj.description}
                </p>
                <div className="flex items-center justify-between text-2xs">
                  <span className="text-text-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> End: {proj.endDate}
                  </span>
                  <span className="text-accent-blue font-bold">{Math.round(proj.progress || 0)}% Complete</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Selected Project Detail Panels */}
      <div className="lg:col-span-2 space-y-6">
        {selectedProject ? (
          <>
            {/* Project Summary Banner */}
            <div className="bg-background-secondary p-6 rounded-lg border border-border-subtle space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle/50 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[9px] uppercase font-bold tracking-wider border px-2 py-0.5 rounded", getStatusColor(selectedProject.status))}>
                      Project {selectedProject.status}
                    </span>
                    <span className={cn("text-[9px] uppercase font-bold tracking-wider border px-2 py-0.5 rounded", getPriorityColor(selectedProject.priority || 'medium'))}>
                      {selectedProject.priority || 'medium'} Priority
                    </span>
                  </div>
                  <h2 className="text-lg font-bold font-sans mt-2">{selectedProject.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-md border border-accent-blue/20">
                    {Math.round(selectedProject.progress || 0)}% Complete
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Objectives</h4>
                <p className="text-xs text-text-primary leading-relaxed">{selectedProject.description}</p>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px] text-text-secondary font-medium">
                  <span>Milestone progress</span>
                  <span>{Math.round(selectedProject.progress || 0)}%</span>
                </div>
                <div className="h-2.5 bg-background-primary rounded-full overflow-hidden border border-border-subtle/50">
                  <div 
                    className="h-full bg-accent-blue rounded-full transition-all duration-500" 
                    style={{ width: `${selectedProject.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Timeline Info cards */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-background-primary p-3 rounded border border-border-subtle/50 text-center">
                  <span className="text-[10px] text-text-secondary block">Start Date</span>
                  <span className="text-xs font-semibold">{selectedProject.startDate}</span>
                </div>
                <div className="bg-background-primary p-3 rounded border border-border-subtle/50 text-center">
                  <span className="text-[10px] text-text-secondary block">Target Release Date</span>
                  <span className="text-xs font-semibold">{selectedProject.endDate}</span>
                </div>
              </div>
            </div>

            {/* Financials & Deliverables checklist group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Project Financials Widget */}
              <div className="bg-background-secondary p-5 rounded-lg border border-border-subtle shadow-md space-y-4">
                <div className="border-b border-border-subtle/50 pb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold flex items-center gap-2 text-text-secondary uppercase tracking-wider">
                    <Percent className="w-4 h-4 text-accent-green" /> Project Financials
                  </h3>
                  <span className={cn(
                    "text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border",
                    (selectedProject.spending || 0) <= (selectedProject.budget || 0) 
                      ? "text-accent-green bg-accent-green/10 border-accent-green/20" 
                      : "text-accent-red bg-accent-red/10 border-accent-red/20"
                  )}>
                    {(selectedProject.spending || 0) <= (selectedProject.budget || 0) ? 'On Budget' : 'Over Budget'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-2xs text-text-secondary">
                    <div>
                      <span>Allocated Budget</span>
                      <span className="block font-bold text-text-primary text-sm mt-0.5">₹{(selectedProject.budget || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span>Total Spending</span>
                      <span className="block font-bold text-text-primary text-sm mt-0.5">₹{(selectedProject.spending || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-center">
                    <div className="flex justify-between text-[10px] text-text-secondary font-semibold">
                      <span>Budget Burn Rate</span>
                      <span>{selectedProject.budget ? Math.round(((selectedProject.spending || 0) / selectedProject.budget) * 100) : 0}%</span>
                    </div>
                    <div className="h-2 bg-background-primary rounded-full overflow-hidden border border-border-subtle/30">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          (selectedProject.spending || 0) <= (selectedProject.budget || 0) ? 'bg-accent-green' : 'bg-accent-red'
                        )}
                        style={{ width: `${Math.min(selectedProject.budget ? ((selectedProject.spending || 0) / selectedProject.budget) * 100 : 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Inline Edit Budget form */}
                <div className="flex items-center gap-4 pt-2 text-2xs border-t border-border-subtle/30">
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted font-medium">Budget:</span>
                    <input 
                      type="number" 
                      defaultValue={selectedProject.budget || 0}
                      onBlur={async (e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val !== selectedProject.budget) {
                          try {
                            await projectsService.updateProject(selectedProject.id, { budget: val });
                            const refreshed = await projectsService.getProjects();
                            setProjects(refreshed);
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className="w-20 bg-background-primary border border-border-subtle rounded px-1.5 py-0.5 outline-none text-text-primary font-bold focus:border-accent-blue"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted font-medium">Spent:</span>
                    <input 
                      type="number" 
                      defaultValue={selectedProject.spending || 0}
                      onBlur={async (e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val !== selectedProject.spending) {
                          try {
                            await projectsService.updateProject(selectedProject.id, { spending: val });
                            const refreshed = await projectsService.getProjects();
                            setProjects(refreshed);
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className="w-20 bg-background-primary border border-border-subtle rounded px-1.5 py-0.5 outline-none text-text-primary font-bold focus:border-accent-blue"
                    />
                  </div>
                </div>
              </div>

              {/* Tasks & Milestone Deliverables checklist */}
              <div className="bg-background-secondary p-5 rounded-lg border border-border-subtle shadow-md space-y-4">
                <div className="border-b border-border-subtle/50 pb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold flex items-center gap-2 text-text-secondary uppercase tracking-wider">
                    <CheckSquare className="w-4 h-4 text-accent-blue" />
                    Tasks Checklist ({(selectedProject.tasks || []).length})
                  </h3>
                  
                  <button
                    onClick={() => setQuickTaskOpen(!quickTaskOpen)}
                    className="text-[10px] text-accent-blue hover:underline font-semibold"
                  >
                    {quickTaskOpen ? 'Hide' : '+ Add Task'}
                  </button>
                </div>

                {/* Quick Create Task Form */}
                {quickTaskOpen && (
                  <form onSubmit={handleQuickTaskSubmit} className="p-3 bg-background-primary rounded-lg border border-border-subtle space-y-3 text-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Task title..." 
                        value={quickTaskTitle}
                        onChange={(e) => setQuickTaskTitle(e.target.value)}
                        className="w-full bg-background-secondary border border-border-subtle rounded px-2 py-1 text-text-primary outline-none focus:border-accent-blue"
                        required
                      />
                      <select
                        value={quickTaskPriority}
                        onChange={(e) => setQuickTaskPriority(e.target.value)}
                        className="bg-background-secondary border border-border-subtle rounded px-2 py-1 text-text-primary outline-none"
                      >
                        <option value="low">🟢 Low</option>
                        <option value="medium">🔵 Medium</option>
                        <option value="high">🔴 High</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-accent-blue hover:bg-accent-blue-hover text-white py-1 px-2 rounded font-semibold text-2xs transition-colors"
                    >
                      Add Deliverable
                    </button>
                  </form>
                )}

                {/* Tasks List */}
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {(selectedProject.tasks || []).map((task) => {
                    const isCompleted = task.status === 'done';
                    return (
                      <div 
                        key={task.id} 
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border transition-all duration-200",
                          isCompleted 
                            ? "border-accent-green/20 bg-accent-green/5 opacity-80" 
                            : "border-border-subtle bg-background-primary hover:bg-background-primary/80"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input 
                            type="checkbox" 
                            checked={isCompleted}
                            onChange={async () => {
                              try {
                                const newStatus = isCompleted ? 'todo' : 'done';
                                await fetch(`/api/v1/tasks/${task.id}`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`
                                  },
                                  body: JSON.stringify({ status: newStatus })
                                });
                                const refreshed = await projectsService.getProjects();
                                setProjects(refreshed);
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="rounded border-border-subtle text-accent-blue focus:ring-accent-blue w-3.5 h-3.5 cursor-pointer"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className={cn("text-[11px] font-bold text-text-primary truncate", isCompleted ? "line-through text-text-muted font-normal" : "")}>
                              {task.title}
                            </span>
                            <span className="text-[9px] text-text-muted flex items-center gap-1.5 mt-0.5">
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                task.priority === 'high' ? 'bg-accent-red' : task.priority === 'medium' ? 'bg-accent-blue' : 'bg-accent-green'
                              )} />
                              {task.priority} Priority
                            </span>
                          </div>
                        </div>

                        {task.assignedTo && (
                          <div 
                            className="w-5 h-5 rounded-full bg-cover bg-center border border-border-subtle flex-shrink-0"
                            style={{ backgroundImage: `url(${task.assignedTo.avatar})` }}
                            title={`Assigned to ${task.assignedTo.name}`}
                          />
                        )}
                      </div>
                    );
                  })}
                  {(selectedProject.tasks || []).length === 0 && (
                    <div className="text-center py-6 text-[10px] text-text-muted">No deliverables or tasks assigned to this project yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Members & Activity logs group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Members tracker */}
              <div className="bg-background-secondary border border-border-subtle rounded-lg shadow-md">
                <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                  <h3 className="text-xs font-bold flex items-center gap-2 text-text-secondary uppercase tracking-wider">
                    <Users className="w-4 h-4 text-accent-blue" /> Team Members ({selectedProject.members.length})
                  </h3>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddMember(e.target.value);
                        e.target.value = ''; // reset option selection
                      }
                    }}
                    className="text-[10px] bg-background-primary border border-border-subtle rounded px-2 py-1 outline-none text-text-secondary cursor-pointer font-semibold"
                  >
                    <option value="">+ Add Member</option>
                    {availableUsers
                      .filter(user => !selectedProject.members.some(m => m.id === user.id.toString()))
                      .map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                  </select>
                </div>
                <div className="p-4 space-y-3 max-h-[250px] overflow-y-auto">
                  {selectedProject.members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between bg-background-primary p-2.5 rounded border border-border-subtle/30 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full bg-cover bg-center border border-border-subtle"
                          style={{ backgroundImage: `url(${member.avatar})` }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-text-primary">{member.name}</span>
                          <span className="text-[10px] text-text-muted">{member.role}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-2xs text-accent-red hover:text-red-400 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {selectedProject.members.length === 0 && (
                    <div className="text-center py-4 text-xs text-text-muted">No team members assigned yet.</div>
                  )}
                </div>
              </div>

              {/* Activity Log & Git Commit tracker */}
              <div className="bg-background-secondary border border-border-subtle rounded-lg shadow-md">
                <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                  <h3 className="text-xs font-bold flex items-center gap-2 text-text-secondary uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-accent-orange" /> Git Commits & Logs
                  </h3>
                  {selectedProject.gitUrl && (
                    <span className="text-[9px] text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded border border-accent-blue/20 flex items-center gap-1 font-mono uppercase font-bold">
                      CONNECTED
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-3 max-h-[250px] overflow-y-auto">
                  {selectedProject.gitUrl ? (
                    [
                      { hash: '7c8a1b2', author: 'Aryan', branch: 'main', msg: 'Merge pull request #14 from frontend-dashboard', time: '10 mins ago' },
                      { hash: 'f2d8c3e', author: 'Vincent CEO', branch: 'main', msg: 'Update financial milestones layout and budget schemas', time: '2 hours ago' },
                      { hash: 'e9b3a1d', author: 'Muneesha', branch: 'main', msg: 'Fix eager-load relationship serialization crash on create_project', time: '1 day ago' }
                    ].map((commit, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs font-mono border-b border-border-subtle/30 pb-3 last:border-b-0 last:pb-0">
                        <span className="text-[9px] bg-background-primary border border-border-subtle rounded px-1.5 py-0.5 text-text-muted font-bold">
                          {commit.hash}
                        </span>
                        <div className="flex-1 space-y-0.5 min-w-0">
                          <p className="text-text-primary text-[11px] font-sans truncate font-medium">
                            {commit.msg}
                          </p>
                          <div className="flex items-center gap-2 text-[9px] text-text-muted">
                            <span className="font-bold text-accent-blue">{commit.author}</span>
                            <span>•</span>
                            <span className="text-accent-orange font-bold">[{commit.branch}]</span>
                            <span>•</span>
                            <span>{commit.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-text-muted space-y-2">
                      <p>No repository connected.</p>
                      <div className="flex items-center gap-2 justify-center pt-2">
                        <input 
                          type="text" 
                          placeholder="https://github.com/nurofin/..." 
                          onBlur={async (e) => {
                            const val = e.target.value;
                            if (val) {
                              try {
                                await projectsService.updateProject(selectedProject.id, { gitUrl: val });
                                const refreshed = await projectsService.getProjects();
                                setProjects(refreshed);
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                          className="text-2xs bg-background-primary border border-border-subtle rounded px-2.5 py-1.5 outline-none text-text-primary w-48 text-center"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-background-secondary p-8 rounded-lg border border-border-subtle text-center text-text-muted">
            Select a project from the directory list on the left to view details.
          </div>
        )}
      </div>

    </div>

      {/* Add New Project Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-background-secondary border border-border-subtle rounded-2xl shadow-2xl p-6 overflow-hidden">
          {/* Glowing border top */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent" />
          
          <DialogHeader className="pb-2 border-b border-border-subtle/30">
            <DialogTitle className="text-lg font-extrabold tracking-wide text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-blue animate-pulse" />
              <span>Create New Project</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Establish the parameters, timeline, and team roster for the initiative.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Project Name</label>
              <Input
                type="text"
                placeholder="e.g. Project Delta"
                {...register('name')}
                className={cn(
                  "bg-background-primary border-border-subtle text-text-primary placeholder-text-muted focus-visible:ring-2 focus-visible:ring-accent-blue/20 focus-visible:border-accent-blue transition-all duration-200",
                  errors.name ? 'border-accent-red focus-visible:ring-accent-red/20 focus-visible:border-accent-red' : ''
                )}
              />
              {errors.name && <span className="text-[10px] text-accent-red font-medium">{errors.name.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Description</label>
              <Textarea
                placeholder="Provide high-level project goals, deliverables, and scope..."
                rows={3}
                {...register('description')}
                className="bg-background-primary border-border-subtle text-text-primary placeholder-text-muted focus-visible:ring-2 focus-visible:ring-accent-blue/20 focus-visible:border-accent-blue transition-all duration-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Status</label>
                <select
                  className="w-full h-10 bg-background-primary border border-border-subtle text-text-primary rounded-md px-3 text-xs outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all duration-200 cursor-pointer"
                  {...register('status')}
                >
                  <option value="planning">📋 Planning</option>
                  <option value="active">⚡ Active</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Priority</label>
                <select
                  className="w-full h-10 bg-background-primary border border-border-subtle text-text-primary rounded-md px-3 text-xs outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-all duration-200 cursor-pointer"
                  {...register('priority')}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🔵 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Start Date</label>
                <Input
                  type="date"
                  {...register('startDate')}
                  className={cn(
                    "bg-background-primary border-border-subtle text-text-primary focus-visible:ring-2 focus-visible:ring-accent-blue/20 focus-visible:border-accent-blue transition-all duration-200",
                    errors.startDate ? 'border-accent-red focus-visible:ring-accent-red/20 focus-visible:border-accent-red' : ''
                  )}
                />
                {errors.startDate && <span className="text-[10px] text-accent-red font-medium">{errors.startDate.message}</span>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">End Date</label>
                <Input
                  type="date"
                  {...register('endDate')}
                  className={cn(
                    "bg-background-primary border-border-subtle text-text-primary focus-visible:ring-2 focus-visible:ring-accent-blue/20 focus-visible:border-accent-blue transition-all duration-200",
                    errors.endDate ? 'border-accent-red focus-visible:ring-accent-red/20 focus-visible:border-accent-red' : ''
                  )}
                />
                {errors.endDate && <span className="text-[10px] text-accent-red font-medium">{errors.endDate.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Initial Budget (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  {...register('budget', { valueAsNumber: true })}
                  className="bg-background-primary border-border-subtle text-text-primary focus-visible:ring-2 focus-visible:ring-accent-blue/20 focus-visible:border-accent-blue transition-all duration-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Initial Git Repo URL</label>
                <Input
                  type="text"
                  placeholder="https://github.com/..."
                  {...register('gitUrl')}
                  className="bg-background-primary border-border-subtle text-text-primary focus-visible:ring-2 focus-visible:ring-accent-blue/20 focus-visible:border-accent-blue transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Initial Team Members</label>
              <div className="h-28 overflow-y-auto bg-background-primary border border-border-subtle rounded-lg p-2.5 space-y-2 max-h-[140px]">
                {availableUsers.map(user => {
                  const selectedMembers = watch('members') || [];
                  const isChecked = selectedMembers.includes(user.id.toString());
                  return (
                    <label 
                      key={user.id} 
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all duration-200",
                        isChecked 
                          ? "border-accent-blue bg-accent-blue/5 shadow-[0_2px_8px_rgba(59,130,246,0.08)]" 
                          : "border-border-subtle bg-background-secondary hover:bg-background-secondary/80"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className="w-6 h-6 rounded-full bg-cover bg-center border border-border-subtle flex-shrink-0"
                          style={{ backgroundImage: `url(${user.avatar})` }}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold text-text-primary truncate">{user.name}</span>
                          <span className="text-[9px] text-text-muted truncate">{user.role}</span>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        value={user.id} 
                        {...register('members')}
                        className="rounded border-border-subtle text-accent-blue focus:ring-accent-blue w-4 h-4 cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border-subtle/30 flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-border-subtle text-text-secondary hover:text-text-primary text-xs font-semibold rounded-lg hover:bg-surface-hover transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-accent-blue to-indigo-600 hover:from-accent-blue-hover hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
              >
                <span>Create Project</span>
                <Sparkles className="w-3.5 h-3.5 text-white/90 animate-pulse" />
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
