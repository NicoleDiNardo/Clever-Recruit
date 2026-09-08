import type { MantineColor } from '@mantine/core';

/**
 * One pipeline-stage colour map for the whole app.
 *
 * There were three: Dashboard, Candidates and the Reports funnel each carried
 * their own, and they disagreed. "Hired" was green on two pages and red — the
 * app's rejection colour — on the third, and Candidates had no case for
 * `applied`, `screening` or `assessment`, which is 69% of the seeded records,
 * so most of the Status column rendered as one indistinguishable grey.
 *
 * Red is reserved for `rejected`.
 */
export const STAGE_COLORS: Record<string, MantineColor> = {
  applied: 'blue',
  screening: 'cyan',
  interview: 'teal',
  assessment: 'yellow',
  offer: 'orange',
  hired: 'green',
  rejected: 'red',
};

export function getStageColor(stage?: string): MantineColor {
  if (!stage) return 'gray';
  return STAGE_COLORS[stage.toLowerCase()] ?? 'gray';
}

/** Candidate availability, not pipeline position. */
export function getStatusColor(status?: string): MantineColor {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'teal';
    case 'inactive':
      return 'gray';
    default:
      return 'blue';
  }
}

/**
 * Employment status is a biographical fact, not a verdict — "Freelance" and
 * "Unemployed" used to render in the destructive red.
 */
export function getEmploymentColor(status?: string): MantineColor {
  switch (status?.toLowerCase()) {
    case 'employed':
      return 'teal';
    case 'freelance':
      return 'blue';
    default:
      return 'gray';
  }
}

/** Shared by the Candidates table and the candidate drawer, which had copies. */
export function getJobTitleColor(title?: string): MantineColor {
  if (!title) return 'gray';
  const t = title.toLowerCase();
  if (t.includes('engineer') || t.includes('software')) return 'cyan';
  if (t.includes('designer')) return 'violet';
  if (t.includes('manager')) return 'teal';
  return 'blue';
}
