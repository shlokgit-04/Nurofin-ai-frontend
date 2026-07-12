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
  getDocuments: async (): Promise<DocumentItem[]> => {
    return Promise.resolve([]);
  },
  askAiAboutDoc: async (docId: string, question: string): Promise<string> => {
    return Promise.resolve(`AI Answer regarding document ID ${docId}: Analyzing PDF signatures and meta audits.`);
  }
};
