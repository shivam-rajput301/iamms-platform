import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Factory, Download, Pencil, Trash2, QrCode } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { PageLoader } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { HealthBar } from '@/components/ui/HealthBar';
import { AssetStatusBadge, CriticalityBadge } from '@/components/ui/StatusBadges';
import { useAssets, useDepartments, useDeleteAsset } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { ASSET_CATEGORIES, ASSET_STATUSES, ASSET_STATUS_META } from '@/lib/constants';
import { formatDate, downloadBlob } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { Modal } from '@/components/ui/Modal';

const PAGE_SIZE = 10;

export function AssetsPage() {
  const { can } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: assets = [], isLoading } = useAssets();
  const { data: departments = [] } = useDepartments();
  const deleteAsset = useDeleteAsset();

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [category, setCategory] = useState('');
  const [dept, setDept] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (query) {
        const q = query.toLowerCase();
        if (!a.name.toLowerCase().includes(q) && !a.asset_id.toLowerCase().includes(q) && !(a.manufacturer ?? '').toLowerCase().includes(q)) return false;
      }
      if (status && a.status !== status) return false;
      if (category && a.category !== category) return false;
      if (dept && a.department_id !== dept) return false;
      return true;
    });
  }, [assets, query, status, category, dept]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function exportExcel() {
    const rows = filtered.map((a) => ({
      'Asset ID': a.asset_id,
      Name: a.name,
      Category: a.category,
      Department: a.department?.name ?? '',
      Status: ASSET_STATUS_META[a.status]?.label ?? a.status,
      Criticality: a.criticality,
      'Health Score': a.health_score,
      Manufacturer: a.manufacturer ?? '',
      'Model No': a.model_number ?? '',
      Location: a.location ?? '',
      'Purchase Date': a.purchase_date ?? '',
      'Next Maintenance': a.next_maintenance_date ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Assets');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    downloadBlob(new Blob([buf]), 'assets.xlsx');
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader
        title="Asset Registry"
        description={`${filtered.length} equipment assets across ${departments.length} plant departments`}
        actions={
          <>
            <Button variant="secondary" onClick={exportExcel}>
              <Download className="h-4 w-4" /> Export
            </Button>
            {can('assets:create') && (
              <Link to="/assets/new">
                <Button>
                  <Plus className="h-4 w-4" /> Add Asset
                </Button>
              </Link>
            )}
          </>
        }
      />

      {/* Filters */}
      <Card>
        <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-steel-400" />
            <input
              className="input pl-9"
              placeholder="Search equipment…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
                setSearchParams(e.target.value ? { q: e.target.value } : {});
              }}
            />
          </div>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {ASSET_STATUSES.map((s) => (
              <option key={s} value={s}>{ASSET_STATUS_META[s]?.label ?? s}</option>
            ))}
          </Select>
          <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {ASSET_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
          <Button
            variant="ghost"
            onClick={() => { setQuery(''); setStatus(''); setCategory(''); setDept(''); setPage(1); setSearchParams({}); }}
          >
            <Filter className="h-4 w-4" /> Clear Filters
          </Button>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          {paged.length === 0 ? (
            <EmptyState title="No assets found" description="Try adjusting your filters or register a new asset." icon={Factory} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-steel-200 dark:border-steel-800">
                    <th className="table-header">Asset</th>
                    <th className="table-header">Category</th>
                    <th className="table-header">Department</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Criticality</th>
                    <th className="table-header">Health</th>
                    <th className="table-header">Next Maint.</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-100 dark:divide-steel-800/60">
                  {paged.map((a) => (
                    <tr key={a.id} className="group hover:bg-steel-50 dark:hover:bg-steel-800/40">
                      <td className="table-cell">
                        <Link to={`/assets/${a.id}`} className="block">
                          <p className="font-semibold text-steel-800 group-hover:text-brand-600 dark:text-steel-200">{a.name}</p>
                          <p className="text-xs text-steel-500">{a.asset_id} · {a.manufacturer ?? '—'}</p>
                        </Link>
                      </td>
                      <td className="table-cell">{a.category}</td>
                      <td className="table-cell">{a.department?.name ?? '—'}</td>
                      <td className="table-cell"><AssetStatusBadge status={a.status} /></td>
                      <td className="table-cell"><CriticalityBadge criticality={a.criticality} /></td>
                      <td className="table-cell"><HealthBar score={a.health_score} /></td>
                      <td className="table-cell text-steel-500">{formatDate(a.next_maintenance_date)}</td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/assets/${a.id}`}>
                            <button className="rounded-lg p-1.5 text-steel-400 hover:bg-steel-100 hover:text-brand-600 dark:hover:bg-steel-800" title="View / QR">
                              <QrCode className="h-4 w-4" />
                            </button>
                          </Link>
                          {can('assets:edit') && (
                            <Link to={`/assets/${a.id}/edit`}>
                              <button className="rounded-lg p-1.5 text-steel-400 hover:bg-steel-100 hover:text-brand-600 dark:hover:bg-steel-800" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </button>
                            </Link>
                          )}
                          {can('assets:edit') && a.status === 'retired' && (
                            <button
                              onClick={() => setDeleteId(a.id)}
                              className="rounded-lg p-1.5 text-steel-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-600/10"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={filtered.length} pageSize={PAGE_SIZE} />

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Asset"
        description="This action cannot be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (deleteId) await deleteAsset.mutateAsync(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-steel-600 dark:text-steel-300">
          Are you sure you want to permanently delete this asset? All associated maintenance history will also be removed.
        </p>
      </Modal>
    </div>
  );
}
