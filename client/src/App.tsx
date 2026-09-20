import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Candidates } from './pages/Candidates';
import { Pipeline } from './pages/Pipeline';
import { Interviews } from './pages/Interviews';
import { Jobs } from './pages/Jobs';
import { Companies } from './pages/Companies';
import { Team } from './pages/Team';
import { Calendar } from './pages/Calendar';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { AdminUsers } from './pages/Admin/Users';
import { CareersLayout } from './pages/Careers/CareersLayout';
import { Directory } from './pages/Careers/Directory';
import { JobDetail } from './pages/Careers/JobDetail';
import { Apply } from './pages/Careers/Apply';
import { Confirmation } from './pages/Careers/Confirmation';
import { Status } from './pages/Careers/Status';
import { RequireRole } from './components/RequireRole';
import { useUser } from './context/UserContext';
import { isEmbedMode } from './hooks/useEmbedMode';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUser();
  if (!isAuthenticated) {
    return <Navigate to={isEmbedMode() ? '/dashboard' : '/login'} replace />;
  }
  return <>{children}</>;
}

function LoginRoute() {
  if (isEmbedMode()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
}

/**
 * The public careers site lives under /careers/* rather than the IA doc's
 * literal /jobs, /jobs/:jobId, etc. — those paths already belong to the
 * authenticated, internal Jobs management screen (see Route "/jobs" below),
 * and React Router can't route the same path two different ways depending
 * on auth state. /careers/* is the resolution; documented here and in the
 * IA doc rather than silently diverging from the spec.
 */
function RootRedirect() {
  const { isAuthenticated } = useUser();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/careers'} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginRoute />} />

      {/* Public, unauthenticated candidate-facing site — flows 4-9. */}
      <Route element={<CareersLayout />}>
        <Route path="/careers" element={<Directory />} />
        <Route path="/careers/status" element={<Status />} />
        <Route path="/careers/status/:applicationId" element={<Status />} />
        <Route path="/careers/apply/:applicationId/confirmation" element={<Confirmation />} />
        <Route path="/careers/:jobId" element={<JobDetail />} />
        <Route path="/careers/:jobId/apply" element={<Apply />} />
        {/* Any other /careers/* path (typo, stale link) stays on the public
            site and lands on the directory, rather than falling through to
            the authenticated shell's catch-all below and bouncing an
            unauthenticated visitor to /login. */}
        <Route path="/careers/*" element={<Navigate to="/careers" replace />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/candidates" element={<Candidates />} />
        {/* Open to every authenticated role, same as /candidates — a hiring
            manager's ability to move a candidate is gated inside the page
            itself (shortlist/reject only), not at the route level. */}
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/pipeline/:jobId" element={<Pipeline />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="/interviews/:interviewId" element={<Interviews />} />
        {/* Job/company/team/report management is recruiter and admin work —
            AUD-P0-01. A hiring manager hitting these by URL sees a real
            Permission denied state, not the page or a silent redirect. */}
        <Route
          path="/jobs"
          element={
            <RequireRole roles={['recruiter', 'admin']}>
              <Jobs />
            </RequireRole>
          }
        />
        <Route
          path="/companies"
          element={
            <RequireRole roles={['recruiter', 'admin']}>
              <Companies />
            </RequireRole>
          }
        />
        <Route
          path="/team"
          element={
            <RequireRole roles={['recruiter', 'admin']}>
              <Team />
            </RequireRole>
          }
        />
        <Route path="/calendar" element={<Calendar />} />
        <Route
          path="/reports"
          element={
            <RequireRole roles={['recruiter', 'admin']}>
              <Reports />
            </RequireRole>
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/admin/users"
          element={
            <RequireRole roles={['admin']}>
              <AdminUsers />
            </RequireRole>
          }
        />
        {/* Without this, an unmatched URL rendered a blank page with no shell
            and no way back. */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
