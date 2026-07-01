export interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

export const chatService = {
  sendQuery: async (messages: ChatMessage[]): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Response from Nurofin Executive AI model.");
      }, 800);
    });
  }
};
