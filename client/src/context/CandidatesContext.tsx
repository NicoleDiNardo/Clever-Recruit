import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { mockCandidates as initialCandidates } from '../data/mockData';
import type { Candidate } from '../types';

/* Bumped when the seed data changes so stale demo state is superseded. */
const STORAGE_KEY = 'cr-candidates-v2';

function loadCandidates(): Candidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Candidate[];
  } catch {
    /* ignore */
  }
  return initialCandidates;
}

interface CandidatesContextType {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  addCandidate: (candidate: Candidate) => void;
  removeCandidate: (id: string) => void;
  resetCandidates: () => void;
  stageCounts: Record<string, number>;
}

const CandidatesContext = createContext<CandidatesContextType | null>(null);

const PIPELINE_KEYS = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'] as const;

export function CandidatesProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>(loadCandidates);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  }, [candidates, hydrated]);

  const updateCandidate = useCallback((id: string, updates: Partial<Candidate>) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  }, []);

  const addCandidate = useCallback((candidate: Candidate) => {
    setCandidates((prev) => [candidate, ...prev]);
  }, []);

  const removeCandidate = useCallback((id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const resetCandidates = useCallback(() => {
    setCandidates(initialCandidates);
  }, []);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const key of PIPELINE_KEYS) {
      counts[key] = candidates.filter((c) => c.stage === key).length;
    }
    counts.applied += candidates.filter((c) => !c.stage).length;
    return counts;
  }, [candidates]);

  const value = useMemo(
    () => ({
      candidates,
      setCandidates,
      updateCandidate,
      addCandidate,
      removeCandidate,
      resetCandidates,
      stageCounts,
    }),
    [candidates, updateCandidate, addCandidate, removeCandidate, resetCandidates, stageCounts]
  );

  return <CandidatesContext.Provider value={value}>{children}</CandidatesContext.Provider>;
}

export function useCandidates() {
  const ctx = useContext(CandidatesContext);
  if (!ctx) throw new Error('useCandidates must be used within CandidatesProvider');
  return ctx;
}
