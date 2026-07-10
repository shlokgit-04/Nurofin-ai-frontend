import { Project } from '../types';

export const projectsService = {
  getProjects: async (): Promise<Project[]> => {
    const res = await fetch('/api/projects');
    if (!res.ok) {
      throw new Error('Failed to fetch projects');
    }
    return res.json();
  },
  createProject: async (project: Omit<Project, 'id'>): Promise<Project> => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });
    if (!res.ok) {
      throw new Error('Failed to create project');
    }
    return res.json();
  },
  updateProject: async (id: string, updates: Partial<Project>): Promise<Project> => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      throw new Error('Failed to update project');
    }
    return res.json();
  },
};
