import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useNotifications } from "@/lib/hooks";
import { ROLE_LABELS } from "@/lib/constants";
import { cn, timeAgo } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { profile, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: notifs = [] } = useNotifications();
  const unread = notifs.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-steel-200 bg-white/80 px-4 backdrop-blur-xl dark:border-steel-800 dark:bg-steel-900/80">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-steel-500 hover:bg-steel-100 lg:hidden dark:hover:bg-steel-800"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
        <input
          placeholder="Search assets, requests, parts…"
          className="input pl-9 py-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const q = (e.target as HTMLInputElement).value;
              navigate(`/assets?q=${encodeURIComponent(q)}`);
            }
          }}
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-steel-500 hover:bg-steel-100 dark:text-steel-400 dark:hover:bg-steel-800"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((p) => !p);
              setProfileOpen(false);
            }}
            className="relative rounded-lg p-2 text-steel-500 hover:bg-steel-100 dark:text-steel-400 dark:hover:bg-steel-800"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-80 origin-top-right rounded-xl border border-steel-200 bg-white shadow-md animate-slide-up dark:border-steel-800 dark:bg-steel-900">
                <div className="flex items-center justify-between border-b border-steel-200 px-4 py-3 dark:border-steel-800">
                  <p className="text-sm font-semibold text-steel-800 dark:text-steel-200">
                    Notifications
                  </p>
                  <span className="text-xs text-steel-500">
                    {unread} unread
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifs.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-steel-500">
                      No notifications
                    </p>
                  ) : (
                    notifs.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "border-b border-steel-100 px-4 py-3 last:border-0 dark:border-steel-800/60",
                          !n.is_read && "bg-brand-50/50 dark:bg-brand-600/5",
                        )}
                      >
                        <p className="text-sm font-medium text-steel-800 dark:text-steel-200">
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-xs text-steel-500">
                          {n.message}
                        </p>
                        <p className="mt-1 text-[11px] text-steel-400">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => {
                    setNotifOpen(false);
                    navigate("/notifications");
                  }}
                  className="w-full border-t border-steel-200 px-4 py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-steel-50 dark:border-steel-800 dark:hover:bg-steel-800/50"
                >
                  View all
                </button>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen((p) => !p);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-steel-100 dark:hover:bg-steel-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {profile?.full_name?.charAt(0) ?? "U"}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-steel-800 dark:text-steel-200">
                {profile?.full_name}
              </p>
              <p className="text-xs text-steel-500">
                {profile ? ROLE_LABELS[profile.role] : ""}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-steel-400" />
          </button>
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-xl border border-steel-200 bg-white shadow-md animate-slide-up dark:border-steel-800 dark:bg-steel-900">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-steel-700 hover:bg-steel-100 dark:text-steel-200 dark:hover:bg-steel-800"
                >
                  Profile
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-2 border-t border-steel-200 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:border-steel-800 dark:hover:bg-rose-600/10"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
