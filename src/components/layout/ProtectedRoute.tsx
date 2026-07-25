import type { ReactNode } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import type { Role } from '@/lib/types';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  role?: Role;
}

export function ProtectedRoute({ children, permission, role }: ProtectedRouteProps) {
  const { user, token, profile, loading, can } = useAuth();

  if (loading) return <PageLoader />;
  if (!user && !token) return <Navigate to="/login" replace />;
  const userRole = user?.role || profile?.role;
  if (role && userRole !== role) {
    return <Navigate to="/dashboard" replace />;
  }
  if (permission && !can(permission)) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-steel-900 dark:text-steel-100">403 Access Denied</h2>
        <p className="mt-2 text-xs text-steel-500 dark:text-steel-400 max-w-sm">
          You do not have administrative permissions to view this section of the system.
        </p>
        <Link to="/dashboard" className="mt-5">
          <Button size="sm">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }
  if (!user && !profile) return <PageLoader />;
  return <>{children}</>;
}
