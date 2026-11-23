"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  HelpCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  Send,
  RotateCcw,
  Sparkles,
  GraduationCap,
  Users,
  FileCheck2,
  Timer,
  Search,
  CheckCheck,
  Calendar,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { authFetch } from "../../src/services/api-clients";
import type {
  ApiQuiz,
  AuthUser,
  QuestionItem,
  QuizAttemptResult,
} from "../../src/models/types";
import { API_URL } from "../../src/services/api-clients";

interface CourseOption {
  id: string;
  code: string;
  name: string;
  sks: number;
  studyProgramId: string;
  studyProgramName: string;
}

export default function QuizManager() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Lecturer: Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newCourseId, setNewCourseId] = useState("");
  const [newType, setNewType] = useState<"Kuis" | "UTS" | "UAS">("Kuis");
  const [newDescription, setNewDescription] = useState("");
  const [newDuration, setNewDuration] = useState(30);
  const [newPublished, setNewPublished] = useState(true);
  const [newQuestions, setNewQuestions] = useState<QuestionItem[]>([
    {
      text: "",
      options: ["", "", "", ""],
      answerIndex: 0,
      points: 20,
    },
  ]);
  const [creating, setCreating] = useState(false);

  // Lecturer: View Attempts Modal State
  const [selectedQuizForAttempts, setSelectedQuizForAttempts] = useState<ApiQuiz | null>(null);
  const [attemptsList, setAttemptsList] = useState<QuizAttemptResult[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [attemptSearch, setAttemptSearch] = useState("");

  // Student: Quiz Taking State
  const [activeQuiz, setActiveQuiz] = useState<ApiQuiz | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<QuestionItem[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<(number | null)[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);

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

  // Fetch quizzes
  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_URL}/quizzes/mine`);
      const json = await res.json();
      if (res.ok && json.success) {
        setQuizzes(json.data || []);
      } else {
        setError(json.message || "Gagal memuat daftar kuis perkuliahan.");
      }
    } catch {
      setError("Tidak dapat terhubung ke server backend LMS.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Fetch courses list for quiz creation
  const openCreateModal = async () => {
    setIsCreateOpen(true);
    try {
      const res = await authFetch(`${API_URL}/quizzes/courses`);
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

  // Add Question in Builder
  const handleAddQuestion = () => {
    setNewQuestions((prev) => [
      ...prev,
      {
        text: "",
        options: ["", "", "", ""],
        answerIndex: 0,
        points: 20,
      },
    ]);
  };

  // Remove Question
  const handleRemoveQuestion = (idx: number) => {
    if (newQuestions.length <= 1) return;
    setNewQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (qIdx: number, text: string) => {
    setNewQuestions((prev) => {
      const updated = [...prev];
      updated[qIdx].text = text;
      return updated;
    });
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setNewQuestions((prev) => {
      const updated = [...prev];
      const opts = [...updated[qIdx].options];
      opts[optIdx] = val;
      updated[qIdx].options = opts;
      return updated;
    });
  };

  const handleCorrectAnswerChange = (qIdx: number, optIdx: number) => {
    setNewQuestions((prev) => {
      const updated = [...prev];
      updated[qIdx].answerIndex = optIdx;
      return updated;
    });
  };

  const handlePointsChange = (qIdx: number, points: number) => {
    setNewQuestions((prev) => {
      const updated = [...prev];
      updated[qIdx].points = Math.max(1, Number(points) || 10);
      return updated;
    });
  };

  // Submit Create Quiz (Lecturer)
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Harap masukkan judul kuis/ujian.");
      return;
    }
    if (!newCourseId) {
      alert("Harap pilih mata kuliah pengampu.");
      return;
    }
    for (let i = 0; i < newQuestions.length; i++) {
      if (!newQuestions[i].text.trim()) {
        alert(`Pertanyaan butir nomor ${i + 1} belum diisi.`);
        return;
      }
      for (let j = 0; j < newQuestions[i].options.length; j++) {
        if (!newQuestions[i].options[j].trim()) {
          alert(`Pilihan ${String.fromCharCode(65 + j)} pada soal nomor ${i + 1} masih kosong.`);
          return;
        }
      }
    }

    setCreating(true);
    try {
      const res = await authFetch(`${API_URL}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          courseId: newCourseId,
          type: newType,
          description: newDescription,
          durationMinutes: Number(newDuration),
          published: newPublished,
          questions: newQuestions,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsCreateOpen(false);
        setNewTitle("");
        setNewDescription("");
        setNewQuestions([
          {
            text: "",
            options: ["", "", "", ""],
            answerIndex: 0,
            points: 20,
          },
        ]);
        await fetchQuizzes();
      } else {
        alert(json.message || "Gagal membuat kuis.");
      }
    } catch {
      alert("Terjadi kendala koneksi.");
    } finally {
      setCreating(false);
    }
  };

  // Toggle publish
  const handleTogglePublish = async (quiz: ApiQuiz) => {
    try {
      const res = await authFetch(`${API_URL}/quizzes/${quiz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !quiz.published }),
      });
      if (res.ok) {
        await fetchQuizzes();
      }
    } catch {
      alert("Gagal mengubah status publikasi kuis.");
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kuis/ujian ini secara permanen?")) return;
    try {
      const res = await authFetch(`${API_URL}/quizzes/${quizId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchQuizzes();
      }
    } catch {
      alert("Gagal menghapus kuis.");
    }
  };

  // View attempts
  const handleViewAttempts = async (quiz: ApiQuiz) => {
    setSelectedQuizForAttempts(quiz);
    setLoadingAttempts(true);
    setAttemptSearch("");
    try {
      const res = await authFetch(`${API_URL}/quizzes/${quiz.id}/attempts`);
      const json = await res.json();
      if (res.ok && json.success) {
        setAttemptsList(json.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingAttempts(false);
    }
  };

  // Student: Start taking quiz
  const handleStartQuiz = async (quiz: ApiQuiz) => {
    setLoading(true);
    try {
      const detailRes = await authFetch(`${API_URL}/quizzes/${quiz.id}`);
      const detailJson = await detailRes.json();
      if (!detailRes.ok || !detailJson.success) {
        alert(detailJson.message || "Gagal memuat naskah soal kuis.");
        setLoading(false);
        return;
      }

      const startRes = await authFetch(`${API_URL}/quizzes/${quiz.id}/start`, {
        method: "POST",
      });
      const startJson = await startRes.json();
      if (!startRes.ok || !startJson.success) {
        alert(startJson.message || "Gagal memulai sesi pengerjaan ujian.");
        setLoading(false);
        return;
      }

      const questions: QuestionItem[] = detailJson.data.questions || [];
      setActiveQuiz(detailJson.data);
      setActiveQuestions(questions);
      setStudentAnswers(new Array(questions.length).fill(null));
      setCurrentQuestionIndex(0);
      setTimeLeftSeconds((quiz.durationMinutes || 30) * 60);
      setQuizResult(null);
      setShowConfirmSubmit(false);
    } catch {
      alert("Terjadi gangguan jaringan saat memuat ruang ujian CBT.");
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!activeQuiz || quizResult) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, quizResult]);

  // Answer selection
  const handleSelectAnswer = (optionIdx: number) => {
    setStudentAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = optionIdx;
      return updated;
    });
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmittingQuiz(true);
    try {
      const res = await authFetch(`${API_URL}/quizzes/${activeQuiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: studentAnswers }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setQuizResult(json.data);
        setShowConfirmSubmit(false);
        await fetchQuizzes();
      } else {
        alert(json.message || "Gagal mengumpulkan lembar jawaban ujian.");
      }
    } catch {
      alert("Terjadi kendala saat mengirimkan lembar jawaban.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isAdmin = user?.role === "admin";
  const isLecturer = user?.role === "lecturer";
  const isStudent = user?.role === "student";
  const canManageQuiz = isLecturer; // Pembuatan, pengeditan, penerbitan, dan penghapusan kuis khusus dosen
  const canViewAttempts = isLecturer || isAdmin; // Admin dapat memonitor rekap nilai mahasiswa (read-only)

  // Filtered quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchesType = filterType === "all" || q.type.toLowerCase() === filterType.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.courseName && q.courseName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [quizzes, filterType, searchQuery]);

  // Filtered attempts for modal
  const filteredAttempts = useMemo(() => {
    if (!attemptSearch) return attemptsList;
    return attemptsList.filter(
      (a) =>
        a.studentName.toLowerCase().includes(attemptSearch.toLowerCase()) ||
        a.studentNim.toLowerCase().includes(attemptSearch.toLowerCase())
    );
  }, [attemptsList, attemptSearch]);

  // Summary stats
  const stats = useMemo(() => {
    const total = quizzes.length;
    const completed = quizzes.filter((q) => q.myAttempt?.isFinished).length;
    const available = total - completed;
    const avgScore =
      completed > 0
        ? Math.round(
            quizzes
              .filter((q) => q.myAttempt?.isFinished && q.myAttempt.score !== null)
              .reduce((acc, cur) => acc + (cur.myAttempt?.score || 0), 0) / completed
          )
        : 0;

    return { total, completed, available, avgScore };
  }, [quizzes]);

  // =========================================================================
  // CBT / EXAM ROOM (TAMPILAN CBT PRESTISIUS DENGAN WARNA BRAND KAMPUS)
  // =========================================================================
  if (activeQuiz) {
    const totalQuestions = activeQuestions.length;
    const answeredCount = studentAnswers.filter((a) => a !== null).length;
    const currentQ = activeQuestions[currentQuestionIndex];
    const isCriticalTime = timeLeftSeconds < 300; // < 5 mins

    return (
      <div className="cbt-container">
        {quizResult ? (
          // ================= RESULT SCREEN =================
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl text-center max-w-xl mx-auto my-6 animate-fade-in relative overflow-hidden">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Award className="w-10 h-10" />
            </div>

            <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full uppercase tracking-wider">
              Ujian CBT Telah Selesai
            </span>

            <h1 className="text-2xl font-extrabold text-slate-900 mt-4 tracking-tight">{activeQuiz.title}</h1>
            <p className="text-slate-500 text-xs mt-1.5 font-medium">
              {activeQuiz.courseName} · {activeQuiz.studyProgramName}
            </p>

            {/* Score Showcase */}
            <div className="my-8 p-6 bg-[var(--primary-light)] rounded-2xl border border-[#c7d9f5] max-w-sm mx-auto shadow-xs">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--primary)] block">
                Skor Perolehan Akhir
              </span>
              <div className="text-5xl font-black text-[var(--primary)] my-2">
                {quizResult.score}
                <span className="text-2xl font-semibold text-slate-500"> / {quizResult.maxScore}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white text-[var(--primary)] border border-[#c7d9f5] rounded-xl text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Akurasi Jawaban: {quizResult.percentage}%
              </div>

              <div className="grid grid-cols-3 gap-2.5 mt-5 pt-5 border-t border-[#c7d9f5] text-xs">
                <div className="bg-white p-3 rounded-xl border border-[#c7d9f5]">
                  <span className="text-slate-500 block text-[11px] font-medium">Benar</span>
                  <strong className="text-emerald-600 text-lg font-bold">{quizResult.correctCount}</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#c7d9f5]">
                  <span className="text-slate-500 block text-[11px] font-medium">Salah</span>
                  <strong className="text-rose-600 text-lg font-bold">
                    {quizResult.totalQuestions - quizResult.correctCount}
                  </strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#c7d9f5]">
                  <span className="text-slate-500 block text-[11px] font-medium">Total Soal</span>
                  <strong className="text-slate-800 text-lg font-bold">{quizResult.totalQuestions}</strong>
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-xs mb-8 leading-relaxed max-w-sm mx-auto">
              Hasil evaluasi ujian Anda telah otomatis tercatat dalam sistem pangkalan data akademik dosen pengampu.
            </p>

            <button
              onClick={() => {
                setActiveQuiz(null);
                setQuizResult(null);
              }}
              className="cbt-btn cbt-btn-primary !py-2.5 !px-6"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kembali ke Beranda Asesmen</span>
            </button>
          </div>
        ) : (
          // ================= CBT EXAM VIEW =================
          <div className="space-y-6">
            {/* Top Professional CBT Header */}
            <header className="cbt-header">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] border border-[#c7d9f5] flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="quiz-badge kuis">{activeQuiz.type}</span>
                    <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                      {activeQuiz.courseName}
                    </span>
                  </div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{activeQuiz.title}</h1>
                </div>
              </div>

              {/* Timer & Finish Trigger */}
              <div className="flex items-center gap-3 ml-auto">
                <div className={`cbt-timer-box ${isCriticalTime ? "warning" : ""}`}>
                  <Timer className="w-4 h-4" />
                  <span>{formatTime(timeLeftSeconds)}</span>
                </div>

                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="cbt-btn cbt-btn-success shadow-sm"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Selesaikan Ujian</span>
                </button>
              </div>
            </header>

            {/* Main CBT Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Question Area (8 cols) */}
              <main className="lg:col-span-8 bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[520px]">
                {currentQ && (
                  <div>
                    {/* Question Header */}
                    <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="px-3.5 py-1.5 bg-[#193966] text-white font-black text-xs rounded-xl shadow-xs">
                          Butir Pertanyaan #{currentQuestionIndex + 1}
                        </span>
                        <span className="text-xs text-slate-600 font-bold">
                          dari {totalQuestions} soal
                        </span>
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-300 font-extrabold font-mono">
                        Bobot: {currentQ.points} Poin
                      </span>
                    </div>

                    {/* Question Prompt with high-contrast text */}
                    <div className="my-5 p-5 sm:p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-extrabold text-base sm:text-lg leading-relaxed shadow-xs">
                      {currentQ.text}
                    </div>

                    {/* Options List with high-contrast letter badges */}
                    <div className="space-y-3 pt-2">
                      {currentQ.options.map((option, optIdx) => {
                        const isSelected = studentAnswers[currentQuestionIndex] === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectAnswer(optIdx)}
                            className={`p-4 sm:p-4.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                              isSelected
                                ? "border-[#193966] bg-blue-50/70 shadow-md ring-2 ring-[#193966]/20"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected
                                  ? "bg-[#193966] text-white shadow-xs"
                                  : "bg-slate-100 text-slate-800 border border-slate-300"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="text-sm sm:text-base font-bold text-slate-900 flex-1 leading-snug">
                              {option}
                            </span>
                            {isSelected && (
                              <Check className="w-5 h-5 text-[#193966] flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between pt-6 border-t-2 border-slate-100 mt-6 gap-3">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="lms-btn-secondary disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Soal Sebelumnya</span>
                  </button>

                  <div className="text-xs text-slate-600 font-extrabold hidden sm:flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>Jawaban tersimpan otomatis</span>
                  </div>

                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                      className="lms-btn-primary"
                    >
                      <span>Soal Berikutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      className="lms-btn-primary !bg-gradient-to-r !from-emerald-700 !to-teal-800 shadow-lg hover:shadow-xl"
                    >
                      <Check className="w-4 h-4" />
                      <span>Kirim Lembar Ujian</span>
                    </button>
                  )}
                </div>
              </main>

              {/* Question Navigation Sheet (4 cols) */}
              <aside className="lg:col-span-4 cbt-sheet-box space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[var(--primary)]" />
                    <span>Lembar Palet Soal Ujian</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Status: <strong className="text-emerald-600">{answeredCount}</strong> terjawab dari {totalQuestions} soal
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                  />
                </div>

                {/* Numbers Grid */}
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {activeQuestions.map((_, idx) => {
                    const isAnswered = studentAnswers[idx] !== null;
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`cbt-num-btn ${isCurrent ? "active" : isAnswered ? "answered" : ""}`}
                        title={`Soal nomor ${idx + 1}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-200 text-xs space-y-2 text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[var(--primary)] inline-block" />
                    <span>Sedang Dikerjakan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-300 inline-block" />
                    <span>Sudah Terjawab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-slate-50 border border-slate-200 inline-block" />
                    <span>Belum Dijawab</span>
                  </div>
                </div>
              </aside>
            </div>

            {/* Confirmation Modal */}
            {showConfirmSubmit && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 max-w-md w-full rounded-3xl p-6 shadow-2xl text-center animate-scale-up">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Konfirmasi Pengumpulan Lembar Jawaban</h3>
                  <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                    Anda telah menjawab <strong className="text-emerald-600">{answeredCount}</strong> dari {totalQuestions} pertanyaan yang tersedia.
                    {answeredCount < totalQuestions && (
                      <span className="text-rose-600 block font-bold mt-2 p-2 bg-rose-50 border border-rose-200 rounded-xl">
                        ⚠️ Perhatian: Terdapat {totalQuestions - answeredCount} butir soal yang belum Anda isi!
                      </span>
                    )}
                  </p>

                  <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                      onClick={() => setShowConfirmSubmit(false)}
                      className="cbt-btn cbt-btn-secondary"
                    >
                      Periksa Kembali
                    </button>
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={submittingQuiz}
                      className="cbt-btn cbt-btn-success"
                    >
                      {submittingQuiz ? "Mengirim Jawaban..." : "Kirimkan Sekarang"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // MAIN QUIZ HUB (DASHBOARD DOSEN & MAHASISWA)
  // =========================================================================
  return (
    <div className="page-container space-y-6">
      {/* Hero Banner Header */}
      <div className="quiz-hero-banner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="quiz-hero-tag">
              <GraduationCap className="w-3.5 h-3.5" />
              {isAdmin
                ? "Direktori & Pengawasan CBT Kampus (Mode Baca Saja)"
                : "Sistem Asesmen CBT & Ujian Akademik Terintegrasi"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isAdmin
                ? "Direktori Kuis & Ujian CBT Kampus"
                : isLecturer
                ? "Kelola Kuis & Ujian CBT Perkuliahan"
                : "Portal Ujian & Kuis Akademik Mahasiswa"}
            </h1>
            <p className="text-[#dbeafe] text-xs sm:text-sm max-w-xl mt-1.5 opacity-90 leading-relaxed">
              {isAdmin
                ? "Pemantauan seluruh kuis berkala, UTS, dan UAS yang dirilis oleh para dosen pengampu dari seluruh program studi. (Wewenang pembuatan & pengeditan khusus Dosen)."
                : isLecturer
                ? "Rancang butir soal pilihan ganda interaktif, tetapkan kunci jawaban & bobot poin, publikasikan ujian, dan pantau hasil evaluasi mahasiswa."
                : "Akses kuis berkala, ujian tengah semester (UTS), dan ujian akhir semester (UAS) yang dirilis oleh dosen pengampu program studi Anda."}
            </p>
          </div>

          {canManageQuiz && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#1e40af] hover:from-[#3b82f6] hover:to-[#1d4ed8] shadow-xl shadow-blue-950/25 hover:shadow-2xl hover:shadow-blue-900/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer border border-blue-400/30 tracking-wide flex-shrink-0 self-start md:self-auto"
            >
              <div className="w-6 h-6 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Plus size={16} strokeWidth={3} />
              </div>
              <span>Buat Kuis Baru</span>
            </button>
          )}

          {isAdmin && (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-sm flex-shrink-0">
              <Eye className="w-4 h-4 text-emerald-300" />
              <span>Akses Super Admin: Read-Only Monitoring</span>
            </div>
          )}
        </div>

        {/* Stats Row in Header */}
        <div className="quiz-stats-strip">
          <div className="quiz-stat-box">
            <span>Total Kuis & CBT</span>
            <strong>{stats.total}</strong>
          </div>
          {isStudent ? (
            <>
              <div className="quiz-stat-box">
                <span>Sudah Diselesaikan</span>
                <strong className="text-emerald-300">{stats.completed}</strong>
              </div>
              <div className="quiz-stat-box">
                <span>Belum Dikerjakan</span>
                <strong className="text-amber-200">{stats.available}</strong>
              </div>
              <div className="quiz-stat-box">
                <span>Rata-rata Skor</span>
                <strong>{stats.avgScore}%</strong>
              </div>
            </>
          ) : (
            <>
              <div className="quiz-stat-box">
                <span>Kuis Aktif Terbit</span>
                <strong className="text-emerald-300">
                  {quizzes.filter((q) => q.published).length}
                </strong>
              </div>
              <div className="quiz-stat-box">
                <span>Draf Tersimpan</span>
                <strong>{quizzes.filter((q) => !q.published).length}</strong>
              </div>
              <div className="quiz-stat-box">
                <span>Hak Akses</span>
                <strong className={isAdmin ? "text-amber-300" : "text-indigo-200"}>
                  {isAdmin ? "Super Admin (Read-Only)" : "Dosen Pengampu"}
                </strong>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Type Filter Tabs with Modern Sub Menu Styling */}
        <div className="lms-tab-nav w-full lg:w-auto">
          {[
            {
              id: "all",
              label: "Semua Asesmen",
              icon: ClipboardList,
              count: quizzes.length,
            },
            {
              id: "kuis",
              label: "Kuis Harian",
              icon: Clock,
              count: quizzes.filter((q) => q.type.toLowerCase() === "kuis").length,
            },
            {
              id: "uts",
              label: "UTS",
              icon: Award,
              count: quizzes.filter((q) => q.type.toUpperCase() === "UTS").length,
            },
            {
              id: "uas",
              label: "UAS",
              icon: GraduationCap,
              count: quizzes.filter((q) => q.type.toUpperCase() === "UAS").length,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`lms-tab-pill ${isActive ? "active" : ""}`}
              >
                <Icon size={14} className={isActive ? "text-[var(--primary)]" : "text-slate-400"} />
                <span>{tab.label}</span>
                <span className="lms-tab-badge">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input - Clean Flex Container with No Overlap */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl w-full lg:w-80 focus-within:ring-2 focus-within:ring-[#234b8c]/20 focus-within:border-[#234b8c] focus-within:bg-white transition flex-shrink-0">
          <Search size={16} className="text-slate-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Cari judul kuis atau mata kuliah..."
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

      {/* Main Quizzes List Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-200 text-center shadow-sm">
          <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-500">Memuat data kuis dan ujian perkuliahan...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-2xl text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border-2 border-dashed border-slate-200 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-100">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Tidak Ada Kuis Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            {searchQuery
              ? "Coba gunakan kata kunci pencarian yang lain."
              : isLecturer
              ? "Klik tombol 'Buat Kuis Baru' untuk menambahkan kuis pada mata kuliah program studi yang Anda ampu."
              : "Dosen pengampu belum mempublikasikan asesmen untuk kategori ini."}
          </p>
        </div>
      ) : (
        <div className="quiz-grid">
          {filteredQuizzes.map((quiz) => {
            const hasFinished = quiz.myAttempt?.isFinished;
            const score = quiz.myAttempt?.score;
            const maxScore = quiz.myAttempt?.maxScore || quiz.totalPoints || 100;
            const pct = maxScore > 0 && score !== null ? Math.round(((score || 0) / maxScore) * 100) : 0;
            const typeBadgeStyle =
              quiz.type === "UTS"
                ? "bg-amber-100 text-amber-950 border-amber-300"
                : quiz.type === "UAS"
                ? "bg-rose-100 text-rose-950 border-rose-300"
                : "bg-blue-100 text-blue-950 border-blue-300";

            return (
              <div
                key={quiz.id}
                className="lms-card-elevated border-2 border-slate-200 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-[10.5px] font-black uppercase tracking-wider border shadow-2xs ${typeBadgeStyle}`}
                    >
                      {quiz.type === "Kuis" ? "Kuis Berkala" : quiz.type}
                    </span>

                    {isLecturer || isAdmin ? (
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-black border shadow-2xs ${
                          quiz.published
                            ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                            : "bg-slate-100 text-slate-800 border-slate-300"
                        }`}
                      >
                        {quiz.published ? "Dipublikasikan" : "Draf Disimpan"}
                      </span>
                    ) : hasFinished ? (
                      <span className="text-xs px-3 py-1 rounded-full font-black bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Selesai</span>
                      </span>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-full font-black bg-amber-100 text-amber-950 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>Siap Dikerjakan</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 group-hover:text-[var(--primary)] transition line-clamp-2 leading-snug">
                    {quiz.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] mt-2 mb-3">
                    <BookOpen className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                    <span>{quiz.courseName}</span>
                    <span className="text-slate-500 font-semibold">· {quiz.studyProgramName}</span>
                  </div>

                  {quiz.description && (
                    <p className="text-xs text-slate-700 font-medium leading-relaxed line-clamp-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                      {quiz.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 py-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#193966]" />
                      <span>{quiz.durationMinutes} Menit</span>
                    </div>
                    {quiz.questionCount !== undefined && (
                      <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <ClipboardList className="w-4 h-4 text-slate-600" />
                        <span>{quiz.questionCount} Soal</span>
                      </div>
                    )}
                    {isLecturer || isAdmin ? (
                      <div className="font-black text-[var(--primary)] flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{quiz.attemptCount || 0} Pengumpulan</span>
                      </div>
                    ) : (
                      <div className="text-slate-600 font-semibold">
                        <span>{quiz.lecturerName || "Dosen Pengampu"}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 mt-2">
                  {isAdmin ? (
                    <div className="flex items-center justify-between w-full">
                      <button
                        onClick={() => handleViewAttempts(quiz)}
                        className="lms-btn-primary !py-2 !px-3.5 !text-xs font-black"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Rekap Nilai Mahasiswa ({quiz.attemptCount || 0})</span>
                      </button>

                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        Read-Only
                      </span>
                    </div>
                  ) : isLecturer ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewAttempts(quiz)}
                          className="lms-btn-primary !py-2 !px-3.5 !text-xs font-black"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Rekap Nilai ({quiz.attemptCount || 0})</span>
                        </button>

                        <button
                          onClick={() => handleTogglePublish(quiz)}
                          className="lms-btn-secondary !py-2 !px-3 !text-xs font-bold"
                        >
                          {quiz.published ? "Tutup" : "Terbitkan"}
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-slate-200"
                        title="Hapus Kuis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : hasFinished ? (
                    <div className="flex items-center justify-between w-full p-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl shadow-2xs">
                      <div className="text-xs">
                        <span className="text-emerald-950 font-bold">Perolehan Skor: </span>
                        <strong className="text-emerald-900 text-base font-black ml-1">
                          {score} / {maxScore}
                        </strong>
                      </div>
                      <span className="text-xs font-black text-emerald-950 bg-white px-3 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                        {pct >= 85 ? "Grade A" : pct >= 70 ? "Grade B" : "Grade C"} ({pct}%)
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="lms-btn-primary w-full !py-2.5 font-black text-sm"
                    >
                      <Play className="w-4 h-4" />
                      <span>Kerjakan Ujian CBT Sekarang</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STUDIO PEMBUAT KUIS (DOSEN) - MATCHING STUDY MATERIALS STYLE       */}
      {/* ========================================================================= */}
      {isCreateOpen && (
        <div className="modal-backdrop">
          <div className="user-form-modal course-modal">
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <div className="modal-heading-icon">
                  <ClipboardList size={20} />
                </div>
                <h2>Studio Pembuat Asesmen & Ujian CBT</h2>
                <p>Konfigurasi naskah ujian terstruktur untuk mata kuliah yang Anda ampu.</p>
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

            {/* Modal Form */}
            <form onSubmit={handleSaveQuiz}>
              <div className="academic-form-grid">
                <div className="form-field full-width">
                  <label>Judul Asesmen / Kuis *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kuis 1 Logika Pemrograman & Algoritma"
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
                        {c.code} · {c.name} ({c.studyProgramName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Tipe Evaluasi *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as "Kuis" | "UTS" | "UAS")}
                  >
                    <option value="Kuis">Kuis Berkala</option>
                    <option value="UTS">Ujian Tengah Semester (UTS)</option>
                    <option value="UAS">Ujian Akhir Semester (UAS)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Durasi Waktu Pengerjaan (Menit) *</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Status Publikasi *</label>
                  <select
                    value={newPublished ? "published" : "draft"}
                    onChange={(e) => setNewPublished(e.target.value === "published")}
                  >
                    <option value="published">Langsung Terbitkan ke Mahasiswa</option>
                    <option value="draft">Simpan Sebagai Draf</option>
                  </select>
                </div>

                <div className="form-field full-width">
                  <label>Petunjuk & Tata Tertib Ujian</label>
                  <textarea
                    rows={3}
                    placeholder="Instruksi pengerjaan, ketentuan pengerjaan tanpa catatan, dan rubrik..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>

                {/* Dynamic Questions Builder */}
                <div className="form-field full-width" style={{ marginTop: "10px", borderTop: "1px solid var(--border)", paddingTop: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div>
                      <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--primary)" }}>Daftar Butir Soal Pilihan Ganda</label>
                      <p style={{ fontSize: "11px", color: "var(--muted)", margin: "3px 0 0" }}>
                        Tandai radio button pada opsi yang menjadi <strong>kunci jawaban benar</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="secondary-action"
                      onClick={handleAddQuestion}
                      style={{ minHeight: "34px", padding: "0 12px", fontSize: "12px", fontWeight: 700 }}
                    >
                      <Plus size={14} />
                      <span>Tambah Butir Soal</span>
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {newQuestions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        style={{
                          background: "#f8fafc",
                          border: "1px solid var(--border)",
                          borderRadius: "10px",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ background: "var(--primary-light)", color: "var(--primary)", fontWeight: 800, fontSize: "11px", padding: "4px 9px", borderRadius: "6px" }}>
                            Butir Soal #{qIdx + 1}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>Bobot:</span>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={q.points}
                              onChange={(e) => handlePointsChange(qIdx, Number(e.target.value))}
                              style={{ width: "55px", height: "30px", padding: "0 6px", textAlign: "center", fontSize: "12px", fontWeight: 700, borderRadius: "6px", border: "1px solid var(--border)" }}
                            />
                            <span style={{ fontSize: "11px", color: "var(--muted)" }}>Poin</span>
                            {newQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(qIdx)}
                                style={{ border: "none", background: "transparent", color: "var(--danger)", cursor: "pointer", padding: "4px" }}
                                title="Hapus Soal"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          placeholder={`Tuliskan teks pertanyaan soal nomor ${qIdx + 1}...`}
                          value={q.text}
                          onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                          style={{ width: "100%", padding: "10px", borderRadius: "7px", border: "1px solid var(--border)", background: "white", fontSize: "12px", fontFamily: "inherit" }}
                        />

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                          {q.options.map((opt, optIdx) => {
                            const isKey = q.answerIndex === optIdx;
                            return (
                              <div
                                key={optIdx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 10px",
                                  borderRadius: "8px",
                                  background: isKey ? "#f0fdf4" : "white",
                                  border: isKey ? "1.5px solid #16a34a" : "1px solid var(--border)"
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`correct-key-${qIdx}`}
                                  checked={isKey}
                                  onChange={() => handleCorrectAnswerChange(qIdx, optIdx)}
                                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#16a34a" }}
                                />
                                <span style={{ fontWeight: 800, fontSize: "12px", color: isKey ? "#16a34a" : "var(--muted)", minWidth: "16px" }}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <input
                                  type="text"
                                  placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}`}
                                  value={opt}
                                  onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                  style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "12px", height: "28px" }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="primary-action"
                >
                  {creating ? "Menyimpan Ujian..." : "Simpan & Publikasikan Ujian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REKAPITULASI HASIL MAHASISWA (DOSEN) */}
      {/* ========================================================================= */}
      {selectedQuizForAttempts && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-up border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#193966] via-[#234b8c] to-[#1e3a8a] text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-white">
                  Rekapitulasi Perolehan Nilai Ujian
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedQuizForAttempts.title}</h3>
                <p className="text-xs text-[#dbeafe] opacity-90">{selectedQuizForAttempts.courseName}</p>
              </div>
              <button
                onClick={() => setSelectedQuizForAttempts(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-bar Filter & Summary */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-xl w-full sm:w-72 focus-within:ring-2 focus-within:ring-[#234b8c]/20 focus-within:border-[#234b8c] transition flex-shrink-0">
                <Search size={14} className="text-slate-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Cari mahasiswa / NIM..."
                  value={attemptSearch}
                  onChange={(e) => setAttemptSearch(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none p-0 text-xs font-semibold text-slate-900 placeholder:text-slate-400"
                />
                {attemptSearch && (
                  <button
                    type="button"
                    onClick={() => setAttemptSearch("")}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-700 font-semibold">
                Total Mahasiswa Mengikuti: <strong className="text-[#234b8c] font-black">{attemptsList.length}</strong> Orang
              </div>
            </div>

            {/* Table */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingAttempts ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Memuat data pengerjaan mahasiswa...
                </div>
              ) : filteredAttempts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Belum ada data pengerjaan mahasiswa yang sesuai.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">NIM</th>
                        <th className="py-3 px-4">Nama Mahasiswa</th>
                        <th className="py-3 px-4">Skor Diperoleh</th>
                        <th className="py-3 px-4">Grade & Akurasi</th>
                        <th className="py-3 px-4">Waktu Selesai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAttempts.map((atm) => (
                        <tr key={atm.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-600">{atm.studentNim}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{atm.studentName}</td>
                          <td className="py-3 px-4 font-extrabold text-[var(--primary)]">
                            {atm.score} <span className="text-slate-400 font-normal">/ {atm.maxScore}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                                atm.percentage >= 85
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : atm.percentage >= 70
                                  ? "bg-blue-50 text-[var(--primary)] border border-blue-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {atm.percentage}% · Grade {atm.percentage >= 85 ? "A" : atm.percentage >= 70 ? "B" : "C"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            {new Date(atm.submittedAt).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedQuizForAttempts(null)}
                className="cbt-btn cbt-btn-secondary"
              >
                Tutup Rekapitulasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
