'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';
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
  Globe
} from 'lucide-react';
import { meetingsService } from '@/services/meetings';
import { plannerService, PlannerUser, ScheduleEvent } from '@/services/planner';
import { useStore } from '@/store';

export default function PlannerPage() {
  const { userProfile } = useStore();
  const currentUserId = parseInt(userProfile.id || '0');

  const [teammates, setTeammates] = useState<PlannerUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number>(currentUserId);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('week');

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('10:00');
  const [newEventEndTime, setNewEventEndTime] = useState('11:00');
  const [newEventType, setNewEventType] = useState('meeting');
  const [newEventOpen, setNewEventOpen] = useState(false);

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
      const startStr = getWeekStart(selectedDate);
      const endStr = getWeekEnd(selectedDate);
      const data = await plannerService.getSchedule(selectedUserId, startStr, endStr);
      setScheduleEvents(data.schedule || []);

      if (selectedUserId === currentUserId) {
        const localData = await meetingsService.getMeetings();
        setLocalEvents(localData);
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setScheduleLoading(false);
      setLoading(false);
    }
  }, [selectedUserId, selectedDate, currentUserId]);

  useEffect(() => {
    loadTeammates();
    setNewEventDate(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadSchedule();
    }
  }, [selectedUserId, loadSchedule]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    try {
      const newEvent = await meetingsService.createMeeting({
        title: newEventTitle,
        date: newEventDate,
        time: newEventStartTime,
        type: newEventType
      });
      setLocalEvents([...localEvents, newEvent]);
      setNewEventTitle('');
      setNewEventOpen(false);
      loadSchedule();
    } catch (error) {
      console.error('Failed to create event:', error);
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
    switch (type) {
      case 'meeting': return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      case 'event': return 'text-accent-green bg-accent-green/10 border-accent-green/20';
      case 'reminder': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
      default: return 'text-text-secondary bg-background-secondary border-border-subtle';
    }
  };

  const getEventIcon = (source: string, type: string) => {
    if (source === 'google_calendar') return <Globe className="w-3.5 h-3.5 text-[#4285F4]" />;
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

  const getEventsForDayOfWeek = (dayNum: number) => {
    return scheduleEvents.filter(e => {
      if (e.date) {
        const d = new Date(e.date);
        return d.getDay() === dayNum;
      }
      if (e.start) {
        const d = new Date(e.start);
        return d.getDay() === dayNum;
      }
      return false;
    });
  };

  const selectedUserInfo = getSelectedUser();

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-full mx-auto font-sans text-text-primary overflow-hidden">

      {/* Teammate Sidebar */}
      <div className="w-64 min-w-[256px] bg-background-secondary border-r border-border-subtle flex flex-col">
        <div className="p-4 border-b border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-text-secondary" /> Team
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
              className="w-full h-9 bg-background-primary border border-border-subtle rounded-md pl-9 pr-3 text-xs text-text-primary focus:border-accent-blue outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredTeammates.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={cn(
                "w-full p-3 flex items-center gap-3 border-b border-border-subtle/50 text-left transition-colors",
                selectedUserId === user.id
                  ? "bg-accent-blue/10 border-l-2 border-l-accent-blue"
                  : "hover:bg-surface-hover/30 border-l-2 border-l-transparent"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-xs font-bold text-accent-blue flex-shrink-0">
                {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{user.full_name}</p>
                <p className="text-[10px] text-text-muted truncate">{user.role || 'Member'}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {user.google_connected && (
                  <span title="Google Calendar connected">
                    <Globe className="w-3 h-3 text-[#4285F4]" />
                  </span>
                )}
                {user.id === currentUserId && (
                  <span className="text-[9px] bg-accent-blue/20 text-accent-blue px-1.5 py-0.5 rounded font-bold">YOU</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Google Calendar Connect Button */}
        {!selectedUserInfo?.google_connected && isOwnSchedule && (
          <div className="p-3 border-t border-border-subtle">
            <button
              onClick={handleConnectGoogle}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-semibold rounded-md transition-colors"
            >
              <Link2 className="w-3.5 h-3.5" /> Connect Google Calendar
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-background-secondary">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              {selectedUserInfo?.full_name || 'Team'}&apos;s Planner
              {isOwnSchedule && <span className="text-[10px] bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded-full font-bold">Your Schedule</span>}
              {!isOwnSchedule && <Lock className="w-4 h-4 text-text-muted" title="Read-only view" />}
            </h2>
            <p className="text-2xs text-text-secondary mt-0.5">
              {selectedUserInfo?.google_connected
                ? "Synced with Google Calendar + Nurofin meetings"
                : "Nurofin meetings only (Google Calendar not connected)"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isOwnSchedule && (
              <button
                onClick={() => setNewEventOpen(!newEventOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold rounded-md shadow transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Event
              </button>
            )}
          </div>
        </div>

        {/* Add Event Form */}
        {newEventOpen && isOwnSchedule && (
          <form onSubmit={handleAddEvent} className="bg-background-secondary border-b border-border-subtle p-5 grid grid-cols-1 sm:grid-cols-6 gap-4 items-end text-xs">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-2xs text-text-secondary font-bold uppercase">Title</label>
              <input
                type="text"
                placeholder="e.g. AWS Billing Review"
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                className="w-full h-10 bg-background-primary border border-border-subtle rounded px-3 text-sm text-text-primary focus:border-accent-blue"
              />
            </div>
            <div className="space-y-1">
              <label className="text-2xs text-text-secondary font-bold uppercase">Date</label>
              <input
                type="date"
                value={newEventDate}
                onChange={e => setNewEventDate(e.target.value)}
                className="w-full h-10 bg-background-primary border border-border-subtle rounded px-3 text-sm text-text-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-2xs text-text-secondary font-bold uppercase">Start</label>
              <input
                type="time"
                value={newEventStartTime}
                onChange={e => setNewEventStartTime(e.target.value)}
                className="w-full h-10 bg-background-primary border border-border-subtle rounded px-3 text-sm text-text-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-2xs text-text-secondary font-bold uppercase">Type</label>
              <select
                value={newEventType}
                onChange={e => setNewEventType(e.target.value)}
                className="w-full h-10 bg-background-primary border border-border-subtle rounded px-3 text-sm text-text-primary"
              >
                <option value="meeting">Meeting</option>
                <option value="reminder">Reminder</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setNewEventOpen(false)}
                className="px-4 h-10 bg-background-primary border border-border-subtle text-text-secondary hover:text-text-primary rounded font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 h-10 bg-accent-green hover:bg-accent-green-light text-white font-semibold rounded"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Calendar Views */}
        <div className="flex-1 overflow-y-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-4">
              <TabsList>
                <TabsTrigger value="day">Daily</TabsTrigger>
                <TabsTrigger value="week">Weekly</TabsTrigger>
                <TabsTrigger value="month">Monthly</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                {activeTab === 'week' && (
                  <>
                    <button onClick={() => navigateWeek(-1)} className="p-1 hover:bg-surface-hover rounded">
                      <ChevronLeft className="w-4 h-4 text-text-secondary" />
                    </button>
                    <span className="text-xs font-semibold text-text-secondary min-w-[180px] text-center">
                      {getWeekStart(selectedDate)} to {getWeekEnd(selectedDate)}
                    </span>
                    <button onClick={() => navigateWeek(1)} className="p-1 hover:bg-surface-hover rounded">
                      <ChevronRight className="w-4 h-4 text-text-secondary" />
                    </button>
                  </>
                )}
                {activeTab === 'month' && (
                  <>
                    <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-surface-hover rounded">
                      <ChevronLeft className="w-4 h-4 text-text-secondary" />
                    </button>
                    <span className="text-xs font-semibold text-text-secondary min-w-[140px] text-center">
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-surface-hover rounded">
                      <ChevronRight className="w-4 h-4 text-text-secondary" />
                    </button>
                  </>
                )}
                {activeTab === 'day' && (
                  <span className="text-xs font-semibold text-text-secondary">{todayStr}</span>
                )}
              </div>
            </div>

            {/* Daily View */}
            <TabsContent value="day" className="mt-0">
              <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md space-y-4">
                <h3 className="text-sm font-bold border-b border-border-subtle/50 pb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-text-secondary" /> Daily Timeline
                </h3>
                <div className="space-y-4">
                  {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(hour => {
                    const hourNum = parseInt(hour.split(':')[0]);
                    const hourEvents = scheduleEvents.filter(e => {
                      if (e.source === 'google_calendar' && e.start) {
                        const d = new Date(e.start);
                        return d.getHours() === hourNum && e.start.startsWith(todayStr);
                      }
                      if (e.date === todayStr && e.start_time) {
                        return parseInt(e.start_time.split(':')[0]) === hourNum;
                      }
                      return false;
                    });

                    return (
                      <div key={hour} className="flex gap-4 items-start text-xs border-b border-border-subtle/30 pb-3 last:border-0 last:pb-0">
                        <span className="font-mono text-text-secondary font-bold w-12 pt-1">{hour}</span>
                        {hourEvents.length > 0 ? (
                          <div className="flex-1 space-y-2">
                            {hourEvents.map((evt, idx) => (
                              <div key={idx} className="bg-background-primary p-3 rounded-md border border-border-subtle/50 hover:border-accent-blue/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                                    {getEventIcon(evt.source, evt.type)}
                                    {evt.title}
                                  </h4>
                                  {evt.description && <p className="text-[11px] text-text-secondary line-clamp-1">{evt.description}</p>}
                                  {evt.source === 'google_calendar' && evt.start && evt.end && (
                                    <p className="text-[10px] text-[#4285F4]">
                                      {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(evt.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={cn("text-[9px] uppercase font-bold border px-2 py-0.5 rounded", getEventBadge(evt.source, evt.type))}>
                                    {evt.source === 'google_calendar' ? 'Google' : evt.type}
                                  </span>
                                  {evt.source === 'nurofin' && isOwnSchedule && evt.id && (
                                    <button onClick={() => handleDeleteEvent(evt.id)} className="text-text-muted hover:text-accent-orange transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex-1 border border-dashed border-border-subtle p-3 rounded-md text-text-muted italic">
                            Available
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Weekly View */}
            <TabsContent value="week" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {weekDays.map((dayName, idx) => {
                  const dayNum = weekDayNums[idx];
                  const dayDate = new Date(selectedDate);
                  const currentDay = dayDate.getDay();
                  const diff = dayNum - currentDay;
                  dayDate.setDate(dayDate.getDate() + diff);
                  const dayStr = formatDateStr(dayDate);

                  const dayEvents = getEventsForDate(dayStr);
                  const isToday = dayStr === todayStr;

                  return (
                    <div key={dayName} className={cn(
                      "bg-background-secondary border rounded-lg flex flex-col min-h-[400px]",
                      isToday ? "border-accent-blue/50" : "border-border-subtle"
                    )}>
                      <div className={cn(
                        "p-2 border-b text-center",
                        isToday ? "bg-accent-blue/10 border-accent-blue/30" : "bg-surface-card/10 border-border-subtle"
                      )}>
                        <span className="text-[10px] font-bold text-text-secondary uppercase">{dayName}</span>
                        <p className={cn("text-lg font-bold", isToday ? "text-accent-blue" : "text-text-primary")}>
                          {dayDate.getDate()}
                        </p>
                      </div>
                      <div className="p-2 flex-1 overflow-y-auto space-y-2">
                        {dayEvents.map((e, idx) => (
                          <div key={idx} className="bg-background-primary group p-2 rounded border border-border-subtle/50 text-left space-y-1 relative hover:border-accent-blue/50 transition-colors">
                            <h4 className="text-[11px] font-bold text-text-primary pr-4 leading-tight">{e.title}</h4>
                            <div className="flex items-center justify-between text-[9px]">
                              <span className={cn("flex items-center gap-0.5",
                                e.source === 'google_calendar' ? 'text-[#4285F4]' : 'text-text-muted'
                              )}>
                                {e.source === 'google_calendar' ? (
                                  <><Globe className="w-2.5 h-2.5" /> {e.start ? new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</>
                                ) : (
                                  <><Clock className="w-2.5 h-2.5" /> {e.start_time || ''}</>
                                )}
                              </span>
                              <span className={cn("text-[8px] uppercase font-extrabold border px-1 py-0.2 rounded", getEventBadge(e.source, e.type))}>
                                {e.source === 'google_calendar' ? 'Google' : e.type}
                              </span>
                            </div>
                            {e.source === 'nurofin' && isOwnSchedule && e.id && (
                              <button
                                onClick={() => handleDeleteEvent(e.id)}
                                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-orange transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        {dayEvents.length === 0 && (
                          <div className="text-center py-8 text-[10px] text-text-muted italic">Free</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Monthly View */}
            <TabsContent value="month" className="mt-0">
              <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 shadow-md">
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-text-secondary border-b border-border-subtle/50 pb-2 mb-2">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((day, idx) => {
                    const dateStr = formatDateStr(day);
                    const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                    const isToday = dateStr === todayStr;
                    const dayEvents = getEventsForDate(dateStr);

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "min-h-[80px] p-1.5 border rounded flex flex-col gap-0.5 text-left transition-colors overflow-hidden",
                          isToday ? "border-accent-blue/50 bg-accent-blue/5" : "border-border-subtle/40",
                          isCurrentMonth ? "bg-background-primary hover:bg-surface-hover/30" : "bg-background-secondary/20 opacity-40"
                        )}
                      >
                        <span className={cn(
                          "text-[10px] font-bold block mb-0.5 w-5 h-5 flex items-center justify-center rounded-full",
                          isToday ? "bg-accent-blue text-white" : "text-text-secondary"
                        )}>
                          {day.getDate()}
                        </span>
                        {dayEvents.slice(0, 3).map((e, i) => (
                          <div key={i} className={cn("text-[8px] font-bold px-1 py-0.5 rounded truncate leading-tight",
                            e.source === 'google_calendar'
                              ? 'bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20'
                              : e.type === 'meeting' ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                              : e.type === 'event' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                              : 'bg-accent-orange/10 text-accent-orange border border-accent-orange/20'
                          )}>
                            {e.source === 'google_calendar'
                              ? (e.start ? new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' : '') + e.title
                              : (e.start_time || '') + ' ' + e.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[7px] text-text-muted italic text-center block">+{dayEvents.length - 3} more</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
