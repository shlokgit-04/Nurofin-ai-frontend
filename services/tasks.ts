export interface ApiTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'completed';
  owner: string;
  deadline: string;
  status: 'Backlog' | 'In Progress' | 'Under Review' | 'Completed';
  project: string;
  createdBy: string;
  relatedMeeting?: string;
}

export const tasksService = {
  getTasks: async (): Promise<ApiTask[]> => {
    return Promise.resolve([
      {
        id: 'TSK-101',
        title: 'Audit AWS production architecture cost structures',
        priority: 'high',
        owner: 'Sarah Connor',
        deadline: '2026-07-03',
        status: 'In Progress',
        project: 'Cloud Scaling',
        createdBy: 'Vincent'
      }
    ]);
  },
  createTask: async (task: Omit<ApiTask, 'id'>): Promise<ApiTask> => {
    return Promise.resolve({ ...task, id: `TSK-${Math.floor(Math.random() * 1000)}` });
  },
  updateTask: async (id: string, updates: Partial<ApiTask>): Promise<ApiTask> => {
    return Promise.resolve({
      id,
      title: 'Audit AWS production architecture cost structures',
      priority: 'high',
      owner: 'Sarah Connor',
      deadline: '2026-07-03',
      status: 'In Progress',
      project: 'Cloud Scaling',
      createdBy: 'Vincent',
      ...updates
    });
  },
  deleteTask: async (id: string): Promise<void> => {
    return Promise.resolve();
  }
};
