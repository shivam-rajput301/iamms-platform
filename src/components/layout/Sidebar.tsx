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

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
      isActive
        ? "bg-brand-50 text-brand-700 font-semibold border-l-2 border-brand-600 pl-2.5 dark:bg-brand-600/15 dark:text-brand-400 dark:border-brand-500"
        : "text-steel-700 hover:bg-steel-100 dark:text-steel-200 dark:hover:bg-steel-800/60",
    );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-steel-950/40 dark:bg-steel-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-steel-200 bg-white transition-transform duration-200 dark:border-steel-800 dark:bg-steel-900 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand & Organization */}
        <div className="border-b border-steel-200 dark:border-steel-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md shadow-brand-600/30 dark:shadow-brand-950">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-extrabold tracking-tight text-steel-900 dark:text-white">
                {APPLICATION_NAME}
              </h1>
              <p className="truncate text-[10px] font-medium text-steel-500 dark:text-steel-400">
                {APPLICATION_FULL_NAME}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto rounded-lg p-1 text-steel-400 hover:bg-steel-100 dark:hover:bg-steel-800 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Subtitle: Organization Config */}
          <div className="mt-3 rounded-xl border border-steel-200 bg-steel-50/80 p-3 dark:border-steel-800/80 dark:bg-steel-950/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-steel-600 dark:text-steel-400">
                <Building2 className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                <span>Organization</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>
            <p className="mt-1.5 truncate text-xs font-bold text-steel-900 dark:text-steel-100">
              {orgConfig.company_name && orgConfig.company_name !== "Not Configured"
                ? orgConfig.company_name
                : "Industrial Manufacturing Plant"}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-steel-600 dark:text-steel-400">
              {orgConfig.plant_name && orgConfig.plant_name !== "Not Configured"
                ? orgConfig.plant_name
                : "Renukoot, Uttar Pradesh"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
            Core Operations
          </p>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={navLinkClass}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0 text-steel-600 dark:text-steel-300" />
              {item.label}
            </NavLink>
          ))}

          {/* ── Admin section (super_admin only) ── */}
          {isSuperAdmin && (
            <div className="mt-5 pt-4 border-t border-steel-200 dark:border-steel-800/80">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
                Administration
              </p>

              {/* All Users */}
              <NavLink
                to="/admin/users"
                onClick={onClose}
                className={navLinkClass}
              >
                <Users className="h-[18px] w-[18px] shrink-0 text-steel-600 dark:text-steel-300" />
                All Users
              </NavLink>

              {/* Pending Registrations with badge */}
              <NavLink
                to="/admin/pending-registrations"
                onClick={onClose}
                className={navLinkClass}
              >
                <UserCheck className="h-[18px] w-[18px] shrink-0 text-steel-600 dark:text-steel-300" />
                <span className="flex-1 truncate">Pending Approvals</span>
                {pendingCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-steel-950">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </NavLink>
            </div>
          )}
        </nav>

        {/* User Card Footer */}
        <div className="border-t border-steel-200 dark:border-steel-800 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-steel-50 border border-steel-200 p-2.5 dark:bg-steel-950/60 dark:border-steel-800/60">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
              {profile?.full_name?.charAt(0) ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-steel-900 dark:text-steel-200">
                {profile?.full_name}
              </p>
              <p className="truncate text-[10px] text-steel-500 dark:text-steel-400">
                {profile?.designation ?? "Authorized Personnel"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
