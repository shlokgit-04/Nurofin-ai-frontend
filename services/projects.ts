import { Project } from '../types';

export const projectsService = {
  getProjects: async (): Promise<Project[]> => {
    return Promise.resolve([
      {
        id: 'proj-1',
        name: 'Project Alpha (Core Ledger)',
        description: 'Upgrading the financial ledger transaction speed and compliance auditing tools.',
        status: 'active',
        progress: 75,
        startDate: '2026-05-01',
        endDate: '2026-08-30',
        members: [
          { id: 'm-1', name: 'Sarah Connor', role: 'Project Manager', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
          { id: 'm-2', name: 'John Doe', role: 'Lead Architect', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
          { id: 'm-3', name: 'Aryan Dev', role: 'Frontend Engineer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
        ],
        activities: [
          { id: 'act-1', user: 'Sarah Connor', action: 'merged pull request', target: '#409 compliance', time: '10 mins ago' },
          { id: 'act-2', user: 'John Doe', action: 'completed task', target: 'PostgreSQL Database Sharding', time: '1 hour ago' },
        ],
      },
      {
        id: 'proj-2',
        name: 'Project Delta (GetStream Chat Integration)',
        description: 'Implementing high-fidelity real-time workspace messenger channels.',
        status: 'planning',
        progress: 20,
        startDate: '2026-07-01',
        endDate: '2026-11-15',
        members: [
          { id: 'm-1', name: 'Sarah Connor', role: 'Project Manager', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
          { id: 'm-4', name: 'Vincent N.', role: 'CEO / Sponsor', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100' },
        ],
        activities: [
          { id: 'act-3', user: 'Vincent N.', action: 'reviewed milestone', target: 'Architecture Blueprints', time: '1 day ago' },
        ],
      },
    ]);
  },
  createProject: async (project: Omit<Project, 'id'>): Promise<Project> => {
    return Promise.resolve({
      ...project,
      id: `proj-${Date.now()}`,
    });
  },
  updateProject: async (id: string, updates: Partial<Project>): Promise<Project> => {
    return Promise.resolve({
      id,
      name: 'Project Alpha (Core Ledger)',
      description: 'Upgrading the financial ledger transaction speed and compliance auditing tools.',
      status: 'active',
      progress: 75,
      startDate: '2026-05-01',
      endDate: '2026-08-30',
      members: [],
      activities: [],
      ...updates,
    });
  },
};
