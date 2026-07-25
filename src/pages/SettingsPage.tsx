import { useNavigate } from 'react-router-dom';
import { Users, Building2, Shield, Moon, Sun, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { useProfiles, useDepartments } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { ROLE_LABELS } from '@/lib/constants';
import { cn, initials } from '@/lib/utils';

export function SettingsPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: profiles = [], isLoading } = useProfiles();
  const { data: departments = [] } = useDepartments();

  if (isLoading) return <PageLoader />;

  const roleCounts = profiles.reduce<Record<string, number>>((acc, p) => {
    acc[p.role] = (acc[p.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <PageHeader title="Settings" description="Manage plant configuration, users, and preferences." />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Appearance */}
        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <CardBody>
            <p className="mb-3 text-sm text-steel-500">Choose your preferred theme. Changes apply instantly.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={cn('flex items-center gap-3 rounded-xl border-2 p-4 transition-all', theme === 'light' ? 'border-brand-500 bg-brand-50 dark:bg-brand-600/10' : 'border-steel-200 hover:border-steel-300 dark:border-steel-800')}
              >
                <Sun className="h-5 w-5 text-amber-500" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-steel-800 dark:text-steel-200">Light</p>
                  <p className="text-xs text-steel-500">Bright interface</p>
                </div>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn('flex items-center gap-3 rounded-xl border-2 p-4 transition-all', theme === 'dark' ? 'border-brand-500 bg-brand-50 dark:bg-brand-600/10' : 'border-steel-200 hover:border-steel-300 dark:border-steel-800')}
              >
                <Moon className="h-5 w-5 text-brand-400" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-steel-800 dark:text-steel-200">Dark</p>
                  <p className="text-xs text-steel-500">Reduced glare</p>
                </div>
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Role overview */}
        <Card>
          <CardHeader><CardTitle>Role Distribution</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            {Object.entries(ROLE_LABELS).map(([role, label]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-steel-600 dark:text-steel-300">
                  <Shield className="h-4 w-4 text-steel-400" /> {label}
                </span>
                <span className="text-sm font-semibold text-steel-800 dark:text-steel-200">{roleCounts[role] ?? 0}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Departments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Departments</CardTitle>
              <span className="text-xs text-steel-500">{departments.length} departments</span>
            </div>
          </CardHeader>
          <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((d) => (
              <div key={d.id} className="rounded-xl border border-steel-200 p-4 dark:border-steel-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-600/20 dark:text-brand-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-steel-800 dark:text-steel-200">{d.name}</p>
                    <p className="text-xs text-steel-500">{d.code}</p>
                  </div>
                </div>
                {d.description && <p className="mt-2 text-xs text-steel-500">{d.description}</p>}
              </div>
            ))}
          </CardBody>
        </Card>

        {/* User directory */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>User Directory</CardTitle>
              <Users className="h-4 w-4 text-steel-400" />
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-steel-200 dark:border-steel-800">
                    <th className="table-header">User</th>
                    <th className="table-header">Role</th>
                    <th className="table-header">Department</th>
                    <th className="table-header">Employee ID</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-100 dark:divide-steel-800/60">
                  {profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-steel-50 dark:hover:bg-steel-800/40">
                      <td className="table-cell">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{initials(p.full_name)}</span>
                          <div>
                            <p className="font-medium text-steel-800 dark:text-steel-200">{p.full_name}</p>
                            <p className="text-xs text-steel-500">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="badge bg-steel-100 text-steel-700 dark:bg-steel-800 dark:text-steel-300">{ROLE_LABELS[p.role]}</span>
                      </td>
                      <td className="table-cell">{p.department?.name ?? '—'}</td>
                      <td className="table-cell font-mono text-xs">{p.employee_id ?? '—'}</td>
                      <td className="table-cell">
                        <span className={cn('badge', p.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-600/20 dark:text-rose-400')}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="secondary" onClick={() => navigate('/profile')}>
          View my profile <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
