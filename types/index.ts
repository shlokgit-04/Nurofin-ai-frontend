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
  username?: string;
  is_active?: boolean;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
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

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'completed' | 'blocked';
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

export interface MeetingParticipant {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  status: 'pending' | 'accepted' | 'declined' | 'maybe';
}

export interface MeetingTimelineEvent {
  id: string;
  meeting_id: string;
  action: string;
  description: string;
  user_id?: string;
  user_name?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface MeetingExtractedTask {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  priority: string;
  suggested_owner?: string;
  deadline?: string;
  dependencies?: string[];
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  real_task_id?: string;
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
  type: string;
  status?: string;
  owner_id?: string;
  owner_name?: string;
  owner_avatar?: string;
  participants?: MeetingParticipant[];
  participants_count?: number;
  mom_summary?: string;
  mom_file_path?: string;
  created_at?: string;
  agenda?: string;
  meeting_link?: string;
  location?: string;
  timezone?: string;
  is_recurring?: boolean;
  recurrence_rule?: string;
  mom_executive_summary?: string;
  mom_decisions?: string[];
  mom_action_items?: string[];
  mom_risks?: string[];
  mom_blockers?: string[];
  mom_followups?: string[];
  mom_deadlines?: string[];
  mom_important_dates?: string[];
  timeline?: MeetingTimelineEvent[];
  extracted_tasks?: MeetingExtractedTask[];
  transcript?: string;
  ai_summary?: string;
  minutes_of_meeting?: string;
  analysis_status?: 'uploaded' | 'processing' | 'completed' | 'failed';
  metadata_json?: string;
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
  link?: string;
  notification_type?: string;
}
