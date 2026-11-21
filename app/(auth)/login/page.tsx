"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  User,
  BookOpen,
} from "lucide-react";

import type { UserRole } from "../../../src/models/types";
import { setAuthToken } from "../../../src/services/api-clients";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const roleOptions = [
  {
    value: "admin",
    label: "Super Admin",
    icon: ShieldCheck,
    email: "admin@kampus.ac.id",
  },
  {
    value: "student",
    label: "Student",
    icon: User,
    email: "mahasiswa@kampus.ac.id",
  },
  {
    value: "lecturer",
    label: "Lecturer",
    icon: BookOpen,
    email: "dosen@kampus.ac.id",
  },
];

const destinations: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  student: "/dashboard",
  lecturer: "/lecturer/dashboard",
};

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("mahasiswa@kampus.ac.id");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The role selector only pre-fills a demo email; the backend determines the
  // actual role from the account that matches the email/password.
  function handleRoleChange(nextRole: UserRole) {
    setRole(nextRole);

    const selected = roleOptions.find(
      (item) => item.value === nextRole
    );

    if (selected) {
      setEmail(selected.email);
    }

    setError(null);
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "Login failed.");
        setLoading(false);
        return;
      }

      // Persist auth token to guarantee seamless cross-domain redirect (e.g. Vercel -> Railway)
      if (json.data?.token) {
        setAuthToken(json.data.token);
      }
      if (json.data?.user) {
        localStorage.setItem("lms_user", JSON.stringify(json.data.user));
      }

      const userRole = json.data.user.role as UserRole;
      const target = destinations[userRole] ?? "/dashboard";
      window.location.href = target;
    } catch {
      setError("Cannot reach the server. Check your connection.");
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="login-logo">
            <GraduationCap size={32} />
          </div>

          <h1>Learning Management System Kuliah Universitas A</h1>

          <p>Your academic journey starts here.</p>
        </div>

        <div className="login-card">
          <h2>Welcome back</h2>

          <p className="login-description">
            Sign in to access your learning dashboard.
          </p>

          <form onSubmit={handleLogin}>
            <label>Sign in as</label>

            <div className="role-selector">
              {roleOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleRoleChange(option.value as UserRole)
                    }
                    className={`role-option ${
                      role === option.value
                        ? "role-option-active"
                        : ""
                    }`}
                  >
                    <Icon size={18} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            <label>Email Address</label>

            <div className="input-wrapper">
              <Mail size={19} />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label>Password</label>

            <div className="input-wrapper">
              <Lock size={19} />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: "13px",
                  marginTop: "4px",
                  marginBottom: "10px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="login-footer">
            © 2026 Learning Management Team
          </p>
        </div>
      </div>
    </main>
  );
}
