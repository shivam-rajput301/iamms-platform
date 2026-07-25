import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { downloadBlob, formatCurrency, formatDate } from './utils';
import { COMPANY_NAME } from './constants';
import type { Asset, MaintenanceRequest, InventoryItem, Profile } from './types';

function pdfHeader(doc: jsPDF, title: string, subtitle?: string) {
  doc.setFillColor(29, 97, 240);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_NAME, 14, 13);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Industrial Asset & Maintenance Management System', 14, 21);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 42);
  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 14, 48);
  }
  doc.setTextColor(30, 41, 59);
}

function pdfFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${COMPANY_NAME} — Confidential · Generated ${new Date().toLocaleString('en-IN')} · Page ${i}/${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 8,
    );
  }
}

function exportExcel(filename: string, sheetName: string, rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  downloadBlob(new Blob([buf]), filename);
}

// ===== Monthly Maintenance Report =====
export function exportMonthlyMaintenancePDF(requests: MaintenanceRequest[]) {
  const doc = new jsPDF();
  pdfHeader(doc, 'Monthly Maintenance Report', `Period: ${new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`);
  const rows = requests.map((r) => [
    r.request_code,
    r.asset?.name ?? '—',
    r.priority,
    r.status,
    r.engineer?.full_name ?? 'Unassigned',
    r.downtime_hours ? `${r.downtime_hours}h` : '—',
    formatCurrency(r.maintenance_cost),
    formatDate(r.created_at),
  ]);
  autoTable(doc, {
    head: [['Code', 'Asset', 'Priority', 'Status', 'Engineer', 'Downtime', 'Cost', 'Created']],
    body: rows,
    startY: 54,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [29, 97, 240], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  const totalCost = requests.reduce((s, r) => s + Number(r.maintenance_cost ?? 0), 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Requests: ${requests.length}   Total Cost: ${formatCurrency(totalCost)}`, 14, (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10);
  pdfFooter(doc);
  doc.save('monthly-maintenance-report.pdf');
}

export function exportMonthlyMaintenanceExcel(requests: MaintenanceRequest[]) {
  exportExcel('monthly-maintenance.xlsx', 'Maintenance', requests.map((r) => ({
    Code: r.request_code, Asset: r.asset?.name ?? '', Priority: r.priority, Status: r.status,
    Engineer: r.engineer?.full_name ?? 'Unassigned', 'Downtime (h)': r.downtime_hours ?? 0,
    'Cost (₹)': r.maintenance_cost ?? 0, Created: formatDate(r.created_at),
  })));
}

// ===== Asset Health Report =====
export function exportAssetHealthPDF(assets: Asset[]) {
  const doc = new jsPDF();
  pdfHeader(doc, 'Asset Health Report', `${assets.length} assets · Generated ${new Date().toLocaleDateString('en-IN')}`);
  autoTable(doc, {
    head: [['Asset ID', 'Name', 'Category', 'Status', 'Health', 'Criticality', 'Next Maint.']],
    body: assets.map((a) => [a.asset_id, a.name, a.category, a.status, `${a.health_score}%`, a.criticality, formatDate(a.next_maintenance_date)]),
    startY: 54,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [29, 97, 240], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  const avg = assets.length ? Math.round(assets.reduce((s, a) => s + a.health_score, 0) / assets.length) : 0;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Average Health Score: ${avg}%`, 14, (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10);
  pdfFooter(doc);
  doc.save('asset-health-report.pdf');
}

export function exportAssetHealthExcel(assets: Asset[]) {
  exportExcel('asset-health.xlsx', 'Asset Health', assets.map((a) => ({
    'Asset ID': a.asset_id, Name: a.name, Category: a.category, Status: a.status,
    'Health Score': a.health_score, Criticality: a.criticality,
    'Next Maintenance': formatDate(a.next_maintenance_date), Manufacturer: a.manufacturer ?? '',
  })));
}

// ===== Engineer Performance Report =====
export function exportEngineerPerformancePDF(engineers: Profile[], requests: MaintenanceRequest[]) {
  const doc = new jsPDF();
  pdfHeader(doc, 'Engineer Performance Report', `${engineers.length} engineers`);
  const rows = engineers.map((e) => {
    const assigned = requests.filter((r) => r.assigned_engineer === e.id);
    const completed = assigned.filter((r) => r.status === 'completed' || r.status === 'closed');
    const totalCost = completed.reduce((s, r) => s + Number(r.maintenance_cost ?? 0), 0);
    const totalHours = completed.reduce((s, r) => s + Number(r.actual_hours ?? 0), 0);
    return [e.full_name, e.designation ?? 'Engineer', String(assigned.length), String(completed.length), `${totalHours.toFixed(1)}h`, formatCurrency(totalCost)];
  });
  autoTable(doc, {
    head: [['Engineer', 'Designation', 'Assigned', 'Completed', 'Total Hours', 'Total Cost']],
    body: rows,
    startY: 54,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [29, 97, 240], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  pdfFooter(doc);
  doc.save('engineer-performance-report.pdf');
}

export function exportEngineerPerformanceExcel(engineers: Profile[], requests: MaintenanceRequest[]) {
  exportExcel('engineer-performance.xlsx', 'Engineers', engineers.map((e) => {
    const assigned = requests.filter((r) => r.assigned_engineer === e.id);
    const completed = assigned.filter((r) => r.status === 'completed' || r.status === 'closed');
    return {
      Engineer: e.full_name, Designation: e.designation ?? 'Engineer',
      Assigned: assigned.length, Completed: completed.length,
      'Total Hours': completed.reduce((s, r) => s + Number(r.actual_hours ?? 0), 0),
      'Total Cost (₹)': completed.reduce((s, r) => s + Number(r.maintenance_cost ?? 0), 0),
    };
  }));
}

// ===== Inventory Usage Report =====
export function exportInventoryPDF(inventory: InventoryItem[]) {
  const doc = new jsPDF();
  pdfHeader(doc, 'Inventory Usage Report', `${inventory.length} items`);
  autoTable(doc, {
    head: [['Item', 'Part No.', 'Qty', 'Min', 'Unit Price', 'Value', 'Status']],
    body: inventory.map((i) => [
      i.item_name, i.part_number, String(i.quantity), String(i.minimum_stock),
      formatCurrency(Number(i.unit_price)), formatCurrency(i.quantity * Number(i.unit_price)),
      i.quantity <= i.minimum_stock ? 'LOW' : 'OK',
    ]),
    startY: 54,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [29, 97, 240], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  const totalValue = inventory.reduce((s, i) => s + i.quantity * Number(i.unit_price), 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Inventory Value: ${formatCurrency(totalValue)}`, 14, (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10);
  pdfFooter(doc);
  doc.save('inventory-usage-report.pdf');
}

export function exportInventoryExcel(inventory: InventoryItem[]) {
  exportExcel('inventory-usage.xlsx', 'Inventory', inventory.map((i) => ({
    Item: i.item_name, 'Part Number': i.part_number, Category: i.category ?? '',
    Quantity: i.quantity, 'Min Stock': i.minimum_stock, Unit: i.unit,
    'Unit Price': i.unit_price, 'Stock Value': i.quantity * Number(i.unit_price),
    Supplier: i.supplier ?? '', Location: i.storage_location ?? '',
    Status: i.quantity <= i.minimum_stock ? 'LOW' : 'OK',
  })));
}

// ===== Downtime Report =====
export function exportDowntimePDF(requests: MaintenanceRequest[]) {
  const doc = new jsPDF();
  pdfHeader(doc, 'Downtime Report', 'Asset downtime analysis');
  const withDowntime = requests.filter((r) => Number(r.downtime_hours ?? 0) > 0);
  autoTable(doc, {
    head: [['Code', 'Asset', 'Priority', 'Downtime (h)', 'Cost', 'Status']],
    body: withDowntime.map((r) => [
      r.request_code, r.asset?.name ?? '—', r.priority,
      `${r.downtime_hours}h`, formatCurrency(r.maintenance_cost), r.status,
    ]),
    startY: 54,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [29, 97, 240], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  const totalDown = withDowntime.reduce((s, r) => s + Number(r.downtime_hours ?? 0), 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Downtime: ${totalDown.toFixed(1)}h across ${withDowntime.length} incidents`, 14, (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10);
  pdfFooter(doc);
  doc.save('downtime-report.pdf');
}

export function exportDowntimeExcel(requests: MaintenanceRequest[]) {
  exportExcel('downtime.xlsx', 'Downtime', requests.filter((r) => Number(r.downtime_hours ?? 0) > 0).map((r) => ({
    Code: r.request_code, Asset: r.asset?.name ?? '', Priority: r.priority,
    'Downtime (h)': r.downtime_hours ?? 0, 'Cost (₹)': r.maintenance_cost ?? 0,
    Status: r.status, Created: formatDate(r.created_at),
  })));
}
