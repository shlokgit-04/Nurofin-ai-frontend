import { Task } from '../types';

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

export const tasksService = {
  getTasks: async (): Promise<Task[]> => {
    const res = await fetch('/api/v1/tasks', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const json = await res.json();
    return (json.data || []).map((t: any) => ({
      id: t.id.toString(),
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      dueDate: t.deadline || 'No deadline',
      assignedTo: {
        name: t.assigned_to?.name || 'Unassigned',
        avatar: t.assigned_to?.avatar || ''
      },
      projectId: t.project_id?.toString(),
      scheduledDate: t.scheduled_date || undefined,
      scheduledStartTime: t.scheduled_start_time || undefined,
      scheduledEndTime: t.scheduled_end_time || undefined
    }));
  },
  
  createTask: async (task: Partial<Task>): Promise<Task> => {
    const payload = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.dueDate,
      assigned_to_id: (task as any).assigneeId ? parseInt((task as any).assigneeId, 10) : undefined,
      project_id: task.projectId ? parseInt(task.projectId, 10) : undefined,
      scheduled_date: task.scheduledDate,
      scheduled_start_time: task.scheduledStartTime,
      scheduled_end_time: task.scheduledEndTime
    };
    const res = await fetch('/api/v1/tasks', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create task');
    const json = await res.json();
    const t = json.data;
    return {
      id: t.id.toString(),
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      dueDate: t.deadline || 'No deadline',
      assignedTo: {
        name: t.assigned_to?.name || 'Unassigned',
        avatar: t.assigned_to?.avatar || ''
      },
      projectId: t.project_id?.toString(),
      scheduledDate: t.scheduled_date || undefined,
      scheduledStartTime: t.scheduled_start_time || undefined,
      scheduledEndTime: t.scheduled_end_time || undefined
    };
  },
  
  updateTask: async (id: number | string, task: Partial<Task>): Promise<Task> => {
    const payload = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.dueDate,
      assigned_to_id: (task as any).assigneeId ? parseInt((task as any).assigneeId, 10) : undefined,
      project_id: task.projectId ? parseInt(task.projectId, 10) : undefined,
      scheduled_date: task.scheduledDate,
      scheduled_start_time: task.scheduledStartTime,
      scheduled_end_time: task.scheduledEndTime
    };
    const res = await fetch(`/api/v1/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update task');
    const json = await res.json();
    const t = json.data;
    return {
      id: t.id.toString(),
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      dueDate: t.deadline || 'No deadline',
      assignedTo: {
        name: t.assigned_to?.name || 'Unassigned',
        avatar: t.assigned_to?.avatar || ''
      },
      projectId: t.project_id?.toString(),
      scheduledDate: t.scheduled_date || undefined,
      scheduledStartTime: t.scheduled_start_time || undefined,
      scheduledEndTime: t.scheduled_end_time || undefined
    };
  },
  
  deleteTask: async (id: number | string): Promise<void> => {
    const res = await fetch(`/api/v1/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete task');
  }
};
