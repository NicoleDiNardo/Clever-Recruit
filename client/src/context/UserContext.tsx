import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { isEmbedMode } from '../hooks/useEmbedMode';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  bio: string;
  avatar: string | null;
  role: string;
}

interface UserContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setAvatar: (file: File | null) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const defaultUser: UserProfile = {
  firstName: 'Jenny',
  lastName: 'Chen',
  email: 'jenny@cleverrecruit.com',
  phone: '+1 (555) 123-4567',
  jobTitle: 'Senior Recruiter',
  bio: 'Passionate recruiter with 5+ years of experience in tech talent acquisition.',
  avatar: null,
  role: 'Recruiter',
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);
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

  const login = useCallback((email: string, _password: string) => {
    localStorage.setItem('cr-auth', 'true');
    setIsAuthenticated(true);
    if (email) {
      setUser((prev) => ({ ...prev, email }));
    }
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cr-auth');
    setIsAuthenticated(false);
  }, []);

  return (
    <UserContext.Provider value={{ user, isAuthenticated, updateProfile, setAvatar, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
