"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ClipboardCheck,
  Plus,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Trash2,
  Eye,
  X,
  Send,
  Sparkles,
  HelpCircle,
  GraduationCap,
  MessageSquare,
  Award,
  AlertTriangle,
  ArrowRight,
  Download,
  Check,
} from "lucide-react";
import type {
  ApiAssignment,
  ApiSubmission,
  AuthUser,
} from "../../src/models/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface CourseOption {
  id: string;
  code: string;
  name: string;
  sks: number;
  studyProgramId: string;
  studyProgramName: string;
}

export default function AssignmentManager() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [assignments, setAssignments] = useState<ApiAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Lecturer: Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newCourseId, setNewCourseId] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newMaxScore, setNewMaxScore] = useState(100);
  const [newDescription, setNewDescription] = useState("");
  const [newAttachmentLink, setNewAttachmentLink] = useState("");
  const [creating, setCreating] = useState(false);

  // Lecturer: View Submissions Modal State
  const [selectedAsgForSubs, setSelectedAsgForSubs] = useState<ApiAssignment | null>(null);
  const [submissionsList, setSubmissionsList] = useState<ApiSubmission[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [inputScore, setInputScore] = useState<number>(100);
  const [inputFeedback, setInputFeedback] = useState<string>("");
  const [savingGrade, setSavingGrade] = useState(false);

  // Student: Submit Assignment Modal State
  const [selectedAsgForSubmit, setSelectedAsgForSubmit] = useState<ApiAssignment | null>(null);
  const [submitContent, setSubmitContent] = useState("");
  const [submitLink, setSubmitLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load current user
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.user) {
            setUser(json.data.user);
          }
        }
      } catch {
        // Silently handled
      }
    }
    loadUser();
  }, []);

  // Fetch assignments
  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/assignments/mine`, { credentials: "include" });
      const json = await res.json();
      if (res.ok && json.success) {
        setAssignments(json.data || []);
      } else {
        setError(json.message || "Gagal memuat tugas kuliah.");
      }
    } catch {
      setError("Tidak dapat terhubung ke server backend LMS.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Fetch courses list for assignment creation
  const openCreateModal = async () => {
    setIsCreateOpen(true);
    try {
      const res = await fetch(`${API_URL}/assignments/courses`, { credentials: "include" });
      const json = await res.json();
      if (res.ok && json.success) {
        setCourseOptions(json.data || []);
        if (json.data && json.data.length > 0) {
          setNewCourseId(json.data[0].id);
        }
      }
    } catch {
      // Ignore
    }
  };

  // Submit Create Assignment (Lecturer)
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Harap masukkan judul tugas kuliah.");
      return;
    }
    if (!newCourseId) {
      alert("Harap pilih mata kuliah terlebih dahulu.");
      return;
    }
    if (!newDueDate) {
      alert("Harap tentukan batas waktu pengumpulan tugas.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newTitle,
          courseId: newCourseId,
          dueDate: newDueDate,
          maxScore: Number(newMaxScore),
          description: newDescription,
          attachmentLink: newAttachmentLink || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsCreateOpen(false);
        setNewTitle("");
        setNewDueDate("");
        setNewDescription("");
        setNewAttachmentLink("");
        await fetchAssignments();
      } else {
        alert(json.message || "Gagal merilis tugas.");
      }
    } catch {
      alert("Terjadi kendala jaringan saat membuat tugas.");
    } finally {
      setCreating(false);
    }
  };

  // Delete Assignment (Lecturer)
  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini secara permanen?")) return;
    try {
      const res = await fetch(`${API_URL}/assignments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        await fetchAssignments();
      }
    } catch {
      alert("Gagal menghapus tugas.");
    }
  };

  // Lecturer: View Submissions
  const handleViewSubmissions = async (asg: ApiAssignment) => {
    setSelectedAsgForSubs(asg);
    setLoadingSubs(true);
    setSubmissionSearch("");
    setGradingSubId(null);
    try {
      const res = await fetch(`${API_URL}/assignments/${asg.id}/submissions`, {
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSubmissionsList(json.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingSubs(false);
    }
  };

  // Lecturer: Save Grade & Feedback
  const handleSaveGrade = async (subId: string) => {
    setSavingGrade(true);
    try {
      const res = await fetch(`${API_URL}/assignments/submissions/${subId}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          score: Number(inputScore),
          feedback: inputFeedback,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSubmissionsList((prev) =>
          prev.map((s) =>
            s.id === subId ? { ...s, score: Number(inputScore), feedback: inputFeedback } : s
          )
        );
        setGradingSubId(null);
        await fetchAssignments();
      } else {
        alert(json.message || "Gagal menyimpan penilaian tugas.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setSavingGrade(false);
    }
  };

  // Student: Open Submit Modal
  const handleOpenSubmit = (asg: ApiAssignment) => {
    setSelectedAsgForSubmit(asg);
    setSubmitContent(asg.mySubmission?.content || "");
    setSubmitLink(asg.mySubmission?.link || "");
  };

  // Student: Send Submission
  const handleSendSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsgForSubmit) return;
    if (!submitContent.trim()) {
      alert("Harap masukkan penjelasan atau ringkasan tugas Anda.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/assignments/${selectedAsgForSubmit.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: submitContent,
          link: submitLink,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSelectedAsgForSubmit(null);
        await fetchAssignments();
      } else {
        alert(json.message || "Gagal mengumpulkan lembar tugas.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLecturer = user?.role === "lecturer" || user?.role === "admin";
  const isStudent = user?.role === "student";

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      let matchesStatus = true;
      if (isStudent) {
        if (filterStatus === "pending") matchesStatus = !a.mySubmission;
        if (filterStatus === "submitted") matchesStatus = !!a.mySubmission && a.mySubmission.score === null;
        if (filterStatus === "graded") matchesStatus = !!a.mySubmission && a.mySubmission.score !== null;
      }

      const matchesSearch =
        searchQuery === "" ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.courseName && a.courseName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [assignments, filterStatus, searchQuery, isStudent]);

  // Filtered submissions in modal
  const filteredSubmissions = useMemo(() => {
    if (!submissionSearch) return submissionsList;
    const q = submissionSearch.toLowerCase();
    return submissionsList.filter(
      (s) =>
        (s.studentName && s.studentName.toLowerCase().includes(q)) ||
        (s.studentNim && s.studentNim.toLowerCase().includes(q))
    );
  }, [submissionsList, submissionSearch]);

  // Statistics
  const stats = useMemo(() => {
    const total = assignments.length;
    const submitted = assignments.filter((a) => a.mySubmission).length;
    const graded = assignments.filter((a) => a.mySubmission && a.mySubmission.score !== null).length;
    const pending = total - submitted;

    return { total, submitted, graded, pending };
  }, [assignments]);

  // Helper for deadline urgency
  const getDeadlineStatus = (dueDateStr: string) => {
    const now = new Date();
    const due = new Date(dueDateStr);
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return {
        label: "Tenggat Berakhir",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        isUrgent: true,
      };
    }
    if (diffHours <= 24) {
      return {
        label: `Mendesak (${diffHours} jam lagi)`,
        badgeClass: "bg-red-50 text-red-700 border-red-200 animate-pulse",
        isUrgent: true,
      };
    }
    if (diffDays <= 3) {
      return {
        label: `Tersisa ${diffDays} hari`,
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        isUrgent: false,
      };
    }
    return {
      label: due.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      isUrgent: false,
    };
  };

  return (
    <div className="page-container space-y-6">
      {/* Hero Banner Header */}
      <div className="quiz-hero-banner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="quiz-hero-tag">
              <GraduationCap className="w-3.5 h-3.5" />
              Sistem Manajemen Tugas Akademik Terpadu
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isLecturer ? "Kelola Penugasan Perkuliahan" : "Portal Tugas Kuliah & Lembar Pengumpulan"}
            </h1>
            <p className="text-[#dbeafe] text-xs sm:text-sm max-w-xl mt-1.5 opacity-90 leading-relaxed">
              {isLecturer
                ? "Rilis instruksi penugasan semester, tetapkan batas waktu dan rubrik nilai, lalu evaluasi lembar tugas digital mahasiswa Anda."
                : "Akses instruksi penugasan dari dosen pengampu, unggah dokumen tugas atau tautan berkas mandiri sebelum batas tenggat berakhir."}
            </p>
          </div>

          {isLecturer && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#1e40af] hover:from-[#3b82f6] hover:to-[#1d4ed8] shadow-xl shadow-blue-950/25 hover:shadow-2xl hover:shadow-blue-900/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer border border-blue-400/30 tracking-wide flex-shrink-0 self-start md:self-auto"
            >
              <div className="w-6 h-6 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Plus size={16} strokeWidth={3} />
              </div>
              <span>Rilis Tugas Baru</span>
            </button>
          )}
        </div>

        {/* Stats Strip */}
        <div className="quiz-stats-strip">
          <div className="quiz-stat-box">
            <span>Total Penugasan</span>
            <strong>{stats.total}</strong>
          </div>
          {isStudent ? (
            <>
              <div className="quiz-stat-box">
                <span>Sudah Terkumpul</span>
                <strong className="text-emerald-300">{stats.submitted}</strong>
              </div>
              <div className="quiz-stat-box">
                <span>Belum Dikumpulkan</span>
                <strong className="text-amber-200">{stats.pending}</strong>
              </div>
              <div className="quiz-stat-box">
                <span>Telah Dinilai</span>
                <strong className="text-blue-200">{stats.graded}</strong>
              </div>
            </>
          ) : (
            <>
              <div className="quiz-stat-box">
                <span>Program Studi</span>
                <strong className="text-emerald-300">Teknik Informatika</strong>
              </div>
              <div className="quiz-stat-box">
                <span>Tingkat Akses</span>
                <strong className="text-indigo-200">Dosen Pengampu</strong>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Filter Tabs (for student & lecturer) */}
        {isStudent ? (
          <div className="lms-tab-nav w-full lg:w-auto">
            {[
              {
                id: "all",
                label: "Semua Tugas",
                icon: ClipboardCheck,
                count: stats.total,
                badgeClass: "",
              },
              {
                id: "pending",
                label: "Belum Dikumpulkan",
                icon: Clock,
                count: stats.pending,
                badgeClass: stats.pending > 0 ? "badge-urgent" : "",
              },
              {
                id: "submitted",
                label: "Menunggu Penilaian",
                icon: FileText,
                count: Math.max(0, stats.submitted - stats.graded),
                badgeClass: "",
              },
              {
                id: "graded",
                label: "Sudah Dinilai",
                icon: CheckCircle2,
                count: stats.graded,
                badgeClass: "",
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = filterStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`lms-tab-pill ${isActive ? "active" : ""}`}
                >
                  <Icon size={14} className={isActive ? "text-[var(--primary)]" : "text-slate-400"} />
                  <span>{tab.label}</span>
                  <span className={`lms-tab-badge ${tab.badgeClass}`}>{tab.count}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="lms-tab-nav w-full lg:w-auto">
            {[
              { id: "all", label: "Semua Tugas", count: stats.total, icon: ClipboardCheck },
              {
                id: "active",
                label: "Masa Pengumpulan",
                count: assignments.filter((a) => new Date(a.dueDate) >= new Date()).length,
                icon: Clock,
              },
              {
                id: "needs_grading",
                label: "Perlu Dinilai",
                count: assignments.filter((a) => (a.submissionCount || 0) > 0).length,
                icon: Award,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = filterStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`lms-tab-pill ${isActive ? "active" : ""}`}
                >
                  <Icon size={14} className={isActive ? "text-[var(--primary)]" : "text-slate-400"} />
                  <span>{tab.label}</span>
                  <span className="lms-tab-badge">{tab.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search Input using clean flex layout (No overlapping icon and text) */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl w-full lg:w-80 focus-within:ring-2 focus-within:ring-[#234b8c]/20 focus-within:border-[#234b8c] focus-within:bg-white transition flex-shrink-0">
          <Search size={16} className="text-slate-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Cari judul tugas perkuliahan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none p-0 text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Assignments List Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-200 text-center shadow-sm">
          <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-500">Memuat data penugasan perkuliahan...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-2xl text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border-2 border-dashed border-slate-200 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-100">
            <ClipboardCheck className="w-7 h-7 opacity-50" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Tidak Ada Tugas Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            {isLecturer
              ? "Klik tombol 'Rilis Tugas Baru' di atas untuk membagikan tugas terstruktur kepada mahasiswa."
              : "Belum ada penugasan perkuliahan aktif untuk kategori filter ini."}
          </p>
        </div>
      ) : (
        <div className="quiz-grid">
          {filteredAssignments.map((asg) => {
            const hasSub = asg.mySubmission;
            const isGraded = hasSub && hasSub.score !== null;
            const deadlineMeta = getDeadlineStatus(asg.dueDate);

            return (
              <div
                key={asg.id}
                className="lms-card-elevated border-2 border-slate-200 group"
              >
                <div>
                  {/* Card Header with Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-lg text-[10.5px] font-black uppercase tracking-wider bg-blue-50 text-[var(--primary)] border border-blue-200 shadow-2xs">
                      Tugas Perkuliahan
                    </span>

                    {isLecturer ? (
                      <span className="text-xs px-3 py-1 rounded-full font-black bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1.5 shadow-2xs">
                        <Users size={13} className="text-slate-600" />
                        <span>{asg.submissionCount || 0} Terkumpul</span>
                      </span>
                    ) : isGraded ? (
                      <span className="text-xs px-3 py-1 rounded-full font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 size={14} className="text-emerald-700" />
                        <span>Dinilai: {hasSub.score}/{asg.maxScore}</span>
                      </span>
                    ) : hasSub ? (
                      <span className="text-xs px-3 py-1 rounded-full font-black bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1.5 shadow-2xs">
                        <Clock size={13} className="text-blue-700" />
                        <span>Menunggu Penilaian</span>
                      </span>
                    ) : (
                      <span className={`text-xs px-3 py-1 rounded-full font-black border shadow-2xs ${deadlineMeta.badgeClass}`}>
                        {deadlineMeta.label}
                      </span>
                    )}
                  </div>

                  {/* Title & Course */}
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-[var(--primary)] transition line-clamp-2 leading-snug">
                    {asg.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] mt-2 mb-3">
                    <BookOpen size={15} className="text-[var(--primary)] flex-shrink-0" />
                    <span>{asg.courseName}</span>
                    <span className="text-slate-500 font-semibold">· {asg.studyProgramName}</span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                    {asg.description}
                  </p>

                  {/* Attachment link if present */}
                  {asg.attachmentLink && (
                    <div className="mb-4">
                      <a
                        href={asg.attachmentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-blue-800 font-bold bg-blue-50/80 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200 transition"
                      >
                        <ExternalLink size={14} />
                        <span>Buka Materi / Dokumen Tugas</span>
                      </a>
                    </div>
                  )}

                  {/* Meta Strip */}
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 py-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#193966]" />
                      <span>
                        Tenggat:{" "}
                        {new Date(asg.dueDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Award size={14} className="text-amber-600" />
                      <span>Maks: {asg.maxScore} Poin</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-100 mt-2">
                  {isLecturer ? (
                    <div className="flex items-center justify-between w-full">
                      <button
                        onClick={() => handleViewSubmissions(asg)}
                        className="lms-btn-primary !py-2 !px-4 !text-xs font-black"
                      >
                        <Eye size={15} />
                        <span>Periksa Pengumpulan ({asg.submissionCount || 0})</span>
                      </button>

                      <button
                        onClick={() => handleDeleteAssignment(asg.id)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-slate-200"
                        title="Hapus Tugas Perkuliahan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : isGraded ? (
                    <div className="w-full space-y-2.5">
                      <div className="flex items-center justify-between text-xs p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl shadow-2xs">
                        <span className="text-emerald-950 font-extrabold">Perolehan Nilai:</span>
                        <strong className="text-emerald-900 text-base font-black">
                          {hasSub.score} / {asg.maxScore} Poin
                        </strong>
                      </div>
                      {hasSub.feedback && (
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
                          <span className="font-black block mb-1 text-slate-900 flex items-center gap-1.5">
                            <MessageSquare size={14} className="text-[var(--primary)]" />
                            Umpan Balik Dosen:
                          </span>
                          <p className="italic text-slate-700 leading-relaxed font-medium">"{hasSub.feedback}"</p>
                        </div>
                      )}
                    </div>
                  ) : hasSub ? (
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="text-xs text-blue-900 font-extrabold flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>Lembar tugas terkirim</span>
                      </div>
                      <button
                        onClick={() => handleOpenSubmit(asg)}
                        className="lms-btn-secondary !py-2 !px-3.5 !text-xs font-bold"
                      >
                        Perbarui Jawaban
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenSubmit(asg)}
                      className="lms-btn-primary w-full !py-2.5 font-black text-sm"
                    >
                      <Send size={15} />
                      <span>Kumpulkan Tugas Sekarang</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BUAT TUGAS BARU (DOSEN) - MATCHING STUDY MATERIALS STYLE           */}
      {/* ========================================================================= */}
      {isCreateOpen && (
        <div className="modal-backdrop">
          <div className="user-form-modal course-modal">
            <div className="modal-header">
              <div>
                <div className="modal-heading-icon">
                  <ClipboardCheck size={20} />
                </div>
                <h2>Rilis Tugas Perkuliahan Baru</h2>
                <p>Kirimkan penugasan akademik terstruktur untuk kelas yang Anda ampu.</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsCreateOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment}>
              <div className="academic-form-grid">
                <div className="form-field full-width">
                  <label>Judul Penugasan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Tugas 1 Perancangan Basis Data Relasional"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Mata Kuliah Pengampu *</label>
                  <select
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    required
                  >
                    {courseOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} · {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Batas Akhir Pengumpulan (Tenggat) *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>

                <div className="form-field full-width">
                  <label>Bobot Nilai Maksimal</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(Number(e.target.value))}
                  />
                </div>

                <div className="form-field full-width">
                  <label>Instruksi & Rubrik Penilaian *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Petunjuk detail pengerjaan tugas, format dokumen, dan ketentuan penilaian..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>

                <div className="form-field full-width">
                  <label>Tautan Berkas Modul / Dokumen Panduan (Opsional)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... atau tautan berkas panduan"
                    value={newAttachmentLink}
                    onChange={(e) => setNewAttachmentLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" disabled={creating} className="primary-action">
                  {creating ? "Merilis Tugas..." : "Publikasikan Penugasan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PERIKSA PENGUMPULAN & NILAI MAHASISWA (DOSEN) */}
      {/* ========================================================================= */}
      {selectedAsgForSubs && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-up border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#193966] to-[#234b8c] text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-white">
                  Evaluasi Lembar Tugas Mahasiswa
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedAsgForSubs.title}</h3>
                <p className="text-xs text-[#dbeafe] opacity-90">{selectedAsgForSubs.courseName}</p>
              </div>
              <button
                onClick={() => setSelectedAsgForSubs(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter & Subheader */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-xl w-full sm:w-72 focus-within:ring-2 focus-within:ring-[#234b8c]/20 focus-within:border-[#234b8c] transition flex-shrink-0">
                <Search size={15} className="text-slate-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Cari nama mahasiswa / NIM..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none p-0 text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                />
                {submissionSearch && (
                  <button
                    type="button"
                    onClick={() => setSubmissionSearch("")}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-600 font-medium">
                Total Mahasiswa Mengumpulkan: <strong className="text-[var(--primary)]">{submissionsList.length}</strong>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {loadingSubs ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Memuat lembar pengumpulan tugas...
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  Belum ada berkas pengumpulan mahasiswa yang cocok.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{sub.studentName}</h4>
                          <span className="text-xs font-mono text-slate-500">NIM: {sub.studentNim}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">
                            {new Date(sub.submittedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {sub.score !== null ? (
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                              Nilai: {sub.score} / {selectedAsgForSubs.maxScore}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                              Belum Dinilai
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content & Link */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {sub.content}
                      </div>

                      {sub.link && (
                        <div>
                          <a
                            href={sub.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline font-bold bg-blue-50/60 px-3 py-1.5 rounded-lg border border-blue-200/60"
                          >
                            <ExternalLink size={13} />
                            <span>Buka Berkas Tugas Mahasiswa ({sub.link})</span>
                          </a>
                        </div>
                      )}

                      {/* Grading Action Area */}
                      {gradingSubId === sub.id ? (
                        <div className="p-4 bg-[var(--primary-light)] rounded-xl border border-[#c7d9f5] space-y-3 animate-fade-in">
                          <h5 className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5">
                            <Sparkles size={14} /> Form Evaluasi Nilai & Umpan Balik
                          </h5>
                          <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-slate-800">
                              Nilai Skor (0 - {selectedAsgForSubs.maxScore}):
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={selectedAsgForSubs.maxScore}
                              value={inputScore}
                              onChange={(e) => setInputScore(Number(e.target.value))}
                              className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-800 block mb-1">
                              Catatan Evaluasi / Umpan Balik:
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Berikan umpan balik konstruktif untuk mahasiswa..."
                              value={inputFeedback}
                              onChange={(e) => setInputFeedback(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setGradingSubId(null)}
                              className="cbt-btn cbt-btn-secondary !py-1.5 !px-3 !text-xs font-semibold"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveGrade(sub.id)}
                              disabled={savingGrade}
                              className="cbt-btn cbt-btn-primary !py-1.5 !px-4 !text-xs font-bold"
                            >
                              {savingGrade ? "Menyimpan..." : "Kirim Penilaian & Beritahu Mahasiswa"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          {sub.feedback ? (
                            <span className="text-xs text-slate-500 italic">
                              Umpan Balik: "{sub.feedback}"
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Belum ada catatan umpan balik</span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setGradingSubId(sub.id);
                              setInputScore(sub.score || 85);
                              setInputFeedback(sub.feedback || "");
                            }}
                            className="cbt-btn cbt-btn-primary !py-1.5 !px-3.5 !text-xs font-bold"
                          >
                            <Award size={13} />
                            <span>{sub.score !== null ? "Perbarui Nilai" : "Beri Nilai & Umpan Balik"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedAsgForSubs(null)}
                className="cbt-btn cbt-btn-secondary"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: KUMPULKAN TUGAS (MAHASISWA) - MATCHING STUDY MATERIALS STYLE       */}
      {/* ========================================================================= */}
      {selectedAsgForSubmit && (
        <div className="modal-backdrop">
          <div className="user-form-modal course-modal">
            <div className="modal-header">
              <div>
                <div className="modal-heading-icon">
                  <Send size={20} />
                </div>
                <h2>Lembar Pengumpulan Tugas Mahasiswa</h2>
                <p>{selectedAsgForSubmit.title}</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedAsgForSubmit(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendSubmission}>
              <div className="academic-form-grid">
                <div className="form-field full-width">
                  <div style={{ background: "#edf3fc", padding: "14px", borderRadius: "8px", border: "1px solid #c7d9f5" }}>
                    <label style={{ color: "var(--primary)", fontWeight: 700, fontSize: "12px", display: "block", marginBottom: "4px" }}>
                      Petunjuk & Deskripsi Tugas
                    </label>
                    <p style={{ fontSize: "12px", color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                      {selectedAsgForSubmit.description}
                    </p>
                  </div>
                </div>

                <div className="form-field full-width">
                  <label>Teks Jawaban / Rangkuman Tugas *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tuliskan rangkuman hasil pengerjaan, jawaban pokok, atau keterangan berkas tugas Anda..."
                    value={submitContent}
                    onChange={(e) => setSubmitContent(e.target.value)}
                  />
                </div>

                <div className="form-field full-width">
                  <label>Tautan Berkas Tugas (Google Drive / GitHub / OneDrive)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... atau tautan berkas cloud Anda"
                    value={submitLink}
                    onChange={(e) => setSubmitLink(e.target.value)}
                  />
                  <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>
                    Pastikan akses berbagi tautan (share settings) telah diatur ke "Siapa saja yang memiliki tautan" agar dosen dapat memeriksa lembar pengerjaan Anda.
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => setSelectedAsgForSubmit(null)}
                >
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="primary-action">
                  {submitting ? "Mengirimkan Tugas..." : "Kirim Lembar Tugas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
