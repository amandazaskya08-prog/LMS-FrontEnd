"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Plus,
  Users,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Pencil,
  Trash2,
  MoreHorizontal,
  UserCheck,
  UserX,
  X,
  RefreshCw,
} from "lucide-react";

import type {
  LMSUser,
  UserRole,
} from "../../src/models/user";

import UserFormModal from "./user-form-modal";
import { authFetch } from "../../src/services/api-clients";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const initialUsers: LMSUser[] = [
  {
    id: "USR001",
    name: "Alexandra Putri",
    email: "alexandra@student.ac.id",
    role: "student",
    status: "active",
    studentId: "2024001001",
    faculty: "Computer Science",
    studyProgram: "Informatics",
    createdAt: "2026-01-10",
  },
  {
    id: "USR002",
    name: "Budi Santoso",
    email: "budi@campus.ac.id",
    role: "lecturer",
    status: "active",
    faculty: "Computer Science",
    studyProgram: "Informatics",
    createdAt: "2026-01-12",
  },
  {
    id: "USR003",
    name: "Citra Maharani",
    email: "citra@student.ac.id",
    role: "student",
    status: "active",
    studentId: "2024001002",
    faculty: "Economics",
    studyProgram: "Management",
    createdAt: "2026-01-15",
  },
  {
    id: "USR004",
    name: "Dimas Pratama",
    email: "dimas@student.ac.id",
    role: "student",
    status: "inactive",
    studentId: "2024001003",
    faculty: "Engineering",
    studyProgram: "Civil Engineering",
    createdAt: "2026-01-18",
  },
  {
    id: "USR005",
    name: "Super Administrator",
    email: "admin@campus.ac.id",
    role: "admin",
    status: "active",
    faculty: "University Administration",
    createdAt: "2026-01-01",
  },
];

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  student: "Student",
  lecturer: "Lecturer",
};

export default function UserManagement() {
  const [users, setUsers] = useState<LMSUser[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<LMSUser | null>(null);

  const [menuUser, setMenuUser] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LMSUser | null>(null);

  // Fetch users from backend database
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_URL}/users`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setUsers(json.data);
        }
      }
    } catch {
      // Fallback to local state if server unreachable
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.id.toLowerCase().includes(keyword) ||
        (user.studentId ?? "").toLowerCase().includes(keyword);

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    lecturers: users.filter((u) => u.role === "lecturer").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  function openAddModal() {
    setEditingUser(null);
    setModalOpen(true);
  }

  function openEditModal(user: LMSUser) {
    setEditingUser(user);
    setModalOpen(true);
    setMenuUser(null);
  }

  async function saveUser(data: Omit<LMSUser, "id" | "createdAt">) {
    if (editingUser) {
      // Optimistic local update
      setUsers((previous) =>
        previous.map((user) =>
          user.id === editingUser.id
            ? { ...user, ...data }
            : user
        )
      );

      try {
        await authFetch(`${API_URL}/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch {
        // Ignore network error
      }
    } else {
      const tempId = `USR${String(Date.now()).slice(-6)}`;
      const newUser: LMSUser = {
        ...data,
        id: tempId,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      setUsers((previous) => [newUser, ...previous]);

      try {
        const res = await authFetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setUsers((prev) => prev.map((u) => (u.id === tempId ? { ...u, id: json.data.id } : u)));
        }
      } catch {
        // Ignore
      }
    }

    setModalOpen(false);
    setEditingUser(null);
  }

  async function toggleStatus(userId: string) {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const nextStatus = targetUser.status === "active" ? "inactive" : "active";

    // Optimistic UI update
    setUsers((previous) =>
      previous.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: nextStatus,
            }
          : user
      )
    );

    setMenuUser(null);

    // Sync to backend real database so deactivated user CANNOT login!
    try {
      await authFetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {
      // Handled
    }
  }

  async function deleteUser() {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;

    setUsers((previous) =>
      previous.filter((user) => user.id !== targetId)
    );

    setDeleteTarget(null);

    try {
      await authFetch(`${API_URL}/users/${targetId}`, {
        method: "DELETE",
      });
    } catch {
      // Handled
    }
  }

  return (
    <div className="page-container">
      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage university administrators, students and lecturers.</p>
        </div>

        <button className="primary-action" onClick={openAddModal}>
          <Plus size={18} />
          Add New User
        </button>
      </div>

      {/* STATISTICS */}

      <div className="user-stats-grid">
        <div className="user-stat-card">
          <div className="user-stat-icon blue">
            <Users size={22} />
          </div>
          <div>
            <span>Total Users</span>
            <h2>{stats.total}</h2>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon green">
            <GraduationCap size={22} />
          </div>
          <div>
            <span>Students</span>
            <h2>{stats.students}</h2>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon purple">
            <BookOpen size={22} />
          </div>
          <div>
            <span>Lecturers</span>
            <h2>{stats.lecturers}</h2>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon orange">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span>Administrators</span>
            <h2>{stats.admins}</h2>
          </div>
        </div>
      </div>

      {/* USER TABLE */}

      <section className="content-card user-management-card">
        <div className="user-toolbar">
          <div>
            <h2>All Users</h2>
            <p>View and manage registered accounts.</p>
          </div>

          <div className="user-filters">
            <div className="user-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="user-table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>User ID</th>
                <th>Role</th>
                <th>Faculty / Program</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-table-profile">
                      <div className="user-table-avatar">
                        {user.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="user-id">
                      {user.studentId || user.id}
                    </span>
                  </td>

                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>

                  <td>
                    <div className="user-academic">
                      <strong>{user.faculty}</strong>
                      <span>{user.studyProgram || "—"}</span>
                    </div>
                  </td>

                  <td>
                    <span className={`status-badge ${user.status}`}>
                      <span />
                      {user.status}
                    </span>
                  </td>

                  <td>{user.createdAt}</td>

                  <td>
                    <div className="user-action-wrapper">
                      <button
                        className="user-action-button"
                        onClick={() =>
                          setMenuUser(
                            menuUser === user.id ? null : user.id
                          )
                        }
                        aria-label={`Actions for ${user.name}`}
                      >
                        <MoreHorizontal size={19} />
                      </button>

                      {menuUser === user.id && (
                        <div className="user-action-menu">
                          <button onClick={() => openEditModal(user)}>
                            <Pencil size={15} />
                            Edit user
                          </button>

                          <button onClick={() => toggleStatus(user.id)}>
                            {user.status === "active" ? (
                              <UserX size={15} />
                            ) : (
                              <UserCheck size={15} />
                            )}

                            {user.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            className="delete-action"
                            onClick={() => {
                              setDeleteTarget(user);
                              setMenuUser(null);
                            }}
                          >
                            <Trash2 size={15} />
                            Delete user
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="user-empty">
                    No users found. Try changing your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="user-table-footer">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </section>

      {/* ADD / EDIT MODAL */}

      {modalOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => {
            setModalOpen(false);
            setEditingUser(null);
          }}
          onSave={saveUser}
        />
      )}

      {/* DELETE CONFIRMATION */}

      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="confirmation-modal">
            <div className="confirmation-icon">
              <Trash2 size={24} />
            </div>

            <button
              className="modal-close"
              onClick={() => setDeleteTarget(null)}
              aria-label="Close"
            >
              <X size={19} />
            </button>

            <h2>Delete User?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>? This action cannot
              be undone.
            </p>

            <div className="modal-actions">
              <button
                className="secondary-action"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              <button
                className="danger-action"
                onClick={deleteUser}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}