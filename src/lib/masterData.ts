/**
 * IAMMS Centralized Master Data Configuration
 * Reusable Enterprise Product Defaults
 */

export const APPLICATION_NAME = 'IAMMS';
export const APPLICATION_FULL_NAME = 'Industrial Asset & Maintenance Management System';

export const DEFAULT_COMPANY_NAME = 'Not Configured';
export const DEFAULT_PLANT_NAME = 'Not Configured';

export const COMPANY_NAME = DEFAULT_COMPANY_NAME;
export const PLANT_NAME = DEFAULT_PLANT_NAME;
export const COMPANY_SHORT = APPLICATION_NAME;

export type DepartmentType = 'production' | 'maintenance' | 'support';

export interface IndustrialDepartment {
  id: string;
  code: string;
  name: string;
  departmentType: DepartmentType;
  description: string;
  categories: string[];
}

export const INDUSTRIAL_DEPARTMENTS: IndustrialDepartment[] = [
  // ── Production Departments ──
  {
    id: 'dept-alu',
    code: 'ALU-REF',
    name: 'Alumina Refinery',
    departmentType: 'production',
    description: 'Raw Bauxite processing, Digestion, Precipitation & Calcination to alumina powder',
    categories: ['Digestion Vessel', 'Clarifier Tank', 'Calcination Kiln', 'Slurry Pump', 'Filter Press', 'Bauxite Conveyor'],
  },
  {
    id: 'dept-carb',
    code: 'CARB-PLT',
    name: 'Carbon Plant',
    departmentType: 'production',
    description: 'Pre-baked Anode block manufacturing & baking furnaces for reduction potlines',
    categories: ['Anode Baking Furnace', 'Pitch Mixer', 'Vibro Compactor', 'Green Anode Press', 'Anode Handling Crane'],
  },
  {
    id: 'dept-smelt',
    code: 'SMELT-POT',
    name: 'Smelter',
    departmentType: 'production',
    description: 'Primary Reduction Potlines & Heavy Duty Rectifier Stations',
    categories: ['Potline Cell', 'Rectifier', 'Transformer', 'Busbar', 'Crane', 'Cooling System'],
  },
  {
    id: 'dept-cast',
    code: 'CAST-HSE',
    name: 'Cast House',
    departmentType: 'production',
    description: 'Liquid metal holding, degassing, Direct Chill (DC) billet & ingot casting lines',
    categories: ['DC Casting Machine', 'Billet Casting', 'Ingot Casting', 'Holding Furnace', 'Degasser Unit', 'Homogenizing Furnace'],
  },
  {
    id: 'dept-roll',
    code: 'ROLL-MIL',
    name: 'Rolling Mill',
    departmentType: 'production',
    description: 'Hot & Cold Rolling mills producing high precision sheets, plates & coils',
    categories: ['Hot Rolling Mill', 'Cold Rolling Mill', 'Roll Grinder', 'Hydraulic Unit', 'Foil Mill', 'Annealing Furnace'],
  },
  {
    id: 'dept-ext',
    code: 'EXT-CFM',
    name: 'Extrusion & Conform',
    departmentType: 'production',
    description: 'Custom architectural & structural alloy profiles & continuous conform wire rod',
    categories: ['Extrusion Press', 'Billet Heater', 'Stretching Machine', 'Conform Machine', 'Aging Oven'],
  },
  {
    id: 'dept-cogen',
    code: 'COGEN-PWR',
    name: 'Cogeneration Plant',
    departmentType: 'production',
    description: 'Captive high-pressure thermal power generation & process steam supply',
    categories: ['Steam Turbine', 'Recovery Boiler', 'Deaerator', 'Generator', 'Coal Crusher', 'Electrostatic Precipitator'],
  },

  // ── Maintenance Departments ──
  {
    id: 'dept-mech',
    code: 'MECH-MAINT',
    name: 'Mechanical',
    departmentType: 'maintenance',
    description: 'Plant-wide mechanical maintenance, hydraulics, pneumatics & heavy fabrication repair',
    categories: ['Pump', 'Gearbox', 'Compressor', 'Conveyor', 'Motor', 'Hydraulic Unit', 'Valve Station'],
  },
  {
    id: 'dept-elec',
    code: 'ELEC-MAINT',
    name: 'Electrical',
    departmentType: 'maintenance',
    description: 'High & Low Voltage power distribution, substations & motor control centers (MCC)',
    categories: ['HT Panel', 'LT Panel', 'Transformer', 'Generator', 'UPS', 'Switchgear', 'VFD Drive'],
  },
  {
    id: 'dept-inst',
    code: 'INST-AUTO',
    name: 'Instrumentation',
    departmentType: 'maintenance',
    description: 'Process automation, PLC programming, SCADA supervisory networks & field sensors',
    categories: ['PLC', 'SCADA', 'Pressure Sensor', 'Flow Meter', 'Temperature Sensor', 'Control Valve', 'Level Transmitter'],
  },

  // ── Support Departments ──
  {
    id: 'dept-it',
    code: 'IT-DEPT',
    name: 'IT Department',
    departmentType: 'support',
    description: 'Plant Automation IT, OT Networks, Server Infrastructure & Cybersecurity',
    categories: ['Server', 'Desktop', 'Laptop', 'Firewall', 'Switch', 'Router', 'Printer', 'CCTV'],
  },
  {
    id: 'dept-hr',
    code: 'HR-DEPT',
    name: 'HR',
    departmentType: 'support',
    description: 'Human Resources, Personnel Administration & Corporate Affairs',
    categories: ['Computer', 'Furniture', 'AC Unit', 'Printer', 'Biometric Terminal'],
  },
  {
    id: 'dept-fin',
    code: 'FIN-ACCTS',
    name: 'Finance',
    departmentType: 'support',
    description: 'Commercial Accounting, Costing, Audits & Material Billing',
    categories: ['Computer', 'Furniture', 'AC Unit', 'Printer', 'Cash Locker'],
  },
  {
    id: 'dept-stores',
    code: 'PURCH-STR',
    name: 'Purchase & Stores',
    departmentType: 'support',
    description: 'Raw Material Management, Heavy Equipment Spares Depot & Inventory Control',
    categories: ['Forklift', 'Overhead Stacker', 'Pallet Truck', 'Weighbridge', 'Barcode Scanner'],
  },
  {
    id: 'dept-ehs',
    code: 'SAFETY-EHS',
    name: 'Safety (EHS)',
    departmentType: 'support',
    description: 'Environment, Occupational Health, Industrial Safety Compliance & Fire Services',
    categories: ['Fire Hydrant System', 'Gas Detector', 'Emergency Siren', 'PPE Dispenser', 'Smoke Detector'],
  },
  {
    id: 'dept-sec',
    code: 'SEC-FORCE',
    name: 'Security',
    departmentType: 'support',
    description: 'Perimeter Guarding, Gate Access Verification & CCTV Monitoring',
    categories: ['CCTV', 'Boom Barrier', 'Baggage Scanner', 'Turnstile Gate', 'Patrol Vehicle'],
  },
  {
    id: 'dept-util',
    code: 'UTIL-WTR',
    name: 'Utilities & Water',
    departmentType: 'support',
    description: 'Water treatment plant, compressed air, cooling towers & ETP effluent treatment',
    categories: ['Water Treatment Plant', 'Air Compressor', 'Chiller', 'Gas Pipeline', 'Effluent Treatment Plant'],
  },
];

export const DEPARTMENTS = INDUSTRIAL_DEPARTMENTS.map((d) => d.name) as readonly string[];

export const DEPARTMENT_TYPE_LABELS: Record<DepartmentType, string> = {
  production: 'Production Division',
  maintenance: 'Engineering Maintenance',
  support: 'Plant Support & Administration',
};

// Flattened list of all asset categories across departments
export const ALL_ASSET_CATEGORIES = Array.from(
  new Set(INDUSTRIAL_DEPARTMENTS.flatMap((d) => d.categories))
).sort();

export const ASSET_CATEGORIES = ALL_ASSET_CATEGORIES as readonly string[];

// Map asset categories by department name
export function getCategoriesForDepartment(departmentName: string | null | undefined): string[] {
  if (!departmentName) return ALL_ASSET_CATEGORIES;
  const dept = INDUSTRIAL_DEPARTMENTS.find(
    (d) => d.name.toLowerCase() === departmentName.toLowerCase()
  );
  return dept ? dept.categories : ALL_ASSET_CATEGORIES;
}

export type IndustrialAssetType =
  | 'production_equipment'
  | 'mechanical_equipment'
  | 'electrical_equipment'
  | 'instrumentation'
  | 'it_asset'
  | 'facility_asset'
  | 'vehicle'
  | 'tool';

export const INDUSTRIAL_ASSET_TYPES: { id: IndustrialAssetType; label: string; description: string }[] = [
  { id: 'production_equipment', label: 'Production Equipment', description: 'Core manufacturing & processing machinery' },
  { id: 'mechanical_equipment', label: 'Mechanical Equipment', description: 'Pumps, gearboxes, hydraulics & heavy mechanical drives' },
  { id: 'electrical_equipment', label: 'Electrical Equipment', description: 'Transformers, HT/LT panels, motors & power distribution' },
  { id: 'instrumentation',      label: 'Instrumentation & Automation', description: 'PLC, SCADA, transmitters & process sensors' },
  { id: 'it_asset',             label: 'IT & Network Asset',  description: 'Servers, workstations, switches & firewalls' },
  { id: 'facility_asset',       label: 'Facility Asset',       description: 'Civil structures, HVAC, lighting & building systems' },
  { id: 'vehicle',              label: 'Vehicle & Material Handling', description: 'Forklifts, cranes, loaders & plant transport' },
  { id: 'tool',                 label: 'Tool & Portable Gear', description: 'Testing kits, calibration tools & portable equipment' },
];

export type AssetStatus = 'operational' | 'active' | 'under_maintenance' | 'breakdown' | 'idle' | 'retired';

export const ASSET_STATUS_META: Record<AssetStatus, { label: string; color: string; dot: string }> = {
  operational:       { label: 'Operational',       color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  active:            { label: 'Operational',       color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  under_maintenance: { label: 'Under Maintenance', color: 'text-amber-600 dark:text-amber-400',   dot: 'bg-amber-500' },
  breakdown:         { label: 'Breakdown',         color: 'text-rose-600 dark:text-rose-400',     dot: 'bg-rose-500' },
  idle:              { label: 'Idle / Standby',    color: 'text-blue-600 dark:text-blue-400',     dot: 'bg-blue-500' },
  retired:           { label: 'Decommissioned',    color: 'text-slate-400 dark:text-slate-500',   dot: 'bg-slate-400' },
};

export type Criticality = 'low' | 'medium' | 'high' | 'critical';

export const CRITICALITY_META: Record<Criticality, { label: string; color: string; bg: string }> = {
  low:      { label: 'Low',      color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800' },
  medium:   { label: 'Medium',   color: 'text-blue-600',  bg: 'bg-blue-100 dark:bg-blue-900/30' },
  high:     { label: 'High',     color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  critical: { label: 'Critical', color: 'text-rose-600',  bg: 'bg-rose-100 dark:bg-rose-900/30' },
};

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export const PRIORITY_META: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  low:      { label: 'Low',      color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  medium:   { label: 'Medium',   color: 'text-blue-600',  bg: 'bg-blue-100',  border: 'border-blue-200' },
  high:     { label: 'High',     color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
  critical: { label: 'Critical', color: 'text-rose-600',  bg: 'bg-rose-100',  border: 'border-rose-200' },
};

export type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'emergency' | 'inspection';

export const MAINTENANCE_TYPE_META: Record<MaintenanceType, { label: string; description: string }> = {
  preventive: { label: 'Preventive Maintenance', description: 'Scheduled recurring service to prevent failures' },
  corrective: { label: 'Corrective Maintenance', description: 'Repair action following fault identification' },
  predictive: { label: 'Predictive Maintenance', description: 'Condition-based maintenance from sensor diagnostics' },
  emergency:  { label: 'Emergency Breakdown',     description: 'Unplanned critical failure requiring instant response' },
  inspection: { label: 'Routine Inspection',     description: 'Periodic visual or instrument calibration audit' },
};

export const MAINTENANCE_TYPES: MaintenanceType[] = ['preventive', 'corrective', 'predictive', 'emergency', 'inspection'];
