// ============================================================
// sessionStore — ADO
// Global UI + session state (user, language, active module)
// ============================================================

import { create } from 'zustand';
import type { Language, ModuleId } from '../config/types';

interface SessionState {
  // User
  userName: string;
  userRank: string;
  userInitials: string;

  // Language (mirrored here for non-React contexts)
  lang: Language;
  setLang: (lang: Language) => void;

  // Active module
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Current date (formatted)
  currentDate: string;
}

export const useSessionStore = create<SessionState>((set) => ({
  // Default user — will be replaced by auth in future
  userName:     'MAJ R. de Groot',
  userRank:     'MAJ',
  userInitials: 'MJ',

  lang: 'nl',
  setLang: (lang) => set({ lang }),

  activeModule: 'dashboard',
  setActiveModule: (module) => set({ activeModule: module }),

  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  currentDate: new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
}));
