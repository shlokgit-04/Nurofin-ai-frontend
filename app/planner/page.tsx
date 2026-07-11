'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Video, 
  BellRing,
  Trash2,
  CalendarDays
} from 'lucide-react';
import { meetingsService } from '@/services/meetings';
import { Meeting } from '@/types';

export default function PlannerPage() {
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayDateStr);
  const [events, setEvents] = useState<Meeting[]>([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(todayDateStr);
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventType, setNewEventType] = useState('meeting');
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await meetingsService.getMeetings();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    try {
      const newEvent = await meetingsService.createMeeting({
        title: newEventTitle,
        date: newEventDate,
        time: newEventTime,
        type: newEventType
      });
      setEvents([...events, newEvent]);
      setNewEventTitle('');
      setNewEventOpen(false);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await meetingsService.deleteMeeting(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'meeting': return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      case 'event': return 'text-accent-green bg-accent-green/10 border-accent-green/20';
      case 'reminder': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
      default: return 'text-text-secondary bg-background-secondary border-border-subtle';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Video className="w-3.5 h-3.5 text-accent-blue" />;
      case 'event': return <CalendarDays className="w-3.5 h-3.5 text-accent-green" />;
      case 'reminder': return <BellRing className="w-3.5 h-3.5 text-accent-orange" />;
      default: return <Clock className="w-3.5 h-3.5 text-text-secondary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-text-primary">
      {/* Planner Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background-secondary p-4 rounded-lg border border-border-subtle shadow-md">
        <div>
          <h2 className="text-base font-bold font-sans">Executive Planner</h2>
          <p className="text-2xs text-text-secondary mt-0.5">Track board syncs, vendor renewal calendars, and operational triggers.</p>
        </div>
        <button
          onClick={() => setNewEventOpen(!newEventOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold rounded-md shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {/* Add event inline dialog */}
      {newEventOpen && (
        <form onSubmit={handleAddEvent} className="bg-background-secondary border border-border-subtle p-5 rounded-lg grid grid-cols-1 sm:grid-cols-5 gap-4 items-end text-xs">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-2xs text-text-secondary font-bold uppercase">Event / Reminder Title</label>
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
            <label className="text-2xs text-text-secondary font-bold uppercase">Time</label>
            <input 
              type="time" 
              value={newEventTime}
              onChange={e => setNewEventTime(e.target.value)}
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
          <div className="flex gap-2 sm:col-span-5 justify-end mt-2">
            <button 
              type="button" 
              onClick={() => setNewEventOpen(false)}
              className="px-4 h-9 bg-background-primary border border-border-subtle text-text-secondary hover:text-text-primary rounded font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 h-9 bg-accent-green hover:bg-accent-green-light text-white font-semibold rounded"
            >
              Save to Planner
            </button>
          </div>
        </form>
      )}

      <Tabs defaultValue="week">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <TabsList>
            <TabsTrigger value="day">Daily View</TabsTrigger>
            <TabsTrigger value="week">Weekly Calendar</TabsTrigger>
            <TabsTrigger value="month">Monthly Grid</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-text-secondary">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* 1. Daily View tab */}
        <TabsContent value="day" className="mt-4">
          <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md space-y-4">
            <h3 className="text-sm font-bold border-b border-border-subtle/50 pb-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-text-secondary" /> Daily Schedule Timeline ({todayDateStr})
            </h3>
            <div className="space-y-4">
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(hour => {
                const hourEvents = events.filter(e => e.date === todayDateStr && e.time.startsWith(hour.split(':')[0]));
                return (
                  <div key={hour} className="flex gap-4 items-start text-xs border-b border-border-subtle/30 pb-3 last:border-0 last:pb-0">
                    <span className="font-mono text-text-secondary font-bold w-12 pt-1">{hour}</span>
                    {hourEvents.length > 0 ? (
                      <div className="flex-1 space-y-2">
                        {hourEvents.map(hourEvent => (
                          <div key={hourEvent.id} className="bg-background-primary p-3 rounded-md border border-border-subtle/50 hover:border-accent-blue/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                                {getEventIcon(hourEvent.type)}
                                {hourEvent.title}
                              </h4>
                              {hourEvent.notes && <p className="text-[11px] text-text-secondary">{hourEvent.notes}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={cn("text-[9px] uppercase font-bold border px-2 py-0.5 rounded", getEventBadge(hourEvent.type))}>
                                {hourEvent.type}
                              </span>
                              <button onClick={() => handleDeleteEvent(hourEvent.id)} className="text-text-muted hover:text-accent-orange transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 border border-dashed border-border-subtle p-3 rounded-md text-text-muted italic">
                        Available slot
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* 2. Weekly Calendar tab */}
        <TabsContent value="week" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((dayName, idx) => {
              const dayNum = idx + 1;
              const dayEvents = events.filter(e => {
                if (!e.date) return false;
                const dateObj = new Date(e.date);
                return dateObj.getDay() === dayNum;
              }).sort((a, b) => a.time.localeCompare(b.time));

              return (
                <div key={dayName} className="bg-background-secondary border border-border-subtle rounded-lg flex flex-col min-h-[400px]">
                  <div className="p-3 border-b border-border-subtle text-center bg-surface-card/10">
                    <span className="text-xs font-bold text-text-primary">{dayName}</span>
                  </div>
                  <div className="p-3 flex-1 overflow-y-auto space-y-3">
                    {dayEvents.map(e => (
                      <div key={e.id} className="bg-background-primary group p-2.5 rounded border border-border-subtle/50 text-left space-y-2 relative hover:border-accent-blue/50 transition-colors">
                        <h4 className="text-xs font-bold text-text-primary pr-4">{e.title}</h4>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-text-muted flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {e.time}
                          </span>
                          <span className={cn("text-[8px] uppercase font-extrabold border px-1 py-0.2 rounded", getEventBadge(e.type))}>
                            {e.type}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeleteEvent(e.id)} 
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-orange transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {dayEvents.length === 0 && (
                      <div className="text-center py-12 text-2xs text-text-muted italic">No events.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* 3. Monthly Grid View tab */}
        <TabsContent value="month" className="mt-4">
          <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 shadow-md">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-text-secondary border-b border-border-subtle/50 pb-2 mb-2">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, idx) => {
                const dayValue = idx - 4; // Assuming July 2026 starts on appropriate day (shift as needed)
                const isValidDay = dayValue > 0 && dayValue <= 31;
                const dateStr = `2026-07-${dayValue < 10 ? '0' + dayValue : dayValue}`;
                const dayEvents = events.filter(e => e.date === dateStr);

                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "min-h-[90px] p-2 border border-border-subtle/40 rounded flex flex-col gap-1 text-left transition-colors overflow-hidden",
                      isValidDay ? "bg-background-primary hover:bg-surface-hover/30" : "bg-background-secondary/20 opacity-30 pointer-events-none"
                    )}
                  >
                    <span className="text-xs font-bold text-text-secondary block mb-1">{isValidDay ? dayValue : ''}</span>
                    {dayEvents.slice(0, 3).map(e => (
                      <div key={e.id} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded truncate", 
                        e.type === 'meeting' ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20' : 
                        e.type === 'event' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' : 
                        'bg-accent-orange/10 text-accent-orange border border-accent-orange/20'
                      )}>
                        {e.time} {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-text-muted italic text-center block mt-0.5">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
