import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { mockInterviews as initialInterviews } from '../data/mockInterviews';
import type { Interview } from '../types';

const STORAGE_KEY = 'cr-interviews-v1';

function loadInterviews(): Interview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Interview[];
  } catch {
    /* ignore */
  }
  return initialInterviews;
}

interface InterviewsContextType {
  interviews: Interview[];
  addInterview: (interview: Interview) => void;
  updateInterview: (id: string, updates: Partial<Interview>) => void;
  /** Interviews sharing at least one interviewer with `interviewerIds` whose
   *  [scheduledAt, scheduledAt + durationMinutes) window overlaps the given
   *  one — the double-booking check AUD-P1-02 calls for. `excludeId` lets
   *  the scheduling form re-check an interview against itself while editing. */
  findConflicts: (
    interviewerIds: string[],
    scheduledAt: string,
    durationMinutes: number,
    excludeId?: string
  ) => Interview[];
}

const InterviewsContext = createContext<InterviewsContextType | null>(null);

export function InterviewsProvider({ children }: { children: ReactNode }) {
  const [interviews, setInterviews] = useState<Interview[]>(loadInterviews);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
  }, [interviews, hydrated]);

  const addInterview = useCallback((interview: Interview) => {
    setInterviews((prev) => [interview, ...prev]);
  }, []);

  const updateInterview = useCallback((id: string, updates: Partial<Interview>) => {
    setInterviews((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i))
    );
  }, []);

  const findConflicts = useCallback(
    (interviewerIds: string[], scheduledAt: string, durationMinutes: number, excludeId?: string) => {
      const start = new Date(scheduledAt).getTime();
      const end = start + durationMinutes * 60_000;
      return interviews.filter((existing) => {
        if (existing.id === excludeId) return false;
        if (existing.status === 'cancelled') return false;
        if (!existing.interviewerIds.some((id) => interviewerIds.includes(id))) return false;
        const existingStart = new Date(existing.scheduledAt).getTime();
        const existingEnd = existingStart + existing.durationMinutes * 60_000;
        return start < existingEnd && existingStart < end;
      });
    },
    [interviews]
  );

  const value = useMemo(
    () => ({ interviews, addInterview, updateInterview, findConflicts }),
    [interviews, addInterview, updateInterview, findConflicts]
  );

  return <InterviewsContext.Provider value={value}>{children}</InterviewsContext.Provider>;
}

export function useInterviews() {
  const ctx = useContext(InterviewsContext);
  if (!ctx) throw new Error('useInterviews must be used within InterviewsProvider');
  return ctx;
}
