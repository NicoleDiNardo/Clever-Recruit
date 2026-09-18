import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { mockUsers } from '../data/mockData';
import type { OrgUser, Role } from '../types';

const STORAGE_KEY = 'cr-org-users-v1';

function loadUsers(): OrgUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as OrgUser[];
  } catch {
    /* ignore */
  }
  return mockUsers.map((u) => ({ ...u, status: 'active' as const }));
}

interface OrgUsersContextType {
  users: OrgUser[];
  inviteUser: (email: string, role: Role) => { ok: true } | { ok: false; reason: string };
  changeRole: (userId: string, role: Role) => { ok: true } | { ok: false; reason: string };
}

const OrgUsersContext = createContext<OrgUsersContextType | null>(null);

export function OrgUsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<OrgUser[]>(loadUsers);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users, hydrated]);

  const inviteUser = useCallback(
    (email: string, role: Role) => {
      const normalized = email.trim().toLowerCase();
      if (users.some((u) => u.email.toLowerCase() === normalized)) {
        return { ok: false as const, reason: 'Someone with this email is already on the team.' };
      }
      const [firstName = 'New', lastName = 'Member'] = normalized.split('@')[0].split('.');
      const newUser: OrgUser = {
        id: `pending-${Date.now()}`,
        email: normalized,
        firstName: capitalize(firstName),
        lastName: capitalize(lastName),
        role,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      return { ok: true as const };
    },
    [users]
  );

  /* An org that demotes its only admin locks itself out of the admin area
     entirely — a real edge case worth guarding against, per the edge-cases
     doc's "administrator changes permissions" flow. */
  const changeRole = useCallback(
    (userId: string, role: Role) => {
      const target = users.find((u) => u.id === userId);
      if (!target) return { ok: false as const, reason: 'User not found.' };
      const remainingAdmins = users.filter((u) => u.role === 'admin' && u.id !== userId);
      if (target.role === 'admin' && role !== 'admin' && remainingAdmins.length === 0) {
        return { ok: false as const, reason: "This is the only admin — promote someone else first." };
      }
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      return { ok: true as const };
    },
    [users]
  );

  const value = useMemo(() => ({ users, inviteUser, changeRole }), [users, inviteUser, changeRole]);

  return <OrgUsersContext.Provider value={value}>{children}</OrgUsersContext.Provider>;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function useOrgUsers() {
  const ctx = useContext(OrgUsersContext);
  if (!ctx) throw new Error('useOrgUsers must be used within OrgUsersProvider');
  return ctx;
}
