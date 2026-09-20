import { mockCandidates, mockJobs, mockUsers } from './mockData';
import type { Interview } from '../types';
import { findJobByTitle } from '../utils/jobMatch';

/**
 * Seed interviews for the Calendar/Interviews pages — AUD-P1-02. Built from
 * the real candidate, job and user records (never free-text names the way
 * the old Calendar page's hardcoded list was), and dated relative to
 * whenever the app loads rather than fixed calendar dates, so "Today" and
 * "Upcoming" stay meaningful no matter when this demo is opened.
 *
 * Candidate → job linkage reuses the same case-insensitive jobTitle match
 * Jobs/index.tsx and the Pipeline board already rely on, since there's no
 * real foreign key between the two in this dataset. Where a candidate's
 * jobTitle doesn't match any seeded job, the interview is simply left
 * without one (Interview.jobId is optional) rather than guessing.
 */
function findJobId(jobTitle?: string): string | undefined {
  return findJobByTitle(jobTitle, mockJobs)?.id;
}

function atTime(daysFromNow: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const interviewers = mockUsers.filter((u) => u.role !== 'hiring_manager');
const candidatesInInterview = mockCandidates.filter((c) => c.stage === 'interview');

const SEED_SLOTS: {
  daysFromNow: number;
  hour: number;
  minute?: number;
  durationMinutes: number;
  type: Interview['type'];
  status?: Interview['status'];
  outcome?: Interview['outcome'];
}[] = [
  { daysFromNow: 0, hour: 9, durationMinutes: 45, type: 'video' },
  { daysFromNow: 0, hour: 11, minute: 30, durationMinutes: 30, type: 'phone' },
  { daysFromNow: 0, hour: 14, durationMinutes: 60, type: 'onsite' },
  { daysFromNow: 1, hour: 10, durationMinutes: 45, type: 'video' },
  { daysFromNow: 1, hour: 15, durationMinutes: 30, type: 'phone' },
  { daysFromNow: 2, hour: 9, durationMinutes: 60, type: 'onsite' },
  { daysFromNow: 3, hour: 13, durationMinutes: 45, type: 'video' },
  // A completed one from earlier this week, to seed the outcome field —
  // otherwise nothing in the app would ever show a non-'scheduled' status.
  { daysFromNow: -2, hour: 10, durationMinutes: 45, type: 'video', status: 'completed', outcome: 'advance' },
];

export const mockInterviews: Interview[] = SEED_SLOTS.map((slot, i) => {
  const pool = candidatesInInterview.length > 0 ? candidatesInInterview : mockCandidates;
  const candidate = pool[i % pool.length];
  const interviewer = interviewers[i % interviewers.length];
  return {
    id: `seed-${i + 1}`,
    candidateId: candidate.id,
    jobId: findJobId(candidate.jobTitle),
    interviewerIds: [interviewer.id],
    scheduledAt: atTime(slot.daysFromNow, slot.hour, slot.minute),
    durationMinutes: slot.durationMinutes,
    type: slot.type,
    status: slot.status ?? 'scheduled',
    outcome: slot.outcome,
    createdAt: atTime(slot.daysFromNow - 3, 9),
  };
});
