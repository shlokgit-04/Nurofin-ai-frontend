'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { aiService, ChatMessage, AI_PROVIDERS } from '@/services/ai';
import { conversationsService, Conversation } from '@/services/conversations';
import {
  BrainCircuit,
  Send,
  Plus,
  Mic,
  MicOff,
  Paperclip,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Music,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Settings,
  X,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Trash2,
  Pencil,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';

const WELCOME_MSG: ChatMessage = {
  role: 'assistant',
  content: 'Hello! I am your Executive Operating System assistant. Ask me questions about your projects, tasks, meetings, schedule, or any business data.',
};

export default function AiAssistantPage() {
  const { aiStatus, setAiStatus, selectedProvider, selectedModel, setSelectedProvider, setSelectedModel } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [inputVal, setInputVal] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string; size: string }[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameVal, setRenameVal] = useState('');

  const suggestedPrompts = [
    "Show me all projects",
    "What are my tasks today?",
    "Show today's schedule",
    "Good morning briefing",
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, aiStatus]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoadingConvs(true);
      const list = await conversationsService.list();
      setConversations(list);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const loadConversation = async (conv: Conversation) => {
    if (aiStatus !== 'idle') return;
    try {
      const full = await conversationsService.get(conv.id);
      const loaded: ChatMessage[] = (full.messages || []).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      if (loaded.length === 0) loaded.push(WELCOME_MSG);
      setMessages(loaded);
      setActiveConvId(conv.id);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const createNewConversation = async () => {
    if (aiStatus !== 'idle') return;
    try {
      const conv = await conversationsService.create('New Conversation');
      setConversations(prev => [conv, ...prev]);
      setActiveConvId(conv.id);
      setMessages([WELCOME_MSG]);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const deleteConversation = async (id: number) => {
    try {
      await conversationsService.delete(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([WELCOME_MSG]);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const startRename = (conv: Conversation) => {
    setRenamingId(conv.id);
    setRenameVal(conv.title);
  };

  const confirmRename = async (id: number) => {
    if (!renameVal.trim()) return;
    try {
      await conversationsService.update(id, renameVal.trim());
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: renameVal.trim() } : c));
      setRenamingId(null);
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!activeConvId) return;
    try {
      await conversationsService.addMessage(activeConvId, role, content);
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  };

  const handleSend = useCallback(async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim() && attachedFiles.length === 0) return;

    let convId = activeConvId;
    if (!convId) {
      try {
        const title = text.length > 50 ? text.substring(0, 50) + '...' : text;
        const conv = await conversationsService.create(title);
        setConversations(prev => [conv, ...prev]);
        convId = conv.id;
        setActiveConvId(conv.id);
      } catch (err) {
        console.error('Failed to create conversation:', err);
        return;
      }
    }

    const finalConvId = convId;
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

    saveMessage('user', text);

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const stream = aiService.sendChatMessageStream(text, {
        provider: selectedProvider,
        model: selectedModel,
      });

      let fullContent = '';
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: fullContent };
          return updated;
        });
      }

      if (!fullContent) {
        fullContent = "I'm sorry, I couldn't process your request.";
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: fullContent };
          return updated;
        });
      }

      saveMessage('assistant', fullContent);
    } catch (err) {
      console.error(err);
      const errContent = 'Error retrieving AI suggestions. Please try again.';
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: errContent };
        return updated;
      });
      saveMessage('assistant', errContent);
    } finally {
      setAiStatus('idle');
    }
  }, [inputVal, attachedFiles, activeConvId, selectedProvider, selectedModel, setAiStatus]);

  const handleRegenerate = useCallback(async (lastUserIdx: number) => {
    const lastUserMsg = messages[lastUserIdx];
    if (!lastUserMsg) return;

    setMessages(prev => prev.slice(0, lastUserIdx + 1));
    setAiStatus('thinking');

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const stream = aiService.sendChatMessageStream(lastUserMsg.content, {
        provider: selectedProvider,
        model: selectedModel,
      });

      let fullContent = '';
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: fullContent };
          return updated;
        });
      }

      if (activeConvId && fullContent) {
        saveMessage('assistant', fullContent);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Error retrieving AI suggestions. Please try again.' };
        return updated;
      });
    } finally {
      setAiStatus('idle');
    }
  }, [messages, activeConvId, selectedProvider, selectedModel, setAiStatus]);

  const handleCopyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleAttachFile = (fileType: string, extension: string) => {
    const simulatedFile = {
      name: `Document_Report.${extension}`,
      type: fileType,
      size: '1.2 MB',
    };
    setAttachedFiles(prev => [...prev, simulatedFile]);
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

  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider);
  const currentModel = currentProvider?.models.find(m => m.id === selectedModel);

  const findLastUserIdx = (msgIdx: number): number => {
    for (let i = msgIdx - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return i;
    }
    return -1;
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] max-w-6xl mx-auto border border-border-subtle bg-background-secondary rounded-lg shadow-xl overflow-hidden font-sans text-text-primary">

      {/* Conversation Sidebar */}
      {sidebarOpen && (
        <div className="w-64 border-r border-border-subtle bg-background-secondary flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-border-subtle flex items-center justify-between">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Conversations</span>
            <button
              onClick={createNewConversation}
              disabled={aiStatus !== 'idle'}
              className="p-1.5 rounded-md bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 transition-colors disabled:opacity-50"
              title="New Conversation"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="p-4 text-center text-text-muted text-2xs">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                Loading...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-text-muted text-2xs">
                No conversations yet.
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => !renamingId && loadConversation(conv)}
                  className={cn(
                    "group px-3 py-2.5 border-b border-border-subtle/50 cursor-pointer transition-colors",
                    activeConvId === conv.id
                      ? "bg-accent-blue/10 border-l-2 border-l-accent-blue"
                      : "hover:bg-surface-card/50 border-l-2 border-l-transparent"
                  )}
                >
                  {renamingId === conv.id ? (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <input
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') confirmRename(conv.id);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        className="flex-1 bg-background-primary border border-border-subtle rounded px-2 py-1 text-2xs text-text-primary outline-none"
                        autoFocus
                      />
                      <button onClick={() => confirmRename(conv.id)} className="p-1 text-accent-green hover:text-green-400">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={() => setRenamingId(null)} className="p-1 text-text-muted hover:text-text-primary">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-text-muted flex-shrink-0" />
                        <span className="text-2xs text-text-primary truncate flex-1">{conv.title}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-text-muted">{conv.message_count} messages</span>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button onClick={() => startRename(conv)} className="p-0.5 text-text-muted hover:text-accent-blue">
                            <Pencil className="w-2.5 h-2.5" />
                          </button>
                          <button onClick={() => deleteConversation(conv.id)} className="p-0.5 text-text-muted hover:text-accent-red">
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-card/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-card transition-colors"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
            <div className="p-2.5 bg-accent-blue/10 rounded-lg text-accent-blue">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold">Executive Operating Copilot</h3>
              <span className="text-[10px] text-text-secondary flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                {currentModel?.name || 'AI Ready'} &middot; 256-bit encryption
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aiStatus !== 'idle' && (
              <div className="flex items-center gap-1.5 text-2xs text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-full border border-accent-blue/20 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Thinking...
              </div>
            )}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 rounded-md border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-card transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Drawer */}
        {settingsOpen && (
          <div className="border-b border-border-subtle bg-surface-card/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary">Provider & Model</span>
              <button onClick={() => setSettingsOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Provider</label>
                <div className="relative">
                  <select
                    value={selectedProvider}
                    onChange={(e) => {
                      setSelectedProvider(e.target.value);
                      const provider = AI_PROVIDERS.find(p => p.id === e.target.value);
                      if (provider?.models[0]) setSelectedModel(provider.models[0].id);
                    }}
                    className="w-full h-9 bg-background-primary border border-border-subtle rounded-md px-3 text-xs text-text-primary appearance-none cursor-pointer focus:border-accent-blue transition-colors outline-none pr-8"
                  >
                    {AI_PROVIDERS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Model</label>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full h-9 bg-background-primary border border-border-subtle rounded-md px-3 text-xs text-text-primary appearance-none cursor-pointer focus:border-accent-blue transition-colors outline-none pr-8"
                  >
                    {currentProvider?.models.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-background-primary/10">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            const lastUserIdx = !isUser ? findLastUserIdx(i) : -1;

            return (
              <div key={i} className={cn("flex gap-3 max-w-[85%] rounded-lg p-3.5 text-xs leading-relaxed text-left", isUser ? "bg-accent-blue/15 border border-accent-blue/20 ml-auto flex-row-reverse" : "bg-surface-card border border-border-subtle mr-auto")}>
                <div className="p-1.5 rounded-md bg-background-primary border border-border-subtle h-fit flex-shrink-0">
                  {isUser ? <Paperclip className="w-4 h-4 text-text-secondary" /> : <BrainCircuit className="w-4 h-4 text-accent-blue" />}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  {msg.content ? (
                    <p className="text-text-primary whitespace-pre-wrap break-words">{msg.content}</p>
                  ) : (
                    <div className="flex items-center gap-2 text-text-muted italic">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-blue" /> Generating...
                    </div>
                  )}
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
                  {!isUser && msg.content && aiStatus === 'idle' && (
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        onClick={() => handleCopyMessage(msg.content, i)}
                        className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                        title="Copy"
                      >
                        {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      {lastUserIdx >= 0 && i === messages.length - 1 && (
                        <button
                          onClick={() => handleRegenerate(lastUserIdx)}
                          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                          title="Regenerate"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="px-4 py-3 border-t border-border-subtle/50 space-y-2 bg-surface-card/10">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">Suggested Questions</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt, pi) => (
                <button
                  key={pi}
                  onClick={() => handleSend(prompt)}
                  className="flex items-center gap-2 p-2.5 bg-background-primary border border-border-subtle rounded text-xs text-text-secondary hover:text-text-primary hover:border-accent-blue/30 text-left truncate transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-accent-blue flex-shrink-0" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border-subtle bg-surface-card/30 space-y-3">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file, fi) => (
                <div key={fi} className="flex items-center gap-2 bg-background-primary px-2.5 py-1 rounded border border-border-subtle text-[10px]">
                  {getFileIcon(file.type)}
                  <span className="font-semibold truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => removeAttachedFile(fi)} className="text-accent-red hover:text-red-400 font-bold ml-1">×</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <button
                onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                className="p-2.5 bg-background-primary border border-border-subtle text-text-secondary hover:text-text-primary rounded-md transition-colors"
                type="button"
              >
                <Plus className={cn("w-4 h-4 transition-transform", plusMenuOpen ? "rotate-45" : "")} />
              </button>
              {plusMenuOpen && (
                <div className="absolute bottom-12 left-0 w-44 bg-background-secondary border border-border-subtle rounded-md shadow-2xl z-50 overflow-hidden divide-y divide-border-subtle/50 text-2xs font-sans">
                  {[
                    { type: 'pdf', ext: 'pdf', label: 'PDF Document', icon: FileText, color: 'text-accent-red' },
                    { type: 'docx', ext: 'docx', label: 'DOCX Word File', icon: FileText, color: 'text-accent-blue' },
                    { type: 'excel', ext: 'xlsx', label: 'Excel Spreadsheet', icon: FileSpreadsheet, color: 'text-accent-green' },
                    { type: 'image', ext: 'png', label: 'PNG/JPEG Image', icon: ImageIcon, color: 'text-accent-blue' },
                    { type: 'audio', ext: 'mp3', label: 'Audio Recording', icon: Music, color: 'text-accent-orange' },
                  ].map(({ type, ext, label, icon: Icon, color }) => (
                    <button
                      key={type}
                      onClick={() => handleAttachFile(type, ext)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors text-left"
                    >
                      <Icon className={cn("w-3.5 h-3.5", color)} /> {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              placeholder={micActive ? "Listening to voice input..." : "Ask AI about projects, tasks, schedule..."}
              className="flex-1 h-10 bg-background-primary border border-border-subtle rounded-md px-4 text-xs text-text-primary placeholder-text-muted focus:border-accent-blue transition-colors outline-none font-sans"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={micActive}
            />

            <button
              onClick={() => setMicActive(!micActive)}
              className={cn(
                "p-2.5 rounded-md border transition-all",
                micActive ? "bg-accent-red/20 border-accent-red text-accent-red animate-pulse" : "bg-background-primary border-border-subtle text-text-secondary hover:text-text-primary"
              )}
              type="button"
            >
              {micActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={() => handleSend()}
              disabled={aiStatus !== 'idle'}
              className={cn(
                "p-2.5 rounded-md transition-colors",
                aiStatus !== 'idle' ? "bg-accent-blue/50 text-white/50 cursor-not-allowed" : "bg-accent-blue hover:bg-accent-blue-hover text-white"
              )}
              type="button"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
