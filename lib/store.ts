import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

interface AppState {
  activeTab: string;
  sidebarCollapsed: boolean;
  searchQuery: string;
  aiStatus: 'idle' | 'analyzing' | 'thinking';
  theme: 'dark' | 'light';
  notifications: Notification[];
  userProfile: {
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setAiStatus: (status: 'idle' | 'analyzing' | 'thinking') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

export const useStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  sidebarCollapsed: false,
  searchQuery: '',
  aiStatus: 'idle',
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  notifications: [
    {
      id: '1',
      title: 'Vendor Invoice Overdue',
      description: 'Acme Corp invoice of $12,450 is 3 days overdue.',
      time: '10 mins ago',
      type: 'error',
      read: false,
    },
    {
      id: '2',
      title: 'Q2 Financial Review',
      description: 'The Q2 financial review meeting begins in 15 minutes.',
      time: '15 mins ago',
      type: 'info',
      read: false,
    },
    {
      id: '3',
      title: 'Project Delayed',
      description: 'Project Alpha is marked as delayed due to resource bottleneck.',
      time: '1 hour ago',
      type: 'warning',
      read: false,
    },
  ],
  userProfile: {
    name: 'Vincent N.',
    email: 'vincent@nurofin.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    role: 'CEO',
  },
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setAiStatus: (status) => set({ aiStatus: status }),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));
