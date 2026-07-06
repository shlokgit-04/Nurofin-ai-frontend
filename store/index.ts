import { create } from 'zustand';
import { 
  UserProfile, 
  Project, 
  Task, 
  Meeting, 
  Issue, 
  FinanceRecord, 
  NotificationItem,
  TaskStatus,
  TaskPriority,
  IssueStatus,
  IssueSeverity
} from '../types';

interface AppState {
  // Navigation & Shell
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  searchQuery: string;
  activeTab: string;
  aiStatus: 'idle' | 'analyzing' | 'thinking';
  
  // App Entities
  userProfile: UserProfile;
  notifications: NotificationItem[];
  projects: Project[];
  tasks: Task[];
  meetings: Meeting[];
  issues: Issue[];
  financeRecords: FinanceRecord[];

  // Mutators
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: string) => void;
  setAiStatus: (status: 'idle' | 'analyzing' | 'thinking') => void;
  
  // User Profile Actions
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Notification Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'read' | 'time'>) => void;

  // Project Actions
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;

  // Task Actions
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  changeTaskStatus: (id: string, status: TaskStatus) => void;

  // Meeting Actions
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;

  // Issue Actions
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;

  // Finance Actions
  addFinanceRecord: (record: FinanceRecord) => void;
}

export const useStore = create<AppState>((set) => ({
  // Navigation & Shell Defaults
  sidebarCollapsed: false,
  theme: 'dark',
  searchQuery: '',
  activeTab: 'dashboard',
  aiStatus: 'idle',

  // Mock User Profile
  userProfile: {
    id: 'usr-1',
    name: 'Vincent N.',
    email: 'vincent@nurofin.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    role: 'CEO',
    department: 'Executive Office',
    skills: ['Strategic Planning', 'Capital Allocation', 'Executive Leadership', 'Mergers & Acquisitions', 'Financial Operations'],
    github: 'https://github.com/vincent-nurofin',
    linkedin: 'https://linkedin.com/in/vincent-nurofin',
    phone: '+1 (555) 019-2834',
  },

  // Mock Notifications
  notifications: [
    {
      id: 'notif-1',
      title: 'Overdue Vendor Payment Alert',
      description: 'Acme Corp invoice of $12,450 is 3 days overdue. Tap to view details.',
      time: '10 mins ago',
      type: 'error',
      read: false,
      category: 'finance',
    },
    {
      id: 'notif-2',
      title: 'Q2 Strategy Briefing Meeting',
      description: 'Q2 Strategy Review begins in 15 minutes. Note editor has been initialized.',
      time: '15 mins ago',
      type: 'info',
      read: false,
      category: 'meetings',
    },
    {
      id: 'notif-3',
      title: 'Project Delta Delay Risk',
      description: 'Project Delta timeline is at risk due to pending API keys from integrations.',
      time: '2 hours ago',
      type: 'warning',
      read: false,
      category: 'tasks',
    },
    {
      id: 'notif-4',
      title: 'Permissions Audit Complete',
      description: 'The weekly automated role and permissions audit resolved successfully.',
      time: '1 day ago',
      type: 'success',
      read: true,
      category: 'alerts',
    },
  ],

  // Mock Projects
  projects: [
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
    {
      id: 'proj-3',
      name: 'Corporate Site V2',
      description: 'Redesigning brand site to highlight new B2B banking models.',
      status: 'completed',
      progress: 100,
      startDate: '2026-02-01',
      endDate: '2026-06-15',
      members: [
        { id: 'm-5', name: 'Jane Miller', role: 'UI Designer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
      ],
      activities: [
        { id: 'act-4', user: 'Jane Miller', action: 'moved site to production', target: 'nurofin.com', time: '3 weeks ago' },
      ],
    },
  ],

  // Mock Tasks (Work Center)
  tasks: [
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
    {
      id: 'task-3',
      title: 'Design Budget Allocation for Q3/Q4',
      description: 'Allocate infrastructure funding and headcount budget caps for financial ledger sharding operations.',
      status: 'review',
      priority: 'medium',
      dueDate: '2026-07-15',
      assignedTo: { name: 'Vincent N.', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100' },
    },
    {
      id: 'task-4',
      title: 'Configure CORS Guidelines on Static Bucket',
      description: 'Open origins to allowed enterprise endpoints and disable wildcard endpoints.',
      status: 'done',
      priority: 'low',
      dueDate: '2026-06-12',
      assignedTo: { name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
      projectName: 'Corporate Site V2',
      projectId: 'proj-3',
    },
  ],

  // Mock Meetings
  meetings: [
    {
      id: 'meet-1',
      title: 'Nurofin Executive Strategy Review',
      date: '2026-07-06',
      time: '14:00',
      duration: '45 mins',
      attendees: ['Vincent N. (CEO)', 'Sarah Connor (PM)', 'John Doe (Lead Arch)'],
      notes: 'Review ledger sharding blueprints and confirm vendor payout authorizations.',
      type: 'hybrid',
    },
    {
      id: 'meet-2',
      title: 'API Gateway Authentication Review',
      date: '2026-07-07',
      time: '10:30',
      duration: '30 mins',
      attendees: ['Aryan Dev', 'John Doe'],
      notes: 'Go over GetStream connection tokens and CORS rules config.',
      type: 'video',
    },
  ],

  // Mock Issues
  issues: [
    {
      id: 'iss-1',
      title: 'Compliance mismatch on ledger sharding schema',
      description: 'Audit logs throw warning on Q2 formatting standards due to timestamp variance.',
      status: 'open',
      severity: 'high',
      assignedTo: 'John Doe',
      createdAt: '2026-07-05',
    },
    {
      id: 'iss-2',
      title: 'CORS policy blocks public logo vectors',
      description: 'Light/Dark mode SVGs return CORS preflight error on static CDN assets.',
      status: 'in_progress',
      severity: 'medium',
      assignedTo: 'Aryan Dev',
      createdAt: '2026-07-06',
    },
  ],

  // Mock Finance Records
  financeRecords: [
    {
      id: 'fin-1',
      category: 'vendor_payment',
      title: 'Acme Developer Seat Licenses',
      amount: 12450.00,
      dueDate: '2026-07-03',
      status: 'overdue',
      vendor: 'Acme Corp',
      department: 'Engineering',
    },
    {
      id: 'fin-2',
      category: 'expense',
      title: 'GetStream Real-Time Chat Plan',
      amount: 4500.00,
      dueDate: '2026-07-15',
      status: 'pending',
      vendor: 'Stream.io',
      department: 'Product',
    },
    {
      id: 'fin-3',
      category: 'budget',
      title: 'Q3 Enterprise Infrastructure Budget',
      amount: 150000.00,
      dueDate: '2026-09-01',
      status: 'approved',
      department: 'Operations',
      chartData: [
        { name: 'Hosting', value: 80000 },
        { name: 'Licenses', value: 35000 },
        { name: 'Support', value: 20000 },
        { name: 'Reserves', value: 15000 },
      ],
    },
    {
      id: 'fin-4',
      category: 'renewal',
      title: 'AWS Ledger DB Instances Renewal',
      amount: 28900.00,
      dueDate: '2026-08-01',
      status: 'pending',
      vendor: 'Amazon Web Services',
      department: 'Infrastructure',
    },
  ],

  // Shell State Mutators
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setAiStatus: (status) => set({ aiStatus: status }),

  // User Actions
  updateUserProfile: (profile) => set((state) => ({
    userProfile: { ...state.userProfile, ...profile }
  })),

  // Notification Actions
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  markAllNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  addNotification: (notif) => set((state) => ({
    notifications: [
      {
        ...notif,
        id: `notif-${Date.now()}`,
        read: false,
        time: 'Just now',
      },
      ...state.notifications
    ]
  })),

  // Project Actions
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  // Task Actions
  addTask: (task) => set((state) => ({
    tasks: [task, ...state.tasks]
  })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
  changeTaskStatus: (id, status) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
  })),

  // Meeting Actions
  addMeeting: (meeting) => set((state) => ({
    meetings: [...state.meetings, meeting]
  })),
  updateMeeting: (id, updates) => set((state) => ({
    meetings: state.meetings.map(m => m.id === id ? { ...m, ...updates } : m)
  })),

  // Issue Actions
  addIssue: (issue) => set((state) => ({
    issues: [issue, ...state.issues]
  })),
  updateIssue: (id, updates) => set((state) => ({
    issues: state.issues.map(i => i.id === id ? { ...i, ...updates } : i)
  })),

  // Finance Actions
  addFinanceRecord: (record) => set((state) => ({
    financeRecords: [...state.financeRecords, record]
  })),
}));
