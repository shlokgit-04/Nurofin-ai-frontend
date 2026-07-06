import { Meeting } from '../types';

export const meetingsService = {
  getMeetings: async (): Promise<Meeting[]> => {
    return Promise.resolve([
      {
        id: 'meet-1',
        title: 'Nurofin Executive Strategy Review',
        date: '2026-07-06',
        time: '14:00',
        duration: '45 mins',
        attendees: ['Vincent N. (CEO)', 'Sarah Connor (PM)', 'John Doe (Lead Arch)'],
        notes: 'Review ledger sharding blueprints and confirm vendor payout authorizations.',
        type: 'hybrid',
        momText: '',
      },
      {
        id: 'meet-2',
        title: 'API Gateway Authentication Review',
        date: '2026-07-07',
        time: '10:30',
        duration: '30 mins',
        attendees: ['Aryan Dev', 'John Doe'],
        notes: 'Go over GetStream connection tokens and CORS rules config.',
        type: 'video',
        momText: '',
      },
    ]);
  },
  getMeetingSummary: async (id: string): Promise<string> => {
    return Promise.resolve(
      `Minutes of Meeting (MoM) for ${id}:\n\n` +
      `- **Key Highlights**: Discussed infrastructure sharding timelines and resolved layout issues.\n` +
      `- **Decisions Made**: Authorized payout for Acme licenses.\n` +
      `- **Action Items**: Aryan to check CORS settings; Sarah to sync on PM targets.`
    );
  },
  createMeeting: async (meeting: Omit<Meeting, 'id'>): Promise<Meeting> => {
    return Promise.resolve({
      ...meeting,
      id: `meet-${Date.now()}`,
    });
  },
  updateMeeting: async (id: string, updates: Partial<Meeting>): Promise<Meeting> => {
    return Promise.resolve({
      id,
      title: 'Nurofin Executive Strategy Review',
      date: '2026-07-06',
      time: '14:00',
      duration: '45 mins',
      attendees: [],
      type: 'hybrid',
      ...updates,
    });
  },
};
