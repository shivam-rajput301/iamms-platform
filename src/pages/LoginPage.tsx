import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Eye, EyeOff, AlertCircle, Lock, Shield, CreditCard,
  Activity, Layers, ClipboardList, ChevronRight, Settings,
  Wrench, Package, BarChart2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { COMPANY_NAME } from '@/lib/constants';

/* ─── KPI data ───────────────────────────────────────────────── */
const KPI_CARDS = [
  { label: 'Assets Managed',      value: '145+',  icon: Layers,        accent: '#2563EB' },
  { label: 'Open Work Orders',    value: '23',    icon: ClipboardList, accent: '#F97316' },
  { label: 'Departments',         value: '7',     icon: Settings,      accent: '#2563EB' },
  { label: 'System Availability', value: '99.8%', icon: Activity,      accent: '#10B981' },
];

/* ════════════════════════════════════════════════════════════════
   IAMMS BRAND ICON — precision gear / cog SVG
════════════════════════════════════════════════════════════════ */
function GearIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-1.954l-.632 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.655L5.516 16.3 4 18l2 2 1.791-1.46 2.606 1.072L11 22h2l.604-2.387 2.651-1.098C16.697 19.48 18 20 18 20l2-2-1.484-1.75 1.098-2.652 2.386-.62V11l-2.378-.605z"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   INDUSTRIAL BLUEPRINT ILLUSTRATION (left panel)
════════════════════════════════════════════════════════════════ */
function BlueprintIllustration() {
  return (
    <svg viewBox="0 0 560 340" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full" style={{ maxWidth: 520 }} aria-hidden="true">
      <defs>
        <pattern id="bp-grid-sm" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(37,99,235,0.12)" strokeWidth="0.5"/>
        </pattern>
        <pattern id="bp-grid-lg" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#bp-grid-sm)"/>
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(37,99,235,0.2)" strokeWidth="0.8"/>
        </pattern>
      </defs>
      <rect width="560" height="340" fill="url(#bp-grid-lg)" rx="4"/>
      {/* Title block */}
      <rect x="380" y="270" width="170" height="60" rx="2" fill="none" stroke="rgba(37,99,235,0.3)" strokeWidth="1"/>
      <line x1="380" y1="286" x2="550" y2="286" stroke="rgba(37,99,235,0.25)" strokeWidth="0.8"/>
      <line x1="380" y1="302" x2="550" y2="302" strokeWidth="0.8" stroke="rgba(37,99,235,0.25)"/>
      <text x="465" y="281" textAnchor="middle" fontSize="6" fill="rgba(37,99,235,0.55)" fontFamily="monospace" fontWeight="600">PLANT FLOOR SCHEMATIC</text>
      <text x="465" y="297" textAnchor="middle" fontSize="5" fill="rgba(37,99,235,0.4)" fontFamily="monospace">IAMMS — REV 4.2</text>
      <text x="465" y="322" textAnchor="middle" fontSize="5" fill="rgba(37,99,235,0.35)" fontFamily="monospace">AMP-DWG-2026-001</text>
      {/* Factory outline */}
      <rect x="30" y="60" width="200" height="170" rx="2" fill="none" stroke="rgba(37,99,235,0.4)" strokeWidth="1.2"/>
      <line x1="30" y1="130" x2="230" y2="130" stroke="rgba(37,99,235,0.25)" strokeWidth="0.8" strokeDasharray="4 3"/>
      <line x1="130" y1="60" x2="130" y2="230" stroke="rgba(37,99,235,0.25)" strokeWidth="0.8" strokeDasharray="4 3"/>
      <text x="80" y="98" textAnchor="middle" fontSize="6.5" fill="rgba(37,99,235,0.5)" fontFamily="monospace" fontWeight="600">SMELTER</text>
      <text x="180" y="98" textAnchor="middle" fontSize="6.5" fill="rgba(37,99,235,0.5)" fontFamily="monospace" fontWeight="600">ROLLING</text>
      <text x="80" y="182" textAnchor="middle" fontSize="6.5" fill="rgba(37,99,235,0.5)" fontFamily="monospace" fontWeight="600">UTILITIES</text>
      <text x="180" y="182" textAnchor="middle" fontSize="6.5" fill="rgba(37,99,235,0.5)" fontFamily="monospace" fontWeight="600">FABRICATION</text>
      {/* Dimension lines */}
      <line x1="30" y1="248" x2="230" y2="248" stroke="rgba(37,99,235,0.3)" strokeWidth="0.8"/>
      <line x1="30" y1="244" x2="30" y2="252" stroke="rgba(37,99,235,0.3)" strokeWidth="0.8"/>
      <line x1="230" y1="244" x2="230" y2="252" stroke="rgba(37,99,235,0.3)" strokeWidth="0.8"/>
      <text x="130" y="258" textAnchor="middle" fontSize="5.5" fill="rgba(37,99,235,0.4)" fontFamily="monospace">200.00 m</text>
      <line x1="14" y1="60" x2="14" y2="230" stroke="rgba(37,99,235,0.3)" strokeWidth="0.8"/>
      <line x1="10" y1="60" x2="18" y2="60" stroke="rgba(37,99,235,0.3)" strokeWidth="0.8"/>
      <line x1="10" y1="230" x2="18" y2="230" stroke="rgba(37,99,235,0.3)" strokeWidth="0.8"/>
      <text x="8" y="148" textAnchor="middle" fontSize="5.5" fill="rgba(37,99,235,0.4)" fontFamily="monospace" transform="rotate(-90 8 148)">170.00 m</text>
      {/* Machinery */}
      <circle cx="70" cy="100" r="16" fill="none" stroke="rgba(249,115,22,0.45)" strokeWidth="1.2" strokeDasharray="3 2"/>
      <circle cx="70" cy="100" r="6" fill="rgba(249,115,22,0.15)" stroke="rgba(249,115,22,0.5)" strokeWidth="0.8"/>
      <text x="70" y="122" textAnchor="middle" fontSize="5" fill="rgba(249,115,22,0.55)" fontFamily="monospace">FURNACE</text>
      <rect x="148" y="72" width="28" height="18" rx="2" fill="none" stroke="rgba(37,99,235,0.4)" strokeWidth="1"/>
      <line x1="148" y1="81" x2="176" y2="81" stroke="rgba(37,99,235,0.3)" strokeWidth="0.6"/>
      <text x="162" y="100" textAnchor="middle" fontSize="5" fill="rgba(37,99,235,0.5)" fontFamily="monospace">ROLLER</text>
      <rect x="46" y="148" width="20" height="20" rx="10" fill="none" stroke="rgba(16,185,129,0.45)" strokeWidth="1"/>
      <text x="56" y="178" textAnchor="middle" fontSize="5" fill="rgba(16,185,129,0.55)" fontFamily="monospace">COMP.</text>
      <rect x="160" y="150" width="24" height="24" rx="2" fill="none" stroke="rgba(37,99,235,0.35)" strokeWidth="1" strokeDasharray="2 2"/>
      <line x1="165" y1="155" x2="179" y2="169" stroke="rgba(37,99,235,0.3)" strokeWidth="0.6"/>
      <line x1="179" y1="155" x2="165" y2="169" stroke="rgba(37,99,235,0.3)" strokeWidth="0.6"/>
      <text x="172" y="184" textAnchor="middle" fontSize="5" fill="rgba(37,99,235,0.5)" fontFamily="monospace">XFMR</text>
      {/* Power plant */}
      <rect x="260" y="40" width="120" height="90" rx="2" fill="none" stroke="rgba(37,99,235,0.35)" strokeWidth="1.2"/>
      <text x="320" y="58" textAnchor="middle" fontSize="7" fill="rgba(37,99,235,0.5)" fontFamily="monospace" fontWeight="600">POWER PLANT</text>
      <circle cx="292" cy="95" r="22" fill="none" stroke="rgba(37,99,235,0.3)" strokeWidth="0.8" strokeDasharray="5 3"/>
      <circle cx="292" cy="95" r="10" fill="none" stroke="rgba(37,99,235,0.4)" strokeWidth="1"/>
      <circle cx="292" cy="95" r="3" fill="rgba(37,99,235,0.3)"/>
      <circle cx="348" cy="95" r="22" fill="none" stroke="rgba(37,99,235,0.3)" strokeWidth="0.8" strokeDasharray="5 3"/>
      <circle cx="348" cy="95" r="10" fill="none" stroke="rgba(37,99,235,0.4)" strokeWidth="1"/>
      <circle cx="348" cy="95" r="3" fill="rgba(37,99,235,0.3)"/>
      <text x="292" y="123" textAnchor="middle" fontSize="5" fill="rgba(37,99,235,0.4)" fontFamily="monospace">GEN-1</text>
      <text x="348" y="123" textAnchor="middle" fontSize="5" fill="rgba(37,99,235,0.4)" fontFamily="monospace">GEN-2</text>
      {/* Railway */}
      <rect x="260" y="155" width="220" height="60" rx="2" fill="none" stroke="rgba(37,99,235,0.3)" strokeWidth="1"/>
      <text x="370" y="170" textAnchor="middle" fontSize="7" fill="rgba(37,99,235,0.45)" fontFamily="monospace" fontWeight="600">RAILWAY YARD</text>
      <line x1="270" y1="185" x2="470" y2="185" stroke="rgba(37,99,235,0.3)" strokeWidth="1.2"/>
      <line x1="270" y1="195" x2="470" y2="195" stroke="rgba(37,99,235,0.3)" strokeWidth="1.2"/>
      {[280,300,320,340,360,380,400,420,440,460].map((x) => (
        <line key={x} x1={x} y1="182" x2={x} y2="198" stroke="rgba(37,99,235,0.2)" strokeWidth="2"/>
      ))}
      <rect x="290" y="178" width="50" height="14" rx="3" fill="rgba(37,99,235,0.08)" stroke="rgba(37,99,235,0.35)" strokeWidth="0.8"/>
      <circle cx="298" cy="194" r="3" fill="none" stroke="rgba(37,99,235,0.35)" strokeWidth="0.8"/>
      <circle cx="330" cy="194" r="3" fill="none" stroke="rgba(37,99,235,0.35)" strokeWidth="0.8"/>
      {/* Sensor nodes */}
      <circle cx="70" cy="100" r="3.5" fill="#10B981" fillOpacity="0.9"/>
      <circle cx="70" cy="100" r="7" fill="#10B981" fillOpacity="0.12"/>
      <circle cx="162" cy="162" r="3.5" fill="#F97316" fillOpacity="0.9"/>
      <circle cx="162" cy="162" r="7" fill="#F97316" fillOpacity="0.12"/>
      <circle cx="320" cy="86" r="3.5" fill="#2563eb" fillOpacity="0.9"/>
      <circle cx="320" cy="86" r="7" fill="#2563eb" fillOpacity="0.12"/>
      <line x1="70" y1="100" x2="162" y2="162" stroke="rgba(37,99,235,0.15)" strokeWidth="0.8" strokeDasharray="5 4"/>
      <line x1="162" y1="162" x2="320" y2="86" stroke="rgba(37,99,235,0.15)" strokeWidth="0.8" strokeDasharray="5 4"/>
      {/* Legend */}
      <rect x="30" y="272" width="160" height="55" rx="2" fill="none" stroke="rgba(37,99,235,0.2)" strokeWidth="0.8"/>
      <text x="110" y="283" textAnchor="middle" fontSize="5.5" fill="rgba(37,99,235,0.5)" fontFamily="monospace" fontWeight="700">LEGEND</text>
      <circle cx="42" cy="295" r="3" fill="#10B981" fillOpacity="0.8"/>
      <text x="50" y="298" fontSize="5" fill="rgba(37,99,235,0.45)" fontFamily="monospace">OPERATIONAL</text>
      <circle cx="42" cy="308" r="3" fill="#F97316" fillOpacity="0.8"/>
      <text x="50" y="311" fontSize="5" fill="rgba(37,99,235,0.45)" fontFamily="monospace">MAINTENANCE REQUIRED</text>
      <circle cx="42" cy="320" r="3" fill="#2563EB" fillOpacity="0.8"/>
      <text x="50" y="323" fontSize="5" fill="rgba(37,99,235,0.45)" fontFamily="monospace">MONITORED</text>
      {/* North */}
      <g transform="translate(510 48)">
        <circle cx="0" cy="0" r="14" fill="none" stroke="rgba(37,99,235,0.25)" strokeWidth="0.8"/>
        <path d="M0 -10 L4 4 L0 1 L-4 4 Z" fill="rgba(37,99,235,0.5)"/>
        <path d="M0 10 L4 -4 L0 -1 L-4 -4 Z" fill="rgba(37,99,235,0.18)"/>
        <text x="0" y="-14" textAnchor="middle" fontSize="6" fill="rgba(37,99,235,0.55)" fontFamily="monospace" fontWeight="700">N</text>
      </g>
      {/* Piping */}
      <path d="M 230 90 H 260" stroke="rgba(249,115,22,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M 230 140 H 260 V 155" stroke="rgba(37,99,235,0.25)" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 3"/>
    </svg>
  );
}

/* ─── Animated KPI counter ───────────────────────────────────── */
function AnimatedValue({ value }: { value: string }) {
  return (
    <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {value}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════════════
   SYSTEM BOOT SEQUENCE
   Premium enterprise startup animation — 2.2 s, once per session
   Inspired by: SAP, Siemens, ABB, Honeywell control system UIs
════════════════════════════════════════════════════════════════ */

const BOOT_SESSION_KEY = 'iamms_boot_v2';
const NODE_RADIUS      = 148; // distance from center to module nodes (px)

type LucideIconComponent = React.ComponentType<{
  style?: React.CSSProperties;
  className?: string;
}>;

interface BootModule {
  id:    string;
  label: string;
  Icon:  LucideIconComponent;
  angle: number;   // degrees from top, clockwise
  color: string;
}

const BOOT_MODULES: BootModule[] = [
  { id: 'assets',      label: 'Assets',      Icon: Layers,        angle: -90,  color: '#2563EB' },
  { id: 'maintenance', label: 'Maintenance', Icon: Wrench,        angle: -18,  color: '#F97316' },
  { id: 'workorders',  label: 'Work Orders', Icon: ClipboardList, angle:  54,  color: '#2563EB' },
  { id: 'inventory',   label: 'Inventory',   Icon: Package,       angle: 126,  color: '#10B981' },
  { id: 'reports',     label: 'Reports',     Icon: BarChart2,     angle: 198,  color: '#2563EB' },
];

/** Convert polar angle + radius to {x, y} cartesian offset from center */
function degToXY(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad) * r, y: Math.sin(rad) * r };
}

type BootPhase = 'center' | 'lines' | 'modules' | 'connections' | 'hold' | 'collapse';

function SystemBootSequence({ onComplete }: { onComplete: () => void }) {
  const prefersReduced = useReducedMotion();
  const [phase,   setPhase]   = useState<BootPhase>('center');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Skip: reduced-motion or already played this session
    if (prefersReduced || sessionStorage.getItem(BOOT_SESSION_KEY)) {
      setVisible(false);
      onComplete();
      return;
    }
    sessionStorage.setItem(BOOT_SESSION_KEY, '1');

    // ── Timeline (total ≈ 2.25 s) ──────────────────────────────
    // 0 ms   → center node materialises     (phase: 'center')
    // 330 ms → radial lines extend           (phase: 'lines')
    // 620 ms → module nodes reveal (stagger) (phase: 'modules')
    // 1150ms → pentagon connections draw     (phase: 'connections')
    // 1580ms → brief hold                   (phase: 'hold')
    // 1780ms → collapse into login card     (phase: 'collapse')
    // 2350ms → unmount + fire onComplete
    const timers = [
      setTimeout(() => setPhase('lines'),       330),
      setTimeout(() => setPhase('modules'),     620),
      setTimeout(() => setPhase('connections'), 1150),
      setTimeout(() => setPhase('hold'),        1580),
      setTimeout(() => setPhase('collapse'),    1780),
      setTimeout(() => { setVisible(false); onComplete(); }, 2350),
    ];
    return () => timers.forEach(clearTimeout);
  }, [prefersReduced, onComplete]);

  if (!visible) return null;

  const showLines       = phase !== 'center';
  const showModules     = ['modules', 'connections', 'hold', 'collapse'].includes(phase);
  const showConnections = ['connections', 'hold', 'collapse'].includes(phase);
  const isCollapsing    = phase === 'collapse';

  // SVG canvas — center at (SVG_CX, SVG_CY)
  const SVG_W = 560, SVG_H = 480;
  const SVG_CX = SVG_W / 2, SVG_CY = SVG_H / 2;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot-seq"
          className="fixed inset-0 z-[100] flex items-center justify-center select-none"
          style={{ background: '#020817' }}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          animate={
            isCollapsing
              ? { opacity: 0, scale: 0.04, x: '28vw', y: '6vh' }
              : { opacity: 1, scale: 1, x: 0, y: 0 }
          }
          transition={
            isCollapsing
              ? { duration: 0.52, ease: [0.7, 0, 0.95, 0.4] }
              : { duration: 0 }
          }
        >
          {/* ── Blueprint grid background ── */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage:
              'linear-gradient(rgba(37,99,235,0.065) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(37,99,235,0.065) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}/>

          {/* ── Radial vignette ── */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 55% 60% at 50% 50%, transparent 0%, rgba(2,8,23,0.82) 100%)',
          }}/>

          {/* ── Horizontal scan sweep line ── */}
          <motion.div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.45) 30%, rgba(96,165,250,0.9) 50%, rgba(37,99,235,0.45) 70%, transparent 100%)',
            }}
            initial={{ top: '8%', opacity: 0 }}
            animate={{ top: '92%', opacity: [0, 0.9, 0.9, 0] }}
            transition={{ duration: 1.35, delay: 0.2, ease: 'linear', times: [0, 0.04, 0.9, 1] }}
          />

          {/* ── SVG canvas — all lines, rings, dots ── */}
          <svg
            width={SVG_W} height={SVG_H}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', overflow: 'visible' }}
            aria-hidden="true"
          >
            {/* Radial spokes: center → each module node */}
            {BOOT_MODULES.map((mod, i) => {
              const p = degToXY(mod.angle, NODE_RADIUS);
              return (
                <motion.line
                  key={`spoke-${mod.id}`}
                  x1={SVG_CX} y1={SVG_CY}
                  x2={SVG_CX + p.x} y2={SVG_CY + p.y}
                  stroke="rgba(37,99,235,0.38)"
                  strokeWidth="0.9"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: showLines ? 1 : 0 }}
                  transition={{ duration: 0.4, delay: i * 0.065, ease: 'easeOut' }}
                />
              );
            })}

            {/* Pentagon perimeter — module-to-adjacent-module */}
            {BOOT_MODULES.map((mod, i) => {
              const next = BOOT_MODULES[(i + 1) % BOOT_MODULES.length];
              const p1 = degToXY(mod.angle,  NODE_RADIUS);
              const p2 = degToXY(next.angle, NODE_RADIUS);
              return (
                <motion.line
                  key={`edge-${mod.id}`}
                  x1={SVG_CX + p1.x} y1={SVG_CY + p1.y}
                  x2={SVG_CX + p2.x} y2={SVG_CY + p2.y}
                  stroke="rgba(37,99,235,0.2)"
                  strokeWidth="0.75"
                  strokeDasharray="6 5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: showConnections ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06, ease: 'easeOut' }}
                />
              );
            })}

            {/* Center rings — outer decorative */}
            <motion.circle cx={SVG_CX} cy={SVG_CY} r={52}
              fill="none" stroke="rgba(37,99,235,0.12)" strokeWidth="1" strokeDasharray="10 8"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ transformOrigin: `${SVG_CX}px ${SVG_CY}px` }}
            />
            <motion.circle cx={SVG_CX} cy={SVG_CY} r={40}
              fill="none" stroke="rgba(37,99,235,0.22)" strokeWidth="1" strokeDasharray="6 5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.42, delay: 0.07, ease: 'easeOut' }}
              style={{ transformOrigin: `${SVG_CX}px ${SVG_CY}px` }}
            />
            {/* Center fill circle */}
            <motion.circle cx={SVG_CX} cy={SVG_CY} r={30}
              fill="rgba(37,99,235,0.09)" stroke="rgba(37,99,235,0.55)" strokeWidth="1.5"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ duration: 0.32, ease: 'backOut' }}
              style={{ transformOrigin: `${SVG_CX}px ${SVG_CY}px` }}
            />

            {/* Module endpoint dots + pulse rings */}
            {BOOT_MODULES.map((mod, i) => {
              const p = degToXY(mod.angle, NODE_RADIUS);
              const nx = SVG_CX + p.x, ny = SVG_CY + p.y;
              return (
                <g key={`node-dot-${mod.id}`}>
                  {/* Pulse ring */}
                  <motion.circle cx={nx} cy={ny} r={8}
                    fill="none" stroke={mod.color} strokeWidth="0.6" strokeOpacity="0.35"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={showModules ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{ duration: 0.28, delay: i * 0.095 + 0.05, ease: 'easeOut' }}
                    style={{ transformOrigin: `${nx}px ${ny}px` }}
                  />
                  {/* Core dot */}
                  <motion.circle cx={nx} cy={ny} r={3.5}
                    fill={mod.color} fillOpacity="0.9"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={showModules ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.095, ease: 'backOut' }}
                    style={{ transformOrigin: `${nx}px ${ny}px` }}
                  />
                </g>
              );
            })}
          </svg>

          {/* ── Center logo / label — HTML overlay ── */}
          <motion.div
            style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, pointerEvents: 'none' }}
            initial={{ opacity: 0, scale: 0.65 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.32, delay: 0.04, ease: 'easeOut' }}
          >
            <GearIcon size={18} color="#60a5fa"/>
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: '0.24em',
              color: '#93c5fd', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif",
            }}>
              IAMMS
            </span>
          </motion.div>

          {/* ── Module nodes — HTML, positioned from viewport center ── */}
          {BOOT_MODULES.map((mod, i) => {
            const p    = degToXY(mod.angle, NODE_RADIUS);
            const Icon = mod.Icon;
            return (
              <motion.div
                key={mod.id}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${p.x}px)`,
                  top:  `calc(50% + ${p.y}px)`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}
                initial={{ opacity: 0, scale: 0.55 }}
                animate={showModules ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.55 }}
                transition={{ duration: 0.26, delay: i * 0.1, ease: 'backOut' }}
              >
                {/* Icon tile */}
                <div style={{
                  width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 9,
                  background: `${mod.color}13`,
                  border: `1px solid ${mod.color}40`,
                  backdropFilter: 'blur(6px)',
                }}>
                  <Icon style={{ width: 17, height: 17, color: mod.color }}/>
                </div>
                {/* Label */}
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.13em',
                  color: '#475569', textTransform: 'uppercase',
                  fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap',
                }}>
                  {mod.label}
                </span>
              </motion.div>
            );
          })}

          {/* ── Progress bar + status text ── */}
          <div style={{
            position: 'absolute', bottom: 68, left: 0, right: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            pointerEvents: 'none',
          }}>
            {/* Track */}
            <div style={{ width: 220, height: 1, background: 'rgba(37,99,235,0.1)', borderRadius: 1, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', borderRadius: 1, background: 'linear-gradient(90deg, rgba(37,99,235,0.55), rgba(96,165,250,0.85))' }}
                initial={{ width: '0%' }}
                animate={{
                  width: showConnections ? '100%'
                    : showModules   ? '65%'
                    : showLines     ? '30%'
                    : '6%',
                }}
                transition={{ duration: 0.38, ease: 'easeOut' }}
              />
            </div>
            {/* Status text */}
            <motion.p
              style={{
                fontSize: 9, fontWeight: 600, letterSpacing: '0.22em',
                color: '#1e3a5f', textTransform: 'uppercase',
                fontFamily: "'Inter', sans-serif", margin: 0,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: showLines ? 0.9 : 0 }}
              transition={{ duration: 0.4 }}
            >
              Initializing IAMMS · {COMPANY_NAME}
            </motion.p>
          </div>

          {/* ── Corner crosshairs (enterprise detail) ── */}
          {(['topleft', 'topright', 'bottomleft', 'bottomright'] as const).map((corner) => {
            const isTop    = corner.startsWith('top');
            const isLeft   = corner.endsWith('left');
            const len      = 20;
            const gap      = 28;
            return (
              <motion.svg
                key={corner}
                width={len + gap} height={len + gap}
                style={{
                  position: 'absolute',
                  top:    isTop    ? 20 : undefined,
                  bottom: !isTop   ? 20 : undefined,
                  left:   isLeft   ? 20 : undefined,
                  right:  !isLeft  ? 20 : undefined,
                  pointerEvents: 'none',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {/* Horizontal arm */}
                <line
                  x1={isLeft ? 0 : len + gap} y1={isTop ? 0 : len + gap}
                  x2={isLeft ? len : gap}      y2={isTop ? 0 : len + gap}
                  stroke="rgba(37,99,235,0.45)" strokeWidth="1"
                />
                {/* Vertical arm */}
                <line
                  x1={isLeft ? 0 : len + gap} y1={isTop ? 0  : len + gap}
                  x2={isLeft ? 0 : len + gap} y2={isTop ? len : gap}
                  stroke="rgba(37,99,235,0.45)" strokeWidth="1"
                />
              </motion.svg>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ════════════════════════════════════════════════════════════════
   LOGIN PAGE
════════════════════════════════════════════════════════════════ */
export function LoginPage() {
  const { signIn } = useAuth();
  const navigate   = useNavigate();

  const [employeeId, setEmployeeId] = useState('');
  const [password,   setPassword]   = useState('');
  const [show,       setShow]       = useState(false);
  const [remember,   setRemember]   = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [mounted,    setMounted]    = useState(false);
  /* Boot sequence signals it's done → glow the Access Portal button */
  const [signInGlow, setSignInGlow] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleBootComplete = useCallback(() => {
    setSignInGlow(true);
    // Glow fades naturally after 1.5 s
    setTimeout(() => setSignInGlow(false), 1500);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(employeeId.trim(), password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/dashboard');
    }
  }

  function handleForgotPassword(e: React.MouseEvent) {
    e.preventDefault();
    setForgotSent(true);
  }

  return (
    <div
      className="flex flex-col lg:flex-row"
      style={{ height: '100vh', overflow: 'hidden', fontFamily: "'Inter', sans-serif", background: '#020817' }}
    >
      {/* ════════════ BOOT SEQUENCE ════════════ */}
      <SystemBootSequence onComplete={handleBootComplete} />

      {/* ══════════════════════════════════════════
          LEFT HERO PANEL  (65%)
      ══════════════════════════════════════════ */}
      <div
        className="relative flex-col overflow-hidden hidden lg:flex"
        style={{
          width: '65%', flexShrink: 0,
          background: 'linear-gradient(150deg, #020817 0%, #060f22 35%, #0a1830 70%, #020c1a 100%)',
          borderRight: '1px solid rgba(37,99,235,0.12)',
        }}
      >
        {/* Blueprint grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.055) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(37,99,235,0.055) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}/>

        {/* Glow — top-right */}
        <motion.div className="absolute pointer-events-none" style={{
          top: '-8%', right: '-4%', width: 550, height: 550, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }} animate={{ scale: [1, 1.07, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}/>

        {/* Glow — bottom-left */}
        <motion.div className="absolute pointer-events-none" style={{
          bottom: '-12%', left: '-8%', width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }} animate={{ scale: [1, 1.10, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}/>

        {/* Industrial warm accent */}
        <motion.div className="absolute pointer-events-none" style={{
          top: '55%', left: '25%', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }} animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 5 }}/>

        {/* Top branding bar */}
        <div className="relative z-10 flex items-center justify-between px-10 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', boxShadow: '0 4px 20px rgba(37,99,235,0.45)' }}>
              <GearIcon size={22} color="white"/>
            </div>
            <div>
              <p className="text-base font-black tracking-[0.2em] text-white uppercase">IAMMS</p>
              <p className="text-[9px] font-medium tracking-widest leading-tight"
                style={{ color: '#334155', textTransform: 'uppercase' }}>
                Industrial Asset &amp; Maintenance Management System
              </p>
            </div>
          </div>
          {/* System status chip */}
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>
            <span className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: '#34d399' }}>
              All Systems Operational
            </span>
          </div>
        </div>

        {/* Centre content */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-10 py-6">
          {/* Accent line */}
          <motion.div className="mb-6 h-[2px]"
            style={{ background: 'linear-gradient(90deg, #2563eb, #1d4ed8, transparent)', maxWidth: 72 }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={mounted ? { scaleX: 1 } : {}}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}/>

          {/* Headline */}
          <motion.h1
            className="font-black text-white leading-[1.08]"
            style={{ fontSize: 'clamp(1.7rem, 2.8vw, 2.8rem)', letterSpacing: '-0.03em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Industrial Asset &amp;<br/>
            <span style={{ color: '#3b82f6' }}>Maintenance Management</span><br/>
            System
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-4 text-sm leading-relaxed"
            style={{ color: '#475569', maxWidth: 380 }}
            initial={{ opacity: 0, y: 12 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            Centralized platform for asset lifecycle management, preventive maintenance,
            work orders, inspections and compliance tracking.
          </motion.p>

          {/* KPI cards */}
          <motion.div
            className="mt-7 grid grid-cols-2 gap-2.5"
            style={{ maxWidth: 420 }}
            initial={{ opacity: 0, y: 16 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.38 }}
          >
            {KPI_CARDS.map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.label}
                  className="group relative overflow-hidden rounded-xl p-3.5"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(8px)',
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={mounted ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.42 + i * 0.07 }}
                  whileHover={{ y: -2, transition: { duration: 0.18 } }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 10% 90%, ${kpi.accent}12, transparent 60%)` }}/>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ background: `${kpi.accent}16`, border: `1px solid ${kpi.accent}28` }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: kpi.accent }}/>
                    </div>
                  </div>
                  <p className="text-xl font-black text-white" style={{ letterSpacing: '-0.025em' }}>
                    <AnimatedValue value={kpi.value}/>
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#334155' }}>
                    {kpi.label}
                  </p>
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300"
                    style={{ background: `linear-gradient(90deg, ${kpi.accent}55, transparent)` }}/>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Blueprint illustration */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={mounted ? { opacity: 0.85 } : {}}
            transition={{ duration: 1.2, delay: 0.7 }}
          >
            <BlueprintIllustration/>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 px-10 pb-5">
          <p className="text-[10px] font-medium" style={{ color: '#1e293b' }}>
            © 2026 {COMPANY_NAME} · Restricted to authorized personnel only · Internal use only
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT FORM PANEL  (35%)
      ══════════════════════════════════════════ */}
      <div
        className="relative flex flex-col items-center justify-center p-6 lg:p-8 overflow-y-auto"
        style={{
          width: '35%', minWidth: 340, flexShrink: 0,
          background: 'linear-gradient(180deg, #060e1f 0%, #020817 100%)',
        }}
      >
        {/* Corner glow */}
        <div className="absolute top-0 right-0 pointer-events-none" style={{
          width: 260, height: 260,
          background: 'radial-gradient(circle, rgba(37,99,235,0.09) 0%, transparent 70%)',
          filter: 'blur(35px)',
        }}/>

        {/* Mobile branding */}
        <div className="mb-7 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}>
            <GearIcon size={20} color="white"/>
          </div>
          <div>
            <p className="text-sm font-black tracking-[0.2em] uppercase text-white">IAMMS</p>
            <p className="text-[9px] tracking-wide uppercase" style={{ color: '#334155' }}>
              Industrial Asset &amp; Maintenance Management System
            </p>
          </div>
        </div>

        {/* ─── Glass Login Card ─── */}
        <motion.div
          className="relative z-10 w-full"
          style={{ maxWidth: 390 }}
          initial={{ opacity: 0, y: 24 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          <div
            className="overflow-hidden rounded-[20px]"
            style={{
              background: 'rgba(11,20,40,0.75)',
              backdropFilter: 'blur(28px)',
              border: '1px solid rgba(37,99,235,0.14)',
              boxShadow: '0 28px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.035) inset',
            }}
          >
            {/* Card header bar */}
            <div className="px-7 py-4 flex items-center gap-2.5"
              style={{ borderBottom: '1px solid rgba(37,99,235,0.1)', background: 'rgba(2,8,23,0.4)' }}>
              <div className="flex h-6 w-6 items-center justify-center rounded-md text-blue-400"
                style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)' }}>
                <Lock className="h-3 w-3"/>
              </div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: '#334155' }}>
                Secure Internal Portal
              </p>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                <span className="text-[9px] font-medium tracking-wider uppercase" style={{ color: '#064e3b' }}>
                  Encrypted
                </span>
              </div>
            </div>

            <div className="px-7 py-7">
              {/* Heading */}
              <div className="mb-6">
                <h2 className="text-[1.6rem] font-black text-white" style={{ letterSpacing: '-0.03em' }}>
                  Sign In
                </h2>
                <p className="mt-1 text-sm" style={{ color: '#334155' }}>
                  Sign in with your Employee ID or email address.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Employee ID */}
                <div>
                  <label htmlFor="employeeId"
                    className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: '#475569' }}>
                    Employee ID or Email
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none"
                      style={{ color: '#1e3a5f' }}/>
                    <input
                      id="employeeId"
                      type="text"
                      autoComplete="username"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="Employee ID or email"
                      required
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(2,8,23,0.6)',
                        border: '1px solid rgba(37,99,235,0.18)',
                        color: '#e2e8f0', fontFamily: 'inherit',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#2563eb';
                        e.currentTarget.style.boxShadow  = '0 0 0 3px rgba(37,99,235,0.16)';
                        e.currentTarget.style.background  = 'rgba(37,99,235,0.05)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(37,99,235,0.18)';
                        e.currentTarget.style.boxShadow  = 'none';
                        e.currentTarget.style.background  = 'rgba(2,8,23,0.6)';
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password"
                      className="block text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: '#475569' }}>
                      Password
                    </label>
                    {forgotSent ? (
                      <span className="text-[10px] font-semibold" style={{ color: '#10b981' }}>
                        Reset link sent to IT Admin.
                      </span>
                    ) : (
                      <a href="#forgot" onClick={handleForgotPassword}
                        className="text-[10px] font-semibold transition-opacity hover:opacity-70"
                        style={{ color: '#2563eb' }}>
                        Forgot Password?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none"
                      style={{ color: '#1e3a5f' }}/>
                    <input
                      id="password"
                      type={show ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl pl-10 pr-11 py-3 text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(2,8,23,0.6)',
                        border: '1px solid rgba(37,99,235,0.18)',
                        color: '#e2e8f0', fontFamily: 'inherit',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#2563eb';
                        e.currentTarget.style.boxShadow  = '0 0 0 3px rgba(37,99,235,0.16)';
                        e.currentTarget.style.background  = 'rgba(37,99,235,0.05)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(37,99,235,0.18)';
                        e.currentTarget.style.boxShadow  = 'none';
                        e.currentTarget.style.background  = 'rgba(2,8,23,0.6)';
                      }}
                    />
                    <button type="button" onClick={() => setShow((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                      style={{ color: '#334155' }} tabIndex={-1}
                      aria-label={show ? 'Hide password' : 'Show password'}>
                      {show ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2.5">
                  <button type="button" role="checkbox" aria-checked={remember}
                    onClick={() => setRemember((p) => !p)}
                    className="flex h-4 w-4 items-center justify-center rounded transition-all flex-shrink-0"
                    style={{
                      background: remember ? '#2563eb' : 'rgba(2,8,23,0.6)',
                      border: remember ? '1px solid #2563eb' : '1px solid rgba(37,99,235,0.2)',
                    }}>
                    {remember && (
                      <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
                        <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  <label className="text-xs cursor-pointer select-none" style={{ color: '#334155' }}
                    onClick={() => setRemember((p) => !p)}>
                    Remember me on this device
                  </label>
                </div>

                {/* Error banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs overflow-hidden"
                      style={{ background: 'rgba(127,29,29,0.18)', border: '1px solid rgba(185,28,28,0.3)', color: '#fca5a5' }}
                    >
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400"/>
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Access Portal button — glows after boot sequence */}
                <motion.button
                  type="submit"
                  id="signin-btn"
                  disabled={loading}
                  className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-bold text-white transition-all"
                  style={{
                    background: loading ? 'rgba(37,99,235,0.45)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    cursor:     loading ? 'not-allowed' : 'pointer',
                    opacity:    loading ? 0.7 : 1,
                    letterSpacing: '0.01em',
                    fontFamily: 'inherit',
                  }}
                  animate={
                    signInGlow && !loading
                      ? {
                          boxShadow: [
                            '0 4px 28px rgba(37,99,235,0.5)',
                            '0 0 0 4px rgba(37,99,235,0.28), 0 4px 38px rgba(37,99,235,0.8)',
                            '0 4px 28px rgba(37,99,235,0.5)',
                          ],
                        }
                      : { boxShadow: '0 4px 28px rgba(37,99,235,0.5)' }
                  }
                  transition={{ boxShadow: { duration: 1.0, ease: 'easeInOut' } }}
                  whileHover={!loading ? { scale: 1.015 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {/* Shimmer sweep */}
                  {!loading && (
                    <motion.div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.09) 50%, transparent 65%)', backgroundSize: '200% 100%' }}
                      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}/>
                  )}
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                          strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round"/>
                      </svg>
                      Authenticating…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In
                      <ChevronRight className="h-4 w-4"/>
                    </span>
                  )}
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1" style={{ background: 'rgba(37,99,235,0.12)' }}/>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#1e3a5f' }}>or</span>
                  <div className="h-px flex-1" style={{ background: 'rgba(37,99,235,0.12)' }}/>
                </div>

                {/* Request Access */}
                <button
                  type="button"
                  id="request-access-btn"
                  onClick={() => navigate('/request-access')}
                  className="w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98]"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(37,99,235,0.2)',
                    color: '#475569', fontFamily: 'inherit', cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.4)'; e.currentTarget.style.color = '#64748b'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)'; e.currentTarget.style.color = '#475569'; }}
                >
                  Request Access
                </button>
              </form>

              {/* Admin approval notice */}
              <div className="mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.12)' }}>
                <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#1d4ed8' }}/>
                <p className="text-[10px] leading-relaxed" style={{ color: '#334155' }}>
                  New employee accounts require administrator approval before they can access the system.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-[10px]" style={{ color: '#0f172a' }}>
            © 2026 {COMPANY_NAME} · For internal use only
          </p>
        </motion.div>
      </div>

      <style>{`
        html, body { overflow: hidden; height: 100%; }
        @media (max-width: 1023px) { html, body { overflow: auto; } }
        input::placeholder { color: #1e293b !important; }
      `}</style>
    </div>
  );
}
