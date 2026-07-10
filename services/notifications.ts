import { NotificationItem } from '../types';

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

export const notificationsService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await fetch('/api/v1/notifications/', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const json = await res.json();
    return json.data || [];
  },
  
  markAsRead: async (id: number): Promise<void> => {
    const res = await fetch(`/api/v1/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
  }
};
