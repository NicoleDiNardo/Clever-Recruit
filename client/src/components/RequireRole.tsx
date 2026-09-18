import type { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import type { Role } from '../types';
import { PermissionDenied } from './PermissionDenied';

interface RequireRoleProps {
  roles: Role[];
  children: ReactNode;
}

/** Route-level permission guard — renders PermissionDenied in place of the
 *  page rather than hiding the route only from navigation, so a direct or
 *  stale link doesn't silently grant access. AUD-P0-01. */
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { role } = usePermissions();
  if (!roles.includes(role)) {
    return <PermissionDenied />;
  }
  return <>{children}</>;
}
