import { create } from 'zustand';
import { CandidateProfile, RecruiterProfile } from '@/services/profileServiceTypes'; // New import for types

type UserRoleBackend = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

interface User {
  id: number;
  email: string;
  name: string;
  role: UserRoleBackend;
  candidate_profile?: CandidateProfile; // Optional profile data
  recruiter_profile?: RecruiterProfile; // Optional profile data
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User | null) => void; // Simplified, tokens now in cookies
  setUser: (user: User) => void; 
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  (set) => ({ // Removed persist middleware
    user: null,
    isAuthenticated: false,
    setAuth: (user) => set({ // Simplified setAuth
      user: user ? { ...user, role: user.role } : null,
      isAuthenticated: !!user 
    }),
    setUser: (user) => set((state) => ({ 
      user: { ...user, role: user.role }, 
      isAuthenticated: true 
    })),
    logout: () => set({ user: null, isAuthenticated: false }),
  })
);
