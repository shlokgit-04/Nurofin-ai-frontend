export interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  files?: { name: string; type: string; size: string }[];
}

const AI_ENGINE_URL = '/ai';

export const aiService = {
  sendChatMessage: async (messages: ChatMessage[]): Promise<ChatMessage> => {
    const lastMessage = messages[messages.length - 1];
<<<<<<< Updated upstream
    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: lastMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        role: 'assistant',
        content: data.response,
      };
    } catch (error) {
      console.error("Failed to fetch from AI backend:", error);
      return {
        role: 'assistant',
        content: "Error: Failed to connect to Nuro-Ai backend. Please make sure the backend server is running on port 8001.",
=======
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
>>>>>>> Stashed changes
      };
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
