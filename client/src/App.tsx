import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Candidates } from './pages/Candidates';
import { Jobs } from './pages/Jobs';
import { Companies } from './pages/Companies';
import { Team } from './pages/Team';
import { Calendar } from './pages/Calendar';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { AdminUsers } from './pages/Admin/Users';
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

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/candidates" element={<Candidates />} />
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
