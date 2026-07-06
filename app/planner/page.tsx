'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Video, 
  BellRing,
  Info
} from 'lucide-react';
import { useStore } from '@/lib/store';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  type: 'video' | 'in-person' | 'reminder';
  details: string;
  dayOfWeek: number; // 1 = Mon, 5 = Fri
}

const mockEvents: EventItem[] = [
  { id: 'ev-1', title: 'Acme Seat License Auditing', date: '2026-07-06', time: '09:00', duration: '60 mins', type: 'video', details: 'Clarify API CORS blocks with Sarah.', dayOfWeek: 1 },
  { id: 'ev-2', title: 'Executive Operations Briefing', date: '2026-07-06', time: '14:00', duration: '45 mins', type: 'in-person', details: 'Approve budget limits with Vincent.', dayOfWeek: 1 },
  { id: 'ev-3', title: 'Compliance Signature Due Date', date: '2026-07-07', time: '17:00', duration: '15 mins', type: 'reminder', details: 'Check Q2 compliance formats.', dayOfWeek: 2 },
  { id: 'ev-4', title: 'PostgreSQL DB Sharding Review', date: '2026-07-08', time: '11:00', duration: '90 mins', type: 'video', details: 'Database sharding metrics with John.', dayOfWeek: 3 },
  { id: 'ev-5', title: 'AWS Instances Renewal Pre-sync', date: '2026-07-09', time: '15:30', duration: '30 mins', type: 'video', details: 'Confirm DB scale sizes.', dayOfWeek: 4 },
];

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState('2026-07-06');
  const [events, setEvents] = useState<EventItem[]>(mockEvents);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-07-06');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventOpen, setNewEventOpen] = useState(false);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    const item: EventItem = {
      id: `ev-${Date.now()}`,
      title: newEventTitle,
      date: newEventDate,
      time: newEventTime,
      duration: '60 mins',
      type: 'reminder',
      details: 'Mock added reminder event.',
      dayOfWeek: new Date(newEventDate).getDay(),
    };
    setEvents([...events, item]);
    setNewEventTitle('');
    setNewEventOpen(false);
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'video': return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      case 'in-person': return 'text-accent-green bg-accent-green/10 border-accent-green/20';
      default: return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
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
        <form onSubmit={handleAddEvent} className="bg-background-secondary border border-border-subtle p-5 rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-4 items-end text-xs">
          <div className="space-y-1">
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
            <label className="text-2xs text-text-secondary font-bold uppercase">Start Time</label>
            <input 
              type="time" 
              value={newEventTime}
              onChange={e => setNewEventTime(e.target.value)}
              className="w-full h-10 bg-background-primary border border-border-subtle rounded px-3 text-sm text-text-primary"
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="flex-1 h-10 bg-accent-green hover:bg-accent-green-light text-white font-semibold rounded"
            >
              Save Event
            </button>
            <button 
              type="button" 
              onClick={() => setNewEventOpen(false)}
              className="px-3 h-10 bg-background-primary border border-border-subtle text-text-secondary hover:text-text-primary rounded"
            >
              Cancel
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
            <span className="font-semibold text-text-secondary">July 2026</span>
          </div>
        </div>

        {/* 1. Daily View tab */}
        <TabsContent value="day" className="mt-4">
          <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md space-y-4">
            <h3 className="text-sm font-bold border-b border-border-subtle/50 pb-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-text-secondary" /> Daily Schedule Timeline (July 6, 2026)
            </h3>
            <div className="space-y-4">
              {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(hour => {
                const hourEvent = events.find(e => e.date === '2026-07-06' && e.time.startsWith(hour.split(':')[0]));
                return (
                  <div key={hour} className="flex gap-4 items-start text-xs border-b border-border-subtle/30 pb-3 last:border-0 last:pb-0">
                    <span className="font-mono text-text-secondary font-bold w-12 pt-1">{hour}</span>
                    {hourEvent ? (
                      <div className="flex-1 bg-background-primary p-3 rounded-md border border-border-subtle/50 hover:border-accent-blue/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                            {hourEvent.type === 'video' && <Video className="w-3.5 h-3.5 text-accent-blue" />}
                            {hourEvent.type === 'reminder' && <BellRing className="w-3.5 h-3.5 text-accent-orange" />}
                            {hourEvent.title}
                          </h4>
                          <p className="text-[11px] text-text-secondary">{hourEvent.details}</p>
                        </div>
                        <span className={cn("text-[9px] uppercase font-bold border px-2 py-0.5 rounded", getEventBadge(hourEvent.type))}>
                          {hourEvent.type}
                        </span>
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
            {['Monday (Jul 6)', 'Tuesday (Jul 7)', 'Wednesday (Jul 8)', 'Thursday (Jul 9)', 'Friday (Jul 10)'].map((dayName, idx) => {
              const dayNum = idx + 1;
              const dayEvents = events.filter(e => e.dayOfWeek === dayNum);
              return (
                <div key={dayName} className="bg-background-secondary border border-border-subtle rounded-lg flex flex-col min-h-[400px]">
                  <div className="p-3 border-b border-border-subtle text-center bg-surface-card/10">
                    <span className="text-xs font-bold text-text-primary">{dayName}</span>
                  </div>
                  <div className="p-3 flex-1 overflow-y-auto space-y-3">
                    {dayEvents.map(e => (
                      <div key={e.id} className="bg-background-primary p-2.5 rounded border border-border-subtle/50 text-left space-y-2">
                        <h4 className="text-xs font-bold text-text-primary line-clamp-2 leading-relaxed">{e.title}</h4>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-text-muted flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {e.time}
                          </span>
                          <span className={cn("text-[8px] uppercase font-extrabold border px-1 py-0.2 rounded", getEventBadge(e.type))}>
                            {e.type}
                          </span>
                        </div>
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
            {/* Calendar grid headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-text-secondary border-b border-border-subtle/50 pb-2 mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, idx) => {
                const dayValue = idx - 4; // Shift days to start July on appropriate column
                const isValidDay = dayValue > 0 && dayValue <= 31;
                const dateStr = `2026-07-${dayValue < 10 ? '0' + dayValue : dayValue}`;
                const dayEventCount = events.filter(e => e.date === dateStr).length;

                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "min-h-[80px] p-2 border border-border-subtle/40 rounded flex flex-col justify-between text-left transition-colors",
                      isValidDay ? "bg-background-primary hover:bg-surface-hover/30" : "bg-background-secondary/20 opacity-30 pointer-events-none"
                    )}
                  >
                    <span className="text-xs font-bold text-text-secondary">{isValidDay ? dayValue : ''}</span>
                    {dayEventCount > 0 && (
                      <span className="text-[10px] font-bold text-accent-blue bg-accent-blue/10 border border-accent-blue/20 rounded px-1.5 py-0.5 block text-center truncate">
                        {dayEventCount} event{dayEventCount > 1 ? 's' : ''}
                      </span>
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
