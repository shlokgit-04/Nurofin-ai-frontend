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
      type: m.type === 'meeting' ? 'video' : 'in-person'
    }));
  },
  
  getMeetingSummary: async (title: string): Promise<string> => {
    // Mock the MoM generation
    await new Promise(r => setTimeout(r, 1500));
    return `AI Summary generated for: ${title}\n\n- Discussed key strategic deliverables.\n- Aligned on Q4 milestones and resource allocation.\n- Next Steps: Review finalizing budget next week.`;
  },
  
  createMeeting: async (meeting: Partial<Meeting>): Promise<Meeting> => {
    const payload = {
      title: meeting.title,
      description: meeting.notes,
      date: meeting.date,
      start_time: meeting.time,
      type: 'meeting'
    };
    const res = await fetch('/api/v1/meetings/', {
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
      type: 'video'
    };
  },
  
  updateMeeting: async (id: number | string, meeting: Partial<Meeting>): Promise<Meeting> => {
    const payload = {
      title: meeting.title,
      description: meeting.notes,
      date: meeting.date,
      start_time: meeting.time
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
      type: 'video'
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
