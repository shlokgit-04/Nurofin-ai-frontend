import { Meeting, MeetingParticipant, MeetingTimelineEvent, MeetingExtractedTask } from '../types';

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

function parseJsonArray(val: unknown): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapMeeting(m: any): Meeting {
  return {
    id: m.id.toString(),
    title: m.title,
    date: m.date || 'N/A',
    time: m.start_time || '00:00',
    duration: m.end_time ? `${m.start_time} - ${m.end_time}` : '1h',
    attendees: m.participants?.map((p: any) => p.user_name).filter(Boolean) || [],
    notes: m.description || '',
    momText: m.mom_summary || '',
    type: m.type || 'meeting',
    status: m.status || 'scheduled',
    owner_id: m.owner_id?.toString(),
    owner_name: m.owner_name,
    owner_avatar: m.owner_avatar,
    participants: m.participants?.map((p: any) => ({
      id: p.id?.toString() || '',
      user_id: p.user_id?.toString() || '',
      user_name: p.user_name || 'Unknown',
      user_avatar: p.user_avatar,
      status: p.status || 'pending',
    })) || [],
    participants_count: m.participants_count || 0,
    mom_summary: m.mom_summary,
    mom_file_path: m.mom_file_path,
    created_at: m.created_at,
    agenda: m.agenda,
    meeting_link: m.meeting_link,
    location: m.location,
    timezone: m.timezone,
    is_recurring: m.is_recurring,
    recurrence_rule: m.recurrence_rule,
    mom_executive_summary: m.mom_executive_summary,
    mom_decisions: parseJsonArray(m.mom_decisions),
    mom_action_items: parseJsonArray(m.mom_action_items),
    mom_risks: parseJsonArray(m.mom_risks),
    mom_blockers: parseJsonArray(m.mom_blockers),
    mom_followups: parseJsonArray(m.mom_followups),
    mom_deadlines: parseJsonArray(m.mom_deadlines),
    mom_important_dates: parseJsonArray(m.mom_important_dates),
    timeline: m.timeline?.map((t: any) => ({
      id: t.id?.toString() || '',
      meeting_id: t.meeting_id?.toString() || '',
      action: t.action || '',
      description: t.description || '',
      user_id: t.user_id?.toString(),
      user_name: t.user_name,
      metadata: t.metadata_json ? (typeof t.metadata_json === 'string' ? JSON.parse(t.metadata_json) : t.metadata_json) : undefined,
      created_at: t.created_at,
    })) || [],
    extracted_tasks: m.extracted_tasks?.map((t: any) => ({
      id: t.id?.toString() || '',
      meeting_id: t.meeting_id?.toString() || '',
      title: t.title || '',
      description: t.description,
      priority: t.priority || 'medium',
      suggested_owner: t.suggested_owner,
      deadline: t.deadline,
      dependencies: t.dependencies || [],
      confidence: t.confidence || 0,
      status: t.status || 'pending',
      real_task_id: t.real_task_id?.toString(),
    })) || [],
  };
}

export interface BulkApproveRequest {
  task_ids: number[];
}

export interface ExtractedTaskUpdate {
  title?: string;
  description?: string;
  priority?: string;
  suggested_owner?: string;
  deadline?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const meetingsService = {
  getMeetings: async (
    filter?: 'today' | 'weekly' | 'monthly',
    search?: string,
    sort?: string,
    status?: string
  ): Promise<Meeting[]> => {
    const params = new URLSearchParams();
    if (filter) params.set('filter', filter);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    if (status) params.set('status', status);
    const qs = params.toString();
    const url = `/api/v1/meetings/${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch events');
    const json = await res.json();
    return (json.data || []).map(mapMeeting);
  },

  getMeeting: async (id: number | string): Promise<Meeting> => {
    const res = await fetch(`/api/v1/meetings/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch meeting');
    const json = await res.json();
    return mapMeeting(json.data);
  },

  getMeetingSummary: async (title: string): Promise<string> => {
    await new Promise(r => setTimeout(r, 1500));
    return `AI Summary generated for: ${title}\n\n- Discussed key strategic deliverables.\n- Aligned on Q4 milestones and resource allocation.\n- Next Steps: Review finalizing budget next week.`;
  },

  createMeeting: async (meeting: Partial<Meeting> & { participant_ids?: number[] }): Promise<Meeting> => {
    const payload = {
      title: meeting.title,
      description: meeting.notes,
      date: meeting.date,
      start_time: meeting.time,
      type: meeting.type || 'meeting',
      agenda: meeting.agenda,
      meeting_link: meeting.meeting_link,
      location: meeting.location,
      timezone: meeting.timezone,
      is_recurring: meeting.is_recurring,
      recurrence_rule: meeting.recurrence_rule,
      participant_ids: meeting.participant_ids || [],
    };
    const res = await fetch('/api/v1/meetings', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create event');
    const json = await res.json();
    return mapMeeting(json.data);
  },

  updateMeeting: async (id: number | string, meeting: Partial<Meeting>): Promise<Meeting> => {
    const payload: Record<string, any> = {};
    if (meeting.title !== undefined) payload.title = meeting.title;
    if (meeting.notes !== undefined) payload.description = meeting.notes;
    if (meeting.date !== undefined) payload.date = meeting.date;
    if (meeting.time !== undefined) payload.start_time = meeting.time;
    if (meeting.type !== undefined) payload.type = meeting.type;
    if (meeting.agenda !== undefined) payload.agenda = meeting.agenda;
    if (meeting.meeting_link !== undefined) payload.meeting_link = meeting.meeting_link;
    if (meeting.location !== undefined) payload.location = meeting.location;
    if (meeting.timezone !== undefined) payload.timezone = meeting.timezone;
    if (meeting.is_recurring !== undefined) payload.is_recurring = meeting.is_recurring;
    if (meeting.recurrence_rule !== undefined) payload.recurrence_rule = meeting.recurrence_rule;
    const res = await fetch(`/api/v1/meetings/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update event');
    const json = await res.json();
    return mapMeeting(json.data);
  },

  deleteMeeting: async (id: number | string): Promise<void> => {
    const res = await fetch(`/api/v1/meetings/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete event');
  },

  acceptMeeting: async (id: number | string): Promise<void> => {
    const res = await fetch(`/api/v1/meetings/${id}/accept`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to accept meeting');
  },

  declineMeeting: async (id: number | string): Promise<void> => {
    const res = await fetch(`/api/v1/meetings/${id}/decline`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to decline meeting');
  },

  uploadMOM: async (id: number | string, summary: string): Promise<Meeting> => {
    const res = await fetch(`/api/v1/meetings/${id}/mom`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ summary })
    });
    if (!res.ok) throw new Error('Failed to upload MOM');
    const json = await res.json();
    return mapMeeting(json.data);
  },

  analyzeMOM: async (id: number | string): Promise<Meeting> => {
    const res = await fetch(`/api/v1/meetings/${id}/mom/analyze`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to analyze MOM');
    const json = await res.json();
    return mapMeeting(json.data);
  },

  getTimeline: async (id: number | string): Promise<MeetingTimelineEvent[]> => {
    const res = await fetch(`/api/v1/meetings/${id}/timeline`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch timeline');
    const json = await res.json();
    return (json.data || []).map((t: any) => ({
      id: t.id?.toString() || '',
      meeting_id: t.meeting_id?.toString() || '',
      action: t.action || '',
      description: t.description || '',
      user_id: t.user_id?.toString(),
      user_name: t.user_name,
      metadata: t.metadata_json ? (typeof t.metadata_json === 'string' ? JSON.parse(t.metadata_json) : t.metadata_json) : undefined,
      created_at: t.created_at,
    }));
  },

  getExtractedTasks: async (id: number | string): Promise<MeetingExtractedTask[]> => {
    const res = await fetch(`/api/v1/meetings/${id}/extracted-tasks`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch extracted tasks');
    const json = await res.json();
    return (json.data || []).map((t: any) => ({
      id: t.id?.toString() || '',
      meeting_id: t.meeting_id?.toString() || '',
      title: t.title || '',
      description: t.description,
      priority: t.priority || 'medium',
      suggested_owner: t.suggested_owner,
      deadline: t.deadline,
      dependencies: t.dependencies || [],
      confidence: t.confidence || 0,
      status: t.status || 'pending',
      real_task_id: t.real_task_id?.toString(),
    }));
  },

  updateExtractedTask: async (
    meetingId: number | string,
    taskId: number | string,
    update: ExtractedTaskUpdate
  ): Promise<MeetingExtractedTask> => {
    const res = await fetch(`/api/v1/meetings/${meetingId}/extracted-tasks/${taskId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(update)
    });
    if (!res.ok) throw new Error('Failed to update extracted task');
    const json = await res.json();
    const t = json.data;
    return {
      id: t.id?.toString() || '',
      meeting_id: t.meeting_id?.toString() || '',
      title: t.title || '',
      description: t.description,
      priority: t.priority || 'medium',
      suggested_owner: t.suggested_owner,
      deadline: t.deadline,
      dependencies: t.dependencies || [],
      confidence: t.confidence || 0,
      status: t.status || 'pending',
      real_task_id: t.real_task_id?.toString(),
    };
  },

  approveExtractedTasks: async (id: number | string, taskIds: number[]): Promise<void> => {
    const res = await fetch(`/api/v1/meetings/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ task_ids: taskIds })
    });
    if (!res.ok) throw new Error('Failed to approve extracted tasks');
  },

  rejectExtractedTasks: async (id: number | string, taskIds: number[]): Promise<void> => {
    const res = await fetch(`/api/v1/meetings/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ task_ids: taskIds })
    });
    if (!res.ok) throw new Error('Failed to reject extracted tasks');
  },

  bulkApprove: async (id: number | string): Promise<void> => {
    const res = await fetch(`/api/v1/meetings/${id}/bulk-approve`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to bulk approve');
  },

  bulkReject: async (id: number | string): Promise<void> => {
    const res = await fetch(`/api/v1/meetings/${id}/bulk-reject`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to bulk reject');
  },

  addParticipant: async (meetingId: number | string, userId: number | string): Promise<void> => {
    const res = await fetch(`/api/v1/meetings/${meetingId}/participants?user_id=${userId}`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to add participant');
  },

  removeParticipant: async (meetingId: number | string, userId: number | string): Promise<void> => {
    const res = await fetch(`/api/v1/meetings/${meetingId}/participants/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to remove participant');
  },
};
