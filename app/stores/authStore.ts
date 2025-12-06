import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>, password: string) => void;
}

// Usuarios por defecto del sistema
const defaultUsers: (User & { password: string })[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Administrador',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    password: 'admin123',
  },
  {
    id: '2',
    username: 'cajero',
    name: 'Cajero Principal',
    role: 'cajero',
    isActive: true,
    createdAt: new Date(),
    password: 'cajero123',
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: defaultUsers,

      login: (username: string, password: string) => {
        const users = get().users as (User & { password: string })[];
        const foundUser = users.find(
          (u) => u.username === username && u.password === password && u.isActive
        );

        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          set({ user: userWithoutPassword, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      addUser: (userData, password) => {
        const newUser = {
          ...userData,
          id: uuidv4(),
          createdAt: new Date(),
          password,
        };
        set((state) => ({
          users: [...state.users, newUser as User & { password: string }],
        }));
      },
    }),
    {
      name: 'pos-auth-storage',
    }
  )
);
