import { useState } from 'react';
import { User, Mail, Phone, Building2, BadgeCheck, Save } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/auth';
import { useUpdateProfile } from '@/lib/hooks';
import { ROLE_LABELS } from '@/lib/constants';
import { initials } from '@/lib/utils';

export function ProfilePage() {
  const { profile, session, refreshProfile } = useAuth();
  const updateProfile = useUpdateProfile();
  const [form, setForm] = useState({ full_name: '', phone: '', designation: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!profile) return <PageLoader />;

  const current = {
    full_name: form.full_name || profile.full_name,
    phone: form.phone || (profile.phone ?? ''),
    designation: form.designation || (profile.designation ?? ''),
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile.mutateAsync({ id: profile!.id, ...current });
      await refreshProfile();
      setSaved(true);
      setForm({ full_name: '', phone: '', designation: '' });
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Profile" description="View and update your personal information." />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Profile card */}
        <Card>
          <CardBody className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white shadow-lg shadow-brand-600/30">
              {initials(profile.full_name)}
            </div>
            <h2 className="mt-4 text-lg font-bold text-steel-900 dark:text-steel-100">{profile.full_name}</h2>
            <p className="text-sm text-steel-500">{profile.designation ?? '—'}</p>
            <span className="mt-3 badge bg-brand-100 text-brand-700 dark:bg-brand-600/20 dark:text-brand-400">
              <BadgeCheck className="h-3.5 w-3.5" /> {ROLE_LABELS[profile.role]}
            </span>

            <div className="mt-6 w-full space-y-2.5 border-t border-steel-200 pt-4 text-left dark:border-steel-800">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 text-steel-400" />
                <span className="text-steel-600 dark:text-steel-300">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="h-4 w-4 text-steel-400" />
                <span className="text-steel-600 dark:text-steel-300">{profile.phone ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Building2 className="h-4 w-4 text-steel-400" />
                <span className="text-steel-600 dark:text-steel-300">{profile.department?.name ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <User className="h-4 w-4 text-steel-400" />
                <span className="text-steel-600 dark:text-steel-300">{profile.employee_id ?? '—'}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Edit form */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Edit Information</CardTitle></CardHeader>
          <CardBody>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Full Name" value={current.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Phone" value={current.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+91-…" />
                <Input label="Designation" value={current.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} />
              </div>
              <Input label="Email" value={session?.user?.email ?? profile.email} disabled hint="Email cannot be changed." />

              {saved && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-600/10 dark:text-emerald-400">
                  Profile updated successfully.
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <Button type="submit" disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Changes'}</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
