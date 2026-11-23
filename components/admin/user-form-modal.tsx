"use client";

import { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Lock,
  Eye,
  EyeOff,
  Mail,
  User as UserIcon,
  CheckCircle2,
  Building2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

import type { LMSUser, UserRole, UserStatus } from "../../src/models/user";
import { authFetch } from "../../src/services/api-clients";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface UserFormModalProps {
  user: LMSUser | null;
  initialRole?: UserRole;
  onClose: () => void;
  onSave: (
    data: Omit<LMSUser, "id" | "createdAt"> & {
      password?: string;
      nim?: string;
      nidn?: string;
      studyProgramId?: string;
      angkatan?: number;
      currentSemester?: number;
      uktGroup?: number;
      position?: string;
      expertise?: string;
    }
  ) => Promise<{ success: boolean; message?: string } | void>;
}

interface StudyProgramOption {
  id: string;
  name: string;
  code: string;
  degree: string;
  facultyName?: string;
}

export default function UserFormModal({
  user,
  initialRole,
  onClose,
  onSave,
}: UserFormModalProps) {
  const [role, setRole] = useState<UserRole>(
    user?.role ?? initialRole ?? "student"
  );
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<UserStatus>(
    user?.status ?? "active"
  );

  // Student specific
  const [studentId, setStudentId] = useState(
    user?.studentId ?? ""
  );
  const [angkatan, setAngkatan] = useState<number>(user?.angkatan ?? 2026);
  const [currentSemester, setCurrentSemester] = useState<number>(user?.currentSemester ?? 1);
  const [uktGroup, setUktGroup] = useState<number>(user?.uktGroup ?? 3);

  // Lecturer specific
  const [nidn, setNidn] = useState(user?.nidn ?? user?.studentId ?? "");
  const [position, setPosition] = useState(user?.position ?? "Lektor");
  const [expertise, setExpertise] = useState(
    user?.expertise ?? "Informatika & Basis Data"
  );

  // Academic program & faculty
  const [studyProgramId, setStudyProgramId] = useState(user?.studyProgramId ?? "sp-1");
  const [faculty, setFaculty] = useState(user?.faculty ?? "");
  const [studyProgram, setStudyProgram] = useState(user?.studyProgram ?? "");

  const [availablePrograms, setAvailablePrograms] = useState<StudyProgramOption[]>([
    { id: "sp-1", name: "Teknik Informatika", code: "IF", degree: "S1", facultyName: "Fakultas Ilmu Komputer" },
    { id: "sp-2", name: "Sistem Informasi", code: "SI", degree: "S1", facultyName: "Fakultas Ilmu Komputer" },
  ]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load programs from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`${API_URL}/faculties/programs`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAvailablePrograms(json.data);
            if (!user) {
              setStudyProgramId(json.data[0].id);
              setStudyProgram(json.data[0].name);
              setFaculty(json.data[0].facultyName || "Fakultas Ilmu Komputer");
            }
          }
        }
      } catch {
        // Fallback default programs
      }
    })();
  }, [user]);

  function handleProgramChange(progId: string) {
    setStudyProgramId(progId);
    const selected = availablePrograms.find((p) => p.id === progId);
    if (selected) {
      setStudyProgram(selected.name);
      setFaculty(selected.facultyName || "Fakultas Ilmu Komputer");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    // Validate email
    if (!email || !email.includes("@")) {
      setErrorMsg("Mohon masukkan alamat email yang valid.");
      return;
    }

    // Validate password for new user
    if (!user && (!password || password.trim().length < 6)) {
      setErrorMsg("Password wajib diisi minimal 6 karakter untuk akun baru.");
      return;
    }

    // If edit and password entered but < 6
    if (user && password && password.trim().length < 6) {
      setErrorMsg("Password baru minimal 6 karakter.");
      return;
    }

    setSaving(true);
    try {
      const selectedProg = availablePrograms.find((p) => p.id === studyProgramId);
      const effectiveProgName = selectedProg?.name || studyProgram.trim() || (role === "admin" ? "Administrasi Kampus" : "Teknik Informatika");
      const effectiveFacName = selectedProg?.facultyName || faculty.trim() || (role === "admin" ? "Biro Rektorat" : "Fakultas Ilmu Komputer");

      const result = await onSave({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        status,
        faculty: effectiveFacName,
        studyProgram: effectiveProgName,
        studyProgramId,
        password: password.trim() ? password.trim() : undefined,
        studentId: role === "student" ? (studentId.trim() || undefined) : undefined,
        nim: role === "student" ? (studentId.trim() || undefined) : undefined,
        angkatan: role === "student" ? Number(angkatan) : undefined,
        currentSemester: role === "student" ? Number(currentSemester) : undefined,
        uktGroup: role === "student" ? Number(uktGroup) : undefined,
        nidn: role === "lecturer" ? (nidn.trim() || undefined) : undefined,
        position: role === "lecturer" ? position.trim() : undefined,
        expertise: role === "lecturer" ? expertise.trim() : undefined,
      });

      if (result && !result.success) {
        setErrorMsg(result.message || "Gagal menyimpan akun pengguna.");
        setSaving(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kesalahan saat memproses data.");
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="user-form-modal" style={{ maxWidth: "620px" }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-heading-icon" style={{ background: "#e8effe", color: "#193966" }}>
              <UserPlus size={22} />
            </div>

            <h2 style={{ fontSize: "19px", fontWeight: 700, color: "#111827" }}>
              {user ? "Edit Akun Pengguna" : "Buat Akun Login Baru"}
            </h2>

            <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
              {user
                ? "Perbarui informasi profil, role, atau kata sandi pengguna."
                : "Daftarkan akun pengguna baru lengkap dengan password untuk login ke portal."}
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            type="button"
            aria-label="Tutup"
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fee2e2",
              border: "1px solid #f87171",
              borderRadius: "8px",
              color: "#991b1b",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 1. ROLE SELECTION */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "8px",
              }}
            >
              Pilih Peran Akun (Role) *
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setRole("student")}
                style={{
                  padding: "12px 8px",
                  borderRadius: "10px",
                  border: role === "student" ? "2px solid #193966" : "1px solid #e2e8f0",
                  background: role === "student" ? "#f0f5ff" : "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: role === "student" ? "#193966" : "#f1f5f9",
                    color: role === "student" ? "#ffffff" : "#64748b",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <GraduationCap size={18} />
                </div>
                <strong style={{ fontSize: "12px", color: role === "student" ? "#193966" : "#334155" }}>
                  Mahasiswa
                </strong>
                <span style={{ fontSize: "10px", color: "#64748b", textAlign: "center" }}>
                  Akses Tugas & Kuis
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("lecturer")}
                style={{
                  padding: "12px 8px",
                  borderRadius: "10px",
                  border: role === "lecturer" ? "2px solid #0284c7" : "1px solid #e2e8f0",
                  background: role === "lecturer" ? "#f0f9ff" : "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: role === "lecturer" ? "#0284c7" : "#f1f5f9",
                    color: role === "lecturer" ? "#ffffff" : "#64748b",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <BookOpen size={18} />
                </div>
                <strong style={{ fontSize: "12px", color: role === "lecturer" ? "#0284c7" : "#334155" }}>
                  Dosen
                </strong>
                <span style={{ fontSize: "10px", color: "#64748b", textAlign: "center" }}>
                  Kelola Kelas & Nilai
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("admin")}
                style={{
                  padding: "12px 8px",
                  borderRadius: "10px",
                  border: role === "admin" ? "2px solid #7c3aed" : "1px solid #e2e8f0",
                  background: role === "admin" ? "#faf5ff" : "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: role === "admin" ? "#7c3aed" : "#f1f5f9",
                    color: role === "admin" ? "#ffffff" : "#64748b",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
                <strong style={{ fontSize: "12px", color: role === "admin" ? "#7c3aed" : "#334155" }}>
                  Super Admin
                </strong>
                <span style={{ fontSize: "10px", color: "#64748b", textAlign: "center" }}>
                  Kelola Sistem LMS
                </span>
              </button>
            </div>
          </div>

          <div className="user-form-grid">
            {/* Nama Lengkap */}
            <div className="form-field full-width">
              <label htmlFor="user-name">Nama Lengkap *</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <UserIcon size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                <input
                  id="user-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Muhammad Ihsan Pratama"
                  required
                  style={{ paddingLeft: "36px" }}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="form-field full-width">
              <label htmlFor="user-email">
                Alamat Email (Username Login) *
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Mail size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                <input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: ihsan@kampus.ac.id"
                  required
                  style={{ paddingLeft: "36px" }}
                />
              </div>
            </div>

            {/* PASSWORD FIELD WITH SHOW/HIDE */}
            <div className="form-field full-width">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="user-password">
                  Kata Sandi / Password {user ? "(Opsional)" : "*"}
                </label>
                <span style={{ fontSize: "10px", color: "#64748b" }}>
                  {user ? "Kosongkan jika tidak diubah" : "Min. 6 Karakter"}
                </span>
              </div>

              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <KeyRound size={16} style={{ position: "absolute", left: "12px", color: "#94a3b8" }} />
                <input
                  id="user-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={user ? "Ketik sandi baru untuk mengganti..." : "Masukkan sandi login, cth: Kampus123!"}
                  required={!user}
                  style={{ paddingLeft: "36px", paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    padding: "4px",
                  }}
                  title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* STATUS AKUN */}
            <div className="form-field full-width">
              <label htmlFor="user-status">Status Akun</label>
              <select
                id="user-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
              >
                <option value="active">Aktif (Dapat Login & Akses Fitur)</option>
                <option value="inactive">Nonaktif (Akses Login Diblokir)</option>
              </select>
            </div>

            {/* DYNAMIC FIELDS: MAHASISWA */}
            {role === "student" && (
              <>
                <div className="form-field">
                  <label htmlFor="student-id">NIM (Nomor Induk Mahasiswa)</label>
                  <input
                    id="student-id"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="cth: 2026101005 (otomatis jika kosong)"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="student-angkatan">Tahun Angkatan</label>
                  <input
                    id="student-angkatan"
                    type="number"
                    min={2018}
                    max={2030}
                    value={angkatan}
                    onChange={(e) => setAngkatan(Number(e.target.value))}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="student-semester">Semester Saat Ini</label>
                  <select
                    id="student-semester"
                    value={currentSemester}
                    onChange={(e) => setCurrentSemester(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="student-ukt">Golongan UKT</label>
                  <select
                    id="student-ukt"
                    value={uktGroup}
                    onChange={(e) => setUktGroup(Number(e.target.value))}
                  >
                    <option value={1}>Golongan 1 (Rp 500.000)</option>
                    <option value={2}>Golongan 2 (Rp 1.000.000)</option>
                    <option value={3}>Golongan 3 (Rp 2.500.000)</option>
                    <option value={4}>Golongan 4 (Rp 4.000.000)</option>
                    <option value={5}>Golongan 5 (Rp 5.500.000)</option>
                    <option value={6}>Golongan 6 (Rp 7.000.000)</option>
                    <option value={7}>Golongan 7 (Rp 8.500.000)</option>
                    <option value={8}>Golongan 8 (Rp 10.000.000)</option>
                  </select>
                </div>

                <div className="form-field full-width">
                  <label htmlFor="user-program">Program Studi & Fakultas *</label>
                  <select
                    id="user-program"
                    value={studyProgramId}
                    onChange={(e) => handleProgramChange(e.target.value)}
                  >
                    {availablePrograms.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name} ({prog.degree}) — {prog.facultyName || "Fakultas"}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* DYNAMIC FIELDS: DOSEN */}
            {role === "lecturer" && (
              <>
                <div className="form-field">
                  <label htmlFor="lecturer-nidn">NIDN / NIP Dosen</label>
                  <input
                    id="lecturer-nidn"
                    value={nidn}
                    onChange={(e) => setNidn(e.target.value)}
                    placeholder="cth: 0012058001 (otomatis jika kosong)"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="lecturer-position">Jabatan Akademik</label>
                  <select
                    id="lecturer-position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option value="Tenaga Pengajar">Tenaga Pengajar</option>
                    <option value="Asisten Ahli">Asisten Ahli</option>
                    <option value="Lektor">Lektor</option>
                    <option value="Lektor Kepala">Lektor Kepala</option>
                    <option value="Guru Besar">Guru Besar (Profesor)</option>
                  </select>
                </div>

                <div className="form-field full-width">
                  <label htmlFor="lecturer-program">Homebase Program Studi *</label>
                  <select
                    id="lecturer-program"
                    value={studyProgramId}
                    onChange={(e) => handleProgramChange(e.target.value)}
                  >
                    {availablePrograms.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name} ({prog.degree}) — {prog.facultyName || "Fakultas"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field full-width">
                  <label htmlFor="lecturer-expertise">Bidang Keahlian / Kepakaran</label>
                  <input
                    id="lecturer-expertise"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="Contoh: Rekayasa Perangkat Lunak, Kecerdasan Buatan"
                  />
                </div>
              </>
            )}

            {/* DYNAMIC FIELDS: ADMIN */}
            {role === "admin" && (
              <div className="form-field full-width">
                <label htmlFor="admin-unit">Unit / Bagian Administrasi</label>
                <input
                  id="admin-unit"
                  value={studyProgram || "Administrasi Kampus & BAAK"}
                  onChange={(e) => setStudyProgram(e.target.value)}
                  placeholder="Contoh: BAAK / Biro Rektorat / TI Kampus"
                />
              </div>
            )}
          </div>

          {/* Notice Callout */}
          <div
            style={{
              marginTop: "18px",
              padding: "12px 14px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "11px",
              color: "#475569",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <CheckCircle2 size={16} color="#059669" className="flex-shrink-0" style={{ marginTop: "1px" }} />
            <div>
              <strong style={{ color: "#0f172a" }}>Kredensial Langsung Aktif:</strong> Akun ini akan dapat login di halaman{" "}
              <code style={{ background: "#e2e8f0", padding: "1px 5px", borderRadius: "4px" }}>/login</code> menggunakan{" "}
              <strong>Email</strong> dan <strong>Password</strong> di atas. Dashboard dan hak akses akan langsung disesuaikan dengan peran <strong>{role.toUpperCase()}</strong>.
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions" style={{ marginTop: "20px" }}>
            <button
              type="button"
              className="secondary-action"
              onClick={onClose}
              disabled={saving}
            >
              Batal
            </button>

            <button
              type="submit"
              className="primary-action"
              disabled={saving}
              style={{ minWidth: "120px" }}
            >
              {saving ? "Menyimpan..." : user ? "Simpan Perubahan" : "Buat Akun"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
