import { User } from '../types';

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

export const usersService = {
  getUsers: async (): Promise<User[]> => {
    const res = await fetch('/api/v1/users/', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch users');
    const json = await res.json();
    return (json.data || []).map((u: any) => ({
      id: u.id.toString(),
      name: u.full_name || u.username,
      email: u.email,
      role: u.role || 'Member',
      avatar: u.profile_picture || `https://ui-avatars.com/api/?name=${u.full_name || u.username}`
    }));
  }
};
