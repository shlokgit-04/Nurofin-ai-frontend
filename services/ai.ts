export interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  files?: { name: string; type: string; size: string }[];
}

export const aiService = {
  sendChatMessage: async (messages: ChatMessage[]): Promise<ChatMessage> => {
    const lastMessage = messages[messages.length - 1];
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
      };
    }
  },

  getSuggestedPrompts: async (): Promise<string[]> => {
    return Promise.resolve([
      "Explain Q3 Infrastructure budget limits",
      "Draft email to Acme PM Connor regarding overdue invoice",
      "Summary of Project Delta authentication milestones",
      "Generate compliance guidelines checklist",
    ]);
  },

  getAiRecommendations: async (): Promise<string[]> => {
    return [
      "Approve overdue Acme Corp invoice to unblock dev team.",
      "Review Project Delta blueprints for CORS compliance.",
      "Schedule quarterly sync with marketing department."
    ];
  },
};
