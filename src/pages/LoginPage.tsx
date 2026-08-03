import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  Mail,
  Building2,
  CheckCircle,
  Package,
  Users,
  Wrench,
  BarChart2,
  Layers,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { COMPANY_NAME } from "@/lib/constants";

/* ─── Theme ──────────────────────────────────────────────────── */
const CYAN = "#17C7E8";
const NAVY = "#09111F";

/* ─── Left-panel metrics ─────────────────────────────────────── */
const METRICS = [
  { Icon: CheckCircle, value: "98.7%", label: "Asset Availability" },
  { Icon: Package, value: "2,840", label: "Assets Managed" },
  { Icon: Users, value: "17", label: "Manufacturing Departments" },
];

/* ════════════════════════════════════════════════════════════════
   GEAR ICON
════════════════════════════════════════════════════════════════ */
function GearIcon({
  size = 20,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-1.954l-.632 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.655L5.516 16.3 4 18l2 2 1.791-1.46 2.606 1.072L11 22h2l.604-2.387 2.651-1.098C16.697 19.48 18 20 18 20l2-2-1.484-1.75 1.098-2.652 2.386-.62V11l-2.378-.605z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   BLUEPRINT INDUSTRIAL ILLUSTRATION
   Wireframe refinery / industrial facility — cyan on navy.
════════════════════════════════════════════════════════════════ */
function BlueprintIllustration() {
  const c = (o: number) => `rgba(23,199,232,${o})`;
  return (
    <svg
      className="absolute pointer-events-none select-none"
      style={{ right: "-50px", bottom: 0, width: "72%", height: "96%" }}
      viewBox="0 0 540 640"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMaxYMax meet"
      aria-hidden="true"
    >
      {/* Fine background grid */}
      <defs>
        <pattern
          id="illus-grid"
          width="22"
          height="22"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 22 0 L 0 0 0 22"
            fill="none"
            stroke={c(0.045)}
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="540" height="640" fill="url(#illus-grid)" />

      {/* ═══ Main distillation column ═══ */}
      <rect
        x="268"
        y="55"
        width="58"
        height="390"
        stroke={c(0.35)}
        strokeWidth="1.5"
      />
      <ellipse
        cx="297"
        cy="55"
        rx="29"
        ry="9"
        stroke={c(0.35)}
        strokeWidth="1.5"
      />
      <ellipse
        cx="297"
        cy="445"
        rx="29"
        ry="9"
        stroke={c(0.35)}
        strokeWidth="1.5"
      />
      {/* Column tray lines */}
      {[95, 128, 161, 194, 227, 260, 293, 326, 359, 392, 425].map((y) => (
        <line
          key={y}
          x1="268"
          y1={y}
          x2="326"
          y2={y}
          stroke={c(0.1)}
          strokeWidth="0.75"
        />
      ))}
      {/* Column top fitting */}
      <rect
        x="279"
        y="34"
        width="36"
        height="21"
        stroke={c(0.28)}
        strokeWidth="1.25"
      />
      <ellipse
        cx="297"
        cy="34"
        rx="18"
        ry="6"
        stroke={c(0.28)}
        strokeWidth="1.25"
      />
      {/* Antenna */}
      <line
        x1="297"
        y1="28"
        x2="297"
        y2="4"
        stroke={c(0.32)}
        strokeWidth="1.5"
      />
      <line
        x1="284"
        y1="18"
        x2="310"
        y2="18"
        stroke={c(0.18)}
        strokeWidth="1"
      />
      <line
        x1="289"
        y1="12"
        x2="305"
        y2="12"
        stroke={c(0.13)}
        strokeWidth="0.75"
      />
      <circle cx="297" cy="4" r="2.5" stroke={c(0.22)} strokeWidth="1" />

      {/* ═══ Reactor vessel (left) ═══ */}
      <rect
        x="82"
        y="196"
        width="102"
        height="138"
        stroke={c(0.28)}
        strokeWidth="1.5"
      />
      <ellipse
        cx="133"
        cy="196"
        rx="51"
        ry="14"
        stroke={c(0.28)}
        strokeWidth="1.5"
      />
      <ellipse
        cx="133"
        cy="334"
        rx="51"
        ry="14"
        stroke={c(0.28)}
        strokeWidth="1.5"
      />
      {[226, 256, 286, 314].map((y) => (
        <line
          key={y}
          x1="82"
          y1={y}
          x2="184"
          y2={y}
          stroke={c(0.07)}
          strokeWidth="0.75"
        />
      ))}
      {/* Nozzles */}
      <line
        x1="82"
        y1="248"
        x2="60"
        y2="248"
        stroke={c(0.25)}
        strokeWidth="1.5"
      />
      <line
        x1="184"
        y1="272"
        x2="208"
        y2="272"
        stroke={c(0.25)}
        strokeWidth="1.5"
      />
      <line
        x1="133"
        y1="334"
        x2="133"
        y2="358"
        stroke={c(0.2)}
        strokeWidth="1.25"
      />

      {/* ═══ Secondary tall column (right) ═══ */}
      <rect
        x="370"
        y="162"
        width="46"
        height="283"
        stroke={c(0.24)}
        strokeWidth="1.5"
      />
      <ellipse
        cx="393"
        cy="162"
        rx="23"
        ry="7.5"
        stroke={c(0.24)}
        strokeWidth="1.5"
      />
      <ellipse
        cx="393"
        cy="445"
        rx="23"
        ry="7.5"
        stroke={c(0.24)}
        strokeWidth="1.5"
      />
      {[200, 236, 272, 308, 344, 380, 416].map((y) => (
        <line
          key={y}
          x1="370"
          y1={y}
          x2="416"
          y2={y}
          stroke={c(0.09)}
          strokeWidth="0.75"
        />
      ))}

      {/* ═══ Heat exchanger (lower-left) ═══ */}
      <rect
        x="18"
        y="360"
        width="56"
        height="52"
        stroke={c(0.2)}
        strokeWidth="1.25"
      />
      <ellipse
        cx="46"
        cy="360"
        rx="28"
        ry="8"
        stroke={c(0.2)}
        strokeWidth="1.25"
      />
      <ellipse
        cx="46"
        cy="412"
        rx="28"
        ry="8"
        stroke={c(0.2)}
        strokeWidth="1.25"
      />
      {[374, 386, 398].map((y) => (
        <line
          key={y}
          x1="18"
          y1={y}
          x2="74"
          y2={y}
          stroke={c(0.08)}
          strokeWidth="0.5"
        />
      ))}
      <line
        x1="74"
        y1="385"
        x2="82"
        y2="385"
        stroke={c(0.2)}
        strokeWidth="1.25"
      />
      <line
        x1="82"
        y1="248"
        x2="82"
        y2="385"
        stroke={c(0.14)}
        strokeWidth="1"
      />
      <line
        x1="74"
        y1="248"
        x2="82"
        y2="248"
        stroke={c(0.14)}
        strokeWidth="1"
      />

      {/* ═══ Connecting pipes ═══ */}
      <line
        x1="184"
        y1="272"
        x2="268"
        y2="272"
        stroke={c(0.32)}
        strokeWidth="2"
        
      />
      <line
        x1="326"
        y1="238"
        x2="370"
        y2="238"
        stroke={c(0.28)}
        strokeWidth="2"
      />
      {/* Overhead feed */}
      <line
        x1="82"
        y1="178"
        x2="268"
        y2="178"
        stroke={c(0.18)}
        strokeWidth="1.5"
      />
      <line
        x1="82"
        y1="178"
        x2="82"
        y2="196"
        stroke={c(0.18)}
        strokeWidth="1.5"
      />
      {/* Pipe from main column down */}
      <line
        x1="297"
        y1="445"
        x2="297"
        y2="492"
        stroke={c(0.26)}
        strokeWidth="2"
      />
      <line
        x1="297"
        y1="492"
        x2="126"
        y2="492"
        stroke={c(0.26)}
        strokeWidth="2"
      />
      <line
        x1="297"
        y1="492"
        x2="242"
        y2="492"
        stroke={c(0.2)}
        strokeWidth="1.5"
      />
      <line
        x1="393"
        y1="445"
        x2="393"
        y2="484"
        stroke={c(0.2)}
        strokeWidth="1.5"
      />
      <line
        x1="393"
        y1="484"
        x2="454"
        y2="484"
        stroke={c(0.2)}
        strokeWidth="1.5"
      />

      {/* ═══ Storage tanks ═══ */}
      <circle cx="126" cy="548" r="50" stroke={c(0.22)} strokeWidth="1.5" />
      <ellipse
        cx="126"
        cy="536"
        rx="50"
        ry="13"
        stroke={c(0.22)}
        strokeWidth="1.5"
      />
      <circle cx="242" cy="554" r="36" stroke={c(0.2)} strokeWidth="1.25" />
      <ellipse
        cx="242"
        cy="544"
        rx="36"
        ry="10"
        stroke={c(0.2)}
        strokeWidth="1.25"
      />
      <circle cx="454" cy="545" r="52" stroke={c(0.2)} strokeWidth="1.25" />
      <ellipse
        cx="454"
        cy="533"
        rx="52"
        ry="13"
        stroke={c(0.2)}
        strokeWidth="1.25"
      />

      {/* ═══ Control building ═══ */}
      <rect
        x="436"
        y="348"
        width="88"
        height="70"
        stroke={c(0.2)}
        strokeWidth="1.25"
      />
      <line
        x1="436"
        y1="370"
        x2="524"
        y2="370"
        stroke={c(0.12)}
        strokeWidth="0.75"
      />
      {[356, 378].map((y) =>
        [444, 464, 488, 508].map((x) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="12"
            height="9"
            stroke={c(0.13)}
            strokeWidth="0.75"
          />
        )),
      )}

      {/* ═══ Platforms / walkways ═══ */}
      {[112, 188, 268, 358].map((y) => (
        <line
          key={y}
          x1="236"
          y1={y}
          x2="358"
          y2={y}
          stroke={c(0.14)}
          strokeWidth="0.75"
        />
      ))}
      {/* Ladder on main column */}
      <line
        x1="326"
        y1="55"
        x2="326"
        y2="445"
        stroke={c(0.08)}
        strokeWidth="0.75"
      />
      <line
        x1="340"
        y1="55"
        x2="340"
        y2="445"
        stroke={c(0.08)}
        strokeWidth="0.75"
      />
      {Array.from({ length: 23 }, (_, i) => 55 + i * 17).map((y) => (
        <line
          key={y}
          x1="326"
          y1={y}
          x2="340"
          y2={y}
          stroke={c(0.08)}
          strokeWidth="0.5"
        />
      ))}

      {/* ═══ Ground line ═══ */}
      <line
        x1="0"
        y1="598"
        x2="540"
        y2="598"
        stroke={c(0.28)}
        strokeWidth="2"
      />
      {Array.from({ length: 30 }, (_, i) => i * 18).map((x) => (
        <line
          key={x}
          x1={x}
          y1="598"
          x2={x + 10}
          y2="610"
          stroke={c(0.1)}
          strokeWidth="0.75"
        />
      ))}
      {/* Column foundations */}
      <line
        x1="268"
        y1="445"
        x2="256"
        y2="598"
        stroke={c(0.18)}
        strokeWidth="1.25"
      />
      <line
        x1="326"
        y1="445"
        x2="342"
        y2="598"
        stroke={c(0.18)}
        strokeWidth="1.25"
      />
      <line
        x1="370"
        y1="445"
        x2="362"
        y2="598"
        stroke={c(0.16)}
        strokeWidth="1.25"
      />
      <line
        x1="416"
        y1="445"
        x2="424"
        y2="598"
        stroke={c(0.16)}
        strokeWidth="1.25"
      />

      {/* ═══ Annotation elements ═══ */}
      <line
        x1="6"
        y1="55"
        x2="6"
        y2="445"
        stroke={c(0.1)}
        strokeWidth="0.7"
        strokeDasharray="5 4"
      />
      <line x1="2" y1="55" x2="10" y2="55" stroke={c(0.1)} strokeWidth="0.7" />
      <line
        x1="2"
        y1="445"
        x2="10"
        y2="445"
        stroke={c(0.1)}
        strokeWidth="0.7"
      />
      {/* Title block */}
      <rect
        x="388"
        y="562"
        width="140"
        height="40"
        stroke={c(0.16)}
        strokeWidth="0.75"
      />
      <line
        x1="388"
        y1="576"
        x2="528"
        y2="576"
        stroke={c(0.09)}
        strokeWidth="0.5"
      />
      <text
        x="458"
        y="572"
        textAnchor="middle"
        fontSize="5.5"
        fill={c(0.35)}
        fontFamily="monospace"
        fontWeight="700"
        letterSpacing="0.08em"
      >
        IAMMS-DWG-001
      </text>
      <text
        x="458"
        y="588"
        textAnchor="middle"
        fontSize="4.5"
        fill={c(0.2)}
        fontFamily="monospace"
        letterSpacing="0.06em"
      >
        PLANT FACILITY OVERVIEW
      </text>
      {/* Key node dots */}
      <circle cx="297" cy="272" r="3.5" fill={c(0.7)} />
      <circle cx="133" cy="265" r="3.5" fill={c(0.6)} />
      <circle cx="393" cy="238" r="3" fill={c(0.55)} />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   SYSTEM BOOT SEQUENCE
════════════════════════════════════════════════════════════════ */
const BOOT_SESSION_KEY = "iamms_boot_v2";
const NODE_RADIUS = 148;

type LucideIconComponent = React.ComponentType<{
  style?: React.CSSProperties;
  className?: string;
}>;

interface BootModule {
  id: string;
  label: string;
  Icon: LucideIconComponent;
  angle: number;
  color: string;
}

const BOOT_MODULES: BootModule[] = [
  { id: "assets", label: "Assets", Icon: Layers, angle: -90, color: "#17C7E8" },
  {
    id: "maintenance",
    label: "Maintenance",
    Icon: Wrench,
    angle: -18,
    color: "#fbbf24",
  },
  {
    id: "workorders",
    label: "Work Orders",
    Icon: ClipboardList,
    angle: 54,
    color: "#17C7E8",
  },
  {
    id: "inventory",
    label: "Inventory",
    Icon: Package,
    angle: 126,
    color: "#34d399",
  },
  {
    id: "reports",
    label: "Reports",
    Icon: BarChart2,
    angle: 198,
    color: "#17C7E8",
  },
];

function degToXY(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad) * r, y: Math.sin(rad) * r };
}

type BootPhase =
  | "center"
  | "lines"
  | "modules"
  | "connections"
  | "hold"
  | "collapse";

function SystemBootSequence({ onComplete }: { onComplete: () => void }) {
  const prefersReduced = useReducedMotion();
  const [phase, setPhase] = useState<BootPhase>("center");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (prefersReduced || sessionStorage.getItem(BOOT_SESSION_KEY)) {
      setVisible(false);
      onComplete();
      return;
    }
    sessionStorage.setItem(BOOT_SESSION_KEY, "1");
    const timers = [
      setTimeout(() => setPhase("lines"), 330),
      setTimeout(() => setPhase("modules"), 620),
      setTimeout(() => setPhase("connections"), 1150),
      setTimeout(() => setPhase("hold"), 1580),
      setTimeout(() => setPhase("collapse"), 1780),
      setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 2350),
    ];
    return () => timers.forEach(clearTimeout);
  }, [prefersReduced, onComplete]);

  if (!visible) return null;

  const showLines = phase !== "center";
  const showModules = ["modules", "connections", "hold", "collapse"].includes(
    phase,
  );
  const showConnections = ["connections", "hold", "collapse"].includes(phase);
  const isCollapsing = phase === "collapse";
  const SVG_W = 560,
    SVG_H = 480;
  const SVG_CX = SVG_W / 2,
    SVG_CY = SVG_H / 2;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot-seq"
          className="fixed inset-0 z-[100] flex items-center justify-center select-none"
          style={{ background: NAVY }}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          animate={
            isCollapsing
              ? { opacity: 0, scale: 0.04, x: "28vw", y: "6vh" }
              : { opacity: 1, scale: 1, x: 0, y: 0 }
          }
          transition={
            isCollapsing
              ? { duration: 0.52, ease: [0.7, 0, 0.95, 0.4] }
              : { duration: 0 }
          }
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(23,199,232,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(23,199,232,0.04) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 55% 60% at 50% 50%, transparent 0%, rgba(9,17,31,0.88) 100%)",
            }}
          />
          <motion.div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(23,199,232,0.3) 30%, rgba(23,199,232,0.8) 50%, rgba(23,199,232,0.3) 70%, transparent 100%)",
            }}
            initial={{ top: "8%", opacity: 0 }}
            animate={{ top: "92%", opacity: [0, 0.9, 0.9, 0] }}
            transition={{
              duration: 1.35,
              delay: 0.2,
              ease: "linear",
              times: [0, 0.04, 0.9, 1],
            }}
          />
          <svg
            width={SVG_W}
            height={SVG_H}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              overflow: "visible",
            }}
            aria-hidden="true"
          >
            {BOOT_MODULES.map((mod, i) => {
              const p = degToXY(mod.angle, NODE_RADIUS);
              return (
                <motion.line
                  key={`spoke-${mod.id}`}
                  x1={SVG_CX}
                  y1={SVG_CY}
                  x2={SVG_CX + p.x}
                  y2={SVG_CY + p.y}
                  stroke="rgba(23,199,232,0.25)"
                  strokeWidth="0.9"
                  strokeDasharray="5 4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: showLines ? 1 : 0 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.065,
                    ease: "easeOut",
                  }}
                />
              );
            })}
            {BOOT_MODULES.map((mod, i) => {
              const next = BOOT_MODULES[(i + 1) % BOOT_MODULES.length];
              const p1 = degToXY(mod.angle, NODE_RADIUS);
              const p2 = degToXY(next.angle, NODE_RADIUS);
              return (
                <motion.line
                  key={`edge-${mod.id}`}
                  x1={SVG_CX + p1.x}
                  y1={SVG_CY + p1.y}
                  x2={SVG_CX + p2.x}
                  y2={SVG_CY + p2.y}
                  stroke="rgba(23,199,232,0.15)"
                  strokeWidth="0.75"
                  strokeDasharray="6 5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: showConnections ? 1 : 0 }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.06,
                    ease: "easeOut",
                  }}
                />
              );
            })}
            <motion.circle
              cx={SVG_CX}
              cy={SVG_CY}
              r={52}
              fill="none"
              stroke="rgba(23,199,232,0.10)"
              strokeWidth="1"
              strokeDasharray="10 8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ transformOrigin: `${SVG_CX}px ${SVG_CY}px` }}
            />
            <motion.circle
              cx={SVG_CX}
              cy={SVG_CY}
              r={40}
              fill="none"
              stroke="rgba(23,199,232,0.18)"
              strokeWidth="1"
              strokeDasharray="6 5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.42, delay: 0.07, ease: "easeOut" }}
              style={{ transformOrigin: `${SVG_CX}px ${SVG_CY}px` }}
            />
            <motion.circle
              cx={SVG_CX}
              cy={SVG_CY}
              r={30}
              fill="rgba(23,199,232,0.06)"
              stroke="rgba(23,199,232,0.45)"
              strokeWidth="1.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.32, ease: "backOut" }}
              style={{ transformOrigin: `${SVG_CX}px ${SVG_CY}px` }}
            />
            {BOOT_MODULES.map((mod, i) => {
              const p = degToXY(mod.angle, NODE_RADIUS);
              const nx = SVG_CX + p.x,
                ny = SVG_CY + p.y;
              return (
                <g key={`node-${mod.id}`}>
                  <motion.circle
                    cx={nx}
                    cy={ny}
                    r={8}
                    fill="none"
                    stroke={mod.color}
                    strokeWidth="0.6"
                    strokeOpacity="0.35"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={
                      showModules
                        ? { scale: 1, opacity: 1 }
                        : { scale: 0, opacity: 0 }
                    }
                    transition={{
                      duration: 0.28,
                      delay: i * 0.095 + 0.05,
                      ease: "easeOut",
                    }}
                    style={{ transformOrigin: `${nx}px ${ny}px` }}
                  />
                  <motion.circle
                    cx={nx}
                    cy={ny}
                    r={3.5}
                    fill={mod.color}
                    fillOpacity="0.9"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={
                      showModules
                        ? { scale: 1, opacity: 1 }
                        : { scale: 0, opacity: 0 }
                    }
                    transition={{
                      duration: 0.22,
                      delay: i * 0.095,
                      ease: "backOut",
                    }}
                    style={{ transformOrigin: `${nx}px ${ny}px` }}
                  />
                </g>
              );
            })}
          </svg>
          <motion.div
            style={{
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              pointerEvents: "none",
            }}
            initial={{ opacity: 0, scale: 0.65 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.32, delay: 0.04, ease: "easeOut" }}
          >
            <GearIcon size={18} color={CYAN} />
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.24em",
                color: CYAN,
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              IAMMS
            </span>
          </motion.div>
          {BOOT_MODULES.map((mod, i) => {
            const p = degToXY(mod.angle, NODE_RADIUS);
            const Icon = mod.Icon;
            return (
              <motion.div
                key={mod.id}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${p.x}px)`,
                  top: `calc(50% + ${p.y}px)`,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
                initial={{ opacity: 0, scale: 0.55 }}
                animate={
                  showModules
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.55 }
                }
                transition={{ duration: 0.26, delay: i * 0.1, ease: "backOut" }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 9,
                    background: `${mod.color}12`,
                    border: `1px solid ${mod.color}35`,
                  }}
                >
                  <Icon style={{ width: 17, height: 17, color: mod.color }} />
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.13em",
                    color: "#334155",
                    textTransform: "uppercase",
                    fontFamily: "'Inter', sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  {mod.label}
                </span>
              </motion.div>
            );
          })}
          <div
            style={{
              position: "absolute",
              bottom: 68,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 220,
                height: 1,
                background: "rgba(23,199,232,0.08)",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <motion.div
                style={{
                  height: "100%",
                  background:
                    "linear-gradient(90deg, rgba(23,199,232,0.45), rgba(23,199,232,0.85))",
                }}
                initial={{ width: "0%" }}
                animate={{
                  width: showConnections
                    ? "100%"
                    : showModules
                      ? "65%"
                      : showLines
                        ? "30%"
                        : "6%",
                }}
                transition={{ duration: 0.38, ease: "easeOut" }}
              />
            </div>
            <motion.p
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.22em",
                color: "#1e3a5f",
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
                margin: 0,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: showLines ? 0.9 : 0 }}
              transition={{ duration: 0.4 }}
            >
              Initializing IAMMS · {COMPANY_NAME}
            </motion.p>
          </div>
          {(["topleft", "topright", "bottomleft", "bottomright"] as const).map(
            (corner) => {
              const isTop = corner.startsWith("top"),
                isLeft = corner.endsWith("left");
              const len = 20,
                gap = 28;
              return (
                <motion.svg
                  key={corner}
                  width={len + gap}
                  height={len + gap}
                  style={{
                    position: "absolute",
                    top: isTop ? 20 : undefined,
                    bottom: !isTop ? 20 : undefined,
                    left: isLeft ? 20 : undefined,
                    right: !isLeft ? 20 : undefined,
                    pointerEvents: "none",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <line
                    x1={isLeft ? 0 : len + gap}
                    y1={isTop ? 0 : len + gap}
                    x2={isLeft ? len : gap}
                    y2={isTop ? 0 : len + gap}
                    stroke="rgba(23,199,232,0.4)"
                    strokeWidth="1"
                  />
                  <line
                    x1={isLeft ? 0 : len + gap}
                    y1={isTop ? 0 : len + gap}
                    x2={isLeft ? 0 : len + gap}
                    y2={isTop ? len : gap}
                    stroke="rgba(23,199,232,0.4)"
                    strokeWidth="1"
                  />
                </motion.svg>
              );
            },
          )}
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
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [signInGlow, setSignInGlow] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBootComplete = useCallback(() => {
    setSignInGlow(true);
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
      navigate("/dashboard");
    }
  }

  function handleForgotPassword(e: React.MouseEvent) {
    e.preventDefault();
    setForgotSent(true);
  }

  /* shared input focus/blur handlers */
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(23,199,232,0.45)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(23,199,232,0.08)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(23,199,232,0.12)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div
      className="flex flex-col lg:flex-row"
      style={{
        height: "100vh",
        overflow: "hidden",
        background: NAVY,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <SystemBootSequence onComplete={handleBootComplete} />

      {/* ══════════════════════════════════════════════════════
          LEFT PANEL  60%  — Brand + Blueprint
      ══════════════════════════════════════════════════════ */}
      <div
        className="relative hidden overflow-hidden lg:flex lg:flex-col"
        style={{
          width: "60%",
          flexShrink: 0,
          background: NAVY,
          borderRight: "1px solid rgba(23,199,232,0.1)",
        }}
      >
        {/* Blueprint illustration — positioned right-bottom */}
        <BlueprintIllustration />

        {/* Gradient to protect text readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, #09111F 32%, rgba(9,17,31,0.7) 58%, rgba(9,17,31,0.1) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 px-14 py-12">
          {/* ── Logo ── */}
          <div className="flex items-center gap-3 mb-20">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: "rgba(23,199,232,0.1)",
                border: "1px solid rgba(23,199,232,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GearIcon size={24} color={CYAN} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                }}
              >
                IAMMS
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 8,
                  fontWeight: 500,
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.32)",
                  lineHeight: 1.5,
                }}
              >
                Industrial Asset &amp; Maintenance
                <br />
                Management System
              </p>
            </div>
          </div>

          {/* ── Eyebrow ── */}
          <p
            style={{
              margin: "0 0 14px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: CYAN,
            }}
          >
            Enterprise Asset Management
          </p>

          {/* ── Main heading ── */}
          <h1
            style={{
              margin: 0,
              color: "#ffffff",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              fontSize: "clamp(2rem, 2.8vw, 3rem)",
            }}
          >
            Industrial Asset &amp;
            <br />
            Maintenance
            <br />
            Management System
          </h1>

          {/* ── Description ── */}
          <p
            style={{
              margin: "18px 0 0",
              fontSize: 14,
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.45)",
              maxWidth: 380,
              fontWeight: 400,
            }}
          >
            One unified platform to manage industrial assets, maintenance
            operations, inventory, work orders, and engineering teams.
          </p>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* ── Metrics ── */}
          <div className="flex items-stretch mb-12">
            {METRICS.map((m, i) => (
              <div key={m.label} className="flex items-stretch">
                <div style={{ paddingRight: i < METRICS.length - 1 ? 28 : 0 }}>
                  {/* Icon + number row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: "1px solid rgba(23,199,232,0.35)",
                        background: "rgba(23,199,232,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <m.Icon style={{ width: 15, height: 15, color: CYAN }} />
                    </div>
                    <span
                      style={{
                        fontSize: "1.65rem",
                        fontWeight: 800,
                        color: "#ffffff",
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                      }}
                    >
                      {m.value}
                    </span>
                  </div>
                  {/* Label */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11.5,
                      color: "rgba(255,255,255,0.38)",
                      paddingLeft: 48,
                    }}
                  >
                    {m.label}
                  </p>
                </div>
                {/* Separator */}
                {i < METRICS.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      alignSelf: "stretch",
                      marginRight: 28,
                      background: "rgba(23,199,232,0.15)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <p
            style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.2)" }}
          >
            © 2026 {COMPANY_NAME}. All rights reserved.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL  40%  — Auth card
      ══════════════════════════════════════════════════════ */}
      <div
        className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 lg:py-0"
        style={{ background: NAVY }}
      >
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(23,199,232,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(23,199,232,0.025) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Mobile logo */}
        <div className="relative z-10 mb-8 flex items-center gap-3 lg:hidden">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "rgba(23,199,232,0.1)",
              border: "1px solid rgba(23,199,232,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GearIcon size={20} color={CYAN} />
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#ffffff",
              }}
            >
              IAMMS
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 7.5,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Industrial Management System
            </p>
          </div>
        </div>

        {/* ── Auth Card ── */}
        <motion.div
          className="relative z-10 w-full"
          style={{ maxWidth: 440 }}
          initial={{ opacity: 0, y: 18 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
        >
          <div
            style={{
              background: "#0D1829",
              border: "1px solid rgba(23,199,232,0.12)",
              borderRadius: 14,
              padding: "40px",
            }}
          >
            {/* Heading */}
            <h2
              style={{
                margin: 0,
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}
            >
              Welcome Back
            </h2>
            <p
              style={{
                margin: "8px 0 28px",
                fontSize: 14,
                color: "rgba(255,255,255,0.45)",
                fontWeight: 400,
              }}
            >
              Sign in to access your IAMMS account
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {/* Employee ID */}
                <div>
                  <label
                    htmlFor="employeeId"
                    style={{
                      display: "block",
                      marginBottom: 7,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    Employee ID or Email
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail
                      style={{
                        position: "absolute",
                        left: 13,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 15,
                        height: 15,
                        color: "rgba(23,199,232,0.5)",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      id="employeeId"
                      type="text"
                      autoComplete="username"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="Enter employee ID or email"
                      required
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "11px 13px 11px 40px",
                        fontSize: 13.5,
                        background: "rgba(8,15,30,0.7)",
                        border: "1px solid rgba(23,199,232,0.12)",
                        borderRadius: 10,
                        color: "#E2E8F0",
                        fontFamily: "inherit",
                        outline: "none",
                        transition: "border-color 150ms, box-shadow 150ms",
                      }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 7,
                    }}
                  >
                    <label
                      htmlFor="password"
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      Password
                    </label>
                    {forgotSent ? (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#34d399",
                          fontWeight: 500,
                        }}
                      >
                        Reset link sent to IT Admin.
                      </span>
                    ) : (
                      <a
                        href="#forgot"
                        onClick={handleForgotPassword}
                        style={{
                          fontSize: 11,
                          color: CYAN,
                          fontWeight: 500,
                          textDecoration: "none",
                          opacity: 0.8,
                          transition: "opacity 150ms",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "0.8")
                        }
                      >
                        Forgot Password?
                      </a>
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <Lock
                      style={{
                        position: "absolute",
                        left: 13,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 15,
                        height: 15,
                        color: "rgba(23,199,232,0.5)",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      id="password"
                      type={show ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "11px 42px 11px 40px",
                        fontSize: 13.5,
                        background: "rgba(8,15,30,0.7)",
                        border: "1px solid rgba(23,199,232,0.12)",
                        borderRadius: 10,
                        color: "#E2E8F0",
                        fontFamily: "inherit",
                        outline: "none",
                        transition: "border-color 150ms, box-shadow 150ms",
                      }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((p) => !p)}
                      tabIndex={-1}
                      aria-label={show ? "Hide password" : "Show password"}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.35)",
                        display: "flex",
                        alignItems: "center",
                        transition: "color 150ms",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.6)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
                      }
                    >
                      {show ? (
                        <EyeOff style={{ width: 15, height: 15 }} />
                      ) : (
                        <Eye style={{ width: 15, height: 15 }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={remember}
                    onClick={() => setRemember((p) => !p)}
                    style={{
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 4,
                      padding: 0,
                      cursor: "pointer",
                      background: remember ? CYAN : "rgba(8,15,30,0.8)",
                      border: remember
                        ? `1px solid ${CYAN}`
                        : "1px solid rgba(23,199,232,0.2)",
                      transition: "all 150ms",
                    }}
                  >
                    {remember && (
                      <svg
                        viewBox="0 0 10 8"
                        fill="none"
                        style={{ width: 9, height: 9 }}
                      >
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          stroke="#08111F"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  <label
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => setRemember((p) => !p)}
                  >
                    Remember me
                  </label>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: "10px 13px",
                        borderRadius: 10,
                        background: "rgba(127,29,29,0.2)",
                        border: "1px solid rgba(185,28,28,0.3)",
                        overflow: "hidden",
                      }}
                    >
                      <AlertCircle
                        style={{
                          width: 14,
                          height: 14,
                          color: "#FCA5A5",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12.5,
                          color: "#FCA5A5",
                          lineHeight: 1.5,
                        }}
                      >
                        {error}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sign In button */}
                <motion.button
                  type="submit"
                  id="signin-btn"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2"
                  style={{
                    padding: "13px 20px",
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    fontFamily: "inherit",
                    background: loading ? "rgba(23,199,232,0.4)" : CYAN,
                    color: "#080F1E",
                    border: "none",
                    borderRadius: 10,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.75 : 1,
                    transition: "opacity 150ms, background 150ms",
                  }}
                  animate={
                    signInGlow && !loading
                      ? {
                          boxShadow: [
                            "0 0 0 0 rgba(23,199,232,0)",
                            "0 0 0 5px rgba(23,199,232,0.25)",
                            "0 0 0 0 rgba(23,199,232,0)",
                          ],
                        }
                      : { boxShadow: "0 4px 20px rgba(23,199,232,0.25)" }
                  }
                  transition={{ boxShadow: { duration: 0.9, ease: "easeOut" } }}
                  whileHover={!loading ? { filter: "brightness(1.08)" } : {}}
                  whileTap={!loading ? { scale: 0.99 } : {}}
                >
                  {loading ? (
                    <>
                      <svg
                        style={{
                          width: 15,
                          height: 15,
                          animation: "spin 0.9s linear infinite",
                        }}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeDasharray="60"
                          strokeDashoffset="20"
                          strokeLinecap="round"
                        />
                      </svg>
                      Authenticating
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg
                        style={{ width: 15, height: 15 }}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            {/* OR divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "22px 0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.1em",
                }}
              >
                OR
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                }}
              />
            </div>

            {/* Request Access */}
            <button
              type="button"
              id="request-access-btn"
              onClick={() => navigate("/request-access")}
              className="w-full flex items-center justify-center gap-2"
              style={{
                padding: "12px 20px",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
                background: "rgba(23,199,232,0.06)",
                color: "rgba(255,255,255,0.65)",
                border: "1px solid rgba(23,199,232,0.2)",
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 150ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(23,199,232,0.1)";
                e.currentTarget.style.borderColor = "rgba(23,199,232,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(23,199,232,0.06)";
                e.currentTarget.style.borderColor = "rgba(23,199,232,0.2)";
              }}
            >
              <Building2
                style={{
                  width: 16,
                  height: 16,
                  color: "rgba(23,199,232,0.65)",
                }}
              />
              Request Access
            </button>

            {/* Secure footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginTop: 22,
              }}
            >
              <Lock
                style={{
                  width: 11,
                  height: 11,
                  color: "rgba(255,255,255,0.22)",
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.22)",
                }}
              >
                Secure login. All connections are encrypted.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        html, body { overflow: hidden; height: 100%; }
        @media (max-width: 1023px) { html, body { overflow: auto; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.22) !important; opacity: 1; }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0A1626 inset !important;
          -webkit-text-fill-color: #E2E8F0 !important;
          caret-color: #E2E8F0 !important;
        }
      `}</style>
    </div>
  );
}
