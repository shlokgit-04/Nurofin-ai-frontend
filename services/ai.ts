export interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  files?: { name: string; type: string; size: string }[];
}

export const aiService = {
  sendChatMessage: async (messages: ChatMessage[]): Promise<ChatMessage> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lastMessage = messages[messages.length - 1];
        let reply = "I am Nurofin Executive AI. How can I assist you with your operations today?";

        if (lastMessage.content.toLowerCase().includes('invoice') || lastMessage.content.toLowerCase().includes('acme')) {
          reply = "I noticed that Acme Corp invoice of $12,450 is 3 days overdue. This is blocking seat keys for your dev team. I recommend approving this payment immediately as we have $382,500 remaining in our operations budget.";
        } else if (lastMessage.content.toLowerCase().includes('budget') || lastMessage.content.toLowerCase().includes('finance')) {
          reply = "Our current Q3 operations budget is approved at $150,000. Infrastructure consumes $80,000, licenses at $35,000, support is $20,000, and $15,000 is held in reserve.";
        } else if (lastMessage.content.toLowerCase().includes('project') || lastMessage.content.toLowerCase().includes('delta')) {
          reply = "Project Delta is currently at 20% progress. Sarah Connor is PM, and you are CEO sponsor. Sarah merged the latest blueprints yesterday. There is a CORS API policy issue block on logo vectors.";
        }

        resolve({
          role: 'assistant',
          content: reply,
        });
      }, 1000);
    });
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
    const res = await fetch('/api/ai/recommendations');
    if (!res.ok) {
      throw new Error('Failed to fetch AI recommendations');
    }
    return res.json();
  },
};
