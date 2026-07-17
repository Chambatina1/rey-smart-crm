import { create } from 'zustand';

export type AppView =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'leads'
  | 'clients'
  | 'client-detail'
  | 'disputes'
  | 'dispute-detail'
  | 'courses'
  | 'course-detail'
  | 'conferences'
  | 'appointments'
  | 'messages'
  | 'documents'
  | 'billing'
  | 'finance'
  | 'quickbooks'
  | 'settings'
  | 'team'
  | 'client-portal'
  | 'client-portal-credit'
  | 'client-portal-disputes'
  | 'client-portal-courses'
  | 'client-portal-messages'
  | 'client-portal-schedule';

interface NavigationState {
  currentView: AppView;
  selectedClientId: string | null;
  selectedDisputeId: string | null;
  selectedCourseId: string | null;
  sidebarOpen: boolean;
  navigate: (view: AppView) => void;
  selectClient: (id: string | null) => void;
  selectDispute: (id: string | null) => void;
  selectCourse: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentView: 'landing',
  selectedClientId: null,
  selectedDisputeId: null,
  selectedCourseId: null,
  sidebarOpen: true,
  navigate: (view) => set({ currentView: view }),
  selectClient: (id) => set({ selectedClientId: id }),
  selectDispute: (id) => set({ selectedDisputeId: id }),
  selectCourse: (id) => set({ selectedCourseId: id }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
