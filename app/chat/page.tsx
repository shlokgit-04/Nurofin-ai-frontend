'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { aiService, ChatMessage } from '@/services/ai';
import { 
  BrainCircuit, 
  Send, 
  Plus, 
  Mic, 
  MicOff, 
  Sparkles, 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Music, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AiAssistantPage() {
  const { aiStatus, setAiStatus } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello Vincent, I am your Executive Operating System assistant. Ask me questions about Q3 budgets, Acme developer invoices, compliance certification checklists, or Project Delta milestones.' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string; size: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggested prompts
  const suggestedPrompts = [
    "Explain Q3 Infrastructure budget limits",
    "Summary of Project Delta authentication milestones",
    "Verify overdue Acme Corp invoice details",
    "Check Q2 compliance certification checklist",
  ];

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, aiStatus]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim() && attachedFiles.length === 0) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      files: attachedFiles.length > 0 ? attachedFiles : undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setAttachedFiles([]);
    setPlusMenuOpen(false);
    setAiStatus('thinking');

    try {
      const response = await aiService.sendChatMessage([...messages, userMsg]);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error retrieving AI suggestions. Please try again.' }]);
    } finally {
      setAiStatus('idle');
    }
  };

  const handleAttachFile = (fileType: string, extension: string) => {
    const mockFile = {
      name: `Document_Report.${extension}`,
      type: fileType,
      size: '1.2 MB',
    };
    setAttachedFiles(prev => [...prev, mockFile]);
    setPlusMenuOpen(false);
  };

  const removeAttachedFile = (idx: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'excel': return <FileSpreadsheet className="w-3.5 h-3.5 text-accent-green" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5 text-accent-blue" />;
      case 'audio': return <Music className="w-3.5 h-3.5 text-accent-orange" />;
      default: return <FileText className="w-3.5 h-3.5 text-accent-red" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto border border-border-subtle bg-background-secondary rounded-lg shadow-xl overflow-hidden font-sans text-text-primary">
      
      {/* AI Assistant Chat Room Header */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-card/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent-blue/10 rounded-lg text-accent-blue">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold">Executive Operating Copilot</h3>
            <span className="text-[10px] text-text-secondary flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" /> 256-bit encryption active
            </span>
          </div>
        </div>

        {aiStatus !== 'idle' && (
          <div className="flex items-center gap-1.5 text-2xs text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-full border border-accent-blue/20 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            AI is writing...
          </div>
        )}
      </div>

      {/* Message Feed Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-background-primary/10">
        {messages.map((msg, i) => (
          <div 
            key={i}
            className={cn(
              "flex gap-3 max-w-[80%] rounded-lg p-3.5 text-xs leading-relaxed text-left",
              msg.role === 'user' 
                ? "bg-accent-blue/15 border border-accent-blue/20 ml-auto flex-row-reverse" 
                : "bg-surface-card border border-border-subtle mr-auto"
            )}
          >
            <div className="p-1.5 rounded-md bg-background-primary border border-border-subtle h-fit flex-shrink-0">
              {msg.role === 'user' ? <Paperclip className="w-4 h-4 text-text-secondary" /> : <BrainCircuit className="w-4 h-4 text-accent-blue" />}
            </div>
            
            <div className="space-y-2">
              <p className="text-text-primary whitespace-pre-wrap">{msg.content}</p>

              {/* Render Attached Files inside messages */}
              {msg.files && (
                <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle/50">
                  {msg.files.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2 bg-background-primary px-2.5 py-1.5 rounded border border-border-subtle/50 text-[10px]">
                      {getFileIcon(f.type)}
                      <span className="font-semibold text-text-primary truncate max-w-[200px]">{f.name}</span>
                      <span className="text-text-muted">({f.size})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {aiStatus !== 'idle' && (
          <div className="flex gap-3 bg-surface-card border border-border-subtle mr-auto max-w-[80%] rounded-lg p-4 text-xs italic text-text-secondary">
            <Loader2 className="w-4 h-4 animate-spin text-accent-blue" /> Thinking...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Prompts Grid */}
      {messages.length === 1 && (
        <div className="px-4 py-3 border-t border-border-subtle/50 space-y-2 bg-surface-card/10">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">Suggested Questions</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedPrompts.map((prompt, pi) => (
              <button
                key={pi}
                onClick={() => handleSend(prompt)}
                className="p-2.5 bg-background-primary border border-border-subtle rounded text-xs text-text-secondary hover:text-text-primary hover:border-accent-blue/30 text-left truncate transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Panel with attachments & voice simulation */}
      <div className="p-4 border-t border-border-subtle bg-surface-card/30 space-y-3">
        {/* Attached files pills preview */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, fi) => (
              <div key={fi} className="flex items-center gap-2 bg-background-primary px-2.5 py-1 rounded border border-border-subtle text-[10px]">
                {getFileIcon(file.type)}
                <span className="font-semibold truncate max-w-[150px]">{file.name}</span>
                <button 
                  onClick={() => removeAttachedFile(fi)}
                  className="text-accent-red hover:text-red-400 font-bold ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 relative">
          {/* Plus Add Upload Menu button */}
          <div className="relative">
            <button
              onClick={() => setPlusMenuOpen(!plusMenuOpen)}
              className="p-2.5 bg-background-primary border border-border-subtle text-text-secondary hover:text-text-primary rounded-md transition-colors"
              type="button"
              aria-label="Upload document attachments"
            >
              <Plus className={cn("w-4 h-4 transition-transform", plusMenuOpen ? "rotate-45" : "")} />
            </button>

            {plusMenuOpen && (
              <div className="absolute bottom-12 left-0 w-44 bg-background-secondary border border-border-subtle rounded-md shadow-2xl z-50 overflow-hidden divide-y divide-border-subtle/50 text-2xs font-sans">
                <button 
                  onClick={() => handleAttachFile('pdf', 'pdf')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-accent-red" /> PDF Document
                </button>
                <button 
                  onClick={() => handleAttachFile('docx', 'docx')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-accent-blue" /> DOCX Word File
                </button>
                <button 
                  onClick={() => handleAttachFile('excel', 'xlsx')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors text-left"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-accent-green" /> Excel Spreadsheet
                </button>
                <button 
                  onClick={() => handleAttachFile('image', 'png')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors text-left"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-accent-blue" /> PNG/JPEG Image
                </button>
                <button 
                  onClick={() => handleAttachFile('audio', 'mp3')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors text-left"
                >
                  <Music className="w-3.5 h-3.5 text-accent-orange" /> Audio Recording
                </button>
              </div>
            )}
          </div>

          {/* Text Input area */}
          <input
            type="text"
            placeholder={micActive ? "Listening to voice input..." : "Ask AI about finances, ledgers, strategy review documents..."}
            className="flex-1 h-10 bg-background-primary border border-border-subtle rounded-md px-4 text-xs text-text-primary placeholder-text-muted focus:border-accent-blue transition-colors outline-none font-sans"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={micActive}
          />

          {/* Voice Mic Toggle */}
          <button
            onClick={() => setMicActive(!micActive)}
            className={cn(
              "p-2.5 rounded-md border transition-all",
              micActive 
                ? "bg-accent-red/20 border-accent-red text-accent-red animate-pulse" 
                : "bg-background-primary border-border-subtle text-text-secondary hover:text-text-primary"
            )}
            type="button"
            aria-label="Toggle voice input"
          >
            {micActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send query button */}
          <button
            onClick={() => handleSend()}
            className="p-2.5 bg-accent-blue hover:bg-accent-blue-hover text-white rounded-md transition-colors"
            type="button"
            aria-label="Send message query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
