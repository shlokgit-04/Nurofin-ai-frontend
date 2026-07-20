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

export interface ConversationMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  files?: { name: string; type: string; size: string }[];
}

export interface Conversation {
  id: number;
  title: string;
  user_id: number;
  created_at: string | null;
  updated_at: string | null;
  message_count: number;
  messages?: ConversationMessage[];
}

export const conversationsService = {
  list: async (): Promise<Conversation[]> => {
    const res = await fetch('/api/v1/conversations', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch conversations');
    const json = await res.json();
    return json.data || [];
  },

  get: async (id: number): Promise<Conversation> => {
    const res = await fetch(`/api/v1/conversations/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch conversation');
    const json = await res.json();
    return json.data;
  },

  create: async (title?: string): Promise<Conversation> => {
    const res = await fetch('/api/v1/conversations', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title: title || 'New Conversation' }),
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    const json = await res.json();
    return json.data;
  },

  update: async (id: number, title: string): Promise<void> => {
    const res = await fetch(`/api/v1/conversations/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to update conversation');
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`/api/v1/conversations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete conversation');
  },

  addMessage: async (
    conversationId: number,
    role: 'user' | 'assistant',
    content: string,
    files?: { name: string; type: string; size: string }[],
  ): Promise<void> => {
    const res = await fetch(`/api/v1/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        role,
        content,
        files_json: files ? JSON.stringify(files) : null,
      }),
    });
    if (!res.ok) throw new Error('Failed to add message');
  },

  addMessagesBulk: async (
    conversationId: number,
    messages: { role: string; content: string }[],
  ): Promise<void> => {
    const res = await fetch(`/api/v1/conversations/${conversationId}/messages/bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(messages),
    });
    if (!res.ok) throw new Error('Failed to add messages');
  },
};
