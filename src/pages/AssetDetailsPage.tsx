import { useNavigate, useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Pencil, Factory, MapPin, Calendar, Wrench, IndianRupee, FileText, Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { HealthBar } from '@/components/ui/HealthBar';
import { AssetStatusBadge, CriticalityBadge, RequestStatusBadge, PriorityBadge } from '@/components/ui/StatusBadges';
import { useAsset, useRequests } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { formatCurrency, formatDate, timeAgo, cn } from '@/lib/utils';

export function AssetDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();
  const { data: asset, isLoading } = useAsset(id);
  const { data: requests = [] } = useRequests();
  const assetRequests = requests.filter((r) => r.asset_id === id);

  if (isLoading) return <PageLoader />;
  if (!asset) {
    return <EmptyState title="Asset not found" description="This asset may have been removed." action={<Button onClick={() => navigate('/assets')}>Back to Assets</Button>} />;
  }

  const specs: { label: string; value: string | null }[] = [
    { label: 'Asset ID', value: asset.asset_id },
    { label: 'Manufacturer', value: asset.manufacturer },
    { label: 'Model Number', value: asset.model_number },
    { label: 'Serial Number', value: asset.serial_number },
    { label: 'Department', value: asset.department?.name ?? null },
    { label: 'Plant', value: asset.plant },
    { label: 'Location', value: asset.location },
    { label: 'Category', value: asset.category },
  ];

  const schedule: { label: string; value: string | null; icon: typeof Calendar }[] = [
    { label: 'Purchase Date', value: asset.purchase_date, icon: Calendar },
    { label: 'Warranty Expiry', value: asset.warranty_expiry, icon: Calendar },
    { label: 'Last Maintenance', value: asset.last_maintenance_date, icon: Wrench },
    { label: 'Next Maintenance', value: asset.next_maintenance_date, icon: Wrench },
  ];

  function downloadQR() {
    const svg = document.getElementById('asset-qr');
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset!.asset_id}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/assets')} className="mb-4 flex items-center gap-1.5 text-sm text-steel-500 hover:text-steel-700 dark:hover:text-steel-300">
        <ArrowLeft className="h-4 w-4" /> Back to Assets
      </button>

      <PageHeader
        title={asset.name}
        description={`${asset.asset_id} · ${asset.category}`}
        actions={
          can('assets:edit') && (
            <Link to={`/assets/${asset.id}/edit`}>
              <Button variant="secondary"><Pencil className="h-4 w-4" /> Edit</Button>
            </Link>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: overview + specs */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-steel-500">Status</p>
                <div className="mt-1.5"><AssetStatusBadge status={asset.status} /></div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-steel-500">Criticality</p>
                <div className="mt-1.5"><CriticalityBadge criticality={asset.criticality} /></div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wider text-steel-500">Health Score</p>
                <div className="mt-2"><HealthBar score={asset.health_score} /></div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-steel-500">Purchase Cost</p>
                <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-steel-800 dark:text-steel-200">
                  <IndianRupee className="h-4 w-4" />{formatCurrency(asset.purchase_cost).replace('₹', '')}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-steel-500">Location</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-steel-700 dark:text-steel-300">
                  <MapPin className="h-4 w-4 text-steel-400" />{asset.location ?? '—'}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Technical Specifications</CardTitle></CardHeader>
            <CardBody className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between border-b border-steel-100 pb-2 dark:border-steel-800/60">
                  <span className="text-sm text-steel-500">{s.label}</span>
                  <span className="text-sm font-medium text-steel-800 dark:text-steel-200">{s.value ?? '—'}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><CardTitle>Maintenance Schedule</CardTitle></CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {schedule.map((s) => (
                <div key={s.label} className="rounded-lg border border-steel-200 p-3 dark:border-steel-800">
                  <s.icon className="h-4 w-4 text-brand-600" />
                  <p className="mt-2 text-xs text-steel-500">{s.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-steel-800 dark:text-steel-200">{formatDate(s.value)}</p>
                </div>
              ))}
            </CardBody>
          </Card>

          {asset.notes && (
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardBody>
                <p className="text-sm text-steel-600 dark:text-steel-300">{asset.notes}</p>
              </CardBody>
            </Card>
          )}

          {/* Maintenance history */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {assetRequests.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-steel-500">No maintenance requests recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-steel-200 dark:border-steel-800">
                        <th className="table-header">Code</th>
                        <th className="table-header">Title</th>
                        <th className="table-header">Priority</th>
                        <th className="table-header">Status</th>
                        <th className="table-header">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel-100 dark:divide-steel-800/60">
                      {assetRequests.map((r) => (
                        <tr key={r.id} className="hover:bg-steel-50 dark:hover:bg-steel-800/40">
                          <td className="table-cell font-medium text-brand-600">{r.request_code}</td>
                          <td className="table-cell">{r.title}</td>
                          <td className="table-cell"><PriorityBadge priority={r.priority} /></td>
                          <td className="table-cell"><RequestStatusBadge status={r.status} /></td>
                          <td className="table-cell text-steel-500">{timeAgo(r.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: image + QR */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Asset Image</CardTitle></CardHeader>
            <CardBody>
              {asset.image_url ? (
                <img src={asset.image_url} alt={asset.name} className="h-48 w-full rounded-xl object-cover" />
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-xl bg-steel-100 dark:bg-steel-800">
                  <Factory className="h-12 w-12 text-steel-300 dark:text-steel-600" />
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>QR Code</CardTitle>
                <Button variant="ghost" size="sm" onClick={downloadQR}><Download className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardBody className="flex flex-col items-center">
              <div className="rounded-xl border border-steel-200 bg-white p-4 dark:border-steel-800">
                <QRCodeSVG id="asset-qr" value={`${asset.asset_id}|${asset.name}|${asset.category}`} size={160} level="M" />
              </div>
              <p className="mt-3 text-sm font-medium text-steel-700 dark:text-steel-300">{asset.asset_id}</p>
              <p className="text-xs text-steel-500">Scan to view asset details</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
