'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  Percent, 
  Activity, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Plus
} from 'lucide-react';

export default function ProjectsPage() {
  const { projects } = useStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      case 'planning': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
      case 'completed': return 'text-accent-green bg-accent-green/10 border-accent-green/20';
      default: return 'text-accent-red bg-accent-red/10 border-accent-red/20';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto font-sans text-text-primary">
      
      {/* Left Column: Project Directory List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-background-secondary p-4 rounded-lg border border-border-subtle">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-text-secondary" />
            Project Roster ({projects.length})
          </h3>
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
                <div className="p-4 border-b border-border-subtle">
                  <h3 className="text-xs font-bold flex items-center gap-2 text-text-secondary uppercase tracking-wider">
                    <Users className="w-4 h-4 text-accent-green" /> Team Members ({selectedProject.members.length})
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {selectedProject.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 bg-background-primary p-2.5 rounded border border-border-subtle/30">
                      <div 
                        className="w-8 h-8 rounded-full bg-cover bg-center border border-border-subtle"
                        style={{ backgroundImage: `url(${member.avatar})` }}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-text-primary">{member.name}</span>
                        <span className="text-[10px] text-text-muted">{member.role}</span>
                      </div>
                    </div>
                  ))}
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
  );
}
