'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin, 
  CheckCircle, 
  Briefcase, 
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

export default function ProfilePage() {
  const { userProfile, projects, tasks } = useStore();

  // Compute metrics
  const sponsoredProjects = projects.filter(p => p.members.some(m => m.name === userProfile.name) || p.id === 'proj-2');
  const completedTasks = tasks.filter(t => t.assignedTo.name === userProfile.name && t.status === 'done');
  const pendingTasks = tasks.filter(t => t.assignedTo.name === userProfile.name && t.status !== 'done');

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-text-primary">
      
      {/* Profile Overview Header Card */}
      <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 shadow-md flex flex-col md:flex-row items-center gap-6 text-center md:text-left relative overflow-hidden">
        {/* Background visual detail */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />

        {/* Big Avatar */}
        <div 
          className="w-24 h-24 rounded-full bg-cover bg-center border-2 border-accent-blue shadow-lg flex-shrink-0"
          style={{ backgroundImage: `url(${userProfile.avatar})` }}
        />

        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-extrabold">{userProfile.name}</h2>
            <span className="w-fit bg-accent-blue/15 text-accent-blue text-2xs font-extrabold px-2.5 py-0.5 rounded-full border border-accent-blue/20 mx-auto md:mx-0">
              {userProfile.role}
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium">{userProfile.department || 'Executive Leadership'}</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-2xs text-text-secondary pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-text-muted" /> New York, HQ
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-text-muted" /> {userProfile.email}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Personal Info, Contacts, Skills & Socials */}
        <div className="space-y-6">
          {/* Contact Details */}
          <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md space-y-4">
            <h3 className="text-2xs font-bold text-text-secondary uppercase tracking-wider">Contact Information</h3>
            <div className="space-y-3.5 text-xs text-text-secondary">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-text-muted flex-shrink-0" />
                <span className="truncate">{userProfile.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-text-muted flex-shrink-0" />
                <span>{userProfile.phone || '+1 (555) 019-2834'}</span>
              </div>
            </div>
          </div>

          {/* Social profiles */}
          <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md space-y-4">
            <h3 className="text-2xs font-bold text-text-secondary uppercase tracking-wider">Social Integrations</h3>
            <div className="flex flex-col gap-2.5">
              {userProfile.github && (
                <a 
                  href={userProfile.github} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 bg-background-primary border border-border-subtle hover:border-text-muted text-xs text-text-secondary hover:text-text-primary rounded transition-all"
                >
                  <Github className="w-4 h-4" /> GitHub Connection
                </a>
              )}
              {userProfile.linkedin && (
                <a 
                  href={userProfile.linkedin} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 bg-background-primary border border-border-subtle hover:border-text-muted text-xs text-text-secondary hover:text-text-primary rounded transition-all"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn Profile
                </a>
              )}
            </div>
          </div>

          {/* Core Skills tags */}
          <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md space-y-4">
            <h3 className="text-2xs font-bold text-text-secondary uppercase tracking-wider">Core Skill Sets</h3>
            <div className="flex flex-wrap gap-2">
              {userProfile.skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="text-2xs bg-background-primary border border-border-subtle px-2.5 py-1 rounded font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sponsored Projects & Task Registries (collapsible) */}
        <div className="md:col-span-2 space-y-6">
          {/* Projects sponsorship */}
          <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md space-y-4">
            <h3 className="text-2xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-accent-blue" />
              Sponsorship Projects ({sponsoredProjects.length})
            </h3>
            <div className="space-y-3">
              {sponsoredProjects.map(proj => (
                <div key={proj.id} className="bg-background-primary border border-border-subtle/50 p-3.5 rounded-md flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-text-primary">{proj.name}</h4>
                    <p className="text-[11px] text-text-secondary truncate max-w-sm md:max-w-md">{proj.description}</p>
                  </div>
                  <span className="text-2xs font-extrabold text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-2 py-0.5 rounded">
                    {proj.progress}%
                  </span>
                </div>
              ))}
              {sponsoredProjects.length === 0 && (
                <p className="text-xs text-text-muted text-center py-4">No active projects linked to your profile.</p>
              )}
            </div>
          </div>

          {/* Completed tasks registry */}
          <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md space-y-4">
            <h3 className="text-2xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-accent-green" />
              Completed Tasks registry ({completedTasks.length})
            </h3>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <div key={task.id} className="bg-background-primary border border-border-subtle/50 p-3.5 rounded-md flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-text-primary line-clamp-1">{task.title}</h4>
                    <span className="text-[10px] text-text-muted">Target: {task.dueDate}</span>
                  </div>
                  <span className="text-2xs font-bold text-accent-green bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded">
                    Completed
                  </span>
                </div>
              ))}
              {completedTasks.length === 0 && (
                <p className="text-xs text-text-muted text-center py-4">No completed tasks yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
