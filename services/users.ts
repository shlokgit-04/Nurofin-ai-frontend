import { UserProfile as User } from '../types';

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

export interface DepartmentData {
  id: number;
  name: string;
  is_custom: boolean;
  roles: RoleData[];
}

export interface RoleData {
  id: number;
  name: string;
  is_custom: boolean;
  permissions: string[];
}

export const usersService = {
  getUsers: async (role?: string, department?: string): Promise<User[]> => {
    let url = '/api/v1/users/';
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (department) params.append('department', department);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch users');
    const json = await res.json();
    return (json.data || []).map((u: any) => ({
      id: u.id.toString(),
      name: u.full_name || u.username,
      email: u.email,
      username: u.username,
      role: u.role || 'Member',
      department: u.department,
      avatar: u.profile_picture || `https://ui-avatars.com/api/?name=${u.full_name || u.username}`,
      phone: u.phone,
      github: u.github,
      linkedin: u.linkedin,
      is_active: u.is_active,
      skills: [] // Added to conform to UserProfile type
    }));
  },

  createUser: async (userData: any): Promise<any> => {
    const res = await fetch('/api/v1/users/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create user' }));
      throw new Error(err.detail || 'Failed to create user');
    }
    return res.json();
  },

  updateUser: async (userId: string, userData: any): Promise<any> => {
    const res = await fetch(`/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update user' }));
      throw new Error(err.detail || 'Failed to update user');
    }
    return res.json();
  },

  deleteUser: async (userId: string): Promise<any> => {
    const res = await fetch(`/api/v1/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
  },

  getDepartments: async (): Promise<DepartmentData[]> => {
    const res = await fetch('/api/v1/users/departments', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch departments');
    const json = await res.json();
    return json.data || [];
  },

  createDepartment: async (name: string): Promise<DepartmentData> => {
    const res = await fetch('/api/v1/users/departments', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create department' }));
      throw new Error(err.detail || 'Failed to create department');
    }
    const json = await res.json();
    return json.data;
  },

  createRole: async (deptId: number, name: string, permissions: string[] = []): Promise<RoleData> => {
    const res = await fetch(`/api/v1/users/departments/${deptId}/roles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, permissions })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create role' }));
      throw new Error(err.detail || 'Failed to create role');
    }
    const json = await res.json();
    return json.data;
  },

  updateRolePermissions: async (deptId: number, roleId: number, permissions: string[]): Promise<any> => {
    const res = await fetch(`/api/v1/users/departments/${deptId}/roles/${roleId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(permissions)
    });
    if (!res.ok) throw new Error('Failed to update role permissions');
    return res.json();
  },

  deleteDepartment: async (deptId: number): Promise<any> => {
    const res = await fetch(`/api/v1/users/departments/${deptId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete department');
    return res.json();
  },

  deleteRole: async (deptId: number, roleId: number): Promise<any> => {
    const res = await fetch(`/api/v1/users/departments/${deptId}/roles/${roleId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete role');
    return res.json();
  }
};
