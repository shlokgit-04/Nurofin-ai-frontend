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

export interface DashboardSummary {
  activeProjects: number;
  completedProjects: number;
  todayTasks: number;
  overdueTasks: number;
  todayMeetings: number;
  highPriorityTasks: number;
  pendingInvitations: number;
  meetingsNeedingMOM: number;
  pendingApprovals: number;
  upcomingDeadlines: number;
  recentActivity?: { action: string; description: string; time: string }[];
}

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await fetch('/api/v1/dashboard/summary', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    const json = await res.json();
    return json.data;
  }
};
