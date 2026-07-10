'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  CheckSquare, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Users, 
  ChevronRight, 
  TrendingUp, 
  Bell, 
  ArrowUpRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { tasksService } from '@/services/tasks';
import { projectsService } from '@/services/projects';
import { meetingsService } from '@/services/meetings';
import { financeService, FinancialMetrics } from '@/services/finance';
import { aiService } from '@/services/ai';

export default function Dashboard() {
  const { 
    userProfile, 
    tasks, 
    setTasks, 
    meetings, 
    setMeetings, 
    projects, 
    setProjects 
  } = useStore();

  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all dashboard data concurrently
        const [tasksData, projectsData, meetingsData, metricsData, recommendationsData] = await Promise.all([
          tasksService.getTasks(),
          projectsService.getProjects(),
          meetingsService.getMeetings(),
          financeService.getMetrics(),
          aiService.getAiRecommendations(),
        ]);

        if (active) {
          setTasks(tasksData);
          setProjects(projectsData);
          setMeetings(meetingsData);
          setMetrics(metricsData);
          setAiRecommendations(recommendationsData);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to load dashboard data');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();
    return () => {
      active = false;
    };
  }, [setTasks, setProjects, setMeetings]);

  // Compute metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const meetingsToday = meetings.filter(m => m.date === todayStr);
  const assignedTasks = tasks.filter(t => t.assignedTo.name === userProfile.name);
  const overdueTasks = tasks.filter(t => {
    const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'done';
    return isOverdue;
  });
  const activeProjects = projects.filter(p => p.status === 'active');

  const formatBudget = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
        <span className="text-sm font-medium">Loading Executive Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 max-w-md mx-auto text-center">
        <AlertCircle className="w-10 h-10 text-accent-red" />
        <div>
          <h3 className="text-sm font-bold text-text-primary mb-1">Failed to Load Dashboard</h3>
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
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-text-primary">
      {/* Welcome Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background-secondary p-6 rounded-lg border border-border-subtle shadow-md">
        <div>
          <h2 className="text-xl font-bold font-sans">Welcome Back, {userProfile.name}</h2>
          <p className="text-xs text-text-secondary mt-1">Here is your automated operations briefing for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold shadow transition-all"
          >
            <Sparkles className="w-4 h-4" /> Ask Executive AI
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Meetings Today */}
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 flex items-center gap-4 hover:border-text-muted transition-colors">
          <div className="p-3 bg-accent-blue/10 rounded-lg text-accent-blue">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Meetings Today</span>
            <span className="text-xl font-extrabold">{meetingsToday.length}</span>
          </div>
        </div>

        {/* Assigned Tasks */}
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 flex items-center gap-4 hover:border-text-muted transition-colors">
          <div className="p-3 bg-accent-green/10 rounded-lg text-accent-green">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Assigned Tasks</span>
            <span className="text-xl font-extrabold">{assignedTasks.length}</span>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 flex items-center gap-4 hover:border-text-muted transition-colors">
          <div className="p-3 bg-accent-red/10 rounded-lg text-accent-red">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Overdue Tasks</span>
            <span className="text-xl font-extrabold text-accent-red">{overdueTasks.length}</span>
          </div>
        </div>

        {/* Budget Remaining */}
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 flex items-center gap-4 hover:border-text-muted transition-colors">
          <div className="p-3 bg-accent-orange/10 rounded-lg text-accent-orange">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Budget Remaining</span>
            <span className="text-xl font-extrabold text-accent-orange">
              {metrics ? formatBudget(metrics.budgetRemaining) : '$0'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Core Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI Recommendations & Meetings */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recommendations Card */}
          <div className="bg-background-secondary border border-border-subtle rounded-lg overflow-hidden shadow-md">
            <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-accent-blue/[0.02]">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-blue" />
                AI Strategic Briefing Recommendations
              </h3>
              <span className="text-[10px] bg-accent-blue/15 text-accent-blue px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Real-Time
              </span>
            </div>
            <div className="p-5 space-y-3.5">
              {aiRecommendations.length === 0 ? (
                <div className="p-4 text-center text-xs text-text-muted">No recommendations available.</div>
              ) : (
                aiRecommendations.map((rec, i) => (
                  <div 
                    key={i} 
                    className="flex gap-3 bg-background-primary border border-border-subtle/50 p-3.5 rounded-md hover:border-accent-blue/30 transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-accent-blue/10 text-accent-blue flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i+1}
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed">{rec}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today Meetings List */}
          <div className="bg-background-secondary border border-border-subtle rounded-lg shadow-md">
            <div className="p-5 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-text-secondary" />
                Meetings Schedule Today
              </h3>
              <Link href="/meetings" className="text-2xs text-accent-blue hover:underline flex items-center gap-0.5">
                View Scheduler <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-5 divide-y divide-border-subtle/50">
              {meetingsToday.length === 0 ? (
                <div className="p-4 text-center text-xs text-text-muted">No meetings scheduled for today.</div>
              ) : (
                meetingsToday.map((meet) => (
                  <div key={meet.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-text-primary">{meet.title}</h4>
                      <p className="text-[11px] text-text-secondary flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-text-muted" /> {meet.time} ({meet.duration})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-surface-card border border-border-subtle px-2 py-0.5 rounded text-text-secondary font-medium">
                        {meet.type}
                      </span>
                      <Link 
                        href="/meetings" 
                        className="p-1 bg-background-primary border border-border-subtle hover:border-text-muted rounded text-text-secondary hover:text-text-primary transition-all"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Deadlines, Team Progress, Notifications */}
        <div className="space-y-6">
          {/* Deadlines & Overdue Tasks */}
          <div className="bg-background-secondary border border-border-subtle rounded-lg shadow-md">
            <div className="p-5 border-b border-border-subtle">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-red" />
                Critical Deadlines
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {overdueTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="bg-background-primary p-3 rounded border border-border-subtle flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-accent-red bg-accent-red/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Overdue
                    </span>
                    <span className="text-[10px] text-text-muted">{task.dueDate}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-text-primary line-clamp-1">{task.title}</h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">{task.description}</p>
                </div>
              ))}
              {overdueTasks.length === 0 && (
                <div className="text-center py-4 text-xs text-text-muted">No overdue items. Great work!</div>
              )}
            </div>
          </div>

          {/* Team Project Progress Card */}
          <div className="bg-background-secondary border border-border-subtle rounded-lg shadow-md">
            <div className="p-5 border-b border-border-subtle">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-green" />
                Team Project Progress
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {activeProjects.length === 0 ? (
                <div className="text-center py-4 text-xs text-text-muted">No active projects.</div>
              ) : (
                activeProjects.slice(0, 3).map((p) => (
                  <div key={p.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-primary truncate max-w-[200px]">{p.name}</span>
                      <span className="font-bold text-accent-blue">{p.progress}%</span>
                    </div>
                    <div className="h-2 bg-background-primary rounded-full overflow-hidden border border-border-subtle/50">
                      <div 
                        className="h-full bg-accent-blue rounded-full transition-all duration-500"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
