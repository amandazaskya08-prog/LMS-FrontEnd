"use client";

import { useEffect, useState, useMemo } from "react";
import {
  GraduationCap,
  Users,
  Search,
  BookOpen,
  Mail,
  Phone,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Award,
  X,
  Sparkles,
  LayoutGrid,
  List,
  ShieldCheck,
  RefreshCw,
  Clock,
  ChevronRight,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import type { StudentDirectoryItem, AuthUser } from "../../src/models/types";
import { authFetch } from "../../src/services/api-clients";
import UserFormModal from "../admin/user-form-modal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface StudyProgramMeta {
  id: string;
  name: string;
  code: string;
  degree: string;
  facultyName: string;
  studentCount?: number;
}

export default function StudentDirectoryManager() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [students, setStudents] = useState<StudentDirectoryItem[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgramMeta[]>([]);
  const [currentLecturerProgram, setCurrentLecturerProgram] = useState<StudyProgramMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [selectedProgramId, setSelectedProgramId] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [adviseeOnly, setAdviseeOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Detail Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentDirectoryItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);

  const handleCreateUserAccount = async (data: any) => {
    try {
      const res = await authFetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, message: json.message || "Gagal membuat akun" };
      }
      await fetchStudents();
      setAddUserModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || "Gagal menghubungi server" };
    }
  };

  // Fetch current user
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`${API_URL}/auth/me`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setUser(json.data.user);
          }
        }
      } catch {
        // Silently handled
      }
    })();
  }, []);

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_URL}/students`;
      if (user?.role === "admin" && selectedProgramId !== "all") {
        url += `?studyProgramId=${encodeURIComponent(selectedProgramId)}`;
      }
      const res = await authFetch(url);
      if (!res.ok) {
        throw new Error("Gagal memuat direktori mahasiswa.");
      }
      const json = await res.json();
      if (json.success && json.data) {
        setStudents(json.data.students || []);
        if (json.data.studyPrograms) {
          setStudyPrograms(json.data.studyPrograms);
        }
        if (json.data.studyProgram) {
          setCurrentLecturerProgram(json.data.studyProgram);
        }
      } else {
        throw new Error(json.message || "Gagal mengambil data mahasiswa.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user, selectedProgramId]);

  // Handle student status toggle (Aktif / Cuti)
  const handleToggleStatus = async (student: StudentDirectoryItem) => {
    const nextStatus = student.status.toLowerCase() === "aktif" ? "Cuti" : "Aktif";
    setUpdatingId(student.id);
    try {
      const res = await authFetch(`${API_URL}/students/${student.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, status: nextStatus } : s))
        );
        if (selectedStudent?.id === student.id) {
          setSelectedStudent((prev) => (prev ? { ...prev, status: nextStatus } : null));
        }
      }
    } catch {
      // Ignore
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (semesterFilter !== "all" && s.currentSemester.toString() !== semesterFilter) {
        return false;
      }
      if (statusFilter !== "all" && s.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (adviseeOnly && !s.isAdvisee) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.nim.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, semesterFilter, statusFilter, adviseeOnly, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status.toLowerCase() === "aktif").length;
    const cuti = students.filter((s) => s.status.toLowerCase() === "cuti").length;
    const advisees = students.filter((s) => s.isAdvisee).length;
    const avgGpa =
      total > 0
        ? (students.reduce((acc, s) => acc + (s.gpa || 3.5), 0) / total).toFixed(2)
        : "3.50";
    return { total, active, cuti, advisees, avgGpa };
  }, [students]);

  const isLecturer = user?.role === "lecturer";
  const isAdmin = user?.role === "admin";

  return (
    <div className="page-container space-y-6">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER: MATCHING ASSIGNMENTS & QUIZZES ULTRA-PREMIUM STYLE */}
      {/* ========================================================================= */}
      <div className="quiz-hero-banner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="quiz-hero-tag">
              <GraduationCap className="w-3.5 h-3.5" />
              {isLecturer
                ? `Program Studi ${currentLecturerProgram?.name || "Akademik"}`
                : "Sistem Informasi Manajemen Mahasiswa Terpadu"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isLecturer ? "Direktori Mahasiswa Program Studi" : "Direktori Seluruh Mahasiswa Kampus"}
            </h1>
            <p className="text-[#dbeafe] text-xs sm:text-sm max-w-xl mt-1.5 opacity-90 leading-relaxed font-medium">
              {isLecturer
                ? `Pantau perkembangan akademik, status registrasi, IPK, dan data mahasiswa di bawah naungan Program Studi ${currentLecturerProgram?.name || "Anda"}.`
                : "Akses dan kelola seluruh basis data mahasiswa aktif, distribusi per Program Studi, serta bimbingan akademik dosen."}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-auto">
            <button
              onClick={fetchStudents}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs bg-white text-[#193966] hover:bg-slate-50 transition shadow-lg hover:shadow-xl cursor-pointer"
              title="Perbarui Data Mahasiswa"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-[#193966]" : "text-[#193966]"} />
              <span>Segarkan Data</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setAddUserModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-lg hover:shadow-xl cursor-pointer"
                title="Tambah Akun Login Mahasiswa Baru"
              >
                <UserPlus size={15} />
                <span>Tambah Akun Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="quiz-stats-strip">
          <div className="quiz-stat-box">
            <span>Total Mahasiswa</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="quiz-stat-box">
            <span>Mahasiswa Aktif</span>
            <strong className="text-emerald-300">{stats.active}</strong>
          </div>
          {isLecturer ? (
            <div className="quiz-stat-box">
              <span>Bimbingan Anda (PA)</span>
              <strong className="text-amber-200">{stats.advisees}</strong>
            </div>
          ) : (
            <div className="quiz-stat-box">
              <span>Status Cuti</span>
              <strong className="text-rose-200">{stats.cuti}</strong>
            </div>
          )}
          <div className="quiz-stat-box">
            <span>Rata-rata IPK</span>
            <strong className="text-blue-200">★ {stats.avgGpa}</strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ADMIN CATEGORIZER: PROGRAM STUDI SELECTOR TABS */}
      {/* ========================================================================= */}
      {isAdmin && studyPrograms.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={15} className="text-[#234b8c]" />
              Kategorisasi Program Studi Mahasiswa
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Total {studyPrograms.length} Program Studi
            </span>
          </div>

          <div className="lms-tab-nav w-full">
            <button
              onClick={() => setSelectedProgramId("all")}
              className={`lms-tab-pill ${selectedProgramId === "all" ? "active" : ""}`}
            >
              <Users size={14} className={selectedProgramId === "all" ? "text-[var(--primary)]" : "text-slate-400"} />
              <span>Semua Program Studi</span>
              <span className="lms-tab-badge">{students.length}</span>
            </button>

            {studyPrograms.map((prog) => {
              const isActive = selectedProgramId === prog.id;
              return (
                <button
                  key={prog.id}
                  onClick={() => setSelectedProgramId(prog.id)}
                  className={`lms-tab-pill ${isActive ? "active" : ""}`}
                >
                  <BookOpen size={14} className={isActive ? "text-[var(--primary)]" : "text-slate-400"} />
                  <span>{prog.name} ({prog.degree})</span>
                  {prog.studentCount !== undefined && (
                    <span className="lms-tab-badge">{prog.studentCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONTROL BAR: SUB-MENU TABS, SEARCH & FILTERS (ZERO OVERLAP FLEX) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col gap-4">
        {/* Top Filter Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Sub Menu Quick Filters */}
          <div className="lms-tab-nav w-full lg:w-auto">
            <button
              onClick={() => {
                setAdviseeOnly(false);
                setSemesterFilter("all");
                setStatusFilter("all");
              }}
              className={`lms-tab-pill ${!adviseeOnly && semesterFilter === "all" && statusFilter === "all" ? "active" : ""}`}
            >
              <Users size={14} />
              <span>Semua Mahasiswa</span>
              <span className="lms-tab-badge">{students.length}</span>
            </button>

            {isLecturer && (
              <button
                onClick={() => setAdviseeOnly(!adviseeOnly)}
                className={`lms-tab-pill ${adviseeOnly ? "active" : ""}`}
              >
                <UserCheck size={14} className={adviseeOnly ? "text-[#234b8c]" : "text-slate-400"} />
                <span>Bimbingan Saya (PA)</span>
                <span className="lms-tab-badge">{stats.advisees}</span>
              </button>
            )}

            <button
              onClick={() => setStatusFilter(statusFilter === "Aktif" ? "all" : "Aktif")}
              className={`lms-tab-pill ${statusFilter === "Aktif" ? "active" : ""}`}
            >
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Aktif</span>
              <span className="lms-tab-badge">{stats.active}</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === "Cuti" ? "all" : "Cuti")}
              className={`lms-tab-pill ${statusFilter === "Cuti" ? "active" : ""}`}
            >
              <Clock size={14} className="text-rose-500" />
              <span>Cuti</span>
              <span className="lms-tab-badge">{stats.cuti}</span>
            </button>
          </div>

          {/* Search Box & View Mode Toggle */}
          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
            {/* Flex Search Layout (Zero overlap) */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl w-full sm:w-80 focus-within:ring-2 focus-within:ring-[#234b8c]/20 focus-within:border-[#234b8c] focus-within:bg-white transition flex-shrink-0">
              <Search size={16} className="text-slate-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cari nama, NIM, atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none p-0 text-xs font-semibold text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-300 rounded-xl p-1 bg-slate-50 flex-shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid" ? "bg-white text-[#234b8c] shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
                title="Tampilan Grid Kartu"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "table" ? "bg-white text-[#234b8c] shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
                title="Tampilan Tabel Rinci"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sub-bar Semester Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex-shrink-0">
            Filter Semester:
          </span>
          {["all", "1", "3", "5", "7"].map((sem) => (
            <button
              key={sem}
              onClick={() => setSemesterFilter(sem)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                semesterFilter === sem
                  ? "bg-[#234b8c] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {sem === "all" ? "Semua Semester" : `Semester ${sem}`}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT: STUDENT LIST (IDENTICAL TO QUIZ & ASSIGNMENT CARDS) */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-200 text-center shadow-sm">
          <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-500">Memuat direktori mahasiswa program studi...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-2xl text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border-2 border-dashed border-slate-200 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-100">
            <Users className="w-7 h-7 opacity-50" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Tidak Ada Mahasiswa Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            Tidak ada data mahasiswa yang cocok dengan kriteria filter atau pencarian Anda.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSemesterFilter("all");
              setStatusFilter("all");
              setAdviseeOnly(false);
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === "grid" ? (
        // ================= GRID VIEW (MATCHES QUIZ & ASSIGNMENT CARDS) =================
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((s) => {
            const isAktif = s.status.toLowerCase() === "aktif";
            return (
              <div
                key={s.id}
                className="lms-card-elevated border-2 border-slate-200 group"
              >
                <div>
                  {/* Card Header with Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-lg text-[10.5px] font-black uppercase tracking-wider bg-blue-50 text-[var(--primary)] border border-blue-200 shadow-2xs">
                      {s.studyProgramName}
                    </span>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-black border shadow-2xs ${
                        isAktif
                          ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                          : "bg-rose-100 text-rose-950 border-rose-300"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  {/* Student Name as Main Title */}
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-[var(--primary)] transition line-clamp-1 leading-snug">
                    {s.name}
                  </h3>

                  {/* NIM & Angkatan Subtitle */}
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] mt-2 mb-3">
                    <GraduationCap className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                    <span className="font-mono">NIM: {s.nim}</span>
                    <span className="text-slate-500 font-semibold">· Angkatan {s.angkatan}</span>
                  </div>

                  {/* Advisee Highlight or Advisor Name */}
                  {s.isAdvisee ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50/90 border border-blue-200 text-xs font-extrabold text-[#193966] mb-4">
                      <ShieldCheck size={15} className="text-blue-600 flex-shrink-0" />
                      <span>Mahasiswa Bimbingan Akademik Anda (PA)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600 mb-4">
                      <Users size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">Dosen PA: <strong>{s.advisorName || "Belum Ditentukan"}</strong></span>
                    </div>
                  )}

                  {/* Meta Strip */}
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 py-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#193966]" />
                      <span>Semester {s.currentSemester}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-amber-950 font-black">
                      <Award size={14} className="text-amber-600" />
                      <span>IPK {s.gpa?.toFixed(2) || "3.50"}</span>
                    </div>

                    <div className="text-slate-600 font-semibold">
                      <span>UKT Gol. {s.uktGroup}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStudent(s)}
                    className="lms-btn-primary flex-1 !py-2 !text-xs font-black"
                  >
                    <span>Lihat Profil Lengkap</span>
                  </button>

                  {(isAdmin || isLecturer) && (
                    <button
                      onClick={() => handleToggleStatus(s)}
                      disabled={updatingId === s.id}
                      className="lms-btn-secondary !py-2 !px-3 !text-xs font-bold"
                      title={isAktif ? "Ubah status ke Cuti" : "Aktifkan kembali mahasiswa"}
                    >
                      {updatingId === s.id
                        ? "..."
                        : isAktif
                        ? "Set Cuti"
                        : "Aktifkan"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // ================= TABLE VIEW =================
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-600 tracking-wider">
                  <th className="py-3.5 px-4">Mahasiswa</th>
                  <th className="py-3.5 px-4">Program Studi</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Dosen PA</th>
                  <th className="py-3.5 px-4">IPK</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((s) => {
                  const isAktif = s.status.toLowerCase() === "aktif";
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#234b8c] text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                            {s.name[0]}
                          </div>
                          <div>
                            <strong className="block font-black text-slate-900">{s.name}</strong>
                            <span className="text-[11px] text-slate-500 font-mono">NIM: {s.nim}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">{s.studyProgramName}</span>
                        <span className="block text-[10px] text-slate-500">{s.facultyName}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        Semester {s.currentSemester} ({s.angkatan})
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${s.isAdvisee ? "text-[#234b8c] font-black" : "text-slate-700"}`}>
                          {s.advisorName}
                        </span>
                        {s.isAdvisee && (
                          <span className="block text-[9.5px] font-black text-blue-700">★ Bimbingan PA</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {s.gpa?.toFixed(2) || "3.50"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            isAktif
                              ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                              : "bg-rose-100 text-rose-950 border-rose-300"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition cursor-pointer"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. STUDENT PROFILE DETAIL MODAL (MATCHING STUDY MATERIALS STYLE)           */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div className="modal-backdrop">
          <div className="user-form-modal course-modal">
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <div className="modal-heading-icon">
                  <GraduationCap size={20} />
                </div>
                <h2>Biodata & Status Akademik Mahasiswa</h2>
                <p>Informasi resmi mahasiswa terdaftar pada pangkalan data institusi.</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedStudent(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Profile Card Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--border)" }}>
                <div style={{ width: "54px", height: "54px", borderRadius: "12px", background: "var(--primary)", color: "white", display: "grid", placeItems: "center", fontSize: "18px", fontWeight: 800, flexShrink: 0 }}>
                  {selectedStudent.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text)", margin: 0 }}>
                      {selectedStudent.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: "20px",
                        background: selectedStudent.status.toLowerCase() === "aktif" ? "#ecfdf5" : "#fef2f2",
                        color: selectedStudent.status.toLowerCase() === "aktif" ? "#166534" : "#991b1b",
                        border: selectedStudent.status.toLowerCase() === "aktif" ? "1px solid #bbf7d0" : "1px solid #fecaca"
                      }}
                    >
                      {selectedStudent.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", fontFamily: "monospace" }}>
                      NIM: {selectedStudent.nim}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>· Angkatan {selectedStudent.angkatan}</span>
                  </div>
                </div>
              </div>

              {/* Data Grid: 6 Aesthetic Metric Cards */}
              <div className="academic-form-grid">
                <div className="form-field">
                  <label>Program Studi</label>
                  <input readOnly value={selectedStudent.studyProgramName} style={{ fontWeight: 700, color: "var(--text)" }} />
                </div>

                <div className="form-field">
                  <label>Fakultas</label>
                  <input readOnly value={selectedStudent.facultyName} style={{ fontWeight: 700, color: "var(--text)" }} />
                </div>

                <div className="form-field">
                  <label>Semester Berjalan</label>
                  <input readOnly value={`Semester ${selectedStudent.currentSemester}`} style={{ fontWeight: 700, color: "var(--text)" }} />
                </div>

                <div className="form-field">
                  <label>Tahun Angkatan</label>
                  <input readOnly value={`Tahun ${selectedStudent.angkatan}`} style={{ fontWeight: 700, color: "var(--text)" }} />
                </div>

                <div className="form-field">
                  <label>Indeks Prestasi Kumulatif (IPK)</label>
                  <input readOnly value={`★ ${selectedStudent.gpa?.toFixed(2) || "3.50"} / 4.00`} style={{ fontWeight: 800, color: "#15803d" }} />
                </div>

                <div className="form-field">
                  <label>Kelompok Tagihan UKT</label>
                  <input readOnly value={`Golongan ${selectedStudent.uktGroup}`} style={{ fontWeight: 700, color: "var(--text)" }} />
                </div>

                <div className="form-field full-width">
                  <div style={{ background: "#edf3fc", padding: "14px", borderRadius: "8px", border: "1px solid #c7d9f5", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Dosen Pembimbing Akademik:</span>
                      <strong style={{ fontSize: "12px", color: "var(--primary)" }}>{selectedStudent.advisorName}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #dbeafe", paddingTop: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Email Resmi:</span>
                      <a href={`mailto:${selectedStudent.email}`} style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700, textDecoration: "underline" }}>{selectedStudent.email}</a>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #dbeafe", paddingTop: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Kontak WhatsApp:</span>
                      <span style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: 700 }}>{selectedStudent.phone || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-actions" style={{ marginTop: "10px" }}>
                {(isAdmin || isLecturer) && (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedStudent)}
                    disabled={updatingId === selectedStudent.id}
                    className="secondary-action"
                  >
                    {updatingId === selectedStudent.id
                      ? "Menyimpan..."
                      : selectedStudent.status.toLowerCase() === "aktif"
                      ? "Ubah Status ke Cuti"
                      : "Aktifkan Status Mahasiswa"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="primary-action"
                >
                  Tutup Biodata
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* CREATE USER / STUDENT ACCOUNT MODAL */}
      {addUserModalOpen && (
        <UserFormModal
          user={null}
          initialRole="student"
          onClose={() => setAddUserModalOpen(false)}
          onSave={handleCreateUserAccount}
        />
      )}
    </div>
  );
}
