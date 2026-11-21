"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Users,
  Search,
  Trash2,
  Edit3,
  X,
  Sparkles,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  LayoutGrid,
  Info,
  Building2,
  CreditCard,
  Coffee,
  ArrowRight,
  Tag,
  Check,
  Award,
} from "lucide-react";
import type { ApiCalendarEvent, AuthUser } from "../../src/models/types";
import { authFetch } from "../../src/services/api-clients";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_LABELS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function CalendarManager() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [events, setEvents] = useState<ApiCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state: 'timeline' or 'month'
  const [viewMode, setViewMode] = useState<"timeline" | "month">("timeline");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Month navigation for Month View
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Modal: Create or Edit Event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("Perkuliahan");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formSemesterId, setFormSemesterId] = useState("sem-1");
  const [saving, setSaving] = useState(false);

  // Load current user
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await authFetch(`${API_URL}/auth/me`);
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

  // Fetch calendar events
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_URL}/calendar`);
      const json = await res.json();
      if (res.ok && json.success) {
        setEvents(json.data || []);
      } else {
        setError(json.message || "Gagal memuat agenda kalender akademik.");
      }
    } catch {
      setError("Tidak dapat terhubung ke server kalender akademik.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const isAuthorized = user?.role === "admin" || user?.role === "lecturer";

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingEventId(null);
    setFormTitle("");
    setFormDescription("");
    setFormCategory("Perkuliahan");
    const todayIso = new Date().toISOString().slice(0, 10);
    setFormStartDate(todayIso);
    setFormEndDate(todayIso);
    setFormSemesterId("sem-1");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (ev: ApiCalendarEvent) => {
    setEditingEventId(ev.id);
    setFormTitle(ev.title);
    setFormDescription(ev.description);
    setFormCategory(ev.category);
    setFormStartDate(ev.startDate);
    setFormEndDate(ev.endDate);
    setFormSemesterId(ev.semesterId || "sem-1");
    setIsModalOpen(true);
  };

  // Save Event (Create or Update)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formStartDate) {
      alert("Harap lengkapi judul agenda dan tanggal pelaksanaan.");
      return;
    }

    setSaving(true);
    try {
      const url = editingEventId
        ? `${API_URL}/calendar/${editingEventId}`
        : `${API_URL}/calendar`;
      const method = editingEventId ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          category: formCategory,
          startDate: formStartDate,
          endDate: formEndDate || formStartDate,
          semesterId: formSemesterId,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsModalOpen(false);
        await fetchEvents();
      } else {
        alert(json.message || "Gagal menyimpan agenda akademik.");
      }
    } catch {
      alert("Terjadi kendala jaringan saat menyimpan agenda.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Hapus agenda akademik "${title}" secara permanen?`)) return;
    try {
      const res = await authFetch(`${API_URL}/calendar/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchEvents();
      } else {
        alert("Gagal menghapus agenda kegiatan.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesCat =
        categoryFilter === "all" ||
        ev.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [events, categoryFilter, searchQuery]);

  const formatIndonesianDate = (dStr: string) => {
    try {
      return new Date(dStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dStr;
    }
  };

  // Category badge & color helper with high-contrast text
  const getCategoryMeta = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "krs":
        return {
          label: "KRS & Registrasi",
          badgeClass: "cal-badge-krs",
          pillDot: "bg-blue-600",
        };
      case "perkuliahan":
        return {
          label: "Perkuliahan Aktif",
          badgeClass: "cal-badge-kuliah",
          pillDot: "bg-emerald-600",
        };
      case "ujian":
        return {
          label: "Pekan Ujian (UTS/UAS)",
          badgeClass: "cal-badge-ujian",
          pillDot: "bg-rose-600",
        };
      case "ukt":
        return {
          label: "Administrasi UKT",
          badgeClass: "cal-badge-ukt",
          pillDot: "bg-amber-600",
        };
      case "libur":
        return {
          label: "Libur Akademik",
          badgeClass: "cal-badge-libur",
          pillDot: "bg-purple-600",
        };
      case "yudisium":
        return {
          label: "Yudisium & Wisuda",
          badgeClass: "cal-badge-yudisium",
          pillDot: "bg-cyan-600",
        };
      default:
        return {
          label: cat,
          badgeClass: "bg-slate-100 text-slate-800 border border-slate-300 font-bold",
          pillDot: "bg-slate-600",
        };
    }
  };

  // Calculate timing status with solid contrast
  const getTimingStatus = (startDateStr: string, endDateStr: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (today > endDateStr) {
      return {
        label: "Telah Selesai",
        className: "bg-slate-100 text-slate-700 border border-slate-300 font-bold",
      };
    }
    if (today >= startDateStr && today <= endDateStr) {
      return {
        label: "Sedang Berlangsung",
        className: "bg-emerald-100 text-emerald-900 border border-emerald-400 font-extrabold shadow-xs",
        isLive: true,
      };
    }

    const diffMs = new Date(startDateStr).getTime() - new Date(today).getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return {
      label: `Tersisa ${diffDays} Hari Lagi`,
      className: "bg-blue-50 text-blue-800 border border-blue-300 font-bold",
      isLive: false,
    };
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar Month Grid Generator
  const monthGridDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        isoString: "",
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      const isoString = `${currentYear}-${monthStr}-${dayStr}`;
      days.push({
        date: d,
        isCurrentMonth: true,
        isoString,
      });
    }

    // Next month padding
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        isoString: "",
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="page-container space-y-6">
      {/* Hero Banner Header */}
      <div className="cal-hero-banner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="quiz-hero-tag">
              <CalendarDays className="w-3.5 h-3.5" />
              Sistem Kalender Akademik & Agenda Perkuliahan Resmi
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              Kalender Akademik Semester Ganjil 2026/2027
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl mt-2 leading-relaxed font-medium">
              Panduan agenda resmi institusi: jadwal pengisian KRS, masa perkuliahan aktif, batas pembayaran UKT, pekan ujian (UTS/UAS), serta pengumuman hasil yudisium.
            </p>
          </div>

          {isAuthorized && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 shadow-xl shadow-emerald-950/20 hover:shadow-2xl hover:shadow-emerald-900/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer border border-emerald-400/30 tracking-wide flex-shrink-0 self-start md:self-auto"
            >
              <div className="w-6 h-6 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Plus size={16} strokeWidth={3} />
              </div>
              <span>Tambah Agenda Baru</span>
            </button>
          )}
        </div>

        {/* Quick Stats Strip with high contrast numbers */}
        <div className="quiz-stats-strip mt-6 pt-5 border-t border-white/20">
          <div className="quiz-stat-box">
            <span className="text-blue-200 font-semibold text-xs">Total Agenda Terdaftar</span>
            <strong className="text-white text-2xl font-black">{events.length}</strong>
          </div>
          <div className="quiz-stat-box">
            <span className="text-blue-200 font-semibold text-xs">Agenda Mendatang</span>
            <strong className="text-emerald-300 text-2xl font-black">
              {events.filter((e) => e.endDate >= todayIso).length}
            </strong>
          </div>
          <div className="quiz-stat-box">
            <span className="text-blue-200 font-semibold text-xs">Kategori Kegiatan</span>
            <strong className="text-white text-2xl font-black">6 Bidang</strong>
          </div>
          <div className="quiz-stat-box">
            <span className="text-blue-200 font-semibold text-xs">Tingkat Otoritas</span>
            <strong className="text-indigo-200 text-base font-extrabold">
              {user?.role === "admin"
                ? "Administrator Kampus"
                : user?.role === "lecturer"
                ? "Dosen Pengampu"
                : "Mahasiswa Aktif"}
            </strong>
          </div>
        </div>
      </div>

      {/* Control Bar: Sub-menu tabs, View Toggle & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col gap-4">
        {/* Top Control Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* View Mode Toggle with rich active styles */}
          <div className="lms-tab-nav w-full lg:w-auto">
            <button
              onClick={() => setViewMode("timeline")}
              className={`lms-tab-pill ${viewMode === "timeline" ? "active" : ""}`}
            >
              <ListOrdered size={15} className={viewMode === "timeline" ? "text-[var(--primary)]" : "text-slate-500"} />
              <span className="font-extrabold">Garis Waktu (Milestones)</span>
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`lms-tab-pill ${viewMode === "month" ? "active" : ""}`}
            >
              <LayoutGrid size={15} className={viewMode === "month" ? "text-[var(--primary)]" : "text-slate-500"} />
              <span className="font-extrabold">Kalender Bulanan</span>
            </button>
          </div>

          {/* Search Input - Clean Flex Container with No Overlap */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl w-full lg:w-80 focus-within:ring-2 focus-within:ring-[#234b8c]/20 focus-within:border-[#234b8c] focus-within:bg-white transition flex-shrink-0">
            <Search size={16} className="text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari agenda kegiatan atau ujian..."
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
        </div>

        {/* Sub-menu Category Filter Pills with high-contrast text */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
          {[
            { id: "all", label: "Semua Kategori", count: events.length },
            {
              id: "krs",
              label: "KRS & Registrasi",
              count: events.filter((e) => e.category.toLowerCase() === "krs").length,
            },
            {
              id: "perkuliahan",
              label: "Perkuliahan",
              count: events.filter((e) => e.category.toLowerCase() === "perkuliahan").length,
            },
            {
              id: "ujian",
              label: "Pekan Ujian (UTS/UAS)",
              count: events.filter((e) => e.category.toLowerCase() === "ujian").length,
            },
            {
              id: "ukt",
              label: "Administrasi UKT",
              count: events.filter((e) => e.category.toLowerCase() === "ukt").length,
            },
            {
              id: "libur",
              label: "Libur Akademik",
              count: events.filter((e) => e.category.toLowerCase() === "libur").length,
            },
            {
              id: "yudisium",
              label: "Yudisium & Wisuda",
              count: events.filter((e) => e.category.toLowerCase() === "yudisium").length,
            },
          ].map((cat) => {
            const isActive = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? "bg-[#193966] text-white border-[#193966] shadow-sm"
                    : "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10.5px] px-2 py-0.2 rounded-full font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-white text-slate-800 border border-slate-300"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center shadow-sm">
          <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Memuat data agenda kalender akademik...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 p-5 rounded-2xl text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border-2 border-dashed border-slate-300 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3 border border-slate-200">
            <CalendarDays className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Tidak Ada Agenda Ditemukan</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed font-medium">
            {isAuthorized
              ? "Klik tombol 'Tambah Agenda Akademik' di atas untuk mempublikasikan jadwal perkuliahan atau evaluasi ujian baru."
              : "Belum ada agenda akademik yang terdaftar pada filter kategori ini."}
          </p>
        </div>
      ) : viewMode === "timeline" ? (
        // ================= VIEW 1: TIMELINE MILESTONES (CRISP, LEGIBLE, HIGH CONTRAST) =================
        <div className="space-y-4">
          {filteredEvents.map((ev) => {
            const meta = getCategoryMeta(ev.category);
            const timing = getTimingStatus(ev.startDate, ev.endDate);

            return (
              <div
                key={ev.id}
                className="cal-milestone-card flex flex-col md:flex-row md:items-center justify-between gap-6 group"
              >
                {/* Left side: Date Badge & Details */}
                <div className="flex items-start gap-5 flex-1 min-w-0">
                  {/* Visual Date Box with crisp contrast */}
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col items-center justify-center flex-shrink-0 shadow-xs group-hover:border-blue-300 group-hover:bg-blue-50/50 transition">
                    <span className="text-[11px] uppercase font-black text-slate-700 tracking-wider">
                      {new Date(ev.startDate).toLocaleDateString("id-ID", { month: "short" })}
                    </span>
                    <span className="text-2xl font-black text-[#193966] leading-none mt-1">
                      {new Date(ev.startDate).getDate()}
                    </span>
                  </div>

                  {/* Main Event Information */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`text-[11px] px-3 py-1 rounded-full ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                      <span className={`text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 ${timing.className}`}>
                        {timing.isLive && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
                        )}
                        <span>{timing.label}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 group-hover:text-[var(--primary)] transition tracking-tight">
                      {ev.title}
                    </h3>

                    <p className="text-sm text-slate-700 leading-relaxed max-w-3xl font-medium">
                      {ev.description}
                    </p>

                    <div className="flex items-center gap-5 text-xs pt-1.5 font-bold flex-wrap">
                      <div className="flex items-center gap-2 text-slate-800 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                        <CalendarIcon size={14} className="text-[#193966]" />
                        <span>
                          {ev.startDate === ev.endDate
                            ? new Date(ev.startDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : `${new Date(ev.startDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })} s/d ${new Date(ev.endDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}`}
                        </span>
                      </div>

                      {ev.authorName && (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Building2 size={14} className="text-slate-500" />
                          <span>Penyelenggara: <strong className="text-slate-900">{ev.authorName}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Actions for Admin & Lecturer */}
                {isAuthorized && (
                  <div className="flex items-center gap-2 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleOpenEdit(ev)}
                      className="p-2.5 text-slate-700 hover:text-[var(--primary)] hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200"
                      title="Edit Agenda Akademik"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev.id, ev.title)}
                      className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-slate-200"
                      title="Hapus Agenda"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // ================= VIEW 2: MONTH GRID VIEW (SUPER CLEAR, BOLD, READABLE) =================
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-5">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <span className="text-xs bg-blue-100 text-blue-900 px-3 py-1 rounded-full font-black border border-blue-300">
                Semester Ganjil 2026/2027
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 transition cursor-pointer font-bold"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => {
                  setCurrentMonth(new Date().getMonth());
                  setCurrentYear(new Date().getFullYear());
                }}
                className="px-4 py-2 text-xs font-black border border-slate-300 hover:bg-slate-100 text-slate-900 rounded-xl transition cursor-pointer bg-white"
              >
                Hari Ini
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 transition cursor-pointer font-bold"
                title="Bulan Berikutnya"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-800 py-3 bg-slate-100/90 rounded-2xl border border-slate-200">
            {DAY_LABELS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="cal-month-grid">
            {monthGridDays.map((d, idx) => {
              const isToday = d.isoString === todayIso;
              // Find events on this day
              const dayEvents = d.isCurrentMonth
                ? events.filter(
                    (e) => d.isoString >= e.startDate && d.isoString <= e.endDate
                  )
                : [];

              return (
                <div
                  key={idx}
                  className={`cal-day-cell min-h-[115px] p-2.5 border-2 ${
                    !d.isCurrentMonth ? "bg-slate-50 opacity-40 border-slate-100" : "bg-white border-slate-200"
                  } ${isToday ? "!border-[var(--primary)] !bg-blue-50/30 shadow-md ring-2 ring-[var(--primary)]/20" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-black ${
                        isToday
                          ? "w-7 h-7 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-black shadow-xs"
                          : "text-slate-900"
                      }`}
                    >
                      {d.date}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shadow-xs" />
                    )}
                  </div>

                  {/* Day Events Mini Pills with clear bold text */}
                  <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-none">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const meta = getCategoryMeta(ev.category);
                      return (
                        <div
                          key={ev.id}
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-black truncate border ${meta.badgeClass} shadow-2xs`}
                          title={`${ev.title} (${ev.category})`}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-slate-700 font-extrabold px-1">
                        +{dayEvents.length - 2} agenda lainnya
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT AGENDA AKADEMIK (MATCHING STUDY MATERIALS STYLE)     */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="user-form-modal course-modal">
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <div className="modal-heading-icon">
                  <CalendarDays size={20} />
                </div>
                <h2>
                  {editingEventId ? "Perbarui Agenda Akademik" : "Tambah Agenda Akademik Baru"}
                </h2>
                <p>
                  Jadwal resmi kalender perkuliahan dan timeline institusi semester aktif.
                </p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent}>
              <div className="academic-form-grid">
                <div className="form-field full-width">
                  <label>Nama Kegiatan / Agenda Akademik *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ujian Tengah Semester (UTS) Semester Ganjil"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Kategori Agenda *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="KRS">KRS & Registrasi Rencana Studi</option>
                    <option value="Perkuliahan">Perkuliahan Aktif Tatap Muka</option>
                    <option value="Ujian">Pekan Ujian (UTS / UAS)</option>
                    <option value="UKT">Keuangan & Pembayaran UKT</option>
                    <option value="Libur">Libur Resmi & Cuti Bersama</option>
                    <option value="Yudisium">Yudisium, KHS, & Wisuda</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Semester Berlaku</label>
                  <select
                    value={formSemesterId}
                    onChange={(e) => setFormSemesterId(e.target.value)}
                  >
                    <option value="sem-1">Semester Ganjil 2026/2027</option>
                    <option value="sem-2">Semester Genap 2026/2027</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Tanggal Mulai *</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                  />
                </div>

                <div className="form-field full-width">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "11px" }}>
                    <span style={{ color: "var(--muted)", fontWeight: 600 }}>Preset cepat:</span>
                    {[
                      { label: "1 Hari", days: 0 },
                      { label: "+7 Hari", days: 7 },
                      { label: "+14 Hari (2 Minggu)", days: 14 },
                      { label: "+30 Hari (1 Bulan)", days: 30 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          const base = formStartDate ? new Date(formStartDate) : new Date();
                          if (!formStartDate) setFormStartDate(new Date().toISOString().split("T")[0]);
                          const target = new Date(base.getTime() + preset.days * 24 * 60 * 60 * 1000);
                          setFormEndDate(target.toISOString().split("T")[0]);
                        }}
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          padding: "3px 8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                          color: "var(--text)"
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-field full-width">
                  <label>Deskripsi & Petunjuk Teknis Kegiatan</label>
                  <textarea
                    rows={3}
                    placeholder="Keterangan lengkap, syarat administrasi, lokasi kegiatan, atau panduan pelaksanaan..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" disabled={saving} className="primary-action">
                  {saving
                    ? "Menyimpan..."
                    : editingEventId
                    ? "Perbarui Agenda"
                    : "Terbitkan ke Kalender"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
