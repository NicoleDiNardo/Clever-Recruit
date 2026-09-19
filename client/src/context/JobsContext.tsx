import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { mockJobs as initialJobs } from '../data/mockData';
import type { Job } from '../types';

/* AUD-P1-03 fix: the recruiter-side Jobs page and the public /careers site
 * used to each read their own disconnected copy of job data (Jobs/index.tsx
 * held it in local useState; Careers/Directory.tsx, JobDetail.tsx and
 * Apply.tsx each imported the static `mockJobs` array directly). Neither
 * copy was ever mutated in place, so a recruiter creating a draft,
 * previewing it, and clicking Publish never actually changed what a
 * candidate could see on /careers — the "job appears on the public
 * directory" success criterion documented in user-flows.md flow 3 was not
 * actually true. This context is the shared store that makes it true,
 * persisted like CandidatesContext/InterviewsContext so it survives a
 * reload rather than resetting to the mock seed.
 *
 * Not migrated to this context (left reading the static `mockJobs` import
 * directly, documented as an intentional boundary rather than an oversight):
 * Pipeline, Calendar, Interviews/index.tsx and ScheduleInterviewModal — all
 * of these only use job data for read-only title lookups/dropdowns tied to
 * interview scheduling and candidate-job matching, not for the
 * publish-visibility promise this fix addresses. */
const STORAGE_KEY = 'cr-jobs-v1';

function loadJobs(): Job[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Job[];
  } catch {
    /* ignore */
  }
  return initialJobs;
}

interface JobsContextType {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
}

const JobsContext = createContext<JobsContextType | null>(null);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(loadJobs);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs, hydrated]);

  return <JobsContext.Provider value={{ jobs, setJobs }}>{children}</JobsContext.Provider>;
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error('useJobs must be used within JobsProvider');
  return ctx;
}
