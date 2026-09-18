import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Application } from '../types';

/**
 * Public applications, keyed separately from the internal Candidates store
 * (see CandidatesContext) even though applying also creates a Candidate —
 * this is the thin record a candidate can look themselves up by (email +
 * id), and it's the only state a public, unauthenticated visitor can write.
 * No backend: this is a client-only demo (product-definition.md).
 */
const STORAGE_KEY = 'cr-applications-v1';

function loadApplications(): Application[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Application[];
  } catch {
    /* ignore */
  }
  return [];
}

interface ApplicationsContextType {
  applications: Application[];
  addApplication: (application: Application) => void;
  findExisting: (jobId: string, email: string) => Application | undefined;
  findByEmailAndId: (email: string, applicationId: string) => Application | undefined;
}

const ApplicationsContext = createContext<ApplicationsContextType | null>(null);

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>(loadApplications);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }, [applications, hydrated]);

  const addApplication = useCallback((application: Application) => {
    setApplications((prev) => [application, ...prev]);
  }, []);

  const findExisting = useCallback(
    (jobId: string, email: string) => {
      const normalized = email.trim().toLowerCase();
      return applications.find((a) => a.jobId === jobId && a.email.trim().toLowerCase() === normalized);
    },
    [applications]
  );

  const findByEmailAndId = useCallback(
    (email: string, applicationId: string) => {
      const normalized = email.trim().toLowerCase();
      return applications.find(
        (a) => a.id === applicationId.trim() && a.email.trim().toLowerCase() === normalized
      );
    },
    [applications]
  );

  const value = useMemo(
    () => ({ applications, addApplication, findExisting, findByEmailAndId }),
    [applications, addApplication, findExisting, findByEmailAndId]
  );

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

export function useApplications() {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error('useApplications must be used within ApplicationsProvider');
  return ctx;
}
