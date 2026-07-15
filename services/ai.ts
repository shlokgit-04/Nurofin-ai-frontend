export interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  files?: { name: string; type: string; size: string }[];
}

export interface AIProvider {
  id: string;
  name: string;
  models: { id: string; name: string }[];
}

const AI_ENGINE_URL = '/ai';

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    models: [
      { id: 'openai/gpt-4o', name: 'GPT-4o' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'openai/gpt-oss-20b:free', name: 'GPT OSS 20B (Free)' },
      { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
      { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku' },
      { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'meta-llama/llama-4-maverick:free', name: 'Llama 4 Maverick (Free)' },
      { id: 'deepseek/deepseek-chat-v3:free', name: 'DeepSeek V3 (Free)' },
      { id: 'qwen/qwen3-235b:free', name: 'Qwen3 235B (Free)' },
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    models: [
      { id: 'llama3', name: 'Llama 3' },
      { id: 'llama3.1', name: 'Llama 3.1' },
      { id: 'mistral', name: 'Mistral' },
      { id: 'phi3', name: 'Phi-3' },
    ],
  },
];

export const aiService = {
  sendChatMessage: async (messages: ChatMessage[]): Promise<ChatMessage> => {
    const lastMessage = messages[messages.length - 1];
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    try {
      const response = await fetch(`${AI_ENGINE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          message: lastMessage.content,
          auth_token: authToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Engine responded with status ${response.status}`);
      }

      const data = await response.json();
      return {
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't process your request.",
      };
    } catch (error) {
      console.error('AI Engine error:', error);
      return {
        role: 'assistant',
        content: "I'm having trouble connecting to the AI service. Please try again later.",
      };
    }
  },

  sendChatMessageStream: async function* (
    message: string,
    options?: { provider?: string; model?: string },
  ): AsyncGenerator<string, void, unknown> {
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const response = await fetch(`${AI_ENGINE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        message,
        auth_token: authToken,
        provider: options?.provider,
        model: options?.model,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Engine responded with status ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') return;
          if (!raw) continue;
          try {
            const data = JSON.parse(raw);
            if (data.error) throw new Error(data.error);
            if (data.content !== undefined && data.content !== null) {
              yield data.content;
            }
          } catch (e) {
            if (e instanceof SyntaxError) {
              yield raw;
            } else {
              throw e;
            }
          }
        }
      }
    }
  },

  getSuggestedPrompts: async (): Promise<string[]> => {
    return Promise.resolve([
      "What are my tasks today?",
      "Show me all projects",
      "Show today's schedule",
      "Good morning briefing",
    ]);
  },

  getAiRecommendations: async (): Promise<string[]> => {
    return [
      "Review overdue tasks",
      "Check today's meetings",
      "Generate daily briefing",
      "Review all notifications",
    ];
  },
};
