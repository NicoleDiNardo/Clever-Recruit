import { useMemo } from 'react';
import { useUser } from '../context/UserContext';
import type { Role } from '../types';

/**
 * The permission boundary table from
 * /docs/clever-recruit-information-architecture.md, encoded once so every
 * route guard and every conditionally-rendered control reads from the same
 * source instead of re-deriving "can this role do X" inline. AUD-P0-01.
 */
export type Permission =
  | 'jobs.manage' // create / edit / publish / close a job
  | 'candidates.manage' // create / edit / delete a candidate, free stage changes
  | 'candidates.review' // view + shortlist / reject / leave feedback
  | 'companies.view'
  | 'team.view'
  | 'reports.view'
  | 'admin.users';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  recruiter: ['jobs.manage', 'candidates.manage', 'candidates.review', 'companies.view', 'team.view', 'reports.view'],
  hiring_manager: ['candidates.review'],
  admin: ['jobs.manage', 'candidates.manage', 'candidates.review', 'companies.view', 'team.view', 'reports.view', 'admin.users'],
};

/** Routes gated to specific roles, keyed by path, for use in RequireRole guards. */
export const ROUTE_ROLES: Record<string, Role[]> = {
  '/jobs': ['recruiter', 'admin'],
  '/companies': ['recruiter', 'admin'],
  '/team': ['recruiter', 'admin'],
  '/reports': ['recruiter', 'admin'],
  '/admin/users': ['admin'],
};

export function usePermissions() {
  const { role } = useUser();

  return useMemo(() => {
    const granted = new Set(ROLE_PERMISSIONS[role] ?? []);
    return {
      role,
      can: (permission: Permission) => granted.has(permission),
    };
  }, [role]);
}
