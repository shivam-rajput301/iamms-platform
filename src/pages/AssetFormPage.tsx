import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Spinner';
import { useAsset, useCreateAsset, useUpdateAsset, useDepartments } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { ASSET_CATEGORIES, ASSET_STATUSES, ASSET_STATUS_META, CRITICALITIES } from '@/lib/constants';
import type { Asset, AssetStatus, Criticality } from '@/lib/types';

interface AssetFormPageProps {
  mode: 'create' | 'edit';
  assetId?: string;
}

export function AssetFormPage({ mode, assetId }: AssetFormPageProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: departments = [] } = useDepartments();
  const { data: existing, isLoading } = useAsset(mode === 'edit' ? assetId : undefined);
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();

  const [form, setForm] = useState<Partial<Asset>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (mode === 'edit' && isLoading) return <PageLoader />;

  const current = mode === 'edit' ? { ...existing, ...form } : form;

  function set<K extends keyof Asset>(key: K, value: Asset[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Partial<Asset> = {
        ...current,
        health_score: Number(current.health_score ?? 100),
        purchase_cost: Number(current.purchase_cost ?? 0),
      };
      if (mode === 'create') {
        const code = `AST-${String(Date.now()).slice(-6)}`;
        payload.asset_id = payload.asset_id || code;
        payload.qr_code = payload.asset_id;
        payload.created_by = profile?.id;
        await createAsset.mutateAsync(payload);
      } else if (assetId) {
        await updateAsset.mutateAsync({ id: assetId, ...payload });
      }
      navigate('/assets');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save asset');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/assets')} className="mb-4 flex items-center gap-1.5 text-sm text-steel-500 hover:text-steel-700 dark:hover:text-steel-300">
        <ArrowLeft className="h-4 w-4" /> Back to Assets
      </button>
      <PageHeader title={mode === 'create' ? 'Add New Asset' : 'Edit Asset'} description="Enter the asset's technical and operational details." />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Identification</CardTitle></CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Asset ID" value={current.asset_id ?? ''} onChange={(e) => set('asset_id', e.target.value)} placeholder="Auto-generated" />
            <Input label="Asset Name" required value={current.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Smelter Furnace #2" />
            <Select label="Category" required value={current.category ?? ''} onChange={(e) => set('category', e.target.value)}>
              <option value="">Select category</option>
              {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select label="Department" value={current.department_id ?? ''} onChange={(e) => set('department_id', e.target.value || null)}>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
            <Input label="Plant" value={current.plant ?? ''} onChange={(e) => set('plant', e.target.value)} placeholder="e.g. Smelter Plant" />
            <Input label="Location" value={current.location ?? ''} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Block 2, Bay 3" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Technical Details</CardTitle></CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Manufacturer" value={current.manufacturer ?? ''} onChange={(e) => set('manufacturer', e.target.value)} />
            <Input label="Model Number" value={current.model_number ?? ''} onChange={(e) => set('model_number', e.target.value)} />
            <Input label="Serial Number" value={current.serial_number ?? ''} onChange={(e) => set('serial_number', e.target.value)} />
            <Input label="Purchase Date" type="date" value={current.purchase_date ?? ''} onChange={(e) => set('purchase_date', e.target.value)} />
            <Input label="Warranty Expiry" type="date" value={current.warranty_expiry ?? ''} onChange={(e) => set('warranty_expiry', e.target.value)} />
            <Input label="Purchase Cost (₹)" type="number" value={current.purchase_cost ?? ''} onChange={(e) => set('purchase_cost', Number(e.target.value))} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Maintenance & Health</CardTitle></CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Last Maintenance Date" type="date" value={current.last_maintenance_date ?? ''} onChange={(e) => set('last_maintenance_date', e.target.value)} />
            <Input label="Next Maintenance Date" type="date" value={current.next_maintenance_date ?? ''} onChange={(e) => set('next_maintenance_date', e.target.value)} />
            <Input label="Health Score (0–100)" type="number" min={0} max={100} value={current.health_score ?? 100} onChange={(e) => set('health_score', Number(e.target.value))} />
            <Select label="Status" value={current.status ?? 'active'} onChange={(e) => set('status', e.target.value as AssetStatus)}>
              {ASSET_STATUSES.map((s) => <option key={s} value={s}>{ASSET_STATUS_META[s].label}</option>)}
            </Select>
            <Select label="Criticality" value={current.criticality ?? 'medium'} onChange={(e) => set('criticality', e.target.value as Criticality)}>
              {CRITICALITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Image URL" value={current.image_url ?? ''} onChange={(e) => set('image_url', e.target.value)} placeholder="https://…" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardBody>
            <Textarea label="Additional Notes" rows={3} value={current.notes ?? ''} onChange={(e) => set('notes', e.target.value)} placeholder="Operating notes, special instructions, etc." />
          </CardBody>
        </Card>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/60 dark:bg-rose-600/10 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/assets')}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : mode === 'create' ? 'Create Asset' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
