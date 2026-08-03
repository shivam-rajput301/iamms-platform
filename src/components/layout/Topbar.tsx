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
import { timeAgo } from "@/lib/utils";

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
    <header
      className="sticky top-0 z-20 flex h-16 items-center gap-3 px-4 backdrop-blur-xl"
      style={{
        backgroundColor: "rgba(9,17,31,0.92)",
        borderBottom: "1px solid rgba(23,199,232,0.1)",
      }}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 lg:hidden transition-colors"
        style={{ color: "rgba(255,255,255,0.5)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#17C7E8")}
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
        }
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "rgba(255,255,255,0.3)" }}
        />
        <input
          placeholder="Search assets, requests, parts…"
          className="input pl-9 py-2 w-full"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const q = (e.target as HTMLInputElement).value;
              navigate(`/assets?q=${encodeURIComponent(q)}`);
            }
          }}
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="rounded-lg p-2 transition-colors"
          style={{ color: "rgba(255,255,255,0.45)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#17C7E8")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
          }
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((p) => !p);
              setProfileOpen(false);
            }}
            className="relative rounded-lg p-2 transition-colors"
            style={{ color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#17C7E8")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
            }
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span
                className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold"
                style={{ background: "#f59e0b", color: "#080F1E" }}
              >
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
              <div
                className="absolute right-0 z-20 mt-2 w-80 origin-top-right rounded-xl shadow-2xl animate-slide-up"
                style={{
                  backgroundColor: "#0E1628",
                  border: "1px solid rgba(23,199,232,0.12)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px solid rgba(23,199,232,0.1)" }}
                >
                  <p className="text-sm font-semibold" style={{ color: "#E2E8F0" }}>
                    Notifications
                  </p>
                  <span
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {unread} unread
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifs.length === 0 ? (
                    <p
                      className="px-4 py-8 text-center text-sm"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      No notifications
                    </p>
                  ) : (
                    notifs.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 transition-colors"
                        style={{
                          borderBottom: "1px solid rgba(23,199,232,0.06)",
                          backgroundColor: !n.is_read
                            ? "rgba(23,199,232,0.04)"
                            : "transparent",
                        }}
                      >
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#CBD5E1" }}
                        >
                          {n.title}
                        </p>
                        <p
                          className="mt-0.5 text-xs"
                          style={{ color: "rgba(255,255,255,0.45)" }}
                        >
                          {n.message}
                        </p>
                        <p
                          className="mt-1 text-[11px]"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
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
                  className="w-full px-4 py-2.5 text-center text-sm font-medium transition-colors"
                  style={{
                    borderTop: "1px solid rgba(23,199,232,0.1)",
                    color: "#17C7E8",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(23,199,232,0.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  View all
                </button>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen((p) => !p);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #17C7E8, #0da8c8)",
                color: "#080F1E",
              }}
            >
              {profile?.full_name?.charAt(0) ?? "U"}
            </div>
            <div className="hidden text-left sm:block">
              <p
                className="text-sm font-semibold"
                style={{ color: "#E2E8F0" }}
              >
                {profile?.full_name}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {profile ? ROLE_LABELS[profile.role] : ""}
              </p>
            </div>
            <ChevronDown
              className="h-4 w-4"
              style={{ color: "rgba(255,255,255,0.35)" }}
            />
          </button>
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
              />
              <div
                className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-xl shadow-2xl animate-slide-up"
                style={{
                  backgroundColor: "#0E1628",
                  border: "1px solid rgba(23,199,232,0.12)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                }}
              >
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "#CBD5E1" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(23,199,232,0.06)";
                    e.currentTarget.style.color = "#E2E8F0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#CBD5E1";
                  }}
                >
                  Profile
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                  style={{
                    borderTop: "1px solid rgba(23,199,232,0.08)",
                    color: "#f87171",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(239,68,68,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
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
