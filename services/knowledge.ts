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
    return Promise.resolve([
      {
        id: 'doc-001',
        name: 'Q2-Tax-Audit-Submissions.pdf',
        category: 'Compliance',
        version: 'v1.2',
        createdDate: '2026-06-15',
        updatedDate: '2026-06-20',
        fileSize: '4.2 MB'
      },
      {
        id: 'doc-002',
        name: 'AWS-Scaling-Proposals.docx',
        category: 'Infrastructure',
        version: 'v2.0',
        createdDate: '2026-06-10',
        updatedDate: '2026-06-12',
        fileSize: '1.8 MB'
      }
    ]);
  },
  askAiAboutDoc: async (docId: string, question: string): Promise<string> => {
    return Promise.resolve(`AI Answer regarding document ID ${docId}: Analyzing PDF signatures and meta audits.`);
  }
};
