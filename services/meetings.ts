import { Meeting } from '../types';

const getHeaders = () => {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token') || '';
  }
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const meetingsService = {
  getMeetings: async (filter?: 'today' | 'weekly' | 'monthly'): Promise<Meeting[]> => {
    const url = filter ? `/api/v1/meetings/?filter=${filter}` : '/api/v1/meetings/';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch events');
    const json = await res.json();
    return (json.data || []).map((m: any) => ({
      id: m.id.toString(),
      title: m.title,
      date: m.date || 'N/A',
      time: m.start_time || '00:00',
      duration: m.end_time ? `${m.start_time} - ${m.end_time}` : '1h',
      attendees: m.participants?.map((p: any) => p.name) || [],
      notes: m.description || '',
      momText: '',
      type: m.type || 'meeting'
    }));
  },
  
  getMeetingSummary: async (title: string): Promise<string> => {
    return "";
  },
  
  createMeeting: async (meeting: Partial<Meeting>): Promise<Meeting> => {
    const payload = {
      title: meeting.title,
      description: meeting.notes,
      date: meeting.date,
      start_time: meeting.time,
      type: meeting.type || 'meeting'
    };
    const res = await fetch('/api/v1/meetings', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create event');
    const json = await res.json();
    const m = json.data;
    return {
      id: m.id.toString(),
      title: m.title,
      date: m.date || 'N/A',
      time: m.start_time || '00:00',
      duration: m.end_time ? `${m.start_time} - ${m.end_time}` : '1h',
      attendees: m.participants?.map((p: any) => p.name) || [],
      notes: m.description || '',
      type: m.type || 'meeting'
    };
  },
  
  updateMeeting: async (id: number | string, meeting: Partial<Meeting>): Promise<Meeting> => {
    const payload = {
      title: meeting.title,
      description: meeting.notes,
      date: meeting.date,
      start_time: meeting.time,
      type: meeting.type || 'meeting'
    };
    const res = await fetch(`/api/v1/meetings/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update event');
    const json = await res.json();
    const m = json.data;
    return {
      id: m.id.toString(),
      title: m.title,
      date: m.date || 'N/A',
      time: m.start_time || '00:00',
      duration: m.end_time ? `${m.start_time} - ${m.end_time}` : '1h',
      attendees: m.participants?.map((p: any) => p.name) || [],
      notes: m.description || '',
      type: m.type || 'meeting'
    };
  },
  
  deleteMeeting: async (id: number | string): Promise<void> => {
    const res = await fetch(`/api/v1/meetings/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete event');
  }
};
