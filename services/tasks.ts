import { Task } from '../types';

export const tasksService = {
  getTasks: async (): Promise<Task[]> => {
    const res = await fetch('/api/tasks');
    if (!res.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return res.json();
  },
  createTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    if (!res.ok) {
      throw new Error('Failed to create task');
    }
    return res.json();
  },
  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      throw new Error('Failed to update task');
    }
    return res.json();
  },
  deleteTask: async (id: string): Promise<void> => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Failed to delete task');
    }
  },
};
