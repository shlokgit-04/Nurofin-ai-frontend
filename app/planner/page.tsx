'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Video,
  BellRing,
  Trash2,
  CalendarDays,
  Search,
  Users,
  Link2,
  Unlink,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  Globe,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sunrise,
  Moon
} from 'lucide-react';
import { meetingsService } from '@/services/meetings';
import { plannerService, PlannerUser, ScheduleEvent } from '@/services/planner';
import { tasksService } from '@/services/tasks';
import { useStore } from '@/store';
import { Task } from '@/types';

export default function PlannerPage() {
  const { userProfile } = useStore();
  const currentUserId = parseInt(userProfile.id || '0');
  const isAdmin = ['super_admin', 'ceo'].includes(userProfile.role);

  const [teammates, setTeammates] = useState<PlannerUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number>(currentUserId);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('week');

  // Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('10:00');
  const [newEventType, setNewEventType] = useState('meeting');
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [conflictData, setConflictData] = useState<{message: string, alternative_times: any[]} | null>(null);
  const [newEventParticipantIds, setNewEventParticipantIds] = useState<number[]>([]);
  
  // Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskOpen, setNewTaskOpen] = useState(false);

  const isOwnSchedule = selectedUserId === currentUserId;

  const getWeekStart = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  };

  const getWeekEnd = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 5);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  };

  const loadTeammates = async () => {
    try {
      const data = await plannerService.getUsers();
      setTeammates(data);
    } catch (error) {
      console.error('Failed to load teammates:', error);
    }
  };

  const loadSchedule = useCallback(async () => {
    try {
      setScheduleLoading(true);
      setLoading(true);
      const start = new Date(selectedDate);
      start.setDate(start.getDate() - 30);
      const end = new Date(selectedDate);
      end.setDate(end.getDate() + 30);
      
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      const data = await plannerService.getSchedule(selectedUserId, startStr, endStr);
      setScheduleEvents(data.schedule || []);

      const localData = await meetingsService.getMeetings();
      const filteredLocalData = localData.filter(m => 
        m.owner_id === selectedUserId || 
        (m.participants && m.participants.some(p => p.user_id === selectedUserId))
      );
      setLocalEvents(filteredLocalData);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setScheduleLoading(false);
      setLoading(false);
    }
  }, [selectedUserId, selectedDate, currentUserId]);
  
  const loadTasks = useCallback(async () => {
    try {
      setTasksLoading(true);
      const allTasks = await tasksService.getTasks();
      // Filter tasks for the selected user
      // Note: Assuming tasks have assignedTo.id or we match by some other metric. 
      // If we don't have assignedTo.id, we'll try matching name or if the backend filters by user.
      // Currently the backend returns ALL tasks if admin, or user's tasks. We filter on frontend just in case.
      
      const selectedUser = teammates.find(u => u.id === selectedUserId);
      const filtered = allTasks.filter(t => t.assignedTo?.name === selectedUser?.full_name || (t as any).assignedToId === selectedUserId);
      setTasks(filtered);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setTasksLoading(false);
    }
  }, [selectedUserId, teammates]);

  useEffect(() => {
    loadTeammates();
    setNewEventDate(new Date().toISOString().split('T')[0]);
    setNewTaskDueDate(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadSchedule();
      if (teammates.length > 0) {
        loadTasks();
      }
    }
  }, [selectedUserId, loadSchedule, loadTasks, teammates]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    try {
      setConflictData(null);
      const newEvent = await meetingsService.createMeeting({
        title: newEventTitle,
        date: newEventDate,
        time: newEventStartTime,
        type: newEventType,
        participant_ids: newEventParticipantIds
      });
      setLocalEvents([...localEvents, newEvent]);
      setNewEventTitle('');
      setNewEventOpen(false);
      loadSchedule();
    } catch (error: any) {
      if (error?.detail?.alternative_times) {
        setConflictData(error.detail);
      } else {
        console.error('Failed to create event:', error);
      }
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      await tasksService.createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        status: 'todo',
        priority: newTaskPriority,
        dueDate: newTaskDueDate,
        assigneeId: selectedUserId.toString()
      } as any);
      
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskOpen(false);
      loadTasks();
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await meetingsService.deleteMeeting(id);
      setLocalEvents(localEvents.filter(e => e.id !== id));
      loadSchedule();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const redirectUri = `${window.location.origin}/planner/google/callback`;
      const authUrl = await plannerService.getGoogleLoginUrl(redirectUri);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to get Google login URL:', error);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await plannerService.disconnectGoogle();
      loadTeammates();
      loadSchedule();
    } catch (error) {
      console.error('Failed to disconnect Google Calendar:', error);
    }
  };

  const getMonthStart = (date: Date): string => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    return d.toISOString().split('T')[0];
  };

  const getMonthEnd = (date: Date): string => {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return d.toISOString().split('T')[0];
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const days: Date[] = [];
    const current = new Date(startDate);
    while (days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const formatDateStr = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getEventBadge = (source: string, type: string) => {
    if (source === 'google_calendar') return 'text-[#4285F4] bg-[#4285F4]/10 border-[#4285F4]/20';
    if (source === 'nurofin_task' || type === 'task') return 'text-accent-purple bg-accent-purple/10 border-accent-purple/20';
    switch (type) {
      case 'meeting': return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      case 'event': return 'text-accent-green bg-accent-green/10 border-accent-green/20';
      case 'reminder': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
      default: return 'text-text-secondary bg-background-secondary border-border-subtle';
    }
  };

  const getEventIcon = (source: string, type: string) => {
    if (source === 'google_calendar') return <Globe className="w-3.5 h-3.5 text-[#4285F4]" />;
    if (source === 'nurofin_task' || type === 'task') return <Briefcase className="w-3.5 h-3.5 text-accent-purple" />;
    switch (type) {
      case 'meeting': return <Video className="w-3.5 h-3.5 text-accent-blue" />;
      case 'event': return <CalendarDays className="w-3.5 h-3.5 text-accent-green" />;
      case 'reminder': return <BellRing className="w-3.5 h-3.5 text-accent-orange" />;
      default: return <Clock className="w-3.5 h-3.5 text-text-secondary" />;
    }
  };

  const getSelectedUser = () => teammates.find(u => u.id === selectedUserId);

  const filteredTeammates = teammates.filter(u =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const todayStr = formatDateStr(new Date());
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekDayNums = [1, 2, 3, 4, 5, 6, 0];
  const dailyHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const getEventsForDate = (dateStr: string) => {
    const local = localEvents.filter(e => e.date === dateStr);
    const google = scheduleEvents.filter(e => {
      if (e.source === 'google_calendar' && e.start) {
        return e.start.startsWith(dateStr);
      }
      return false;
    });
    return [...local.map(e => ({ ...e, source: 'nurofin' })), ...google];
  };

  // Returns the hour (0-23) for an event, or null if it can't be determined
  const getEventHour = (e: any): number | null => {
    if (e.source === 'google_calendar' && e.start) {
      return new Date(e.start).getHours();
    }
    if (e.start_time) {
      const parsed = parseInt(e.start_time.split(':')[0]);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  const getEventTimeLabel = (e: any): string => {
    if (e.source === 'google_calendar' && e.start) {
      return new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return e.start_time || '';
  };

  const selectedUserInfo = getSelectedUser();

  const getDiffFromMonday = (currentDay: number, targetDay: number) => {
    const cur = currentDay === 0 ? 7 : currentDay;
    const target = targetDay === 0 ? 7 : targetDay;
    return target - cur;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto font-sans text-text-primary">

      {/* Teammate Sidebar */}
      <div className="w-full lg:w-72 shrink-0 bg-surface-card border border-border-subtle rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-border-subtle bg-background-secondary/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-blue" /> Team
            </h3>
            {selectedUserInfo?.google_connected && isOwnSchedule && (
              <button
                onClick={handleDisconnectGoogle}
                className="text-[10px] text-accent-red hover:text-accent-red/80 flex items-center gap-1"
                title="Disconnect Google Calendar"
              >
                <Unlink className="w-3 h-3" /> Disconnect
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search teammates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-background-primary/80 backdrop-blur border border-border-subtle rounded-lg pl-9 pr-3 text-xs text-text-primary focus:border-accent-blue outline-none transition-all shadow-sm focus:shadow-md"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <AnimatePresence>
            {filteredTeammates.map((user, idx) => (
              <motion.button
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setSelectedUserId(user.id)}
                className={cn(
                  "w-full p-2 flex items-center gap-3 rounded-lg text-left transition-all duration-200 border border-transparent group",
                  selectedUserId === user.id
                    ? "bg-accent-blue/10 border-accent-blue/30 shadow-sm"
                    : "hover:bg-surface-hover hover:border-border-subtle"
                )}
              >
                <div className="w-9 h-9 rounded-full bg-accent-blue/20 flex items-center justify-center text-xs font-bold text-accent-blue flex-shrink-0 overflow-hidden shadow-sm relative">
                  {user.profile_picture ? (
                    <img 
                      src={user.profile_picture} 
                      alt={user.full_name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={user.profile_picture ? "hidden" : ""}>
                    {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  {user.id === currentUserId && (
                    <div className="absolute inset-0 border-2 border-accent-blue rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs font-semibold truncate transition-colors",
                    selectedUserId === user.id ? "text-accent-blue" : "text-text-primary group-hover:text-text-primary"
                  )}>
                    {user.full_name}
                  </p>
                  <p className="text-[10px] text-text-muted truncate capitalize">{user.role || 'Member'}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {user.google_connected && (
                    <span title="Google Calendar connected" className="bg-white/10 p-1 rounded-full">
                      <Globe className="w-3 h-3 text-[#4285F4]" />
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Google Calendar Connect Button */}
        {!selectedUserInfo?.google_connected && isOwnSchedule && (
          <div className="p-4 border-t border-border-subtle bg-background-secondary/80">
            <button
              onClick={handleConnectGoogle}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-bold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Link2 className="w-3.5 h-3.5" /> Connect Google Calendar
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 relative">
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Header */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2 text-text-primary tracking-tight">
              {selectedUserInfo?.full_name || 'Team'}&apos;s Workspace
              {isOwnSchedule && <span className="text-[10px] bg-accent-blue/20 text-accent-blue px-2.5 py-1 rounded-full font-bold shadow-sm uppercase tracking-wider">Your Schedule</span>}
              {!isOwnSchedule && <span title="Read-only view"><Lock className="w-4 h-4 text-text-muted" /></span>}
            </h2>
            <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
              {selectedUserInfo?.google_connected ? <CheckCircle2 className="w-3 h-3 text-accent-green" /> : <AlertCircle className="w-3 h-3 text-text-muted" />}
              {selectedUserInfo?.google_connected
                ? "Synced with Google Calendar + Nurofin"
                : "Nurofin schedule only (Google Calendar not connected)"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'tasks' ? (
              (isAdmin || isOwnSchedule) && (
                <button 
                  onClick={() => setNewTaskOpen(!newTaskOpen)}
                  className="h-8 px-3 rounded flex items-center gap-1.5 bg-accent-purple text-white text-xs font-semibold hover:bg-accent-purple/90 transition-colors shadow-sm"
                >
                  <Briefcase className="w-4 h-4" /> Assign Task
                </button>
              )
            ) : (
              isOwnSchedule && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNewEventOpen(!newEventOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Event
                </motion.button>
              )
            )}
          </div>
        </div>

        {/* Add Event Form */}
        <AnimatePresence>
          {newEventOpen && isOwnSchedule && activeTab !== 'tasks' && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddEvent} 
              className="bg-surface-card border-b border-border-subtle p-5 grid grid-cols-1 sm:grid-cols-6 gap-4 items-start text-xs shadow-inner overflow-hidden z-0"
            >
              {conflictData && (
                <div className="sm:col-span-6 bg-accent-red/10 border border-accent-red/30 rounded-lg p-3 mb-2">
                  <div className="flex items-start gap-2 text-accent-red mb-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="font-semibold text-xs leading-relaxed">{conflictData.message}</p>
                  </div>
                  {conflictData.alternative_times && conflictData.alternative_times.length > 0 && (
                    <div className="space-y-1.5 mt-2 pl-6">
                      <p className="text-[10px] font-bold text-text-secondary uppercase">Suggested Alternative Times:</p>
                      <div className="flex flex-wrap gap-2">
                        {conflictData.alternative_times.map((alt: any, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setNewEventDate(alt.date);
                              setNewEventStartTime(alt.start_time);
                              setConflictData(null);
                            }}
                            className="px-2 py-1 bg-background-primary border border-border-subtle hover:border-accent-blue rounded text-xs transition-colors"
                          >
                            {alt.date} at {alt.start_time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. AWS Billing Review"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={e => setNewEventDate(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-blue transition-all"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Start Time</label>
                <input
                  type="time"
                  value={newEventStartTime}
                  onChange={e => setNewEventStartTime(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-blue transition-all"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Event Type</label>
                <select
                  value={newEventType}
                  onChange={e => setNewEventType(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-blue transition-all"
                >
                  <option value="meeting">Meeting</option>
                  <option value="reminder">Reminder</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-6">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Participants</label>
                <div className="w-full bg-background-primary border border-border-subtle rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                  {teammates.map(user => (
                    <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-surface-hover p-1 rounded">
                      <input
                        type="checkbox"
                        className="rounded border-border-subtle text-accent-blue focus:ring-accent-blue"
                        checked={newEventParticipantIds.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewEventParticipantIds([...newEventParticipantIds, user.id]);
                          } else {
                            setNewEventParticipantIds(newEventParticipantIds.filter(id => id !== user.id));
                          }
                        }}
                      />
                      <span className="text-xs text-text-primary">{user.full_name}</span>
                    </label>
                  ))}
                  {teammates.length === 0 && <span className="text-xs text-text-muted italic px-1">No teammates found</span>}
                </div>
              </div>
              <div className="flex gap-2 justify-end h-10 items-center sm:col-span-6 mt-2 border-t border-border-subtle pt-4">
                <button
                  type="button"
                  onClick={() => setNewEventOpen(false)}
                  className="px-4 h-10 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 h-10 bg-accent-green hover:bg-accent-green-light text-white font-bold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  Save Event
                </button>
              </div>
            </motion.form>
          )}
          
          {/* Add Task Form (Admin Only) */}
          {newTaskOpen && activeTab === 'tasks' && isAdmin && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddTask} 
              className="bg-surface-card border-b border-border-subtle p-5 grid grid-cols-1 sm:grid-cols-6 gap-4 items-start text-xs shadow-inner overflow-hidden z-0"
            >
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Prepare Q3 Report"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-purple focus:ring-1 focus:ring-accent-purple transition-all"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  placeholder="Optional details..."
                  value={newTaskDescription}
                  onChange={e => setNewTaskDescription(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-purple transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={e => setNewTaskPriority(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-purple transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={e => setNewTaskDueDate(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-purple transition-all"
                />
              </div>
              <div className="flex gap-2 justify-end h-10 items-center sm:col-span-6 mt-2 border-t border-border-subtle pt-4">
                <button
                  type="button"
                  onClick={() => setNewTaskOpen(false)}
                  className="px-4 h-10 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 h-10 bg-accent-purple hover:bg-accent-purple-light text-white font-bold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" /> Assign Task
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Views */}
        <div className="flex flex-col relative z-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList className="bg-surface-card p-1 rounded-lg shadow-sm border border-border-subtle self-start">
                <TabsTrigger value="day" className="rounded-md px-4 py-1.5 data-[state=active]:bg-background-primary data-[state=active]:shadow-sm transition-all text-xs font-bold">Daily</TabsTrigger>
                <TabsTrigger value="week" className="rounded-md px-4 py-1.5 data-[state=active]:bg-background-primary data-[state=active]:shadow-sm transition-all text-xs font-bold">Weekly</TabsTrigger>
                <TabsTrigger value="month" className="rounded-md px-4 py-1.5 data-[state=active]:bg-background-primary data-[state=active]:shadow-sm transition-all text-xs font-bold">Monthly</TabsTrigger>
                <TabsTrigger value="tasks" className="rounded-md px-4 py-1.5 data-[state=active]:bg-background-primary data-[state=active]:shadow-sm transition-all text-xs font-bold flex items-center gap-1.5">
                  Tasks <span className="bg-accent-purple/20 text-accent-purple text-[9px] px-1.5 py-0.5 rounded-full leading-none">{tasks.length}</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                {activeTab === 'week' && (
                  <div className="flex items-center bg-background-secondary rounded-lg border border-border-subtle p-1 shadow-sm">
                    <button onClick={() => navigateWeek(-1)} className="p-1.5 hover:bg-surface-hover rounded-md transition-colors">
                      <ChevronLeft className="w-4 h-4 text-text-primary" />
                    </button>
                    <span className="text-xs font-bold text-text-primary min-w-[190px] text-center tracking-wide">
                      {new Date(getWeekStart(selectedDate)).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(getWeekEnd(selectedDate)).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                    </span>
                    <button onClick={() => navigateWeek(1)} className="p-1.5 hover:bg-surface-hover rounded-md transition-colors">
                      <ChevronRight className="w-4 h-4 text-text-primary" />
                    </button>
                  </div>
                )}
                {activeTab === 'month' && (
                  <div className="flex items-center bg-background-secondary rounded-lg border border-border-subtle p-1 shadow-sm">
                    <button onClick={() => navigateMonth(-1)} className="p-1.5 hover:bg-surface-hover rounded-md transition-colors">
                      <ChevronLeft className="w-4 h-4 text-text-primary" />
                    </button>
                    <span className="text-xs font-bold text-text-primary min-w-[150px] text-center tracking-wide">
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => navigateMonth(1)} className="p-1.5 hover:bg-surface-hover rounded-md transition-colors">
                      <ChevronRight className="w-4 h-4 text-text-primary" />
                    </button>
                  </div>
                )}
                {activeTab === 'day' && (
                  <span className="text-sm font-extrabold text-text-primary bg-background-secondary px-4 py-1.5 rounded-lg border border-border-subtle shadow-sm tracking-wide">
                    {new Date(todayStr).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            {/* Daily View */}
            <TabsContent value="day" className="mt-0">
              <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-md space-y-6">
                <h3 className="text-sm font-bold border-b border-border-subtle pb-4 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-accent-blue" /> Daily Timeline
                </h3>

                {(() => {
                  const todaysEvents = getEventsForDate(todayStr);
                  const earlyEvents = todaysEvents.filter(e => {
                    const h = getEventHour(e);
                    return h !== null && h < 8;
                  });
                  const lateEvents = todaysEvents.filter(e => {
                    const h = getEventHour(e);
                    return h !== null && h >= 18;
                  });
                  const unscheduledEvents = todaysEvents.filter(e => getEventHour(e) === null);
                  const earlyLateEvents = [...earlyEvents, ...unscheduledEvents, ...lateEvents];

                  const renderEventCard = (evt: any, idx: number) => (
                    <div key={idx} className="bg-background-primary/80 backdrop-blur p-4 rounded-xl border border-border-subtle hover:border-accent-blue/50 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-text-primary text-sm flex items-center gap-2">
                          {getEventIcon(evt.source, evt.type)}
                          {evt.title}
                        </h4>
                        {evt.description && <p className="text-xs text-text-secondary line-clamp-1 opacity-80">{evt.description}</p>}
                        {evt.source === 'google_calendar' && evt.start && evt.end && (
                          <p className="text-[11px] text-[#4285F4] font-medium flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(evt.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn("text-[10px] uppercase font-bold border px-2.5 py-1 rounded-md shadow-sm", getEventBadge(evt.source, evt.type))}>
                          {evt.source === 'google_calendar' ? 'Google' : evt.source === 'nurofin_task' ? 'Task' : evt.type}
                        </span>
                        {evt.source === 'nurofin' && isOwnSchedule && evt.id && (
                          <button onClick={() => handleDeleteEvent(evt.id)} className="text-text-muted hover:text-accent-orange transition-colors bg-surface-hover p-1.5 rounded-md opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );

                  return (
                    <>
                      {earlyLateEvents.length > 0 && (
                        <div className="rounded-xl border border-dashed border-accent-orange/30 bg-accent-orange/5 p-4 space-y-3">
                          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-accent-orange flex items-center gap-2">
                            <Sunrise className="w-3.5 h-3.5" />
                            Early / Late (outside 08:00–17:00)
                          </h4>
                          <div className="space-y-3">
                            {earlyLateEvents.map((evt, idx) => (
                              <div key={idx} className="flex gap-4 items-start">
                                <span className="font-mono text-text-secondary font-bold text-xs w-14 pt-4 flex items-center gap-1">
                                  {getEventHour(evt) === null ? (
                                    <><Moon className="w-3 h-3" /> --:--</>
                                  ) : (
                                    getEventTimeLabel(evt)
                                  )}
                                </span>
                                <div className="flex-1">{renderEventCard(evt, idx)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-5"
                      >
                        {dailyHours.map((hour) => {
                          const hourNum = parseInt(hour.split(':')[0]);
                          const hourEvents = todaysEvents.filter(e => getEventHour(e) === hourNum);

                          return (
                            <motion.div variants={itemVariants} key={hour} className="flex gap-5 items-start text-xs border-b border-border-subtle/40 pb-4 last:border-0 last:pb-0">
                              <span className="font-mono text-text-secondary font-bold text-sm w-12 pt-2">{hour}</span>
                              {hourEvents.length > 0 ? (
                                <div className="flex-1 space-y-3">
                                  {hourEvents.map((evt, idx) => renderEventCard(evt, idx))}
                                </div>
                              ) : (
                                <div className="flex-1 border border-dashed border-border-subtle p-4 rounded-xl text-text-muted italic bg-background-primary/30 flex items-center justify-center opacity-50 text-xs font-medium">
                                  No events scheduled
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </>
                  );
                })()}
              </div>
            </TabsContent>

            {/* Weekly View */}
            <TabsContent value="week" className="mt-0">
              <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-md space-y-6">
                <h3 className="text-sm font-bold border-b border-border-subtle pb-4 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-accent-blue" /> Weekly Planner
                </h3>
                <motion.div 
                  className="grid grid-cols-1 lg:grid-cols-7 gap-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                {weekDays.map((dayName, idx) => {
                  const dayNum = weekDayNums[idx];
                  const dayDate = new Date(selectedDate);
                  const currentDay = dayDate.getDay();
                  const diff = getDiffFromMonday(currentDay, dayNum);
                  dayDate.setDate(dayDate.getDate() + diff);
                  const dayStr = formatDateStr(dayDate);

                  const dayEvents = getEventsForDate(dayStr);
                  const isToday = dayStr === todayStr;

                  return (
                    <motion.div variants={itemVariants} key={dayName} className={cn(
                      "border rounded-xl flex flex-col min-h-[350px]",
                      isToday ? "border-accent-blue bg-accent-blue/5 shadow-sm" : "border-border-subtle bg-background-secondary/30"
                    )}>
                      <div className={cn(
                        "p-3 border-b text-center backdrop-blur-sm",
                        isToday ? "bg-accent-blue/10 border-accent-blue/20" : "bg-background-secondary/50 border-border-subtle"
                      )}>
                        <span className={cn("text-[11px] font-extrabold uppercase tracking-widest", isToday ? "text-accent-blue" : "text-text-secondary")}>{dayName}</span>
                        <p className={cn("text-2xl font-black mt-1", isToday ? "text-accent-blue" : "text-text-primary")}>
                          {dayDate.getDate()}
                        </p>
                      </div>
                      <div className="p-2 flex-1 space-y-2 relative">
                        {dayEvents.map((e, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={idx} 
                            className="bg-background-primary group p-2.5 rounded-lg border border-border-subtle/80 text-left space-y-1.5 relative hover:border-accent-blue/50 hover:shadow-md transition-all cursor-default"
                          >
                            <h4 className="text-xs font-bold text-text-primary pr-4 leading-tight">{e.title}</h4>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className={cn("flex items-center gap-1 font-medium",
                                e.source === 'google_calendar' ? 'text-[#4285F4]' : 'text-text-secondary'
                              )}>
                                {e.source === 'google_calendar' ? (
                                  <><Globe className="w-3 h-3" /> {e.start ? new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</>
                                ) : (
                                  <><Clock className="w-3 h-3" /> {e.start_time || ''}</>
                                )}
                              </span>
                              <span className={cn("text-[9px] uppercase font-bold border px-1.5 py-0.5 rounded shadow-sm", getEventBadge(e.source, e.type))}>
                                {e.source === 'google_calendar' ? 'Google' : e.source === 'nurofin_task' ? 'Task' : e.type}
                              </span>
                            </div>
                            {e.source === 'nurofin' && isOwnSchedule && e.id && (
                              <button
                                onClick={() => handleDeleteEvent(e.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-orange transition-all bg-surface-hover p-1 rounded-md"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </motion.div>
                        ))}
                        {dayEvents.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[11px] text-text-muted italic font-medium opacity-50">Free</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                </motion.div>
              </div>
            </TabsContent>

            {/* Monthly View */}
            <TabsContent value="month" className="mt-0">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-md space-y-6"
              >
                <h3 className="text-sm font-bold border-b border-border-subtle pb-4 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-accent-blue" /> Monthly Overview
                </h3>
                <div>
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-text-secondary border-b border-border-subtle pb-4 mb-4">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {getDaysInMonth(currentMonth).map((day, idx) => {
                    const dateStr = formatDateStr(day);
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const isToday = dateStr === todayStr;
                    const dayEvents = getEventsForDate(dateStr);

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "min-h-[100px] p-2 border rounded-xl flex flex-col gap-1 text-left transition-all overflow-hidden",
                          isToday ? "border-accent-blue/50 bg-accent-blue/5 ring-1 ring-accent-blue/20 shadow-sm" : "border-border-subtle/50",
                          isCurrentMonth ? "bg-background-primary hover:bg-surface-hover/50 hover:shadow-md cursor-pointer" : "bg-background-secondary/30 opacity-40"
                        )}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={cn(
                            "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm",
                            isToday ? "bg-accent-blue text-white" : "text-text-secondary bg-background-secondary"
                          )}>
                            {day.getDate()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((e, i) => (
                            <div key={i} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded truncate leading-tight shadow-sm flex items-center gap-1",
                              e.source === 'google_calendar'
                                ? 'bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20'
                                : e.type === 'meeting' ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                                : e.type === 'event' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                                : 'bg-accent-orange/10 text-accent-orange border border-accent-orange/20'
                            )}>
                              {e.source === 'google_calendar' ? <Globe className="w-2.5 h-2.5 flex-shrink-0" /> : null}
                              <span className="truncate">
                                {e.source === 'google_calendar'
                                  ? (e.start ? new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' : '') + e.title
                                  : (e.start_time || '') + ' ' + e.title}
                              </span>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[9px] font-bold text-text-muted text-center block mt-1 hover:text-text-primary transition-colors bg-surface-hover rounded py-0.5">+{dayEvents.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            
            {/* Tasks Tab View */}
            <TabsContent value="tasks" className="mt-0">
              <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-md space-y-6">
                <h3 className="text-sm font-bold border-b border-border-subtle pb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-accent-purple" /> Assigned Tasks
                </h3>
                
                {tasksLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full"></div>
                  </div>
                ) : tasks.length > 0 ? (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                  >
                    {tasks.map(task => (
                      <motion.div 
                        key={task.id} 
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        className="bg-background-primary border border-border-subtle rounded-xl p-5 shadow-sm hover:border-accent-purple/50 transition-all group flex flex-col h-full"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={cn(
                            "text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-sm border",
                            task.status === 'completed' ? "bg-accent-green/10 text-accent-green border-accent-green/20" : 
                            task.status === 'in_progress' ? "bg-accent-blue/10 text-accent-blue border-accent-blue/20" : 
                            "bg-accent-orange/10 text-accent-orange border-accent-orange/20"
                          )}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={cn(
                            "text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-sm border",
                            task.priority === 'high' ? "bg-accent-red/10 text-accent-red border-accent-red/20" : 
                            task.priority === 'medium' ? "bg-accent-orange/10 text-accent-orange border-accent-orange/20" : 
                            "bg-text-secondary/10 text-text-secondary border-text-secondary/20"
                          )}>
                            {task.priority} Priority
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-text-primary mb-2 line-clamp-2">{task.title}</h4>
                        <p className="text-xs text-text-secondary line-clamp-3 mb-4 flex-1">{task.description}</p>
                        
                        <div className="flex items-center justify-between border-t border-border-subtle pt-4 mt-auto">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-text-muted" />
                            <span className="text-[11px] font-bold text-text-secondary">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                          {task.projectId && (
                            <span className="text-[10px] font-bold text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded">
                              Project #{task.projectId}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border-subtle rounded-xl bg-background-primary/50">
                    <Briefcase className="w-12 h-12 text-text-muted mb-4 opacity-50" />
                    <p className="text-sm font-bold text-text-secondary">No tasks assigned</p>
                    <p className="text-xs text-text-muted mt-1">This user is all caught up!</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}