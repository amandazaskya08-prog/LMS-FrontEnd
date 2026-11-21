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
import { authFetch, setAuthToken } from "../../src/services/api-clients";

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load the authenticated user from the API (cookie-based auth).
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await authFetch(`${API_URL}/auth/me`);

        if (!active) return;

        if (res.status === 401) {
          setAuthToken(null);
          router.replace("/login");
          return;
        }

        const json = await res.json();
        if (!active) return;

        if (!json.success) {
          setAuthToken(null);
          router.replace("/login");
          return;
        }

        setUser(json.data.user as AuthUser);
      } catch {
        if (active) {
          setAuthToken(null);
          router.replace("/login");
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
