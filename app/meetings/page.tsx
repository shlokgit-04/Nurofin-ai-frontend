'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { Meeting } from '@/types';
import { meetingsService } from '@/services/meetings';
import { 
  Users, 
  Clock, 
  Calendar, 
  Video, 
  MapPin, 
  Sparkles, 
  FileText, 
  Plus, 
  Loader2,
  Save,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function MeetingsPage() {
  const { meetings, setMeetings, addMeeting, updateMeeting } = useStore();
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMoM, setLoadingMoM] = useState(false);
  const [generatedMoM, setGeneratedMoM] = useState<string | null>(null);
  const [momOpen, setMomOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadMeetings() {
      try {
        setLoading(true);
        setError(null);
        const data = await meetingsService.getMeetings();
        if (active) {
          setMeetings(data);
          if (data.length > 0) {
            setSelectedId(data[0].id);
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to load meetings');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadMeetings();
    return () => {
      active = false;
    };
  }, [setMeetings]);

  const selectedMeeting = meetings.find(m => m.id === selectedId) || meetings[0];

  const handleNotesChange = (text: string) => {
    if (!selectedMeeting) return;
    updateMeeting(selectedMeeting.id, { notes: text });
  };

  const handleGenerateMoM = async () => {
    if (!selectedMeeting) return;
    setLoadingMoM(true);
    try {
      const summary = await meetingsService.getMeetingSummary(selectedMeeting.title);
      setGeneratedMoM(summary);
      setMomOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMoM(false);
    }
  };

  const handleSaveMoM = () => {
    if (!selectedMeeting || !generatedMoM) return;
    updateMeeting(selectedMeeting.id, { momText: generatedMoM });
    setMomOpen(false);
    setGeneratedMoM(null);
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-accent-blue" />;
      default: return <MapPin className="w-4 h-4 text-accent-green" />;
    }
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto font-sans text-text-primary">
      
      {/* Left Column: Meetings directory roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-background-secondary p-4 rounded-lg border border-border-subtle shadow-sm">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-text-secondary" />
            Meeting Syncs ({meetings.length})
          </h3>
        </div>

        <div className="space-y-3">
          {meetings.map((meet) => {
            const isSelected = meet.id === selectedId;
            return (
              <div
                key={meet.id}
                onClick={() => setSelectedId(meet.id)}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer text-left transition-all bg-background-secondary hover:border-text-muted",
                  isSelected ? "border-accent-blue shadow-lg" : "border-border-subtle"
                )}
              >
                <h4 className="text-xs font-bold text-text-primary line-clamp-1 mb-2">{meet.title}</h4>
                <div className="flex flex-wrap items-center gap-3 text-2xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" /> {meet.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-text-muted" /> {meet.time}
                  </span>
                  <span className="flex items-center gap-1 uppercase font-bold text-[9px] bg-background-primary px-1.5 py-0.5 rounded border border-border-subtle">
                    {meet.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Meeting details, notes editor & MoM generation */}
      <div className="lg:col-span-2 space-y-6">
        {selectedMeeting ? (
          <>
            {/* Top overview card */}
            <div className="bg-background-secondary p-6 rounded-lg border border-border-subtle shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle/50 pb-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold tracking-wider bg-background-primary border border-border-subtle px-2 py-0.5 rounded text-text-secondary">
                    Meeting ID: {selectedMeeting.id}
                  </span>
                  <h2 className="text-base font-bold font-sans mt-2">{selectedMeeting.title}</h2>
                </div>
                
                {/* Generate MoM button */}
                <button
                  onClick={handleGenerateMoM}
                  disabled={loadingMoM}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold rounded-md shadow disabled:opacity-50 transition-colors"
                >
                  {loadingMoM ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate MoM
                </button>
              </div>

              {/* Attributes grid */}
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
                    <span className="text-[10px] text-text-muted block">Scheduled Date</span>
                    <span className="font-semibold">{selectedMeeting.date}</span>
                  </div>
                </div>
                <div className="bg-background-primary p-3 rounded border border-border-subtle/50 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent-orange" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Duration</span>
                    <span className="font-semibold">{selectedMeeting.time} ({selectedMeeting.duration})</span>
                  </div>
                </div>
              </div>

              {/* Roster of attendees */}
              <div className="space-y-2">
                <h4 className="text-2xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-text-muted" /> Attendees ({selectedMeeting.attendees.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMeeting.attendees.map((att, idx) => (
                    <span 
                      key={idx} 
                      className="text-2xs bg-background-primary border border-border-subtle/60 px-2.5 py-1 rounded-full font-semibold"
                    >
                      {att}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Two-Pane Notes Editor & Saved MoM summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Meeting Notes Editor */}
              <div className="bg-background-secondary border border-border-subtle rounded-lg shadow-md flex flex-col h-[320px]">
                <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                  <h3 className="text-2xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-accent-green" /> Live Notes Editor
                  </h3>
                  <span className="text-[9px] text-text-muted italic flex items-center gap-1">
                    <Save className="w-3.5 h-3.5" /> Autosaved
                  </span>
                </div>
                <div className="p-4 flex-1">
                  <Textarea
                    placeholder="Capture conversation topics, raw thoughts, and timeline milestones here..."
                    className="w-full h-full resize-none bg-background-primary border-border-subtle text-xs leading-relaxed"
                    value={selectedMeeting.notes || ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Generated Minutes of Meeting display */}
              <div className="bg-background-secondary border border-border-subtle rounded-lg shadow-md flex flex-col h-[320px]">
                <div className="p-4 border-b border-border-subtle">
                  <h3 className="text-2xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent-blue" /> Saved AI Minutes (MoM)
                  </h3>
                </div>
                <div className="p-4 flex-1 overflow-y-auto bg-background-primary/30">
                  {selectedMeeting.momText ? (
                    <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                      {selectedMeeting.momText}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-text-muted space-y-2">
                      <Sparkles className="w-8 h-8 text-border-subtle animate-pulse" />
                      <p className="text-[11px] leading-relaxed">
                        No summary generated yet. Click the **Generate MoM** button above to generate a meeting recap.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="bg-background-secondary p-8 rounded-lg border border-border-subtle text-center text-text-muted">
            Select a meeting from the schedule roster on the left.
          </div>
        )}
      </div>

      {/* Generated MoM Preview Dialog */}
      {generatedMoM && (
        <Dialog open={momOpen} onOpenChange={setMomOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>AI Generated Minutes of Meeting (MoM)</DialogTitle>
              <DialogDescription>
                Review and save the automatic strategic meeting summary below.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-background-primary p-4 rounded border border-border-subtle/50 text-xs text-text-secondary whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-mono">
              {generatedMoM}
            </div>

            <DialogFooter className="gap-2">
              <button
                onClick={() => setMomOpen(false)}
                className="px-3 py-1.5 border border-border-subtle text-text-secondary hover:text-text-primary text-2xs font-semibold rounded"
              >
                Discard
              </button>
              <button
                onClick={handleSaveMoM}
                className="px-3 py-1.5 bg-accent-green hover:bg-accent-green-light text-white text-2xs font-semibold rounded shadow transition-all"
              >
                Save MoM Summary
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
