'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { navSections } from '@/components/layout/Sidebar';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const cardMeta: Record<string, { description: string; gradient: string; borderHover: string; iconBg: string; iconColor: string; buttonBg: string; buttonText: string }> = {
  '/projects': {
    description: 'Track initiatives, milestones, and deliverable timelines.',
    gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    borderHover: 'hover:border-purple-500/40 hover:shadow-purple-500/5',
    iconBg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
    iconColor: 'text-purple-500 dark:text-purple-400',
    buttonBg: 'bg-purple-500/10 group-hover:bg-purple-500 text-purple-600 dark:text-purple-400 group-hover:text-white',
    buttonText: 'Go to Projects'
  },
  '/workcenter': {
    description: 'Manage tasks, sprint checklists, and Kanban board states.',
    gradient: 'from-green-500/10 via-green-500/5 to-transparent',
    borderHover: 'hover:border-green-500/40 hover:shadow-green-500/5',
    iconBg: 'bg-green-500/10 group-hover:bg-green-500/20',
    iconColor: 'text-green-500 dark:text-green-400',
    buttonBg: 'bg-green-500/10 group-hover:bg-green-500 text-green-600 dark:text-green-400 group-hover:text-white',
    buttonText: 'Go to Task Center'
  },
  '/planner': {
    description: 'Coordinate calendar items, schedules, and daily agendas.',
    gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    borderHover: 'hover:border-blue-500/40 hover:shadow-blue-500/5',
    iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    iconColor: 'text-blue-500 dark:text-blue-400',
    buttonBg: 'bg-blue-500/10 group-hover:bg-blue-500 text-blue-600 dark:text-blue-400 group-hover:text-white',
    buttonText: 'Go to Planner'
  },
  '/meetings': {
    description: 'Organize meeting operations, minutes, and participant invites.',
    gradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
    borderHover: 'hover:border-orange-500/40 hover:shadow-orange-500/5',
    iconBg: 'bg-orange-500/10 group-hover:bg-orange-500/20',
    iconColor: 'text-orange-500 dark:text-orange-400',
    buttonBg: 'bg-orange-500/10 group-hover:bg-orange-500 text-orange-600 dark:text-orange-400 group-hover:text-white',
    buttonText: 'Go to Meetings'
  },
  '/knowledge': {
    description: 'Access the shared knowledge repository and documents.',
    gradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    borderHover: 'hover:border-indigo-500/40 hover:shadow-indigo-500/5',
    iconBg: 'bg-indigo-500/10 group-hover:bg-indigo-500/20',
    iconColor: 'text-indigo-500 dark:text-indigo-400',
    buttonBg: 'bg-indigo-500/10 group-hover:bg-indigo-500 text-indigo-600 dark:text-indigo-400 group-hover:text-white',
    buttonText: 'Go to Document Hub'
  },
  '/issues': {
    description: 'Log and monitor system issues, bugs, and incident reports.',
    gradient: 'from-red-500/10 via-red-500/5 to-transparent',
    borderHover: 'hover:border-red-500/40 hover:shadow-red-500/5',
    iconBg: 'bg-red-500/10 group-hover:bg-red-500/20',
    iconColor: 'text-red-500 dark:text-red-400',
    buttonBg: 'bg-red-500/10 group-hover:bg-red-500 text-red-600 dark:text-red-400 group-hover:text-white',
    buttonText: 'Go to Issue Center'
  },
  '/finance': {
    description: 'Track budget spending, fiscal records, and financial health.',
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    borderHover: 'hover:border-emerald-500/40 hover:shadow-emerald-500/5',
    iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    buttonBg: 'bg-emerald-500/10 group-hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 group-hover:text-white',
    buttonText: 'Go to Finance'
  },
  '/team-chat': {
    description: 'Connect with team members in direct messages and channels.',
    gradient: 'from-pink-500/10 via-pink-500/5 to-transparent',
    borderHover: 'hover:border-pink-500/40 hover:shadow-pink-500/5',
    iconBg: 'bg-pink-500/10 group-hover:bg-pink-500/20',
    iconColor: 'text-pink-500 dark:text-pink-400',
    buttonBg: 'bg-pink-500/10 group-hover:bg-pink-500 text-pink-600 dark:text-pink-400 group-hover:text-white',
    buttonText: 'Go to Team Chat'
  },
  '/chat': {
    description: 'Consult the Executive AI assistant for insights and actions.',
    gradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
    borderHover: 'hover:border-cyan-500/40 hover:shadow-cyan-500/5',
    iconBg: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
    iconColor: 'text-cyan-500 dark:text-cyan-400',
    buttonBg: 'bg-cyan-500/10 group-hover:bg-cyan-500 text-cyan-600 dark:text-cyan-400 group-hover:text-white',
    buttonText: 'Go to AI Assistant'
  },
  '/notifications': {
    description: 'View real-time event updates and system notifications.',
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    borderHover: 'hover:border-amber-500/40 hover:shadow-amber-500/5',
    iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    iconColor: 'text-amber-500 dark:text-amber-400',
    buttonBg: 'bg-amber-500/10 group-hover:bg-amber-500 text-amber-600 dark:text-amber-400 group-hover:text-white',
    buttonText: 'Go to Notifications'
  },
  '/profile': {
    description: 'Manage your profile settings and system preferences.',
    gradient: 'from-slate-500/10 via-slate-500/5 to-transparent',
    borderHover: 'hover:border-slate-500/40 hover:shadow-slate-500/5',
    iconBg: 'bg-slate-500/10 group-hover:bg-slate-500/20',
    iconColor: 'text-slate-500 dark:text-slate-400',
    buttonBg: 'bg-slate-500/10 group-hover:bg-slate-500 text-slate-600 dark:text-slate-400 group-hover:text-white',
    buttonText: 'Go to Settings'
  },
  '/admin': {
    description: 'Configure platform settings, users, and permissions.',
    gradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
    borderHover: 'hover:border-teal-500/40 hover:shadow-teal-500/5',
    iconBg: 'bg-teal-500/10 group-hover:bg-teal-500/20',
    iconColor: 'text-teal-500 dark:text-teal-400',
    buttonBg: 'bg-teal-500/10 group-hover:bg-teal-500 text-teal-600 dark:text-teal-400 group-hover:text-white',
    buttonText: 'Go to Management'
  }
};

const defaultMeta = {
  description: 'Access the module to manage workspace objectives.',
  gradient: 'from-accent-blue/10 via-accent-blue/5 to-transparent',
  borderHover: 'hover:border-accent-blue/40 hover:shadow-accent-blue/5',
  iconBg: 'bg-accent-blue/10 group-hover:bg-accent-blue/20',
  iconColor: 'text-accent-blue dark:text-accent-blue-hover',
  buttonBg: 'bg-accent-blue/10 group-hover:bg-accent-blue text-accent-blue group-hover:text-white',
  buttonText: 'Open Module'
};

export default function Dashboard() {
  const { userProfile } = useStore();

  // Get navigation items dynamically from Sidebar configuration, excluding overview
  const modules = React.useMemo(() => {
    return navSections
      .flatMap(section => section.items)
      .filter(item => item.href !== '/dashboard');
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  } as const;
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto font-sans text-text-primary relative pb-12"
    >
      {/* Background ambient light */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-accent-blue/5 rounded-full blur-3xl pointer-events-none transform -translate-y-1/2"></div>
      
      {/* Welcome Header Banner */}
      <motion.div 
        variants={itemVariants} 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card/60 backdrop-blur-md p-6 rounded-2xl border border-border-subtle shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Welcome Back, <span className="text-accent-blue">{userProfile.name}</span>
          </h2>
          <p className="text-sm text-text-secondary font-semibold">
            Quickly access every module from one place.
          </p>
        </div>
      </motion.div>

      {/* Modules Launchpad Grid */}
      <motion.div 
        variants={containerVariants} 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {modules.map((item) => {
          const IconComponent = item.icon;
          const meta = cardMeta[item.href] || defaultMeta;

          return (
            <motion.div 
              variants={itemVariants}
              key={item.href}
              className="h-full"
            >
              <Link href={item.href} className="block h-full">
                <div className={cn(
                  "group h-full bg-surface-card hover:bg-background-secondary/40 border border-border-subtle rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-sm hover:-translate-y-1 text-left relative overflow-hidden",
                  meta.borderHover
                )}>
                  {/* Subtle Card Ambient Gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none transition-opacity duration-300 group-hover:opacity-75",
                    meta.gradient
                  )} />

                  <div className="relative z-10 space-y-4">
                    {/* Module Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 shadow-inner",
                      meta.iconBg
                    )}>
                      <IconComponent className={cn("w-6 h-6", meta.iconColor)} />
                    </div>

                    {/* Module Name & Description */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-text-primary tracking-tight transition-colors group-hover:text-text-primary">
                        {item.label}
                      </h3>
                      <p className="text-xs text-text-secondary font-medium leading-relaxed min-h-[36px]">
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="relative z-10 pt-4 mt-auto">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-2xs font-extrabold tracking-wide uppercase transition-all duration-300 shadow-sm",
                      meta.buttonBg
                    )}>
                      <span>{meta.buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
