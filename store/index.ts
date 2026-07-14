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
  selectedProvider: string;
  selectedModel: string;
  
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
  setSelectedProvider: (provider: string) => void;
  setSelectedModel: (model: string) => void;
  
  // User Profile Actions
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Notification Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'read' | 'time'>) => void;

  // Project Actions
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  setProjects: (projects: Project[]) => void;

  // Task Actions
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  changeTaskStatus: (id: string, status: TaskStatus) => void;
  setTasks: (tasks: Task[]) => void;

  // Meeting Actions
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  setMeetings: (meetings: Meeting[]) => void;

  // Issue Actions
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;

  // Finance Actions
  addFinanceRecord: (record: FinanceRecord) => void;
}

export const useStore = create<AppState>((set) => ({
  // Navigation & Shell Defaults
  sidebarCollapsed: false,
  theme: 'light',
  searchQuery: '',
  activeTab: 'dashboard',
  aiStatus: 'idle',
  selectedProvider: 'openrouter',
  selectedModel: 'openai/gpt-oss-20b:free',

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
  projects: [],

  // Mock Tasks (Work Center)
  tasks: [],

  // Mock Meetings
  meetings: [],

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
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nurofin-theme', theme);
    }
    set({ theme });
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setAiStatus: (status) => set({ aiStatus: status }),
  setSelectedProvider: (provider: string) => set({ selectedProvider: provider }),
  setSelectedModel: (model: string) => set({ selectedModel: model }),

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
  setProjects: (projects) => set({ projects }),

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
  setTasks: (tasks) => set({ tasks }),

  // Meeting Actions
  addMeeting: (meeting) => set((state) => ({
    meetings: [...state.meetings, meeting]
  })),
  updateMeeting: (id, updates) => set((state) => ({
    meetings: state.meetings.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  setMeetings: (meetings) => set({ meetings }),

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
