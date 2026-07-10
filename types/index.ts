export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department?: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  phone?: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface ProjectActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'delayed' | 'on_hold' | 'cancelled';
  progress: number;
  startDate: string;
  endDate: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  gitUrl?: string;
  budget?: number;
  spending?: number;
  members: ProjectMember[];
  activities: ProjectActivity[];
  tasks?: Task[];
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedTo: {
    name: string;
    avatar: string;
  };
  projectId?: string;
  projectName?: string;
  comments?: TaskComment[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  notes?: string;
  momText?: string;
  type: 'video' | 'in-person' | 'hybrid';
}

export type IssueStatus = 'open' | 'in_progress' | 'resolved';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  severity: IssueSeverity;
  assignedTo: string;
  createdAt: string;
  projectId?: string;
}

export interface FinanceRecord {
  id: string;
  category: 'vendor_payment' | 'expense' | 'budget' | 'renewal';
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'approved';
  vendor?: string;
  department?: string;
  chartData?: { name: string; value: number }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  category: 'general' | 'tasks' | 'meetings' | 'finance' | 'alerts';
}
