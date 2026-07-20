'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { Meeting, MeetingTimelineEvent, MeetingExtractedTask } from '@/types';
import { meetingsService } from '@/services/meetings';
import {
  Users, Clock, Calendar, Video, MapPin, Sparkles, FileText, Plus, Loader2,
  Save, AlertCircle, Check, X, Upload, UserPlus, Trash2, Link2, Globe,
  AlertTriangle, ListChecks, MessageSquare, Shield, Target, ChevronRight,
  CheckCircle2, XCircle, History, ClipboardList, BrainCircuit, BookOpen
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const meetingSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  type: z.enum(['meeting', 'reminder', 'event']),
});
type MeetingFormValues = z.infer<typeof meetingSchema>;

type Tab = 'info' | 'participants' | 'timeline' | 'transcript' | 'summary' | 'minutes' | 'tasks';

export default function MeetingsPage() {
  const { meetings, setMeetings, addMeeting, updateMeeting } = useStore();
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [filter, setFilter] = useState<'today' | 'weekly' | 'monthly' | 'all'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [loadingMoM, setLoadingMoM] = useState(false);
  const [momText, setMomText] = useState('');
  const [analyzingMom, setAnalyzingMom] = useState(false);

  const [timeline, setTimeline] = useState<MeetingTimelineEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const [extractedTasks, setExtractedTasks] = useState<MeetingExtractedTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

  const [transcriptText, setTranscriptText] = useState('');
  const [uploadingTranscript, setUploadingTranscript] = useState(false);

  const [summaryData, setSummaryData] = useState<{ summary: string | null; analysis_status: string | null } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [momData, setMomData] = useState<{ mom: any; mom_summary: string | null; analysis_status: string | null } | null>(null);
  const [loadingMomData, setLoadingMomData] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: { date: new Date().toISOString().split('T')[0], time: '10:00', type: 'meeting' }
  });

  useEffect(() => {
    let active = true;
    async function loadMeetings() {
      try {
        setLoading(true);
        setError(null);
        const data = filter === 'all'
          ? await meetingsService.getMeetings(undefined, search || undefined)
          : await meetingsService.getMeetings(filter as any, search || undefined);
        if (active) {
          setMeetings(data);
          if (data.length > 0 && !selectedId) {
            setSelectedId(data[0].id);
          }
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to load meetings');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMeetings();
    return () => { active = false; };
  }, [setMeetings, filter, search]);

  const selectedMeeting = meetings.find(m => m.id === selectedId);

  useEffect(() => {
    if (activeTab !== 'timeline' || !selectedId) return;
    let active = true;
    async function load() {
      setLoadingTimeline(true);
      try {
        const data = await meetingsService.getTimeline(selectedId);
        if (active) setTimeline(data);
      } catch { if (active) setTimeline([]); }
      finally { if (active) setLoadingTimeline(false); }
    }
    load();
    return () => { active = false; };
  }, [activeTab, selectedId]);

  useEffect(() => {
    if (activeTab !== 'tasks' || !selectedId) return;
    let active = true;
    async function load() {
      setLoadingTasks(true);
      try {
        const data = await meetingsService.getExtractedTasks(selectedId);
        if (active) { setExtractedTasks(data); setSelectedTaskIds([]); }
      } catch { if (active) setExtractedTasks([]); }
      finally { if (active) setLoadingTasks(false); }
    }
    load();
    return () => { active = false; };
  }, [activeTab, selectedId]);

  useEffect(() => {
    if (activeTab !== 'summary' || !selectedId) return;
    let active = true;
    async function load() {
      setLoadingSummary(true);
      try {
        const data = await meetingsService.getMeetingSummary(selectedId);
        if (active) setSummaryData(data);
      } catch { if (active) setSummaryData(null); }
      finally { if (active) setLoadingSummary(false); }
    }
    load();
    return () => { active = false; };
  }, [activeTab, selectedId]);

  useEffect(() => {
    if (activeTab !== 'minutes' || !selectedId) return;
    let active = true;
    async function load() {
      setLoadingMomData(true);
      try {
        const data = await meetingsService.getMeetingMoM(selectedId);
        if (active) setMomData(data);
      } catch { if (active) setMomData(null); }
      finally { if (active) setLoadingMomData(false); }
    }
    load();
    return () => { active = false; };
  }, [activeTab, selectedId]);

  const onSubmit = async (data: MeetingFormValues) => {
    try {
      const created = await meetingsService.createMeeting({ title: data.title, date: data.date, time: data.time, type: data.type });
      addMeeting(created);
      setSelectedId(created.id);
      setCreateModalOpen(false);
      reset();
    } catch (err) { console.error(err); }
  };

  const handleUploadMoM = async () => {
    if (!selectedMeeting || !momText.trim()) return;
    setActionLoading('mom');
    try {
      const updated = await meetingsService.uploadMOM(selectedMeeting.id, momText);
      updateMeeting(selectedMeeting.id, { momText: updated.mom_summary || momText, mom_summary: updated.mom_summary });
      setMomText('');
      const full = await meetingsService.getMeeting(selectedMeeting.id);
      updateMeeting(selectedMeeting.id, {
        mom_executive_summary: full.mom_executive_summary,
        mom_decisions: full.mom_decisions,
        mom_risks: full.mom_risks,
        mom_blockers: full.mom_blockers,
        mom_followups: full.mom_followups,
      });
    } catch (err) { console.error('Failed to upload MOM:', err); }
    finally { setActionLoading(null); }
  };

  const handleAnalyzeMom = async () => {
    if (!selectedMeeting) return;
    setAnalyzingMom(true);
    try {
      const updated = await meetingsService.analyzeMOM(selectedMeeting.id);
      updateMeeting(selectedMeeting.id, {
        mom_executive_summary: updated.mom_executive_summary,
        mom_decisions: updated.mom_decisions,
        mom_risks: updated.mom_risks,
        mom_blockers: updated.mom_blockers,
        mom_followups: updated.mom_followups,
      });
    } catch (err) { console.error('Failed to analyze MOM:', err); }
    finally { setAnalyzingMom(false); }
  };

  const handleAccept = async () => {
    if (!selectedMeeting) return;
    setActionLoading('accept');
    try {
      await meetingsService.acceptMeeting(selectedMeeting.id);
      const updatedParticipants = (selectedMeeting.participants || []).map(p =>
        p.status === 'pending' ? { ...p, status: 'accepted' as const } : p
      );
      updateMeeting(selectedMeeting.id, { participants: updatedParticipants });
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleDecline = async () => {
    if (!selectedMeeting) return;
    setActionLoading('decline');
    try {
      await meetingsService.declineMeeting(selectedMeeting.id);
      const updatedParticipants = (selectedMeeting.participants || []).map(p =>
        p.status === 'pending' ? { ...p, status: 'declined' as const } : p
      );
      updateMeeting(selectedMeeting.id, { participants: updatedParticipants });
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    if (!selectedMeeting) return;
    if (!confirm('Are you sure you want to delete this meeting?')) return;
    try {
      await meetingsService.deleteMeeting(selectedMeeting.id);
      setMeetings(meetings.filter(m => m.id !== selectedMeeting.id));
      setSelectedId('');
    } catch (err) { console.error(err); }
  };

  const handleApproveTasks = async () => {
    if (!selectedMeeting || selectedTaskIds.length === 0) return;
    try {
      await meetingsService.approveExtractedTasks(selectedMeeting.id, selectedTaskIds);
      const data = await meetingsService.getExtractedTasks(selectedMeeting.id);
      setExtractedTasks(data);
      setSelectedTaskIds([]);
    } catch (err) { console.error(err); }
  };

  const handleRejectTasks = async () => {
    if (!selectedMeeting || selectedTaskIds.length === 0) return;
    try {
      await meetingsService.rejectExtractedTasks(selectedMeeting.id, selectedTaskIds);
      const data = await meetingsService.getExtractedTasks(selectedMeeting.id);
      setExtractedTasks(data);
      setSelectedTaskIds([]);
    } catch (err) { console.error(err); }
  };

  const handleBulkApprove = async () => {
    if (!selectedMeeting) return;
    try {
      await meetingsService.bulkApprove(selectedMeeting.id);
      const data = await meetingsService.getExtractedTasks(selectedMeeting.id);
      setExtractedTasks(data);
      setSelectedTaskIds([]);
    } catch (err) { console.error(err); }
  };

  const toggleTaskSelection = (id: number) => {
    setSelectedTaskIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleUploadTranscript = async () => {
    if (!selectedMeeting || !transcriptText.trim()) return;
    setUploadingTranscript(true);
    try {
      const updated = await meetingsService.uploadTranscript(selectedMeeting.id, transcriptText);
      updateMeeting(selectedMeeting.id, { transcript: updated.transcript, analysis_status: updated.analysis_status });
      setTranscriptText('');
    } catch (err) { console.error('Failed to upload transcript:', err); }
    finally { setUploadingTranscript(false); }
  };

  const handleAnalyzeTranscript = async () => {
    if (!selectedMeeting) return;
    setActionLoading('analyze');
    try {
      const updated = await meetingsService.analyzeMeeting(selectedMeeting.id);
      updateMeeting(selectedMeeting.id, {
        ai_summary: updated.ai_summary,
        minutes_of_meeting: updated.minutes_of_meeting,
        analysis_status: updated.analysis_status,
        mom_executive_summary: updated.mom_executive_summary,
        mom_decisions: updated.mom_decisions,
        mom_risks: updated.mom_risks,
        mom_blockers: updated.mom_blockers,
      });
    } catch (err) { console.error('Failed to analyze meeting:', err); }
    finally { setActionLoading(null); }
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Video className="w-4 h-4 text-accent-blue" />;
      case 'event': return <Calendar className="w-4 h-4 text-accent-green" />;
      case 'reminder': return <Clock className="w-4 h-4 text-accent-orange" />;
      default: return <MapPin className="w-4 h-4 text-accent-green" />;
    }
  };

  const getAnalysisStatusBadge = (status?: string) => {
    switch (status) {
      case 'uploaded': return <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-accent-blue/10 border border-accent-blue/30 text-accent-blue">Uploaded</span>;
      case 'processing': return <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-accent-orange/10 border border-accent-orange/30 text-accent-orange">Processing</span>;
      case 'completed': return <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-accent-green/10 border border-accent-green/30 text-accent-green">Completed</span>;
      case 'failed': return <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-accent-red/10 border border-accent-red/30 text-accent-red">Failed</span>;
      default: return null;
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'info', label: 'Info', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'participants', label: 'Participants', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'timeline', label: 'Timeline', icon: <History className="w-3.5 h-3.5" /> },
    { key: 'transcript', label: 'Transcript', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { key: 'summary', label: 'Summary', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
    { key: 'minutes', label: 'Minutes', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: 'tasks', label: 'Tasks', icon: <ListChecks className="w-3.5 h-3.5" /> },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
        <span className="text-sm font-medium">Loading meetings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 max-w-md mx-auto text-center">
        <AlertCircle className="w-10 h-10 text-accent-red" />
        <div>
          <h3 className="text-sm font-bold text-text-primary mb-1">Failed to Load Meetings</h3>
          <p className="text-xs text-text-muted leading-relaxed">{error}</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold rounded-md shadow transition-colors">Retry</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto font-sans text-text-primary">
      {/* Left Column: Meeting List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-background-secondary p-4 rounded-lg border border-border-subtle shadow-sm gap-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-text-secondary" />
            Meetings ({meetings.length})
          </h3>
          <button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold rounded-md shadow transition-colors">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>

        <Input
          placeholder="Search meetings..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-xs h-8"
        />

        <div className="flex items-center gap-2">
          {(['all', 'today', 'weekly', 'monthly'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 text-xs font-bold rounded-md border capitalize", filter === f ? "bg-accent-blue/10 border-accent-blue text-accent-blue" : "bg-background-primary border-border-subtle text-text-secondary hover:border-text-muted")}>
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
          {meetings.length === 0 && (
            <div className="p-6 text-center text-xs text-text-muted">No meetings found.</div>
          )}
          {meetings.map((meet) => {
            const isSelected = meet.id === selectedId;
            return (
              <div key={meet.id} onClick={() => { setSelectedId(meet.id); setActiveTab('info'); }} className={cn("p-4 rounded-lg border cursor-pointer text-left transition-all bg-background-secondary hover:border-text-muted", isSelected ? "border-accent-blue shadow-lg" : "border-border-subtle")}>
                <h4 className="text-xs font-bold text-text-primary line-clamp-1 mb-2">{meet.title}</h4>
                <div className="flex flex-wrap items-center gap-3 text-2xs text-text-secondary">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-text-muted" /> {meet.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-text-muted" /> {meet.time}</span>
                  {meet.status && <span className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border", meet.status === 'completed' ? "bg-accent-green/10 border-accent-green/30 text-accent-green" : meet.status === 'cancelled' ? "bg-accent-red/10 border-accent-red/30 text-accent-red" : "bg-accent-blue/10 border-accent-blue/30 text-accent-blue")}>{meet.status}</span>}
                  {meet.analysis_status && getAnalysisStatusBadge(meet.analysis_status)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Meeting Detail */}
      <div className="lg:col-span-2 space-y-6">
        {selectedMeeting ? (
          <>
            {/* Header */}
            <div className="bg-background-secondary p-6 rounded-lg border border-border-subtle shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle/50 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider bg-background-primary border border-border-subtle px-2 py-0.5 rounded text-text-secondary">ID: {selectedMeeting.id}</span>
                    {selectedMeeting.status && <span className={cn("text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border", selectedMeeting.status === 'completed' ? "bg-accent-green/10 border-accent-green/30 text-accent-green" : selectedMeeting.status === 'cancelled' ? "bg-accent-red/10 border-accent-red/30 text-accent-red" : "bg-accent-blue/10 border-accent-blue/30 text-accent-blue")}>{selectedMeeting.status.replace('_', ' ')}</span>}
                    {getAnalysisStatusBadge(selectedMeeting.analysis_status)}
                  </div>
                  <h2 className="text-base font-bold font-sans mt-2">{selectedMeeting.title}</h2>
                  {selectedMeeting.owner_name && <p className="text-[11px] text-text-muted">Hosted by {selectedMeeting.owner_name}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={handleAccept} disabled={actionLoading === 'accept'} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-green hover:bg-accent-green/80 text-white text-xs font-semibold rounded-md shadow disabled:opacity-50 transition-colors">
                    {actionLoading === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Accept
                  </button>
                  <button onClick={handleDecline} disabled={actionLoading === 'decline'} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-red/80 hover:bg-accent-red text-white text-xs font-semibold rounded-md shadow disabled:opacity-50 transition-colors">
                    {actionLoading === 'decline' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} Decline
                  </button>
                  <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 border border-accent-red/30 text-accent-red hover:bg-accent-red/10 text-xs font-semibold rounded-md transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 overflow-x-auto">
                {tabs.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap", activeTab === tab.key ? "bg-accent-blue/10 text-accent-blue" : "text-text-secondary hover:text-text-primary hover:bg-background-primary")}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
              <div className="bg-background-secondary p-6 rounded-lg border border-border-subtle shadow-md space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-background-primary p-3 rounded border border-border-subtle/50 flex items-center gap-2">
                    {getMeetingIcon(selectedMeeting.type)}
                    <div>
                      <span className="text-[10px] text-text-muted block">Format</span>
                      <span className="font-semibold capitalize">{selectedMeeting.type}</span>
                    </div>
                  </div>
                  <div className="bg-background-primary p-3 rounded border border-border-subtle/50 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent-blue" />
                    <div>
                      <span className="text-[10px] text-text-muted block">Date</span>
                      <span className="font-semibold">{selectedMeeting.date}</span>
                    </div>
                  </div>
                  <div className="bg-background-primary p-3 rounded border border-border-subtle/50 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent-orange" />
                    <div>
                      <span className="text-[10px] text-text-muted block">Time</span>
                      <span className="font-semibold">{selectedMeeting.time}</span>
                    </div>
                  </div>
                </div>

                {(selectedMeeting.location || selectedMeeting.meeting_link || selectedMeeting.agenda) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {selectedMeeting.location && (
                      <div className="bg-background-primary p-3 rounded border border-border-subtle/50 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent-green" />
                        <div><span className="text-[10px] text-text-muted block">Location</span><span className="font-semibold">{selectedMeeting.location}</span></div>
                      </div>
                    )}
                    {selectedMeeting.meeting_link && (
                      <div className="bg-background-primary p-3 rounded border border-border-subtle/50 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-accent-blue" />
                        <div><span className="text-[10px] text-text-muted block">Link</span><a href={selectedMeeting.meeting_link} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-blue hover:underline truncate block max-w-[150px]">Join Meeting</a></div>
                      </div>
                    )}
                    {selectedMeeting.agenda && (
                      <div className="bg-background-primary p-3 rounded border border-border-subtle/50 flex items-start gap-2 sm:col-span-3">
                        <FileText className="w-4 h-4 text-accent-orange mt-0.5" />
                        <div><span className="text-[10px] text-text-muted block">Agenda</span><p className="font-semibold leading-relaxed">{selectedMeeting.agenda}</p></div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-background-primary p-4 rounded border border-border-subtle/50">
                  <Textarea placeholder="Meeting notes..." className="w-full h-32 resize-none bg-transparent border-none text-xs leading-relaxed" value={selectedMeeting.notes || ''} onChange={(e) => updateMeeting(selectedMeeting.id, { notes: e.target.value })} />
                </div>
              </div>
            )}

            {activeTab === 'participants' && (
              <div className="bg-background-secondary p-6 rounded-lg border border-border-subtle shadow-md space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2"><Users className="w-4 h-4 text-text-secondary" /> Participants ({selectedMeeting.participants?.length || 0})</h4>
                <div className="space-y-2">
                  {(selectedMeeting.participants || []).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-background-primary rounded border border-border-subtle/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-blue/10 flex items-center justify-center text-xs font-bold text-accent-blue">{p.user_name?.charAt(0) || '?'}</div>
                        <div>
                          <span className="text-xs font-semibold">{p.user_name}</span>
                          <span className={cn("ml-2 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded", p.status === 'accepted' ? "bg-accent-green/10 text-accent-green" : p.status === 'declined' ? "bg-accent-red/10 text-accent-red" : "bg-accent-orange/10 text-accent-orange")}>{p.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!selectedMeeting.participants || selectedMeeting.participants.length === 0) && <p className="text-xs text-text-muted text-center py-4">No participants yet.</p>}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="bg-background-secondary p-6 rounded-lg border border-border-subtle shadow-md space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2"><History className="w-4 h-4 text-text-secondary" /> Timeline</h4>
                {loadingTimeline ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent-blue" /></div>
                ) : timeline.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-8">No timeline events recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {timeline.map((event) => (
                      <div key={event.id} className="flex gap-3 p-3 bg-background-primary rounded border border-border-subtle/50">
                        <div className="w-2 h-2 rounded-full bg-accent-blue mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold text-accent-blue bg-accent-blue/10 px-1.5 py-0.5 rounded">{event.action}</span>
                            {event.user_name && <span className="text-[10px] text-text-muted">by {event.user_name}</span>}
                          </div>
                          <p className="text-xs text-text-secondary mt-1">{event.description}</p>
                          {event.created_at && <span className="text-[10px] text-text-muted mt-1 block">{new Date(event.created_at).toLocaleString()}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transcript' && (
              <div className="bg-background-secondary p-6 rounded-lg border border-border-subtle shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-text-secondary" /> Meeting Transcript</h4>
                  {getAnalysisStatusBadge(selectedMeeting.analysis_status)}
                </div>

                {selectedMeeting.transcript && (
                  <div className="bg-background-primary p-4 rounded border border-border-subtle/50 space-y-2">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Saved Transcript</span>
                    <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">{selectedMeeting.transcript}</p>
                  </div>
                )}

                <div className="bg-background-primary p-4 rounded border border-border-subtle/50 space-y-3">
                  <Textarea placeholder="Paste or type meeting transcript here..." className="w-full h-32 resize-none bg-transparent border-none text-xs" value={transcriptText} onChange={(e) => setTranscriptText(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={handleUploadTranscript} disabled={!transcriptText.trim() || uploadingTranscript} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold rounded-md shadow disabled:opacity-50 transition-colors">
                      {uploadingTranscript ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload Transcript
                    </button>
                    {(selectedMeeting.transcript || selectedMeeting.mom_summary) && (
                      <button onClick={handleAnalyzeTranscript} disabled={actionLoading === 'analyze'} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-orange/80 hover:bg-accent-orange text-white text-xs font-semibold rounded-md shadow disabled:opacity-50 transition-colors">
                        {actionLoading === 'analyze' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Analyze Meeting
                      </button>
                    )}
                  </div>
                </div>

                {!selectedMeeting.transcript && !transcriptText && (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-text-muted space-y-2">
                    <MessageSquare className="w-8 h-8 text-border-subtle animate-pulse" />
                    <p className="text-[11px] leading-relaxed">No transcript uploaded yet. Paste the meeting transcript above and click Upload.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="bg-background-secondary p-6 rounded-lg border border-border-subtle shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-accent-blue" /> AI Executive Summary</h4>
                  {getAnalysisStatusBadge(selectedMeeting.analysis_status)}
                </div>

                {loadingSummary ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent-blue" /></div>
                ) : summaryData?.summary ? (
                  <div className="bg-accent-blue/5 p-4 rounded border border-accent-blue/20 space-y-3">
                    <span className="text-[10px] font-bold text-accent-blue uppercase block">Executive Summary</span>
                    <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{summaryData.summary}</p>
                  </div>
                ) : selectedMeeting.ai_summary || selectedMeeting.mom_executive_summary ? (
                  <div className="bg-accent-blue/5 p-4 rounded border border-accent-blue/20 space-y-3">
                    <span className="text-[10px] font-bold text-accent-blue uppercase block">Executive Summary</span>
                    <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{selectedMeeting.ai_summary || selectedMeeting.mom_executive_summary}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-text-muted space-y-2">
                    <BrainCircuit className="w-8 h-8 text-border-subtle animate-pulse" />
                    <p className="text-[11px] leading-relaxed">No summary available. Upload a transcript or MOM, then run analysis.</p>
                  </div>
                )}

                {selectedMeeting.mom_executive_summary && selectedMeeting.mom_executive_summary !== summaryData?.summary && (
                  <div className="space-y-3">
                    {Array.isArray(selectedMeeting.mom_decisions) && selectedMeeting.mom_decisions.length > 0 && (
                      <div className="bg-accent-green/5 p-4 rounded border border-accent-green/20">
                        <span className="text-[10px] font-bold text-accent-green uppercase block mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Decisions</span>
                        <ul className="space-y-1">{selectedMeeting.mom_decisions.map((d: string, i: number) => <li key={i} className="text-xs text-text-secondary">• {d}</li>)}</ul>
                      </div>
                    )}

                    {Array.isArray(selectedMeeting.mom_risks) && selectedMeeting.mom_risks.length > 0 && (
                      <div className="bg-accent-red/5 p-4 rounded border border-accent-red/20">
                        <span className="text-[10px] font-bold text-accent-red uppercase block mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Risks</span>
                        <ul className="space-y-1">{selectedMeeting.mom_risks.map((r: string, i: number) => <li key={i} className="text-xs text-text-secondary">• {r}</li>)}</ul>
                      </div>
                    )}

                    {Array.isArray(selectedMeeting.mom_blockers) && selectedMeeting.mom_blockers.length > 0 && (
                      <div className="bg-accent-orange/5 p-4 rounded border border-accent-orange/20">
                        <span className="text-[10px] font-bold text-accent-orange uppercase block mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Blockers</span>
                        <ul className="space-y-1">{selectedMeeting.mom_blockers.map((b: string, i: number) => <li key={i} className="text-xs text-text-secondary">• {b}</li>)}</ul>
                      </div>
                    )}

                    {Array.isArray(selectedMeeting.mom_followups) && selectedMeeting.mom_followups.length > 0 && (
                      <div className="bg-accent-blue/5 p-4 rounded border border-accent-blue/20">
                        <span className="text-[10px] font-bold text-accent-blue uppercase block mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Follow-ups</span>
                        <ul className="space-y-1">{selectedMeeting.mom_followups.map((f: string, i: number) => <li key={i} className="text-xs text-text-secondary">• {f}</li>)}</ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'minutes' && (
              <div className="bg-background-secondary p-6 rounded-lg border border-border-subtle shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold flex items-center gap-2"><BookOpen className="w-4 h-4 text-accent-blue" /> Minutes of Meeting</h4>
                  {getAnalysisStatusBadge(selectedMeeting.analysis_status)}
                </div>

                <div className="bg-background-primary p-4 rounded border border-border-subtle/50 space-y-3">
                  <Textarea placeholder="Paste or type meeting minutes here..." className="w-full h-24 resize-none bg-transparent border-none text-xs" value={momText} onChange={(e) => setMomText(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={handleUploadMoM} disabled={!momText.trim() || actionLoading === 'mom'} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold rounded-md shadow disabled:opacity-50 transition-colors">
                      {actionLoading === 'mom' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload MOM
                    </button>
                    {selectedMeeting.mom_summary && (
                      <button onClick={handleAnalyzeMom} disabled={analyzingMom} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-orange/80 hover:bg-accent-orange text-white text-xs font-semibold rounded-md shadow disabled:opacity-50 transition-colors">
                        {analyzingMom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Analyze MOM
                      </button>
                    )}
                  </div>
                </div>

                {selectedMeeting.mom_summary && (
                  <div className="bg-background-primary p-4 rounded border border-border-subtle/50 space-y-2">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Saved Summary</span>
                    <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">{selectedMeeting.mom_summary}</p>
                  </div>
                )}

                {loadingMomData ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent-blue" /></div>
                ) : momData?.mom ? (
                  <div className="space-y-3">
                    {momData.mom.summary && (
                      <div className="bg-accent-blue/5 p-4 rounded border border-accent-blue/20">
                        <span className="text-[10px] font-bold text-accent-blue uppercase block mb-1">Summary</span>
                        <p className="text-xs text-text-secondary leading-relaxed">{momData.mom.summary}</p>
                      </div>
                    )}
                    {Array.isArray(momData.mom.key_points) && momData.mom.key_points.length > 0 && (
                      <div className="bg-accent-green/5 p-4 rounded border border-accent-green/20">
                        <span className="text-[10px] font-bold text-accent-green uppercase block mb-1">Key Points</span>
                        <ul className="space-y-1">{momData.mom.key_points.map((p: string, i: number) => <li key={i} className="text-xs text-text-secondary">• {p}</li>)}</ul>
                      </div>
                    )}
                    {Array.isArray(momData.mom.decisions) && momData.mom.decisions.length > 0 && (
                      <div className="bg-accent-green/5 p-4 rounded border border-accent-green/20">
                        <span className="text-[10px] font-bold text-accent-green uppercase block mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Decisions</span>
                        <ul className="space-y-1">{momData.mom.decisions.map((d: string, i: number) => <li key={i} className="text-xs text-text-secondary">• {d}</li>)}</ul>
                      </div>
                    )}
                    {Array.isArray(momData.mom.action_items) && momData.mom.action_items.length > 0 && (
                      <div className="bg-accent-orange/5 p-4 rounded border border-accent-orange/20">
                        <span className="text-[10px] font-bold text-accent-orange uppercase block mb-1 flex items-center gap-1"><ListChecks className="w-3 h-3" /> Action Items</span>
                        <ul className="space-y-1">{momData.mom.action_items.map((a: any, i: number) => <li key={i} className="text-xs text-text-secondary">• {a.title}{a.suggested_owner ? ` (${a.suggested_owner})` : ''}</li>)}</ul>
                      </div>
                    )}
                    {Array.isArray(momData.mom.risks) && momData.mom.risks.length > 0 && (
                      <div className="bg-accent-red/5 p-4 rounded border border-accent-red/20">
                        <span className="text-[10px] font-bold text-accent-red uppercase block mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Risks</span>
                        <ul className="space-y-1">{momData.mom.risks.map((r: string, i: number) => <li key={i} className="text-xs text-text-secondary">• {r}</li>)}</ul>
                      </div>
                    )}
                    {Array.isArray(momData.mom.blockers) && momData.mom.blockers.length > 0 && (
                      <div className="bg-accent-orange/5 p-4 rounded border border-accent-orange/20">
                        <span className="text-[10px] font-bold text-accent-orange uppercase block mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Blockers</span>
                        <ul className="space-y-1">{momData.mom.blockers.map((b: string, i: number) => <li key={i} className="text-xs text-text-secondary">• {b}</li>)}</ul>
                      </div>
                    )}
                  </div>
                ) : selectedMeeting.mom_executive_summary ? (
                  <div className="space-y-3">
                    <div className="bg-accent-blue/5 p-4 rounded border border-accent-blue/20">
                      <span className="text-[10px] font-bold text-accent-blue uppercase block mb-1">Executive Summary</span>
                      <p className="text-xs text-text-secondary leading-relaxed">{selectedMeeting.mom_executive_summary}</p>
                    </div>
                    {Array.isArray(selectedMeeting.mom_decisions) && selectedMeeting.mom_decisions.length > 0 && (
                      <div className="bg-accent-green/5 p-4 rounded border border-accent-green/20">
                        <span className="text-[10px] font-bold text-accent-green uppercase block mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Decisions</span>
                        <ul className="space-y-1">{selectedMeeting.mom_decisions.map((d: string, i: number) => <li key={i} className="text-xs text-text-secondary">• {d}</li>)}</ul>
                      </div>
                    )}
                    {Array.isArray(selectedMeeting.mom_risks) && selectedMeeting.mom_risks.length > 0 && (
                      <div className="bg-accent-red/5 p-4 rounded border border-accent-red/20">
                        <span className="text-[10px] font-bold text-accent-red uppercase block mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Risks</span>
                        <ul className="space-y-1">{selectedMeeting.mom_risks.map((r: string, i: number) => <li key={i} className="text-xs text-text-secondary">• {r}</li>)}</ul>
                      </div>
                    )}
                    {Array.isArray(selectedMeeting.mom_blockers) && selectedMeeting.mom_blockers.length > 0 && (
                      <div className="bg-accent-orange/5 p-4 rounded border border-accent-orange/20">
                        <span className="text-[10px] font-bold text-accent-orange uppercase block mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Blockers</span>
                        <ul className="space-y-1">{selectedMeeting.mom_blockers.map((b: string, i: number) => <li key={i} className="text-xs text-text-secondary">• {b}</li>)}</ul>
                      </div>
                    )}
                    {Array.isArray(selectedMeeting.mom_followups) && selectedMeeting.mom_followups.length > 0 && (
                      <div className="bg-accent-blue/5 p-4 rounded border border-accent-blue/20">
                        <span className="text-[10px] font-bold text-accent-blue uppercase block mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Follow-ups</span>
                        <ul className="space-y-1">{selectedMeeting.mom_followups.map((f: string, i: number) => <li key={i} className="text-xs text-text-secondary">• {f}</li>)}</ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-text-muted space-y-2">
                    <BookOpen className="w-8 h-8 text-border-subtle animate-pulse" />
                    <p className="text-[11px] leading-relaxed">No MOM uploaded yet. Paste meeting minutes above and click Upload MOM.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="bg-background-secondary p-6 rounded-lg border border-border-subtle shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold flex items-center gap-2"><ListChecks className="w-4 h-4 text-text-secondary" /> Extracted Tasks ({extractedTasks.length})</h4>
                  {selectedTaskIds.length > 0 && (
                    <div className="flex gap-2">
                      <button onClick={handleApproveTasks} className="flex items-center gap-1 px-2 py-1 bg-accent-green hover:bg-accent-green/80 text-white text-[10px] font-bold rounded transition-colors">
                        <Check className="w-3 h-3" /> Approve ({selectedTaskIds.length})
                      </button>
                      <button onClick={handleRejectTasks} className="flex items-center gap-1 px-2 py-1 bg-accent-red/80 hover:bg-accent-red text-white text-[10px] font-bold rounded transition-colors">
                        <X className="w-3 h-3" /> Reject ({selectedTaskIds.length})
                      </button>
                    </div>
                  )}
                </div>

                {loadingTasks ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent-blue" /></div>
                ) : extractedTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-text-muted space-y-2">
                    <ClipboardList className="w-8 h-8 text-border-subtle" />
                    <p className="text-[11px]">No extracted tasks. Upload transcript or MOM first, then analyze.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {extractedTasks.map((task) => (
                      <div key={task.id} className={cn("flex items-start gap-3 p-3 rounded border transition-colors", task.status === 'approved' ? "bg-accent-green/5 border-accent-green/20" : task.status === 'rejected' ? "bg-accent-red/5 border-accent-red/20 opacity-60" : "bg-background-primary border-border-subtle/50 hover:border-text-muted")}>
                        <input type="checkbox" checked={selectedTaskIds.includes(Number(task.id))} onChange={() => toggleTaskSelection(Number(task.id))} className="mt-1 rounded border-border-subtle" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{task.title}</span>
                            <span className={cn("text-[9px] uppercase font-bold px-1.5 py-0.5 rounded", task.status === 'approved' ? "bg-accent-green/10 text-accent-green" : task.status === 'rejected' ? "bg-accent-red/10 text-accent-red" : "bg-accent-orange/10 text-accent-orange")}>{task.status}</span>
                            <span className="text-[9px] text-text-muted">{Math.round(task.confidence * 100)}% confidence</span>
                          </div>
                          {task.description && <p className="text-[11px] text-text-muted mt-1">{task.description}</p>}
                          <div className="flex gap-3 mt-1 text-[10px] text-text-muted">
                            {task.priority && <span>Priority: {task.priority}</span>}
                            {task.suggested_owner && <span>Owner: {task.suggested_owner}</span>}
                            {task.deadline && <span>Due: {task.deadline}</span>}
                          </div>
                        </div>
                        {task.status === 'approved' && task.real_task_id && (
                          <span className="text-[9px] text-accent-green flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Created</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-background-secondary p-8 rounded-lg border border-border-subtle text-center text-text-muted">Select a meeting from the list on the left.</div>
        )}
      </div>

      {/* Create Meeting Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
            <DialogDescription>Create a new meeting event and send invites to the team.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-text-secondary uppercase">Meeting Title</label>
              <Input type="text" placeholder="Q3 Planning Sync" {...register('title')} className={errors.title ? 'border-accent-red' : ''} />
              {errors.title && <span className="text-[10px] text-accent-red">{errors.title.message as string}</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-text-secondary uppercase">Date</label>
                <Input type="date" {...register('date')} className={errors.date ? 'border-accent-red' : ''} />
              </div>
              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-text-secondary uppercase">Time</label>
                <Input type="time" {...register('time')} className={errors.time ? 'border-accent-red' : ''} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-text-secondary uppercase">Meeting Format</label>
              <select className="w-full h-10 bg-background-secondary border border-border-subtle rounded-md px-3 text-sm text-text-primary outline-none" {...register('type')}>
                <option value="meeting">Meeting (Video/Call)</option>
                <option value="event">Event (In-Person)</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
            <DialogFooter className="pt-2">
              <button type="button" onClick={() => setCreateModalOpen(false)} className="px-3 py-1.5 border border-border-subtle text-text-secondary hover:text-text-primary text-2xs font-semibold rounded transition-all">Cancel</button>
              <button type="submit" className="px-3 py-1.5 bg-accent-blue hover:bg-accent-blue-hover text-white text-2xs font-semibold rounded shadow transition-all">Schedule Event</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
