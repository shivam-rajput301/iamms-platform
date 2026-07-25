import Plant from './models/Plant.js';
import Department from './models/Department.js';
import Asset from './models/Asset.js';
import InventoryItem from './models/InventoryItem.js';
import MaintenanceRequest from './models/MaintenanceRequest.js';
import MaintenanceLog from './models/MaintenanceLog.js';
import Notification from './models/Notification.js';
import User from './models/User.js';

export async function seedData() {
  try {
    // 1. Plant Master Data
    let plant = await Plant.findOne({ code: 'HIN-RNK' });
    if (!plant) {
      plant = await Plant.create({
        name: 'Renukoot Unit',
        code: 'HIN-RNK',
        company: 'Hindalco Industries Limited',
        location: 'Renukoot, Sonebhadra, Uttar Pradesh',
        state: 'Uttar Pradesh',
        country: 'India',
      });
      console.log('[seed] ✓ Plant Master Data seeded: Renukoot Unit (HIN-RNK)');
    }

    // 2. Industrial Departments
    const HINDALCO_DEPARTMENTS = [
      // Production Division
      { name: 'Alumina Refinery',   code: 'ALU-REF',   departmentType: 'production', description: 'Bauxite processing, Digestion & Calcination to alumina powder', head_of_department: 'S. K. Roy' },
      { name: 'Carbon Plant',       code: 'CARB-PLT',  departmentType: 'production', description: 'Pre-baked Anode block manufacturing for reduction potlines',    head_of_department: 'M. K. Mishra' },
      { name: 'Smelter',            code: 'SMELT-POT', departmentType: 'production', description: 'Primary Reduction Potlines & Heavy Duty Rectifiers',         head_of_department: 'Rajesh Sharma' },
      { name: 'Cast House',         code: 'CAST-HSE',  departmentType: 'production', description: 'Liquid metal holding & Direct Chill (DC) billet/ingot casting',    head_of_department: 'R. P. Singh' },
      { name: 'Rolling Mill',       code: 'ROLL-MIL',  departmentType: 'production', description: 'Hot & Cold Rolling mills producing sheets, plates & coils',      head_of_department: 'Anil Verma' },
      { name: 'Extrusion & Conform',code: 'EXT-CFM',   departmentType: 'production', description: 'Custom architectural profiles & continuous conform wire rod',     head_of_department: 'Suresh Nair' },
      { name: 'Cogeneration Plant', code: 'COGEN-PWR',  departmentType: 'production', description: 'Captive thermal power generation & process steam supply',        head_of_department: 'Pankaj Gupta' },

      // Engineering Maintenance
      { name: 'Mechanical',         code: 'MECH-MAINT',departmentType: 'maintenance',description: 'Mechanical maintenance, hydraulics, pneumatics & fabrication',  head_of_department: 'A. K. Srivastava' },
      { name: 'Electrical',         code: 'ELEC-MAINT',departmentType: 'maintenance',description: 'High & Low Voltage distribution & motor control centers',        head_of_department: 'V. K. Pandey' },
      { name: 'Instrumentation',    code: 'INST-AUTO', departmentType: 'maintenance',description: 'Process automation, PLC programming & SCADA field sensors',       head_of_department: 'Dinesh Kumar' },

      // Support & Administration
      { name: 'IT Department',      code: 'IT-DEPT',   departmentType: 'support',    description: 'Plant Automation IT, OT Networks, SCADA & Enterprise Systems',   head_of_department: 'Shivam Singh' },
      { name: 'HR',                 code: 'HR-DEPT',   departmentType: 'support',    description: 'Human Resources, Plant Training Academy & Personnel',          head_of_department: 'P. N. Tripathi' },
      { name: 'Finance',            code: 'FIN-ACCTS', departmentType: 'support',    description: 'Plant Commercial Accounting, Costing & Material Billing',        head_of_department: 'S. N. Jha' },
      { name: 'Purchase & Stores',  code: 'PURCH-STR', departmentType: 'support',    description: 'Raw Material Management & Heavy Equipment Spares Warehouse',     head_of_department: 'Vikram Singh' },
      { name: 'Safety (EHS)',       code: 'SAFETY-EHS',departmentType: 'support',    description: 'Environment, Health, Safety Compliance & Fire Station',          head_of_department: 'Dr. V. S. Chauhan' },
      { name: 'Security',           code: 'SEC-FORCE', departmentType: 'support',    description: 'Plant Perimeter Guarding, Gate Access & CCTV Surveillance',      head_of_department: 'Capt. R. S. Yadav' },
      { name: 'Utilities & Water',  code: 'UTIL-WTR',  departmentType: 'support',    description: 'DM Water plant, cooling towers & ETP effluent treatment',       head_of_department: 'B. K. Tiwari' },
    ];

    for (const d of HINDALCO_DEPARTMENTS) {
      await Department.findOneAndUpdate(
        { code: d.code },
        { ...d },
        { upsert: true, new: true }
      );
    }
    console.log('[seed] ✓ 17 Hindalco Renukoot Industrial Departments seeded/synced.');

    // Fetch department references
    const smelter = await Department.findOne({ code: 'SMELT-POT' });
    const rolling = await Department.findOne({ code: 'ROLL-MIL' });
    const cogen   = await Department.findOne({ code: 'COGEN-PWR' });
    const inst    = await Department.findOne({ code: 'INST-AUTO' });
    const itDept  = await Department.findOne({ code: 'IT-DEPT' });

    // 3. Hindalco Industrial Assets
    const HINDALCO_ASSETS = [
      {
        asset_id: 'HIN-POT-012',
        name: 'Reduction Potline Cell #12',
        category: 'Potline Cell',
        asset_type: 'production_equipment',
        maintenance_type: 'preventive',
        department_id: smelter?._id || null,
        plant: 'Renukoot Unit',
        location: 'Potline 1 - Bay B',
        manufacturer: 'ECL Aluminium Tech',
        model_number: 'AP30-HE',
        serial_number: 'SN-RNK-2023-9941',
        health_score: 94,
        status: 'operational',
        criticality: 'critical',
        purchase_cost: 14500000,
        notes: 'High-current reduction pot cell operating continuously at 320kA.',
      },
      {
        asset_id: 'HIN-CRM-002',
        name: 'Cold Rolling Mill #2 Drive Motor',
        category: 'Cold Rolling Mill',
        asset_type: 'mechanical_equipment',
        maintenance_type: 'predictive',
        department_id: rolling?._id || null,
        plant: 'Renukoot Unit',
        location: 'Rolling Mill Complex - Line 2',
        manufacturer: 'Siemens Heavy Drives',
        model_number: '1PH8-280-4Pole',
        serial_number: 'SN-RNK-2022-4412',
        health_score: 68,
        status: 'under_maintenance',
        criticality: 'high',
        purchase_cost: 6500000,
        notes: 'Bearing vibration diagnostics scheduled under predictive maintenance.',
      },
      {
        asset_id: 'HIN-BFP-105',
        name: 'High Pressure Boiler Feed Pump #1',
        category: 'Steam Turbine',
        asset_type: 'mechanical_equipment',
        maintenance_type: 'emergency',
        department_id: cogen?._id || null,
        plant: 'Renukoot Unit',
        location: 'Cogeneration Power Plant - Turbine Hall',
        manufacturer: 'KSB Pumps India',
        model_number: 'HGC 6/9 High Temp',
        serial_number: 'SN-RNK-2020-0081',
        health_score: 42,
        status: 'breakdown',
        criticality: 'critical',
        purchase_cost: 4800000,
        notes: 'Mechanical seal replacement required due to high temp feed pressure drop.',
      },
      {
        asset_id: 'HIN-PLC-101',
        name: 'Siemens S7-1500 PLC Master Rack',
        category: 'PLC',
        asset_type: 'instrumentation',
        maintenance_type: 'inspection',
        department_id: inst?._id || null,
        plant: 'Renukoot Unit',
        location: 'Central Control Room (CCR) - Rack A',
        manufacturer: 'Siemens Automation',
        model_number: 'CPU 1518-4 PN/DP',
        serial_number: 'SN-RNK-2024-1102',
        health_score: 98,
        status: 'operational',
        criticality: 'high',
        purchase_cost: 1800000,
        notes: 'Controls Smelter Potline automatic alumina feeding cycle.',
      },
      {
        asset_id: 'HIN-SVR-001',
        name: 'Plant Industrial SCADA Redundant Server',
        category: 'Server',
        asset_type: 'it_asset',
        maintenance_type: 'preventive',
        department_id: itDept?._id || null,
        plant: 'Renukoot Unit',
        location: 'IT Data Center - Rack 04',
        manufacturer: 'Dell PowerEdge Heavy Duty',
        model_number: 'R750xd Server',
        serial_number: 'SN-RNK-2023-7721',
        health_score: 96,
        status: 'operational',
        criticality: 'critical',
        purchase_cost: 1200000,
        notes: 'Hosts Wonderware System Platform SCADA database for Renukoot Unit.',
      },
    ];

    for (const a of HINDALCO_ASSETS) {
      await Asset.findOneAndUpdate(
        { asset_id: a.asset_id },
        { ...a },
        { upsert: true, new: true }
      );
    }
    console.log('[seed] ✓ Hindalco Industrial Assets seeded/synced.');

    // 4. Inventory Spares
    const HINDALCO_INVENTORY = [
      { item_name: 'SKF Spherical Roller Bearing for Potline Crane', part_number: 'BRG-SKF-22230', category: 'Bearings', quantity: 24, minimum_stock: 6, unit: 'pcs', unit_price: 18500, storage_location: 'Central Stores - Rack A-12' },
      { item_name: 'High-Temp Synthetic Anode Grease (18kg Pail)', part_number: 'LUB-MOB-SHC460', category: 'Lubricants', quantity: 5, minimum_stock: 8, unit: 'pails', unit_price: 6400, storage_location: 'Chem Depot - Locker B' },
      { item_name: 'Hydraulic High-Pressure Seal Kit DN100', part_number: 'SEL-PARK-100DN', category: 'Seals & Gaskets', quantity: 36, minimum_stock: 10, unit: 'kits', unit_price: 2850, storage_location: 'Hydraulic Bay - Bin C-04' },
      { item_name: 'Siemens S7-1500 Digital Input Module (16-Ch)', part_number: 'ELE-SIE-DI16-S7', category: 'Automation', quantity: 3, minimum_stock: 4, unit: 'units', unit_price: 24500, storage_location: 'Inst Store - Cabinet E-1' },
    ];

    for (const item of HINDALCO_INVENTORY) {
      await InventoryItem.findOneAndUpdate(
        { part_number: item.part_number },
        { ...item },
        { upsert: true, new: true }
      );
    }
    console.log('[seed] ✓ Hindalco Spares & Inventory seeded/synced.');

    // 5. Seed MR-2026-021 Specific Maintenance Request
    let mr021 = await MaintenanceRequest.findOne({ request_code: 'MR-2026-021' });
    const crmAsset = await Asset.findOne({ asset_id: 'HIN-CRM-002' });
    const employeeUser = await User.findOne({ employeeId: 'IAMMS-EMP-001' }) || await User.findOne({ role: 'employee' });
    const engineerUser = await User.findOne({ employeeId: 'IAMMS-ENG-001' }) || await User.findOne({ role: 'engineer' });
    const managerUser  = await User.findOne({ employeeId: 'IAMMS-MGR-001' }) || await User.findOne({ role: 'manager' });

    if (!mr021 && crmAsset && employeeUser) {
      mr021 = await MaintenanceRequest.create({
        request_code: 'MR-2026-021',
        asset_id: crmAsset._id,
        title: 'Drive Motor Abnormal Vibration & Overheating',
        description: 'Cold Rolling Mill #2 drive motor showing severe shaft vibration during high-torque rolling pass.',
        priority: 'high',
        status: 'in_progress',
        requested_by: employeeUser._id,
        assigned_engineer: engineerUser?._id || null,
        assigned_by: managerUser?._id || null,
        repair_notes: 'Bearing replacement in progress.',
        estimated_hours: 12,
        maintenance_cost: 32000,
        downtime_hours: 6.0,
        assigned_at: new Date('2026-07-24T10:00:00Z').toISOString(),
        started_at: new Date('2026-07-24T14:30:00Z').toISOString(),
      });

      // Add Complaint History & Engineer Comment Logs
      await MaintenanceLog.create([
        { request_id: mr021._id, author_id: employeeUser._id, note: 'Previous Complaint: Bearing vibration reported (Jan 2026)', progress: 10, log_type: 'note' },
        { request_id: mr021._id, author_id: employeeUser._id, note: 'Previous Complaint: Oil leakage inspected (Mar 2026)', progress: 20, log_type: 'note' },
        { request_id: mr021._id, author_id: employeeUser._id, note: 'Previous Complaint: Motor overheating recorded (Jun 2026)', progress: 30, log_type: 'note' },
        { request_id: mr021._id, author_id: engineerUser?._id || employeeUser._id, note: 'Engineer Comment: Bearing replacement in progress.', progress: 70, log_type: 'update' },
      ]);

      console.log('[seed] ✓ Seeded MR-2026-021 (Cold Rolling Mill #2 Drive Motor in_progress)');
    }

    // 6. System Notifications
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      await Notification.insertMany([
        { type: 'breakdown', title: 'Critical Breakdown Alert', message: 'Boiler Feed Pump #1 in Cogeneration Plant reported pressure drop.', link: '/assets', is_read: false },
        { type: 'low_stock', title: 'Low Inventory Alert', message: 'High-Temp Synthetic Anode Grease is below minimum threshold (5 pails left).', link: '/inventory', is_read: false },
        { type: 'new_request', title: 'New Work Order Created', message: 'Work Order MR-2026-021 created for Cold Rolling Mill #2.', link: '/requests', is_read: true },
      ]);
      console.log('[seed] ✓ Initial notifications seeded.');
    }
  } catch (err) {
    console.error('[seedData] Error during data seeding:', err?.message ?? err);
  }
}
