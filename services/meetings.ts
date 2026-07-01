export interface ApiMeeting {
  id: string;
  name: string;
  participants: string[];
  date: string;
  duration: string;
  recordingUrl: string;
  transcriptSummary: string;
  actionItems: string[];
}

export const meetingsService = {
  getMeetings: async (): Promise<ApiMeeting[]> => {
    return Promise.resolve([
      {
        id: 'meet-001',
        name: 'Q2 Financial Review',
        participants: ['Vincent', 'Sarah Connor', 'Dave'],
        date: '2026-07-01',
        duration: '60 mins',
        recordingUrl: '/recordings/meet-001.mp4',
        transcriptSummary: 'AWS billing exceeded Q2 estimates. Agreed to review infrastructure cost centers.',
        actionItems: ['Audit AWS Cost Centers (Sarah)']
      }
    ]);
  },
  getMeetingSummary: async (id: string): Promise<string> => {
    return Promise.resolve("Detailed AI Meeting minutes summary contents.");
  }
};
