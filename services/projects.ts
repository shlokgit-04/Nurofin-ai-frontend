import { Project } from '../types';

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

export const projectsService = {
  getProjects: async (): Promise<Project[]> => {
    const res = await fetch('/api/v1/projects/', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch projects');
    const json = await res.json();
    return (json.data || []).map((p: any) => ({
      id: p.id.toString(),
      name: p.name,
      description: p.description || '',
      status: p.status,
      progress: p.progress,
      startDate: p.start_date || '',
      endDate: p.end_date || '',
      members: p.members?.map((m: any) => ({
        id: m.id.toString(),
        name: m.name,
        role: m.role || 'Member',
        avatar: m.avatar || ''
      })) || [],
      activities: []
    }));
  },
  
  createProject: async (project: Partial<Project>): Promise<Project> => {
    const payload = {
      name: project.name,
      description: project.description,
      status: project.status,
      progress: project.progress,
      start_date: project.startDate,
      end_date: project.endDate
    };
    const res = await fetch('/api/v1/projects/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create project');
    const json = await res.json();
    const p = json.data;
    return {
      id: p.id.toString(),
      name: p.name,
      description: p.description || '',
      status: p.status,
      progress: p.progress,
      startDate: p.start_date || '',
      endDate: p.end_date || '',
      members: p.members?.map((m: any) => ({
        id: m.id.toString(),
        name: m.name,
        role: m.role || 'Member',
        avatar: m.avatar || ''
      })) || [],
      activities: []
    };
  },
  
  updateProject: async (id: number | string, project: Partial<Project>): Promise<Project> => {
    const payload = {
      name: project.name,
      description: project.description,
      status: project.status,
      progress: project.progress,
      start_date: project.startDate,
      end_date: project.endDate
    };
    const res = await fetch(`/api/v1/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update project');
    const json = await res.json();
    const p = json.data;
    return {
      id: p.id.toString(),
      name: p.name,
      description: p.description || '',
      status: p.status,
      progress: p.progress,
      startDate: p.start_date || '',
      endDate: p.end_date || '',
      members: p.members?.map((m: any) => ({
        id: m.id.toString(),
        name: m.name,
        role: m.role || 'Member',
        avatar: m.avatar || ''
      })) || [],
      activities: []
    };
  },
  
  deleteProject: async (id: number | string): Promise<void> => {
    const res = await fetch(`/api/v1/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete project');
  },
  
  addMember: async (id: number | string, userId: number | string): Promise<void> => {
    const res = await fetch(`/api/v1/projects/${id}/members/${userId}`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to add member');
  },
  
  removeMember: async (id: number | string, userId: number | string): Promise<void> => {
    const res = await fetch(`/api/v1/projects/${id}/members/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to remove member');
  }
};
