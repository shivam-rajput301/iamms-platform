import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Profile } from '@/lib/types';
import { can as canPermission } from '@/lib/constants';
import {
  authApi,
  setApiToken,
  clearApiToken,
  getApiToken,
  type RequestAccessPayload,
  type CheckStatusResult,
  type AuthUser,
} from '@/lib/api';

function formatUserToProfile(user: AuthUser | null): Profile | null {
  if (!user) return null;
  const deptName = user.department;
  return {
    id: user.id,
    full_name: user.name,
    email: user.email,
    role: user.role,
    department_id: null,
    phone: user.phone ?? null,
    avatar_url: null,
    employee_id: user.employeeId,
    designation: user.designation ?? null,
    is_active: user.status === 'approved' || user.isApproved === true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    department: deptName
      ? {
          id: '',
          name: deptName,
          code: '',
          description: null,
          head_of_department: null,
          created_at: '',
        }
      : null,
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  profile: Profile | null;
  session: { user: AuthUser } | null;
  /** Signs in via backend POST /api/auth/login and receives JWT */
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>;
  /** Legacy signup wrapper — delegates to requestAccess */
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  can: (permission: string) => boolean;
  refreshProfile: () => Promise<void>;
  /** Submits a new employee registration request to MongoDB backend */
  requestAccess: (payload: RequestAccessPayload) => Promise<{ error: string | null }>;
  /** Whether the currently logged-in user has a valid backend API token */
  hasApiToken: boolean;
  /** Latest status check result */
  lastStatusCheck: CheckStatusResult | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,            setUser]            = useState<AuthUser | null>(null);
  const [token,           setToken]           = useState<string | null>(() => getApiToken());
  const [loading,         setLoading]         = useState(true);
  const [hasApiToken,     setHasApiToken]     = useState(() => !!getApiToken());
  const [lastStatusCheck, setLastStatusCheck] = useState<CheckStatusResult | null>(null);

  const profile = formatUserToProfile(user);
  const session = user ? { user } : null;

  async function restoreAuth() {
    const existingToken = getApiToken();
    if (!existingToken) {
      setUser(null);
      setToken(null);
      setHasApiToken(false);
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      setUser(res.user);
      setToken(existingToken);
      setHasApiToken(true);
    } catch {
      clearApiToken();
      setUser(null);
      setToken(null);
      setHasApiToken(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    restoreAuth();
  }, []);

  async function signIn(identifier: string, password: string): Promise<{ error: string | null }> {
    setLastStatusCheck(null);
    const trimmedId = identifier.trim();

    try {
      const { token: jwtToken, user: loggedUser } = await authApi.login(trimmedId, password);
      setApiToken(jwtToken);
      setToken(jwtToken);
      setUser(loggedUser);
      setHasApiToken(true);
      return { error: null };
    } catch (err: unknown) {
      clearApiToken();
      setToken(null);
      setUser(null);
      setHasApiToken(false);
      const message = err instanceof Error ? err.message : 'Invalid Employee ID or password. Please try again.';
      return { error: message };
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    return requestAccess({
      name: fullName,
      email,
      password,
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    });
  }

  async function signOut() {
    clearApiToken();
    setUser(null);
    setToken(null);
    setHasApiToken(false);
    setLastStatusCheck(null);
  }

  async function refreshProfile() {
    const existingToken = getApiToken();
    if (existingToken) {
      try {
        const res = await authApi.getMe();
        setUser(res.user);
      } catch {
        // ignore transient network errors
      }
    }
  }

  async function requestAccess(payload: RequestAccessPayload) {
    try {
      await authApi.requestAccess(payload);
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      return { error: message };
    }
  }

  const value: AuthContextValue = {
    user,
    token,
    loading,
    profile,
    session,
    signIn,
    signUp,
    signOut,
    can: (perm: string) => canPermission(user?.role, perm),
    refreshProfile,
    requestAccess,
    hasApiToken,
    lastStatusCheck,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
