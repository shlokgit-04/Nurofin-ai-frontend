'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import {
  Search, FolderOpen, FileText, CheckSquare, Users, MessageSquare,
  Briefcase, RefreshCw, BookOpen, Loader2, Database,
} from 'lucide-react';
import { knowledgeService } from '@/services/knowledge';
import { KnowledgeSearchResult, KnowledgeStats, KnowledgeChunk } from '@/types';

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  meeting: Users, task: CheckSquare, project: Briefcase, conversation: MessageSquare,
};

const CHUNK_TYPE_COLORS: Record<string, string> = {
  meeting_info: 'bg-blue-500/10 text-blue-400',
  summary: 'bg-purple-500/10 text-purple-400',
  mom: 'bg-indigo-500/10 text-indigo-400',
  transcript: 'bg-cyan-500/10 text-cyan-400',
  decision: 'bg-green-500/10 text-green-400',
  risk: 'bg-red-500/10 text-red-400',
  blocker: 'bg-orange-500/10 text-orange-400',
  followup: 'bg-yellow-500/10 text-yellow-400',
  deadline: 'bg-pink-500/10 text-pink-400',
  executive_summary: 'bg-emerald-500/10 text-emerald-400',
  task: 'bg-violet-500/10 text-violet-400',
  project: 'bg-teal-500/10 text-teal-400',
  conversation: 'bg-sky-500/10 text-sky-400',
};

const CHUNK_TYPE_LABELS: Record<string, string> = {
  meeting_info: 'Meeting', summary: 'Summary', mom: 'Minutes',
  transcript: 'Transcript', decision: 'Decision', risk: 'Risk',
  blocker: 'Blocker', followup: 'Follow-up', deadline: 'Deadline',
  executive_summary: 'Exec Summary', task: 'Task', project: 'Project', conversation: 'Chat',
};

const SOURCE_FILTERS = [
  { value: '', label: 'All', icon: Database },
  { value: 'meeting', label: 'Meetings', icon: Users },
  { value: 'task', label: 'Tasks', icon: CheckSquare },
  { value: 'project', label: 'Projects', icon: Briefcase },
  { value: 'conversation', label: 'Chats', icon: MessageSquare },
];

function ResultCard({ item, onClick }: { item: KnowledgeSearchResult | KnowledgeChunk; onClick: () => void }) {
  const src = 'score' in item ? item.source_type : item.source_type;
  const Icon = SOURCE_ICONS[src] || Database;
  const colorClass = CHUNK_TYPE_COLORS[item.chunk_type] || 'bg-gray-500/10 text-gray-400';
  const label = CHUNK_TYPE_LABELS[item.chunk_type] || item.chunk_type;
  const score = 'score' in item ? item.score : undefined;

  return (
    <div
      onClick={onClick}
      className="bg-background-secondary border border-border-subtle rounded-lg p-4 hover:border-accent-blue/30 cursor-pointer transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-accent-blue/10 rounded-lg flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-accent-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold', colorClass)}>
              {label}
            </span>
            {score !== undefined && (
              <span className="text-[10px] text-text-muted">
                Score: {score.toFixed(1)}
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-blue transition-colors truncate">
            {item.title}
          </h4>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
            {item.content.slice(0, 200)}
          </p>
          <div className="text-[10px] text-text-muted mt-2 pt-2 border-t border-border-subtle/30">
            Source: {item.source_title}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeHubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'browse'>('search');
  const [sourceFilter, setSourceFilter] = useState('');
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeSearchResult | KnowledgeChunk | null>(null);
  const [isReindexing, setIsReindexing] = useState(false);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if (activeTab === 'browse') loadChunks(); }, [activeTab, sourceFilter]);

  const loadStats = async () => {
    try { setStats(await knowledgeService.getStats()); } catch {}
  };

  const loadChunks = async () => {
    setIsLoading(true);
    try {
      const r = await knowledgeService.listChunks(sourceFilter || undefined, undefined, 0, 100);
      setChunks(r.items);
      setTotalChunks(r.total);
    } catch {}
    setIsLoading(false);
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      setResults(await knowledgeService.search(searchQuery, sourceFilter || undefined));
    } catch { setResults([]); }
    setIsSearching(false);
  }, [searchQuery, sourceFilter]);

  const handleReindex = async () => {
    setIsReindexing(true);
    try { await knowledgeService.reindexAll(); await loadStats(); if (activeTab === 'browse') await loadChunks(); } catch {}
    setIsReindexing(false);
  };

  return (
    <div className="max-w-7xl mx-auto font-sans text-text-primary space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-blue" /> Knowledge Hub
          </h1>
          <p className="text-xs text-text-muted mt-1">Search across all meetings, tasks, projects, and conversations</p>
        </div>
        <button onClick={handleReindex} disabled={isReindexing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors disabled:opacity-50">
          {isReindexing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Reindex All
        </button>
      </div>

      {stats && stats.total_chunks > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(stats.by_source || {}).map(([source, count]) => {
            const Icon = SOURCE_ICONS[source] || Database;
            return (
              <div key={source} className="bg-background-secondary border border-border-subtle rounded-lg p-3 flex items-center gap-3">
                <div className="p-2 bg-accent-blue/10 rounded-lg"><Icon className="w-4 h-4 text-accent-blue" /></div>
                <div>
                  <div className="text-lg font-bold text-text-primary">{count}</div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider">{source}s</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {stats && stats.total_chunks === 0 && (
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 text-center text-xs text-text-muted">
          No indexed knowledge yet. Click &quot;Reindex All&quot; to build the knowledge base.
        </div>
      )}

      <div className="flex gap-1 bg-background-secondary border border-border-subtle rounded-lg p-1 w-fit">
        {([['search', 'Search', Search], ['browse', 'Browse', FolderOpen]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={cn('flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded transition-colors',
              activeTab === key ? 'bg-accent-blue text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover')}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {SOURCE_FILTERS.map(({ value, label, icon: Icon }) => (
          <button key={value} onClick={() => setSourceFilter(value)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
              sourceFilter === value
                ? 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue'
                : 'border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-hover')}>
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 flex items-center gap-3 shadow-sm">
            <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
            <input type="text"
              placeholder="Search knowledge base... (e.g., 'Q4 revenue', 'risk assessment', 'meeting decisions')"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold rounded shadow transition-colors disabled:opacity-50">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>

          {isSearching && (
            <div className="bg-background-secondary border border-border-subtle rounded-lg p-12 text-center">
              <Loader2 className="w-8 h-8 text-accent-blue animate-spin mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Searching...</p>
            </div>
          )}

          {!isSearching && hasSearched && results.length === 0 && (
            <div className="bg-background-secondary border border-border-subtle rounded-lg p-12 text-center">
              <Search className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary">No results found</p>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-text-muted">{results.length} results found</p>
              {results.map(r => (
                <ResultCard key={r.chunk_id} item={r} onClick={() => setSelectedItem(r)} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'browse' && (
        <div className="space-y-3">
          {isLoading && (
            <div className="bg-background-secondary border border-border-subtle rounded-lg p-12 text-center">
              <Loader2 className="w-8 h-8 text-accent-blue animate-spin mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Loading...</p>
            </div>
          )}
          {!isLoading && chunks.length === 0 && (
            <div className="bg-background-secondary border border-border-subtle rounded-lg p-12 text-center">
              <FolderOpen className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary">No knowledge chunks indexed yet</p>
            </div>
          )}
          {!isLoading && chunks.length > 0 && (
            <>
              <p className="text-xs text-text-muted">{totalChunks} chunks indexed</p>
              {chunks.map(c => (
                <ResultCard key={c.id} item={c} onClick={() => setSelectedItem(c)} />
              ))}
            </>
          )}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedItem(null)}>
          <div className="bg-background-secondary border border-border-subtle rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary">{selectedItem.title}</h3>
              <button onClick={() => setSelectedItem(null)} className="text-text-muted hover:text-text-primary text-lg">&times;</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex gap-2">
                <span className={cn('px-2 py-0.5 rounded-full font-semibold', CHUNK_TYPE_COLORS[selectedItem.chunk_type] || 'bg-gray-500/10 text-gray-400')}>
                  {CHUNK_TYPE_LABELS[selectedItem.chunk_type] || selectedItem.chunk_type}
                </span>
                <span className="text-text-muted">{selectedItem.source_type}</span>
              </div>
              <div>
                <span className="text-text-secondary font-bold block mb-1">Source</span>
                <span className="text-text-primary">{selectedItem.source_title}</span>
              </div>
              <div>
                <span className="text-text-secondary font-bold block mb-1">Content</span>
                <p className="text-text-primary leading-relaxed bg-background-primary p-3 rounded border border-border-subtle/50 whitespace-pre-wrap">
                  {selectedItem.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
