import { Meeting } from '../types';

export const meetingsService = {
  getMeetings: async (): Promise<Meeting[]> => {
    const res = await fetch('/api/meetings');
    if (!res.ok) {
      throw new Error('Failed to fetch meetings');
    }
    return res.json();
  },
  getMeetingSummary: async (id: string): Promise<string> => {
    const res = await fetch(`/api/meetings/${id}/summary`);
    if (!res.ok) {
      throw new Error('Failed to fetch meeting summary');
    }
    return res.text();
  },
  createMeeting: async (meeting: Omit<Meeting, 'id'>): Promise<Meeting> => {
    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meeting),
    });
    if (!res.ok) {
      throw new Error('Failed to create meeting');
    }
    return res.json();
  },
  updateMeeting: async (id: string, updates: Partial<Meeting>): Promise<Meeting> => {
    const res = await fetch(`/api/meetings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      throw new Error('Failed to update meeting');
    }
    return res.json();
  },
};
