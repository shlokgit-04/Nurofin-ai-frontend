'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { tasksService } from '@/services/tasks';
import { projectsService } from '@/services/projects';
import { meetingsService } from '@/services/meetings';
import { dashboardService, DashboardSummary } from '@/services/dashboard';
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

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
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
        const [tasksData, projectsData, meetingsData, summaryData, metricsData, recommendationsData] = await Promise.all([
          tasksService.getTasks(),
          projectsService.getProjects(),
          meetingsService.getMeetings(),
          dashboardService.getSummary(),
          financeService.getMetrics(),
          aiService.getAiRecommendations(),
        ]);

        if (active) {
          setTasks(tasksData);
          setProjects(projectsData);
          setMeetings(meetingsData);
          setSummary(summaryData);
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
  const assignedTasks = tasks.filter(t => t.assignedTo.name === userProfile.name || (t as any).assignedToId === userProfile.id);
  const overdueTasks = tasks.filter(t => {
    const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'done' && t.status !== 'completed';
    return isOverdue;
  });
  const activeProjects = projects.filter(p => p.status === 'active');

  const formatBudget = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const;
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
        <span className="text-sm font-bold tracking-wide">Loading Executive Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 max-w-md mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-accent-red" />
        <div>
          <h3 className="text-base font-extrabold text-text-primary mb-2 tracking-wide">Failed to Load Dashboard</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-accent-blue hover:bg-accent-blue-hover text-white text-sm font-bold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto font-sans text-text-primary relative"
    >
      {/* Background ambient light */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-accent-blue/10 rounded-full blur-3xl pointer-events-none transform -translate-y-1/2"></div>
      
      {/* Welcome Header Banner */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card/80 backdrop-blur-md p-6 rounded-xl border border-border-subtle shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold tracking-tight">Welcome Back, <span className="text-accent-blue">{userProfile.name}</span></h2>
          <p className="text-sm text-text-secondary mt-1 font-medium">Here is your automated operations briefing for today.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/chat"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" /> Ask Executive AI
          </Link>
        </div>
      </motion.div>

      {/* Primary KPI Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Meetings Today */}
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-surface-card border border-border-subtle rounded-xl p-6 flex items-center gap-5 hover:border-accent-blue/50 transition-all group">
          <div className="p-3.5 bg-accent-blue/10 group-hover:bg-accent-blue/20 rounded-xl text-accent-blue transition-colors shadow-inner">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block mb-1">Meetings Today</span>
            <span className="text-2xl font-black">{summary?.todayMeetings || 0}</span>
          </div>
        </motion.div>

        {/* Assigned Tasks */}
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-surface-card border border-border-subtle rounded-xl p-6 flex items-center gap-5 hover:border-accent-green/50 transition-all group">
          <div className="p-3.5 bg-accent-green/10 group-hover:bg-accent-green/20 rounded-xl text-accent-green transition-colors shadow-inner">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block mb-1">Assigned Tasks</span>
            <span className="text-2xl font-black">{assignedTasks.length}</span>
          </div>
        </motion.div>

        {/* Overdue Tasks */}
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-surface-card border border-border-subtle rounded-xl p-6 flex items-center gap-5 hover:border-accent-red/50 transition-all group">
          <div className="p-3.5 bg-accent-red/10 group-hover:bg-accent-red/20 rounded-xl text-accent-red transition-colors shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block mb-1">Overdue Tasks</span>
            <span className="text-2xl font-black text-accent-red">{overdueTasks.length}</span>
          </div>
        </motion.div>

        {/* Pending Invites */}
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-surface-card border border-border-subtle rounded-xl p-6 flex items-center gap-5 hover:border-accent-orange/50 transition-all group">
          <div className="p-3.5 bg-accent-orange/10 group-hover:bg-accent-orange/20 rounded-xl text-accent-orange transition-colors shadow-inner">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block mb-1">Pending Invites</span>
            <span className="text-2xl font-black text-accent-orange">{summary?.pendingInvitations || 0}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Meeting Intelligence Row */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <motion.div variants={itemVariants} whileHover={{ y: -2 }} className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-md hover:border-accent-blue/40 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-accent-blue/10 group-hover:bg-accent-blue/20 transition-colors rounded-lg text-accent-blue"><FileText className="w-5 h-5" /></div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-text-secondary">Meetings Needing MOM</span>
          </div>
          <span className="text-3xl font-black text-text-primary">{summary?.meetingsNeedingMOM || 0}</span>
          <p className="text-[11px] font-medium text-text-muted mt-2 leading-relaxed">Completed/scheduled meetings without minutes</p>
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -2 }} className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-md hover:border-accent-orange/40 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-accent-orange/10 group-hover:bg-accent-orange/20 transition-colors rounded-lg text-accent-orange"><CheckSquare className="w-5 h-5" /></div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-text-secondary">Tasks to Review</span>
          </div>
          <span className="text-3xl font-black text-text-primary">{summary?.pendingApprovals || 0}</span>
          <p className="text-[11px] font-medium text-text-muted mt-2 leading-relaxed">Extracted tasks pending approval</p>
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -2 }} className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-md hover:border-accent-green/40 transition-all group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-accent-green/10 group-hover:bg-accent-green/20 transition-colors rounded-lg text-accent-green"><Clock className="w-5 h-5" /></div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-text-secondary">Upcoming Deadlines</span>
          </div>
          <span className="text-3xl font-black text-text-primary">{summary?.upcomingDeadlines || 0}</span>
          <p className="text-[11px] font-medium text-text-muted mt-2 leading-relaxed">Tasks due in the next 7 days</p>
        </motion.div>
      </motion.div>

      {/* Main Core Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI Recommendations & Meetings */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recommendations Card */}
          <motion.div variants={itemVariants} className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-md">
            <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-gradient-to-r from-accent-blue/5 to-transparent">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-blue" />
                AI Strategic Briefing Recommendations
              </h3>
              <span className="text-[10px] bg-accent-blue/20 text-accent-blue px-2.5 py-1 rounded-md font-bold uppercase tracking-widest shadow-sm">
                Real-Time
              </span>
            </div>
            <div className="p-5 space-y-4">
              {aiRecommendations.length === 0 ? (
                <div className="p-6 text-center text-sm font-medium text-text-muted italic bg-background-primary/50 rounded-lg border border-dashed border-border-subtle">No recommendations available.</div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                  {aiRecommendations.map((rec, i) => (
                    <motion.div 
                      variants={itemVariants}
                      key={i} 
                      className="flex gap-4 bg-background-primary border border-border-subtle/80 p-4 rounded-xl hover:border-accent-blue/50 hover:shadow-md transition-all group"
                    >
                      <span className="w-6 h-6 rounded-full bg-accent-blue/15 text-accent-blue flex items-center justify-center text-xs font-black flex-shrink-0 shadow-sm group-hover:bg-accent-blue group-hover:text-white transition-colors">
                        {i+1}
                      </span>
                      <p className="text-sm text-text-secondary leading-relaxed font-medium">{rec}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Today Meetings List */}
          <motion.div variants={itemVariants} className="bg-surface-card border border-border-subtle rounded-xl shadow-md overflow-hidden">
            <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-background-secondary/50">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent-purple" />
                Meetings Schedule Today
              </h3>
              <Link href="/planner" className="text-xs font-bold text-accent-blue hover:text-accent-blue-hover flex items-center gap-1 transition-colors">
                View Planner <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-2 divide-y divide-border-subtle/50">
              {meetingsToday.length === 0 ? (
                <div className="p-6 text-center text-sm font-medium text-text-muted italic bg-background-primary/50 rounded-lg m-2 border border-dashed border-border-subtle">No meetings scheduled for today.</div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                  {meetingsToday.map((meet) => (
                    <motion.div variants={itemVariants} key={meet.id} className="p-4 hover:bg-surface-hover/50 transition-colors flex items-center justify-between gap-4 group rounded-lg mx-2 my-1">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-blue transition-colors">{meet.title}</h4>
                        <p className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-text-muted" /> {meet.time} <span className="text-[10px] opacity-70">({meet.duration})</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-background-primary border border-border-subtle px-2.5 py-1 rounded-md text-text-secondary font-extrabold uppercase tracking-wider shadow-sm">
                          {meet.type}
                        </span>
                        <Link 
                          href="/planner" 
                          className="p-1.5 bg-background-primary border border-border-subtle hover:border-accent-blue hover:text-accent-blue rounded-md text-text-muted transition-all shadow-sm"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Deadlines, Team Progress, Notifications */}
        <div className="space-y-6">
          {/* Deadlines & Overdue Tasks */}
          <motion.div variants={itemVariants} className="bg-surface-card border border-border-subtle rounded-xl shadow-md overflow-hidden">
            <div className="p-5 border-b border-border-subtle bg-gradient-to-r from-accent-red/5 to-transparent">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-accent-red" />
                Critical Deadlines
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {overdueTasks.slice(0, 3).map((task) => (
                <motion.div whileHover={{ scale: 1.02 }} key={task.id} className="bg-background-primary p-4 rounded-xl border border-border-subtle flex flex-col gap-2 shadow-sm hover:shadow-md hover:border-accent-red/30 transition-all cursor-default">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-accent-red bg-accent-red/10 px-2 py-0.5 rounded-sm font-black uppercase tracking-widest border border-accent-red/20">
                      Overdue
                    </span>
                    <span className="text-[10px] font-bold text-text-muted">{task.dueDate}</span>
                  </div>
                  <h4 className="text-sm font-bold text-text-primary line-clamp-1">{task.title}</h4>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 font-medium">{task.description}</p>
                </motion.div>
              ))}
              {overdueTasks.length === 0 && (
                <div className="text-center py-6 text-sm font-bold text-text-muted italic flex flex-col items-center gap-2 bg-background-primary/50 rounded-xl border border-dashed border-border-subtle">
                  <CheckCircle2 className="w-8 h-8 text-accent-green/50" />
                  No overdue items. Great work!
                </div>
              )}
            </div>
          </motion.div>

          {/* Team Project Progress Card */}
          <motion.div variants={itemVariants} className="bg-surface-card border border-border-subtle rounded-xl shadow-md overflow-hidden">
            <div className="p-5 border-b border-border-subtle bg-background-secondary/50">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-green" />
                Team Project Progress
              </h3>
            </div>
            <div className="p-5 space-y-5">
              {activeProjects.length === 0 ? (
                <div className="text-center py-6 text-sm font-medium text-text-muted italic bg-background-primary/50 rounded-xl border border-dashed border-border-subtle">No active projects.</div>
              ) : (
                activeProjects.slice(0, 4).map((p, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    key={p.id} 
                    className="space-y-2.5 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text-primary truncate max-w-[200px] group-hover:text-accent-blue transition-colors">{p.name}</span>
                      <span className="font-black text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded-md">{p.progress}%</span>
                    </div>
                    <div className="h-2.5 bg-background-primary rounded-full overflow-hidden border border-border-subtle/80 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${p.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full shadow-sm",
                          p.progress > 80 ? "bg-accent-green" : p.progress > 40 ? "bg-accent-blue" : "bg-accent-orange"
                        )}
                      />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
