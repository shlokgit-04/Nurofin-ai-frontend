import { KnowledgeChunk, KnowledgeSearchResult, KnowledgeStats } from '../types';

const getHeaders = () => {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token') || '';
  }
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  version: string;
  createdDate: string;
  updatedDate: string;
  fileSize: string;
}

export const knowledgeService = {
  search: async (query: string, sourceType?: string, projectId?: number, topK: number = 20): Promise<KnowledgeSearchResult[]> => {
    const params = new URLSearchParams({ q: query, top_k: String(topK) });
    if (sourceType) params.set('source_type', sourceType);
    if (projectId) params.set('project_id', String(projectId));
    const res = await fetch(`/api/v1/knowledge/search?${params}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Search failed');
    const json = await res.json();
    return json.data || [];
  },

  listChunks: async (sourceType?: string, chunkType?: string, skip: number = 0, limit: number = 50): Promise<{ items: KnowledgeChunk[]; total: number }> => {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (sourceType) params.set('source_type', sourceType);
    if (chunkType) params.set('chunk_type', chunkType);
    const res = await fetch(`/api/v1/knowledge/chunks?${params}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch chunks');
    const json = await res.json();
    return json.data || { items: [], total: 0 };
  },

  getStats: async (): Promise<KnowledgeStats> => {
    const res = await fetch('/api/v1/knowledge/stats', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch stats');
    const json = await res.json();
    return json.data || { total_chunks: 0, by_source: {}, by_type: {} };
  },

  getSourceTypes: async (): Promise<{ source_type: string; count: number }[]> => {
    const res = await fetch('/api/v1/knowledge/sources', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch sources');
    const json = await res.json();
    return json.data || [];
  },

  getChunkTypes: async (): Promise<{ chunk_type: string; count: number }[]> => {
    const res = await fetch('/api/v1/knowledge/chunk-types', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch chunk types');
    const json = await res.json();
    return json.data || [];
  },

  getChunk: async (chunkId: number): Promise<KnowledgeChunk> => {
    const res = await fetch(`/api/v1/knowledge/${chunkId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch chunk');
    const json = await res.json();
    return json.data;
  },

  indexEntity: async (sourceType: string, sourceId: number): Promise<{ chunks_created: number }> => {
    const params = new URLSearchParams({ source_type: sourceType, source_id: String(sourceId) });
    const res = await fetch(`/api/v1/knowledge/index?${params}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to index entity');
    const json = await res.json();
    return json.data;
  },

  reindexAll: async (): Promise<{ total_chunks: number }> => {
    const res = await fetch('/api/v1/knowledge/reindex', {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to reindex');
    const json = await res.json();
    return json.data;
  },

  getDocuments: async (): Promise<DocumentItem[]> => {
    return Promise.resolve([]);
  },
};
