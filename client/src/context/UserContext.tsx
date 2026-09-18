import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { isEmbedMode } from '../hooks/useEmbedMode';
import { mockUsers } from '../data/mockData';
import type { Role } from '../types';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  bio: string;
  avatar: string | null;
  role: Role;
}

interface UserContextType {
  user: UserProfile;
  /** Canonical role for permission checks — same value as user.role, exposed
   *  directly so usePermissions doesn't need to know the profile shape. */
  role: Role;
  isAuthenticated: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setAvatar: (file: File | null) => void;
  login: (email: string, password: string) => boolean;
  /** Demo-only: switch the active session to one of the seeded users, so
   *  role-gated behaviour can actually be exercised without a real backend.
   *  Used by the Login page's "try a role" buttons. */
  loginAs: (userId: string) => void;
  logout: () => void;
}

const ACTIVE_USER_KEY = 'cr-active-user-id';

const JOB_TITLE_BY_ROLE: Record<Role, string> = {
  recruiter: 'Senior Recruiter',
  hiring_manager: 'Hiring Manager',
  admin: 'Admin',
};

function profileForMockUser(id: string): UserProfile {
  const match = mockUsers.find((u) => u.id === id) ?? mockUsers[0];
  return {
    id: match.id,
    firstName: match.firstName,
    lastName: match.lastName,
    email: match.email,
    phone: '+1 (555) 123-4567',
    jobTitle: JOB_TITLE_BY_ROLE[match.role],
    bio: 'Passionate about finding the right people for the right roles.',
    avatar: null,
    role: match.role,
  };
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(() => {
    const storedId = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_USER_KEY) : null;
    return profileForMockUser(storedId ?? '1');
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (import.meta.env.VITE_DEMO_MODE === 'true') return true;
    if (isEmbedMode()) return true;
    return !!localStorage.getItem('cr-auth');
  });

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  const setAvatar = useCallback((file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setUser((prev) => ({ ...prev, avatar: url }));
    } else {
      setUser((prev) => ({ ...prev, avatar: null }));
    }
  }, []);

  const loginAs = useCallback((userId: string) => {
    localStorage.setItem('cr-auth', 'true');
    localStorage.setItem(ACTIVE_USER_KEY, userId);
    setUser(profileForMockUser(userId));
    setIsAuthenticated(true);
  }, []);

  /* Demo login has no real credential check — it matches the typed email
     against the seeded users so the standard sign-in form also lands on the
     right role, instead of always becoming Jenny regardless of who "signed
     in". Unknown emails still default to the recruiter demo account. */
  const login = useCallback((email: string, _password: string) => {
    const match = mockUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    loginAs(match?.id ?? '1');
    return true;
  }, [loginAs]);

  const logout = useCallback(() => {
    localStorage.removeItem('cr-auth');
    setIsAuthenticated(false);
  }, []);

  return (
    <UserContext.Provider
      value={{ user, role: user.role, isAuthenticated, updateProfile, setAvatar, login, loginAs, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
