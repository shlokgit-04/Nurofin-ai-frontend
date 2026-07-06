import { Task } from '../types';

export const tasksService = {
  getTasks: async (): Promise<Task[]> => {
    return Promise.resolve([
      {
        id: 'task-1',
        title: 'Review Overdue Acme Corp Invoice',
        description: 'Verify if the corporate compliance guidelines match the Acme budget increase. Approve or request adjustments.',
        status: 'todo',
        priority: 'high',
        dueDate: '2026-07-04',
        assignedTo: { name: 'Vincent N.', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100' },
        projectName: 'Project Alpha (Core Ledger)',
        projectId: 'proj-1',
        comments: [
          { id: 'c-1', author: 'Sarah Connor', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50', text: 'This payment is blocking Acme developer access keys.', time: '2 hours ago' },
        ],
      },
      {
        id: 'task-2',
        title: 'Audit Executive AI Security Clearance',
        description: 'Assess the vector database encryption layer and ensure tenant isolation parameters are enforced.',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-07-08',
        assignedTo: { name: 'Aryan Dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
        projectName: 'Project Delta (GetStream Chat Integration)',
        projectId: 'proj-2',
      },
    ]);
  },
  createTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    return Promise.resolve({
      ...task,
      id: `task-${Date.now()}`,
    });
  },
  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    return Promise.resolve({
      id,
      title: 'Review Overdue Acme Corp Invoice',
      description: 'Verify if the corporate compliance guidelines match the Acme budget increase.',
      status: 'todo',
      priority: 'high',
      dueDate: '2026-07-04',
      assignedTo: { name: 'Vincent N.', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100' },
      ...updates,
    });
  },
  deleteTask: async (id: string): Promise<void> => {
    return Promise.resolve();
  },
};
