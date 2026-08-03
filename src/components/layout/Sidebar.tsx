import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Factory,
  Wrench,
  Package,
  FileBarChart,
  Bell,
  Settings,
  User,
  Cpu,
  X,
  Users,
  UserCheck,
  Building2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { APPLICATION_NAME, APPLICATION_FULL_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  adminApi,
  organizationApi,
  getApiToken,
  type OrganizationConfig,
} from "@/lib/api";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    permission: "dashboard:view",
  },
  { to: "/assets", label: "Assets", icon: Factory, permission: "assets:view" },
  {
    to: "/requests",
    label: "Maintenance",
    icon: Wrench,
    permission: "requests:view",
  },
  {
    to: "/inventory",
    label: "Inventory",
    icon: Package,
    permission: "inventory:view",
  },
  {
    to: "/reports",
    label: "Reports",
    icon: FileBarChart,
    permission: "reports:view",
  },
  {
    to: "/notifications",
    label: "Notifications",
    icon: Bell,
    permission: "notifications:view",
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
    permission: "settings:view",
  },
  {
    to: "/profile",
    label: "Profile",
    icon: User,
    permission: "dashboard:view",
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { profile, can: canFn } = useAuth();
  const isEmployee = profile?.role === "employee";
  const items = NAV_ITEMS.filter((item) => canFn(item.permission)).map(
    (item) => {
      if (item.to === "/requests" && isEmployee) {
        return { ...item, label: "My Requests" };
      }
      return item;
    },
  );

  const isSuperAdmin = profile?.role === "super_admin";
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [orgConfig, setOrgConfig] = useState<OrganizationConfig>({
    company_name: "Not Configured",
    plant_name: "Not Configured",
  });

  /* Fetch Organization Config & Pending Count */
  useEffect(() => {
    let cancelled = false;

    organizationApi
      .getConfig()
      .then((res) => {
        if (!cancelled && res) setOrgConfig(res);
      })
      .catch(() => {});

    if (isSuperAdmin && getApiToken()) {
      adminApi
        .getPendingCount()
        .then((res) => {
          if (!cancelled) setPendingCount(res.count);
        })
        .catch(() => {});

      const interval = setInterval(() => {
        adminApi
          .getPendingCount()
          .then((res) => {
            if (!cancelled) setPendingCount(res.count);
          })
          .catch(() => {});
      }, 60_000);

      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  // Active: cyan text + cyan left border + subtle cyan bg
  // Hover: very light cyan tint
  // Inactive: muted slate
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
      isActive
        ? "bg-[rgba(23,199,232,0.1)] text-[#17C7E8] font-semibold border-l-2 border-[#17C7E8] pl-2.5"
        : "text-[rgba(255,255,255,0.55)] hover:bg-[rgba(23,199,232,0.06)] hover:text-[rgba(255,255,255,0.85)]",
    );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 backdrop-blur-sm lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={onClose}
        />
      )}
      {/* Sidebar shell — exact Login Page navy */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-200 lg:translate-x-0 scrollbar-thin overflow-y-auto",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          backgroundColor: "#09111F",
          borderRight: "1px solid rgba(23,199,232,0.1)",
        }}
      >
        {/* ── Brand & Organization ── */}
        <div
          className="p-4"
          style={{ borderBottom: "1px solid rgba(23,199,232,0.1)" }}
        >
          <div className="flex items-center gap-3">
            {/* Logo icon — cyan background matching Login Page brand */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-md"
              style={{
                background: "linear-gradient(135deg, #17C7E8, #0da8c8)",
                boxShadow: "0 4px 12px rgba(23,199,232,0.3)",
              }}
            >
              <Cpu className="h-5 w-5 text-[#080F1E]" />
            </div>
            <div className="min-w-0 flex-1">
              <h1
                className="truncate text-base font-extrabold tracking-tight"
                style={{ color: "#E2E8F0" }}
              >
                {APPLICATION_NAME}
              </h1>
              <p
                className="truncate text-[10px] font-medium"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {APPLICATION_FULL_NAME}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto rounded-lg p-1 lg:hidden"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Organization info card */}
          <div
            className="mt-3 rounded-xl p-3"
            style={{
              background: "rgba(23,199,232,0.04)",
              border: "1px solid rgba(23,199,232,0.1)",
            }}
          >
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <Building2
                  className="h-3.5 w-3.5"
                  style={{ color: "#17C7E8" }}
                />
                <span>Organization</span>
              </div>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold"
                style={{
                  background: "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  color: "#10b981",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>
            <p
              className="mt-1.5 truncate text-xs font-bold"
              style={{ color: "#E2E8F0" }}
            >
              {orgConfig.company_name && orgConfig.company_name !== "Not Configured"
                ? orgConfig.company_name
                : "Industrial Manufacturing Plant"}
            </p>
            <p
              className="mt-0.5 truncate text-[11px] font-medium"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {orgConfig.plant_name && orgConfig.plant_name !== "Not Configured"
                ? orgConfig.plant_name
                : "Renukoot, Uttar Pradesh"}
            </p>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto scrollbar-thin">
          <p
            className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Core Operations
          </p>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={navLinkClass}
            >
              <item.icon
                className="h-[18px] w-[18px] shrink-0"
                style={{ color: "inherit", opacity: 0.8 }}
              />
              {item.label}
            </NavLink>
          ))}

          {/* ── Admin section (super_admin only) ── */}
          {isSuperAdmin && (
            <div
              className="mt-5 pt-4"
              style={{ borderTop: "1px solid rgba(23,199,232,0.08)" }}
            >
              <p
                className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Administration
              </p>

              {/* All Users */}
              <NavLink
                to="/admin/users"
                onClick={onClose}
                className={navLinkClass}
              >
                <Users
                  className="h-[18px] w-[18px] shrink-0"
                  style={{ color: "inherit", opacity: 0.8 }}
                />
                All Users
              </NavLink>

              {/* Pending Registrations with badge */}
              <NavLink
                to="/admin/pending-registrations"
                onClick={onClose}
                className={navLinkClass}
              >
                <UserCheck
                  className="h-[18px] w-[18px] shrink-0"
                  style={{ color: "inherit", opacity: 0.8 }}
                />
                <span className="flex-1 truncate">Pending Approvals</span>
                {pendingCount > 0 && (
                  <span
                    className="flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                    style={{
                      background: "#f59e0b",
                      color: "#080F1E",
                    }}
                  >
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </NavLink>
            </div>
          )}
        </nav>

        {/* ── User Card Footer ── */}
        <div
          className="p-3"
          style={{ borderTop: "1px solid rgba(23,199,232,0.1)" }}
        >
          <div
            className="flex items-center gap-3 rounded-lg p-2.5"
            style={{
              background: "rgba(23,199,232,0.04)",
              border: "1px solid rgba(23,199,232,0.1)",
            }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #17C7E8, #0da8c8)",
                color: "#080F1E",
              }}
            >
              {profile?.full_name?.charAt(0) ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-xs font-semibold"
                style={{ color: "#E2E8F0" }}
              >
                {profile?.full_name}
              </p>
              <p
                className="truncate text-[10px]"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {profile?.designation ?? "Authorized Personnel"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
