"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Bell,
  GraduationCap,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import SidebarNavigation from "./sidebar-navigation";
import NotificationPopover from "./notification-popover";

import { getInitials } from "../../src/lib/utils";
import { authFetch, setAuthToken, getAuthToken } from "../../src/services/api-clients";

import type { AuthUser, UserRole } from "../../src/models/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const roleLabels: Record<UserRole, string> = {
  admin: "Super Administrator",
  student: "College Student",
  lecturer: "Lecturer",
};

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("lms_user");
        return cached ? (JSON.parse(cached) as AuthUser) : null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("lms_user");
    }
    return true;
  });

  // Verify and refresh the authenticated user from the API
  useEffect(() => {
    let active = true;

    // If there is no token or cached user, immediately redirect to login
    const token = getAuthToken();
    const cachedUser = typeof window !== "undefined" ? localStorage.getItem("lms_user") : null;
    if (!token && !cachedUser) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const res = await authFetch(`${API_URL}/auth/me`);

        if (!active) return;

        if (res.status === 401) {
          // Token is genuinely invalid or revoked
          setAuthToken(null);
          router.replace("/login");
          return;
        }

        const json = await res.json();
        if (!active) return;

        if (!json.success || !json.data?.user) {
          setAuthToken(null);
          router.replace("/login");
          return;
        }

        const freshUser = json.data.user as AuthUser;
        setUser(freshUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("lms_user", JSON.stringify(freshUser));
        }
      } catch (err) {
        // If server is temporarily unreachable (e.g. Railway cold start), don't kick out if we have cached user
        if (active) {
          const hasCached = typeof window !== "undefined" && !!localStorage.getItem("lms_user");
          if (!hasCached) {
            setAuthToken(null);
            router.replace("/login");
          } else {
            // eslint-disable-next-line no-console
            console.warn("[DashboardShell] Server verification skipped due to network blip:", err);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    setAuthToken(null);
    try {
      await authFetch(`${API_URL}/auth/logout`, {
        method: "POST",
      });
    } catch {
      // Ignore — proceed to the login page regardless.
    }

    // Full page navigation to reset all client router state and cache
    window.location.href = "/login";
  }

  // Avoid rendering the shell until the user is known.
  if (loading || !user) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  const role = user.role;
  const name = user.name;

  return (
    <div className="dashboard-layout">
      {mobileOpen && (
        <button
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`sidebar ${
          mobileOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-icon">
            <GraduationCap size={25} />
          </div>

          <div>
            <h2>LMS Kuliah</h2>
            <span>Learning Platform</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <SidebarNavigation
          role={role}
          onNavigate={() => setMobileOpen(false)}
        />

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <GraduationCap size={24} />
            <p>Campus Learning Platform</p>
            <span>
              Your academic activities in one place.
            </span>
          </div>

          <button
            className="nav-link logout-link logout-button"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="topbar-greeting">
                Welcome back,
              </p>

              <h3>{name}</h3>
            </div>
          </div>

          <div className="topbar-right">
            <NotificationPopover />

            <div className="user-info">
              <div className="avatar">
                {getInitials(name)}
              </div>

              <div className="user-details">
                <strong>{name}</strong>
                <span>{roleLabels[role]}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>

        <footer className="footer">
          © 2026 Campus LMS. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
