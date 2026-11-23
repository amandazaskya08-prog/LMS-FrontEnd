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
  KeyRound,
} from "lucide-react";

import type { LMSUser, UserRole } from "../../src/models/user";

import UserFormModal from "./user-form-modal";
import { authFetch, API_URL } from "../../src/services/api-clients";

const initialUsers: LMSUser[] = [
  {
    id: "usr-admin",
    name: "Admin BAAK",
    email: "admin@kampus.ac.id",
    role: "admin",
    status: "active",
    faculty: "Biro Administrasi Akademik",
    studyProgram: "Administrasi Kampus",
    createdAt: "2026-01-01",
  },
  {
    id: "usr-lec-1",
    name: "Dr. Budi Santoso, M.Kom.",
    email: "dosen@kampus.ac.id",
    role: "lecturer",
    status: "active",
    studentId: "0010010001",
    nidn: "0010010001",
    faculty: "Fakultas Ilmu Komputer",
    studyProgram: "Teknik Informatika",
    createdAt: "2026-01-10",
  },
  {
    id: "usr-stu-1",
    name: "Andi Pratama",
    email: "mahasiswa@kampus.ac.id",
    role: "student",
    status: "active",
    studentId: "2023101001",
    faculty: "Fakultas Ilmu Komputer",
    studyProgram: "Teknik Informatika",
    createdAt: "2026-01-15",
  },
];

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  student: "Mahasiswa",
  lecturer: "Dosen",
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
        (user.studentId ?? "").toLowerCase().includes(keyword) ||
        (user.nidn ?? "").toLowerCase().includes(keyword);

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

  async function saveUser(data: any): Promise<{ success: boolean; message?: string } | void> {
    if (editingUser) {
      try {
        const res = await authFetch(`${API_URL}/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          return { success: false, message: json.message || "Gagal memperbarui akun pengguna" };
        }
        await fetchUsers();
      } catch (err: any) {
        return { success: false, message: err?.message || "Gagal menghubungi server backend" };
      }
    } else {
      try {
        const res = await authFetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          return { success: false, message: json.message || "Gagal membuat akun pengguna baru" };
        }
        await fetchUsers();
      } catch (err: any) {
        return { success: false, message: err?.message || "Gagal menghubungi server backend" };
      }
    }

    setModalOpen(false);
    setEditingUser(null);
    return { success: true };
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
      await fetchUsers();
    } catch {
      // Handled
    }
  }

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Manajemen Pengguna & Akun</h1>
          <p>Kelola seluruh akun login Super Admin, Dosen pengampu, dan Mahasiswa kampus.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={fetchUsers}
            className="secondary-action"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            title="Muat ulang data pengguna"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Segarkan</span>
          </button>

          <button className="primary-action" onClick={openAddModal}>
            <Plus size={18} />
            Tambah Akun Baru
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="user-stats-grid">
        <div className="user-stat-card">
          <div className="user-stat-icon blue">
            <Users size={22} />
          </div>
          <div>
            <span>Total Pengguna</span>
            <h2>{stats.total}</h2>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon green">
            <GraduationCap size={22} />
          </div>
          <div>
            <span>Mahasiswa</span>
            <h2>{stats.students}</h2>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon purple">
            <BookOpen size={22} />
          </div>
          <div>
            <span>Dosen Pengampu</span>
            <h2>{stats.lecturers}</h2>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon orange">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span>Administrator</span>
            <h2>{stats.admins}</h2>
          </div>
        </div>
      </div>

      {/* USER TABLE */}
      <section className="content-card user-management-card">
        <div className="user-toolbar">
          <div>
            <h2>Daftar Seluruh Pengguna</h2>
            <p>Data akun terdaftar yang memiliki akses login ke portal LMS Kuliah.</p>
          </div>

          <div className="user-filters">
            <div className="user-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Cari nama, email, NIM, atau NIDN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Filter berdasarkan peran"
            >
              <option value="all">Semua Peran</option>
              <option value="student">Mahasiswa</option>
              <option value="lecturer">Dosen</option>
              <option value="admin">Administrator</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter berdasarkan status"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif (Bisa Login)</option>
              <option value="inactive">Nonaktif (Diblokir)</option>
            </select>
          </div>
        </div>

        <div className="user-table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>NIM / NIDN</th>
                <th>Peran (Role)</th>
                <th>Program Studi & Fakultas</th>
                <th>Status Akun</th>
                <th>Aksi</th>
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
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{user.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="user-id">
                      {user.studentId || user.nidn || "—"}
                    </span>
                  </td>

                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>

                  <td>
                    <div className="user-academic">
                      <strong>{user.studyProgram || user.faculty || "—"}</strong>
                      <span>{user.faculty || "—"}</span>
                    </div>
                  </td>

                  <td>
                    <span className={`status-badge ${user.status}`}>
                      <span />
                      {user.status === "active" ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>

                  <td>
                    <div className="user-action-wrapper">
                      <button
                        className="user-action-button"
                        onClick={() =>
                          setMenuUser(
                            menuUser === user.id ? null : user.id
                          )
                        }
                        aria-label={`Aksi untuk ${user.name}`}
                      >
                        <MoreHorizontal size={19} />
                      </button>

                      {menuUser === user.id && (
                        <div className="user-action-menu">
                          <button onClick={() => openEditModal(user)}>
                            <Pencil size={15} />
                            Edit Pengguna / Password
                          </button>

                          <button onClick={() => toggleStatus(user.id)}>
                            {user.status === "active" ? (
                              <UserX size={15} />
                            ) : (
                              <UserCheck size={15} />
                            )}
                            {user.status === "active"
                              ? "Nonaktifkan Akun"
                              : "Aktifkan Akun"}
                          </button>

                          <button
                            className="delete-action"
                            onClick={() => {
                              setDeleteTarget(user);
                              setMenuUser(null);
                            }}
                          >
                            <Trash2 size={15} />
                            Hapus Akun
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="user-empty">
                    Tidak ada data pengguna yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="user-table-footer">
          Menampilkan {filteredUsers.length} dari {users.length} pengguna
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

            <h2>Hapus Akun Pengguna?</h2>

            <p>
              Apakah Anda yakin ingin menghapus akun <strong>{deleteTarget.name}</strong> ({deleteTarget.email})?
              Tindakan ini akan menghapus akun login dan data profil terkait dari sistem secara permanen.
            </p>

            <div className="modal-actions">
              <button
                className="secondary-action"
                onClick={() => setDeleteTarget(null)}
              >
                Batal
              </button>

              <button
                className="danger-action"
                onClick={deleteUser}
              >
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
