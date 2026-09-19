import type { Job } from '../types';

/**
 * The only Candidate-to-Job linkage that exists in this dataset: a
 * case-insensitive match of a free-text job title against Job.title.
 * `Assignment` is declared in types but never populated in mockData.ts, and
 * there's no real foreign key to use instead — Jobs/index.tsx's candidate
 * counts, the Pipeline board's job scoping, and interview scheduling all
 * rely on this same match rather than each inventing their own.
 */
export function findJobByTitle(jobTitle: string | undefined, jobs: Job[]): Job | undefined {
  if (!jobTitle) return undefined;
  return jobs.find((j) => j.title.toUpperCase() === jobTitle.toUpperCase());
}
