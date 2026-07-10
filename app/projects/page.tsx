'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { projectsService } from '@/services/projects';
import { usersService } from '@/services/users';
import { User } from '@/types';
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
  Loader2
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
  members: z.array(z.string()).optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function ProjectsPage() {
  const { projects, setProjects, addProject } = useStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { status: 'planning', startDate: new Date().toISOString().split('T')[0], endDate: '', members: [] }
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
      const created = await projectsService.createProject({
        ...data,
        progress: 0
      });
      
      // Add selected members to the project
      if (data.members && data.members.length > 0) {
        for (const userId of data.members) {
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

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      case 'planning': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
      case 'completed': return 'text-accent-green bg-accent-green/10 border-accent-green/20';
      default: return 'text-accent-red bg-accent-red/10 border-accent-red/20';
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
          <h3 className="text-sm font-bold flex items-center gap-2">
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
                  "p-4 rounded-lg border cursor-pointer text-left transition-all bg-background-secondary hover:border-text-muted",
                  isSelected ? "border-accent-blue shadow-lg" : "border-border-subtle"
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-xs font-bold text-text-primary line-clamp-1">{proj.name}</h4>
                  <span className={cn("text-[9px] uppercase font-extrabold tracking-wider border px-1.5 py-0.5 rounded", getStatusColor(proj.status))}>
                    {proj.status}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2 mb-3">
                  {proj.description}
                </p>
                <div className="flex items-center justify-between text-2xs">
                  <span className="text-text-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> End: {proj.endDate}
                  </span>
                  <span className="text-accent-blue font-bold">{proj.progress}% Complete</span>
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
                  <span className={cn("text-[9px] uppercase font-bold tracking-wider border px-2 py-0.5 rounded", getStatusColor(selectedProject.status))}>
                    Project {selectedProject.status}
                  </span>
                  <h2 className="text-lg font-bold font-sans mt-2">{selectedProject.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-md border border-accent-blue/20">
                    {selectedProject.progress}% Complete
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
                  <span>{selectedProject.progress}%</span>
                </div>
                <div className="h-2.5 bg-background-primary rounded-full overflow-hidden border border-border-subtle/50">
                  <div 
                    className="h-full bg-accent-blue rounded-full transition-all duration-500" 
                    style={{ width: `${selectedProject.progress}%` }}
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

            {/* Members & Activity Logs Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Member list roster */}
              <div className="bg-background-secondary border border-border-subtle rounded-lg shadow-md">
                <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                  <h3 className="text-xs font-bold flex items-center gap-2 text-text-secondary uppercase tracking-wider">
                    <Users className="w-4 h-4 text-accent-green" /> Team Members ({selectedProject.members.length})
                  </h3>
                  <select 
                    className="bg-background-primary border border-border-subtle text-2xs p-1 rounded max-w-[120px]"
                    onChange={(e) => {
                      if (e.target.value) handleAddMember(e.target.value);
                      e.target.value = ""; // reset
                    }}
                  >
                    <option value="">+ Add Member</option>
                    {availableUsers
                      .filter(u => !selectedProject.members.find((m: any) => m.id === u.id))
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="p-4 space-y-3">
                  {selectedProject.members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between bg-background-primary p-2.5 rounded border border-border-subtle/30">
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
                        className="text-xs text-accent-red hover:text-red-400 font-semibold"
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

              {/* Activity log tracker */}
              <div className="bg-background-secondary border border-border-subtle rounded-lg shadow-md">
                <div className="p-4 border-b border-border-subtle">
                  <h3 className="text-xs font-bold flex items-center gap-2 text-text-secondary uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-accent-orange" /> Recent Commits / Activity
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {selectedProject.activities.map((act) => (
                    <div key={act.id} className="flex items-start gap-2.5 text-xs">
                      <div className="p-1.5 bg-background-primary border border-border-subtle rounded text-text-muted mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 space-y-0.5 leading-relaxed">
                        <p className="text-text-secondary text-[11px]">
                          <span className="font-bold text-text-primary">{act.user}</span> {act.action}{' '}
                          <span className="text-text-primary font-medium">{act.target}</span>
                        </p>
                        <span className="text-[9px] text-text-muted block">{act.time}</span>
                      </div>
                    </div>
                  ))}
                  {selectedProject.activities.length === 0 && (
                    <div className="text-center py-6 text-xs text-text-muted">No recent activities.</div>
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
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Create a new project and set the timeline.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-text-secondary uppercase">Project Name</label>
              <Input
                type="text"
                placeholder="Project Delta"
                {...register('name')}
                className={errors.name ? 'border-accent-red' : ''}
              />
              {errors.name && <span className="text-[10px] text-accent-red">{errors.name.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-text-secondary uppercase">Description</label>
              <Textarea
                placeholder="High-level project goals..."
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-text-secondary uppercase">Status</label>
                <select
                  className="w-full h-10 bg-background-secondary border border-border-subtle rounded-md px-3 text-sm text-text-primary outline-none"
                  {...register('status')}
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="space-y-1.5"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-text-secondary uppercase">Start Date</label>
                <Input
                  type="date"
                  {...register('startDate')}
                  className={errors.startDate ? 'border-accent-red' : ''}
                />
                {errors.startDate && <span className="text-[10px] text-accent-red">{errors.startDate.message}</span>}
              </div>
              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-text-secondary uppercase">End Date</label>
                <Input
                  type="date"
                  {...register('endDate')}
                  className={errors.endDate ? 'border-accent-red' : ''}
                />
                {errors.endDate && <span className="text-[10px] text-accent-red">{errors.endDate.message}</span>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-text-secondary uppercase">Initial Team Members</label>
              <div className="h-24 overflow-y-auto bg-background-secondary border border-border-subtle rounded-md p-2 space-y-1">
                {availableUsers.map(user => (
                  <label key={user.id} className="flex items-center gap-2 p-1 hover:bg-background-primary rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      value={user.id} 
                      {...register('members')}
                      className="rounded border-border-subtle text-accent-blue focus:ring-accent-blue"
                    />
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full bg-cover bg-center border border-border-subtle"
                        style={{ backgroundImage: `url(${user.avatar})` }}
                      />
                      <span className="text-xs text-text-primary">{user.name}</span>
                      <span className="text-[10px] text-text-muted">({user.role})</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3 py-1.5 border border-border-subtle text-text-secondary hover:text-text-primary text-2xs font-semibold rounded transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-accent-blue hover:bg-accent-blue-hover text-white text-2xs font-semibold rounded shadow transition-all"
              >
                Create Project
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
