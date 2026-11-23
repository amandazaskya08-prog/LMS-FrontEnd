"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Wallet,
  ArrowRight,
  Clock,
  CalendarDays,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
  RefreshCw,
  BellRing,
} from "lucide-react";
import StatCard from "../../../components/ui/stat-card";
import { authFetch, API_URL } from "../../../src/services/api-clients";

interface CourseGradeItem {
  courseId: string;
  courseName: string;
  sks: number;
  assignmentAvg: number | null;
  quizAvg: number | null;
  finalScore: number;
  letterGrade: string;
  gradePoint: number;
}

interface DashboardData {
  stats: {
    ipk: number;
    predicate: string;
    totalSks: number;
    currentSks: number;
    completedQuizzes: number;
    completedAssignments: number;
    attendanceRate: number;
  };
  courseGrades: CourseGradeItem[];
  todaySchedule: Array<{
    id: string;
    courseId: string;
    code: string;
    room: string;
    time: string;
    day: string;
  }>;
  ukt: {
    id: string;
    amount: number;
    status: string;
    dueDate: string;
  } | null;
  recentAnnouncements: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Mahasiswa");
  const [userRole, setUserRole] = useState("student");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_URL}/dashboard`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Gagal mengambil data live dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("lms_user") || localStorage.getItem("auth_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setUserName(u.name);
        if (u.role) setUserRole(u.role);
      }
    } catch {
      // Ignore
    }
    fetchDashboard();
  }, []);

  const ipkValue = data?.stats?.ipk !== undefined ? data.stats.ipk.toFixed(2) : "3.82";
  const predicate = data?.stats?.predicate || "Dengan Pujian (Cum Laude)";
  const totalSks = data?.stats?.currentSks || data?.stats?.totalSks || 21;
  const completedQuizzes = data?.stats?.completedQuizzes ?? 8;
  const completedAssignments = data?.stats?.completedAssignments ?? 6;
  const uktStatus = data?.ukt?.status || "Lunas";

  return (
    <div className="page-container">
      {/* Welcome Hero Banner */}
      <section className="welcome-banner" style={{ position: "relative", overflow: "hidden" }}>
        <div>
          <span className="welcome-label flex items-center gap-1.5 font-semibold text-xs tracking-wider uppercase">
            <Sparkles size={14} className="text-amber-300" />
            PORTAL AKADEMIK MAHASISWA
          </span>

          <h1>Halo, {userName.split(" ")[0]}! 👋</h1>

          <p>
            Pantau performa akademik, akumulasi IPK dinamis, kuis, tugas, serta tagihan UKT secara real-time.
          </p>

          <div className="welcome-meta">
            <span>
              <GraduationCap size={16} />
              Teknik Informatika (S1)
            </span>

            <span>
              <CalendarDays size={16} />
              Semester Ganjil 2026/2027
            </span>

            <span className="inline-flex items-center gap-1 text-emerald-300 font-medium bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <Award size={14} />
              {predicate}
            </span>
          </div>
        </div>

        <div className="welcome-illustration">
          <GraduationCap size={110} strokeWidth={1.2} />
        </div>
      </section>

      {/* Hero Stats Grid */}
      <section className="stats-grid">
        <StatCard
          title="Indeks Prestasi Kumulatif"
          value={ipkValue}
          description={predicate}
          icon={TrendingUp}
          color="#DCFCE7"
        />

        <StatCard
          title="Beban SKS Aktif"
          value={`${totalSks} SKS`}
          description="Batas Maksimal 24 SKS"
          icon={BookOpen}
          color="#DBEAFE"
        />

        <StatCard
          title="Evaluasi Selesai"
          value={`${completedQuizzes + completedAssignments}`}
          description={`${completedQuizzes} Kuis / CBT • ${completedAssignments} Tugas`}
          icon={ClipboardCheck}
          color="#F3E8FF"
        />

        <StatCard
          title="Status UKT Semester Ini"
          value={uktStatus}
          description={uktStatus === "Lunas" ? "Bebas Administrasi Keuangan" : "Segera lakukan pembayaran"}
          icon={Wallet}
          color={uktStatus === "Lunas" ? "#DCFCE7" : "#FEF3C7"}
        />
      </section>

      {/* Main Grid: Live Grades Breakdown & Schedule */}
      <div className="dashboard-grid">
        {/* Course Grades Breakdown */}
        <section className="content-card courses-card">
          <div className="section-heading">
            <div>
              <h2 className="flex items-center gap-2">
                <Award size={20} className="text-indigo-600" />
                Rincian Nilai & Bobot Matkul (SN-Dikti)
              </h2>
              <p>Formula akumulasi: 40% Tugas Terstruktur + 60% Kuis/Ujian CBT</p>
            </div>

            <button
              onClick={fetchDashboard}
              title="Refresh Nilai"
              className="text-xs text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Sinkron
            </button>
          </div>

          <div className="course-list">
            {data?.courseGrades && data.courseGrades.length > 0 ? (
              data.courseGrades.map((grade) => (
                <div className="course-item" key={grade.courseId}>
                  <div
                    className="course-icon"
                    style={{
                      background:
                        grade.letterGrade.startsWith("A")
                          ? "#DCFCE7"
                          : grade.letterGrade.startsWith("B")
                          ? "#DBEAFE"
                          : "#FEF3C7",
                      color:
                        grade.letterGrade.startsWith("A")
                          ? "#15803D"
                          : grade.letterGrade.startsWith("B")
                          ? "#1D4ED8"
                          : "#B45309",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    {grade.letterGrade}
                  </div>

                  <div className="course-info" style={{ width: "100%" }}>
                    <div className="flex items-center justify-between">
                      <span className="course-code font-semibold text-slate-700">{grade.courseName}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Bobot: {grade.gradePoint.toFixed(2)} ({grade.sks} SKS)
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Rata-rata Tugas (40%): {grade.assignmentAvg !== null ? `${grade.assignmentAvg}` : "85"} •
                      Kuis CBT (60%): {grade.quizAvg !== null ? `${grade.quizAvg}` : "90"}
                    </p>

                    <div className="progress-track mt-2">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(100, Math.max(10, grade.finalScore))}%`,
                          background: grade.finalScore >= 80 ? "#10B981" : "#3B82F6",
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                      <span>Nilai Akhir: <strong>{grade.finalScore} / 100</strong></span>
                      <span className="text-emerald-600 font-semibold">Predikat Mutu: {grade.letterGrade}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Default simulated preview if not loaded
              [
                { name: "Pemrograman Web Lanjut", letter: "A", score: 92, point: 4.0, sks: 3 },
                { name: "Basis Data Lanjut & Big Data", letter: "A", score: 88, point: 4.0, sks: 3 },
                { name: "Rekayasa Perangkat Lunak", letter: "A-", score: 84, point: 3.75, sks: 3 },
                { name: "Jaringan Komputer & Cyber Security", letter: "B+", score: 79, point: 3.5, sks: 3 },
              ].map((item, idx) => (
                <div className="course-item" key={idx}>
                  <div
                    className="course-icon font-bold text-emerald-700 bg-emerald-100"
                  >
                    {item.letter}
                  </div>
                  <div className="course-info" style={{ width: "100%" }}>
                    <div className="flex items-center justify-between">
                      <span className="course-code font-semibold text-slate-800">{item.name}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Bobot: {item.point.toFixed(2)} ({item.sks} SKS)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Kalkulasi Otomatis Berdasarkan Evaluasi Quiz & Tugas Mandiri
                    </p>
                    <div className="progress-track mt-2">
                      <div
                        className="progress-fill"
                        style={{ width: `${item.score}%`, background: "#10B981" }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                      <span>Nilai Akhir: <strong>{item.score} / 100</strong></span>
                      <span className="text-emerald-600 font-semibold">Predikat Mutu: {item.letter}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quick Links & Upcoming Evaluasi */}
        <div className="flex flex-col gap-4">
          {/* UKT Card shortcut */}
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2 className="flex items-center gap-2 text-base">
                  <Wallet size={18} className="text-emerald-600" />
                  Status Keuangan & UKT
                </h2>
                <p>Uang Kuliah Tunggal Semester Aktif</p>
              </div>
              <Link href="/ukt" className="text-link text-xs inline-flex items-center gap-1">
                Portal UKT <ArrowRight size={14} />
              </Link>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mt-2 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Status Pembayaran</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  {uktStatus}
                </div>
              </div>
              <Link
                href="/ukt"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-sm transition-all"
              >
                Cek Tagihan / Bukti
              </Link>
            </div>
          </section>

          {/* Quick Shortcuts to Quizzes and Assignments */}
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2 className="flex items-center gap-2 text-base">
                  <ClipboardCheck size={18} className="text-indigo-600" />
                  Evaluasi Akademik
                </h2>
                <p>Kerjakan kuis & tugas untuk menaikkan IPK</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <Link
                href="/quizzes"
                className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-colors flex flex-col items-center text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <FileText size={18} />
                </div>
                <span className="text-xs font-bold text-slate-800">Kuis & CBT</span>
                <span className="text-[11px] text-slate-500">Bobot 60% IPK</span>
              </Link>

              <Link
                href="/assignments"
                className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition-colors flex flex-col items-center text-center group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <BookOpen size={18} />
                </div>
                <span className="text-xs font-bold text-slate-800">Tugas Mandiri</span>
                <span className="text-[11px] text-slate-500">Bobot 40% IPK</span>
              </Link>
            </div>
          </section>

          {/* Pengumuman Terbaru */}
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2 className="flex items-center gap-2 text-base">
                  <BellRing size={18} className="text-amber-500" />
                  Pengumuman Akademik
                </h2>
                <p>Informasi kampus terkini</p>
              </div>
            </div>

            <div className="mt-2 space-y-2">
              {data?.recentAnnouncements && data.recentAnnouncements.length > 0 ? (
                data.recentAnnouncements.slice(0, 2).map((a) => (
                  <div key={a.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
                    <p className="font-semibold text-slate-800">{a.title}</p>
                    <p className="text-slate-500 line-clamp-2 mt-0.5">{a.content}</p>
                  </div>
                ))
              ) : (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-500">
                  Jadwal Ujian Tengah Semester & Batas Akhir Pembayaran UKT Semester Genap akan dibuka sesuai kalender akademik.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
