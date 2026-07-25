import { useMemo } from "react";
import {
  FileText,
  FileSpreadsheet,
  Factory,
  Wrench,
  Users,
  Package,
  Clock,
  TrendingDown,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import {
  useAssets,
  useRequests,
  useInventory,
  useEngineers,
} from "@/lib/hooks";
import {
  exportMonthlyMaintenancePDF,
  exportMonthlyMaintenanceExcel,
  exportAssetHealthPDF,
  exportAssetHealthExcel,
  exportEngineerPerformancePDF,
  exportEngineerPerformanceExcel,
  exportInventoryPDF,
  exportInventoryExcel,
  exportDowntimePDF,
  exportDowntimeExcel,
} from "@/lib/exports";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface ReportDef {
  id: string;
  title: string;
  description: string;
  icon: typeof Factory;
  color: string;
  stat: string;
  onPDF: () => void;
  onExcel: () => void;
}

export function ReportsPage() {
  const { data: assets = [], isLoading: aLoading } = useAssets();
  const { data: requests = [], isLoading: rLoading } = useRequests();
  const { data: inventory = [], isLoading: iLoading } = useInventory();
  const { data: engineers = [] } = useEngineers();

  const completed = useMemo(
    () =>
      requests.filter((r) => r.status === "completed" || r.status === "closed"),
    [requests],
  );
  const totalCost = completed.reduce(
    (s, r) => s + Number(r.maintenance_cost ?? 0),
    0,
  );
  const totalDowntime = requests.reduce(
    (s, r) => s + Number(r.downtime_hours ?? 0),
    0,
  );
  const lowStock = inventory.filter(
    (i) => i.quantity <= i.minimum_stock,
  ).length;
  const invValue = inventory.reduce(
    (s, i) => s + i.quantity * Number(i.unit_price),
    0,
  );

  if (aLoading || rLoading || iLoading) return <PageLoader />;

  const reports: ReportDef[] = [
    {
      id: "monthly",
      title: "Monthly Maintenance Report",
      description: "All maintenance requests with status, cost, and downtime.",
      icon: Wrench,
      color: "bg-brand-600",
      stat: `${requests.length} requests · ${formatCurrency(totalCost)}`,
      onPDF: () => exportMonthlyMaintenancePDF(requests),
      onExcel: () => exportMonthlyMaintenanceExcel(requests),
    },
    {
      id: "health",
      title: "Asset Health Report",
      description:
        "Health scores, criticality, and maintenance schedule per asset.",
      icon: Factory,
      color: "bg-emerald-600",
      stat: `${assets.length} assets tracked`,
      onPDF: () => exportAssetHealthPDF(assets),
      onExcel: () => exportAssetHealthExcel(assets),
    },
    {
      id: "engineer",
      title: "Engineer Performance Report",
      description: "Assigned vs completed jobs, hours, and cost per engineer.",
      icon: Users,
      color: "bg-violet-600",
      stat: `${engineers.length} engineers`,
      onPDF: () => exportEngineerPerformancePDF(engineers, requests),
      onExcel: () => exportEngineerPerformanceExcel(engineers, requests),
    },
    {
      id: "inventory",
      title: "Inventory Usage Report",
      description: "Stock levels, valuations, and low-stock items.",
      icon: Package,
      color: "bg-amber-600",
      stat: `${inventory.length} items · ${lowStock} low · ${formatCurrency(invValue)}`,
      onPDF: () => exportInventoryPDF(inventory),
      onExcel: () => exportInventoryExcel(inventory),
    },
    {
      id: "downtime",
      title: "Downtime Report",
      description:
        "Incidents causing production downtime with duration and cost.",
      icon: Clock,
      color: "bg-rose-600",
      stat: `${totalDowntime.toFixed(1)}h total downtime`,
      onPDF: () => exportDowntimePDF(requests),
      onExcel: () => exportDowntimeExcel(requests),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        description="Generate and export operational reports for compliance and review."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.id} hover className="flex flex-col">
            <CardBody className="flex flex-1 flex-col">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg ${r.color}`}
                >
                  <r.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-steel-900 dark:text-steel-100">
                    {r.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-steel-500">
                    {r.description}
                  </p>
                </div>
              </div>
              <p className="mt-4 rounded-lg bg-steel-50 border border-steel-200 px-3 py-2 text-xs font-medium text-steel-700 dark:bg-steel-950 dark:border-steel-800 dark:text-steel-300">
                {r.stat}
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={r.onPDF}
                >
                  <FileText className="h-4 w-4" /> PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={r.onExcel}
                >
                  <FileSpreadsheet className="h-4 w-4" /> Excel
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Maintenance Cost",
            value: formatCurrency(totalCost),
            icon: Wrench,
            color: "text-brand-600",
          },
          {
            label: "Total Downtime",
            value: `${formatNumber(totalDowntime)}h`,
            icon: Clock,
            color: "text-rose-600",
          },
          {
            label: "Inventory Value",
            value: formatCurrency(invValue),
            icon: Package,
            color: "text-amber-600",
          },
          {
            label: "Low Stock Items",
            value: formatNumber(lowStock),
            icon: TrendingDown,
            color: "text-orange-600",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody className="flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-xl font-bold text-steel-900 dark:text-steel-100">
                  {s.value}
                </p>
                <p className="text-xs text-steel-500">{s.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
