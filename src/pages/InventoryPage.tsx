import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Package,
  Download,
  Pencil,
  Trash2,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import {
  useInventory,
  useCreateInventory,
  useUpdateInventory,
  useDeleteInventory,
} from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate, cn, downloadBlob } from "@/lib/utils";
import * as XLSX from "xlsx";
import type { InventoryItem } from "@/lib/types";

const PAGE_SIZE = 10;

export function InventoryPage() {
  const { can } = useAuth();
  const [searchParams] = useSearchParams();
  const { data: inventory = [], isLoading } = useInventory();
  const createItem = useCreateInventory();
  const updateItem = useUpdateInventory();
  const deleteItem = useDeleteInventory();

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [lowOnly, setLowOnly] = useState(searchParams.get("low") === "1");
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return inventory.filter((i) => {
      if (query) {
        const q = query.toLowerCase();
        if (
          !i.item_name.toLowerCase().includes(q) &&
          !i.part_number.toLowerCase().includes(q) &&
          !(i.supplier ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      if (lowOnly && i.quantity > i.minimum_stock) return false;
      return true;
    });
  }, [inventory, query, lowOnly]);

  const lowStock = inventory.filter((i) => i.quantity <= i.minimum_stock);
  const totalValue = inventory.reduce(
    (s, i) => s + i.quantity * Number(i.unit_price),
    0,
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function exportExcel() {
    const rows = filtered.map((i) => ({
      "Item Name": i.item_name,
      "Part Number": i.part_number,
      Category: i.category ?? "",
      Quantity: i.quantity,
      "Min Stock": i.minimum_stock,
      Unit: i.unit,
      Supplier: i.supplier ?? "",
      "Unit Price": i.unit_price,
      "Storage Location": i.storage_location ?? "",
      "Last Restocked": i.last_restocked ?? "",
      "Stock Value": i.quantity * Number(i.unit_price),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    downloadBlob(new Blob([buf]), "inventory.xlsx");
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Spare Parts Inventory"
        description={`${inventory.length} items · ${lowStock.length} low stock · ${formatCurrency(totalValue)} total value`}
        actions={
          <>
            <Button variant="secondary" onClick={exportExcel}>
              <Download className="h-4 w-4" /> Export
            </Button>
            {can("inventory:create") && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
              >
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            )}
          </>
        }
      />

      {/* Low stock banner */}
      {lowStock.length > 0 && (
        <Card className="mb-4 border-amber-300 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-900/10">
          <CardBody className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {lowStock.length} items below minimum stock
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Restock recommended to avoid maintenance delays.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setLowOnly(!lowOnly)}
            >
              {lowOnly ? "Show all" : "Show low stock only"}
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <CardBody className="flex gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
            <input
              className="input pl-9"
              placeholder="Search parts…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button
            variant={lowOnly ? "primary" : "secondary"}
            onClick={() => {
              setLowOnly(!lowOnly);
              setPage(1);
            }}
          >
            <TrendingDown className="h-4 w-4" /> Low Stock
          </Button>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          {paged.length === 0 ? (
            <EmptyState
              title="No inventory items"
              description="Add spare parts to track stock levels."
              icon={Package}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-steel-200 dark:border-steel-800">
                    <th className="table-header">Item</th>
                    <th className="table-header">Part No.</th>
                    <th className="table-header">Quantity</th>
                    <th className="table-header">Min Stock</th>
                    <th className="table-header">Supplier</th>
                    <th className="table-header">Unit Price</th>
                    <th className="table-header">Location</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-100 dark:divide-steel-800/60">
                  {paged.map((i) => {
                    const low = i.quantity <= i.minimum_stock;
                    return (
                      <tr
                        key={i.id}
                        className="hover:bg-steel-50 dark:hover:bg-steel-800/40"
                      >
                        <td className="table-cell">
                          <p className="font-medium text-steel-800 dark:text-steel-200">
                            {i.item_name}
                          </p>
                          <p className="text-xs text-steel-500">
                            {i.category ?? "—"}
                          </p>
                        </td>
                        <td className="table-cell font-mono text-xs">
                          {i.part_number}
                        </td>
                        <td className="table-cell">
                          <span
                            className={cn(
                              "font-semibold",
                              low
                                ? "text-rose-600"
                                : "text-steel-800 dark:text-steel-200",
                            )}
                          >
                            {i.quantity} {i.unit}
                          </span>
                          {low && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-rose-500">
                              <AlertTriangle className="h-3 w-3" />
                            </span>
                          )}
                        </td>
                        <td className="table-cell text-steel-500">
                          {i.minimum_stock}
                        </td>
                        <td className="table-cell">{i.supplier ?? "—"}</td>
                        <td className="table-cell">
                          {formatCurrency(Number(i.unit_price))}
                        </td>
                        <td className="table-cell text-steel-500">
                          {i.storage_location ?? "—"}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center justify-end gap-1">
                            {can("inventory:edit") && (
                              <button
                                onClick={() => {
                                  setEditing(i);
                                  setShowForm(true);
                                }}
                                className="rounded-lg p-1.5 text-steel-400 hover:bg-steel-100 hover:text-brand-600 dark:hover:bg-steel-800"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            )}
                            {can("inventory:delete") && (
                              <button
                                onClick={() => setDeleteId(i.id)}
                                className="rounded-lg p-1.5 text-steel-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-600/10"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={filtered.length}
        pageSize={PAGE_SIZE}
      />

      {/* Form modal */}
      <InventoryFormModal
        open={showForm}
        item={editing}
        onClose={() => setShowForm(false)}
        onSave={async (payload) => {
          if (editing)
            await updateItem.mutateAsync({ id: editing.id, ...payload });
          else await createItem.mutateAsync(payload);
          setShowForm(false);
        }}
      />

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Item"
        description="This action cannot be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (deleteId) await deleteItem.mutateAsync(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-steel-600 dark:text-steel-300">
          Remove this spare part from inventory?
        </p>
      </Modal>
    </div>
  );
}

function InventoryFormModal({
  open,
  item,
  onClose,
  onSave,
}: {
  open: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onSave: (p: Partial<InventoryItem>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<InventoryItem>>({});
  const [saving, setSaving] = useState(false);

  const current = { ...item, ...form };

  function set<K extends keyof InventoryItem>(k: K, v: InventoryItem[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        item_name: current.item_name,
        part_number: current.part_number,
        category: current.category,
        quantity: Number(current.quantity ?? 0),
        minimum_stock: Number(current.minimum_stock ?? 0),
        unit: current.unit ?? "pcs",
        supplier: current.supplier,
        unit_price: Number(current.unit_price ?? 0),
        storage_location: current.storage_location,
        last_restocked: current.last_restocked,
      });
      setForm({});
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? "Edit Item" : "Add Item"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Item Name"
          required
          value={current.item_name ?? ""}
          onChange={(e) => set("item_name", e.target.value)}
        />
        <Input
          label="Part Number"
          required
          value={current.part_number ?? ""}
          onChange={(e) => set("part_number", e.target.value)}
        />
        <Input
          label="Category"
          value={current.category ?? ""}
          onChange={(e) => set("category", e.target.value)}
        />
        <Input
          label="Unit"
          value={current.unit ?? "pcs"}
          onChange={(e) => set("unit", e.target.value)}
        />
        <Input
          label="Quantity"
          type="number"
          value={current.quantity ?? 0}
          onChange={(e) => set("quantity", Number(e.target.value))}
        />
        <Input
          label="Minimum Stock"
          type="number"
          value={current.minimum_stock ?? 0}
          onChange={(e) => set("minimum_stock", Number(e.target.value))}
        />
        <Input
          label="Supplier"
          value={current.supplier ?? ""}
          onChange={(e) => set("supplier", e.target.value)}
        />
        <Input
          label="Unit Price (₹)"
          type="number"
          value={current.unit_price ?? 0}
          onChange={(e) => set("unit_price", Number(e.target.value))}
        />
        <Input
          label="Storage Location"
          value={current.storage_location ?? ""}
          onChange={(e) => set("storage_location", e.target.value)}
        />
        <Input
          label="Last Restocked"
          type="date"
          value={current.last_restocked ?? ""}
          onChange={(e) => set("last_restocked", e.target.value)}
        />
      </div>
    </Modal>
  );
}
