import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgCard: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Borders
  borderColor: string;
  borderHover: string;

  // Accents
  accent: string;
  accentHover: string;
  accentBg: string;
  accentBorder: string;

  // Status colors
  success: string;
  successBg: string;
  successBorder: string;
  error: string;
  errorBg: string;
  errorBorder: string;
  warning: string;
  warningBg: string;
  warningBorder: string;
}

const darkTheme: ThemeColors = {
  bgPrimary: '#030712',
  bgSecondary: '#1d1d1d',
  bgTertiary: '#2a2a2a',
  bgCard: '#1d1d1d',

  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',

  borderColor: 'rgba(255, 255, 255, 0.1)',
  borderHover: 'rgba(59, 130, 246, 0.5)',

  accent: '#3b82f6',
  accentHover: 'rgba(59, 130, 246, 0.8)',
  accentBg: 'rgba(59, 130, 246, 0.1)',
  accentBorder: 'rgba(59, 130, 246, 0.3)',

  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.1)',
  successBorder: 'rgba(16, 185, 129, 0.3)',
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.3)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  warningBorder: 'rgba(245, 158, 11, 0.3)',
};

const lightTheme: ThemeColors = {
  bgPrimary: '#f8fafc',
  bgSecondary: '#ffffff',
  bgTertiary: '#f1f5f9',
  bgCard: '#ffffff',

  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',

  borderColor: 'rgba(0, 0, 0, 0.1)',
  borderHover: 'rgba(59, 130, 246, 0.5)',

  accent: '#3b82f6',
  accentHover: '#2563eb',
  accentBg: 'rgba(59, 130, 246, 0.1)',
  accentBorder: 'rgba(59, 130, 246, 0.3)',

  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.1)',
  successBorder: 'rgba(16, 185, 129, 0.3)',
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.3)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  warningBorder: 'rgba(245, 158, 11, 0.3)',
};

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      colors: darkTheme,

      toggleTheme: () => {
        set((state) => ({
          mode: state.mode === 'dark' ? 'light' : 'dark',
          colors: state.mode === 'dark' ? lightTheme : darkTheme,
        }));
      },

      setTheme: (mode: ThemeMode) => {
        set({
          mode,
          colors: mode === 'dark' ? darkTheme : lightTheme,
        });
      },
    }),
    {
      name: 'pos-theme-storage',
    }
  )
);
