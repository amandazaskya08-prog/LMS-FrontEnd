"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Building2,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Printer,
  ChevronRight,
  ShieldCheck,
  X,
  FileText,
  DollarSign,
  Wallet,
  ArrowRight,
  HelpCircle,
  Download,
  AlertTriangle,
} from "lucide-react";
import type {
  ApiUktBill,
  ApiUktPayment,
  ApiUktSummary,
  AuthUser,
  StudentDirectoryItem,
} from "../../src/models/types";
import { authFetch } from "../../src/services/api-clients";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const PAYMENT_METHODS = [
  {
    id: "va-bni",
    name: "Virtual Account BNI",
    bank: "Bank BNI",
    code: "8808",
    logoColor: "bg-orange-500",
    desc: "Bebas biaya admin transfer antar bank melalui ATM, Mobile, atau Internet Banking.",
  },
  {
    id: "va-mandiri",
    name: "Virtual Account Mandiri",
    bank: "Bank Mandiri",
    code: "8950",
    logoColor: "bg-blue-600",
    desc: "Pembayaran otomatis terverifikasi via Livin' by Mandiri dan ATM Mandiri.",
  },
  {
    id: "va-bca",
    name: "Virtual Account BCA",
    bank: "Bank BCA",
    code: "1234",
    logoColor: "bg-blue-800",
    desc: "Transfer mudah melalui BCA Mobile, KlikBCA, dan ATM BCA.",
  },
  {
    id: "va-bri",
    name: "Virtual Account BRI",
    bank: "Bank BRI",
    code: "0020",
    logoColor: "bg-cyan-600",
    desc: "Didukung penuh melalui aplikasi BRImo dan jaringan ATM BRI seluruh Indonesia.",
  },
];

export default function UKTManager() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UKT Data
  const [bills, setBills] = useState<ApiUktBill[]>([]);
  const [summary, setSummary] = useState<ApiUktSummary | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentDirectoryItem | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<"all" | "Lunas" | "Menunggu Verifikasi" | "Belum Bayar">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBillForPay, setSelectedBillForPay] = useState<ApiUktBill | null>(null);
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].name);
  const [instantVerify, setInstantVerify] = useState(true);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<ApiUktBill | null>(null);

  // Admin Verification state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Copy VA state
  const [copiedVA, setCopiedVA] = useState<string | null>(null);

  // Admin New Bill Modal
  const [createBillModalOpen, setCreateBillModalOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<StudentDirectoryItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [newUktGroup, setNewUktGroup] = useState(3);
  const [newAmount, setNewAmount] = useState(2500000);
  const [newDueDate, setNewDueDate] = useState("2026-12-15");
  const [creatingBill, setCreatingBill] = useState(false);

  // Load Current User
  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // Fetch UKT Data
  const fetchUktData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_URL}/ukt`);
      if (!res.ok) throw new Error("Gagal mengambil informasi data UKT.");
      const json = await res.json();
      if (json.success && json.data) {
        setBills(json.data.bills || []);
        setSummary(json.data.summary || null);
        if (json.data.student) {
          setStudentInfo(json.data.student);
        }
      } else {
        throw new Error(json.message || "Gagal memproses data tagihan.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kendala jaringan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUktData();
    }
  }, [user]);

  // Load all students for Admin Bill Creation
  const openCreateBillModal = async () => {
    setCreateBillModalOpen(true);
    try {
      const res = await authFetch(`${API_URL}/students`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.students) {
          setAllStudents(json.data.students);
          if (json.data.students.length > 0) {
            setSelectedStudentId(json.data.students[0].id);
          }
        }
      }
    } catch {
      // Ignore
    }
  };

  // Copy VA Number handler
  const handleCopyVA = (vaNumber: string) => {
    navigator.clipboard.writeText(vaNumber);
    setCopiedVA(vaNumber);
    setTimeout(() => setCopiedVA(null), 2500);
  };

  // Student: Submit Payment
  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForPay) return;

    setSubmittingPayment(true);
    try {
      const res = await authFetch(`${API_URL}/ukt/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId: selectedBillForPay.id,
          method: selectedMethod,
          instantVerify,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPayModalOpen(false);
        setSelectedBillForPay(null);
        await fetchUktData();
      } else {
        alert(json.message || "Gagal memproses pembayaran UKT.");
      }
    } catch {
      alert("Terjadi kendala jaringan saat mengirim konfirmasi pembayaran.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Admin: Verify Payment
  const handleVerifyPayment = async (paymentId: string, action: "approve" | "reject") => {
    const confirmText =
      action === "approve"
        ? "Verifikasi pembayaran ini sebagai LUNAS resmi?"
        : "Tolak konfirmasi pembayaran ini dan kembalikan ke status Belum Bayar?";

    if (!confirm(confirmText)) return;

    setVerifyingId(paymentId);
    try {
      const res = await authFetch(`${API_URL}/ukt/verify/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        await fetchUktData();
      } else {
        alert(json.message || "Gagal memperbarui status verifikasi.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setVerifyingId(null);
    }
  };

  // Admin: Create Bill Submit
  const handleCreateBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert("Pilih mahasiswa terlebih dahulu.");
      return;
    }

    setCreatingBill(true);
    try {
      const res = await authFetch(`${API_URL}/ukt/bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          semesterId: "sem-1",
          uktGroup: Number(newUktGroup),
          amount: Number(newAmount),
          dueDate: newDueDate,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setCreateBillModalOpen(false);
        await fetchUktData();
      } else {
        alert(json.message || "Gagal menerbitkan tagihan UKT.");
      }
    } catch {
      alert("Terjadi kesalahan saat membuat tagihan.");
    } finally {
      setCreatingBill(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";

  // Filtered Bills
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const matchTab = activeTab === "all" || b.status === activeTab;
      const matchSearch =
        searchQuery === "" ||
        (b.studentName && b.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.studentNim && b.studentNim.includes(searchQuery)) ||
        (b.studyProgramName && b.studyProgramName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchTab && matchSearch;
    });
  }, [bills, activeTab, searchQuery]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER HEADER & STATS STRIP                                        */}
      {/* ========================================================================= */}
      <div className="quiz-banner-header">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold mb-2">
              <CreditCard size={13} className="text-emerald-300" />
              <span>Sistem Pembayaran & Administrasi Keuangan UKT</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {isAdmin ? "Manajemen UKT & Verifikasi Keuangan" : "Uang Kuliah Tunggal (UKT)"}
            </h1>
            <p className="text-white/80 text-sm mt-1 max-w-2xl">
              {isAdmin
                ? "Monitoring pelunasan UKT seluruh program studi, validasi bukti transfer Virtual Account, serta penerbitan tagihan semester."
                : "Informasi tagihan semester, generate kode bayar Virtual Account (VA), dan unduh lembar bukti pelunasan resmi."}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-auto">
            <button
              onClick={fetchUktData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-[#193966] hover:bg-slate-50 transition shadow-lg cursor-pointer"
              title="Perbarui Data UKT"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-[#193966]" : "text-[#193966]"} />
              <span>Segarkan</span>
            </button>

            {isAdmin && (
              <button
                onClick={openCreateBillModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>+ Terbitkan Tagihan UKT</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="quiz-stats-strip">
          {isAdmin ? (
            <>
              <div className="quiz-stat-box">
                <span>Total Tagihan Terbit</span>
                <strong>{summary?.totalBills ?? bills.length} Tagihan</strong>
              </div>
              <div className="quiz-stat-box">
                <span>Total UKT Terkumpul</span>
                <strong className="text-emerald-300">{formatRupiah(summary?.totalCollected ?? 0)}</strong>
              </div>
              <div className="quiz-stat-box">
                <span>Menunggu Verifikasi</span>
                <strong className="text-amber-200">{summary?.pendingCount ?? 0} Transaksi</strong>
              </div>
              <div className="quiz-stat-box">
                <span>Belum Melakukan Bayar</span>
                <strong className="text-rose-200">{summary?.unpaidCount ?? 0} Mahasiswa</strong>
              </div>
            </>
          ) : (
            <>
              <div className="quiz-stat-box">
                <span>Golongan UKT Anda</span>
                <strong className="text-emerald-300">
                  Golongan {studentInfo?.uktGroup ?? (bills[0]?.uktGroup || 3)}
                </strong>
              </div>
              <div className="quiz-stat-box">
                <span>Total Tagihan Semester</span>
                <strong>{formatRupiah(bills[0]?.amount || 2500000)}</strong>
              </div>
              <div className="quiz-stat-box">
                <span>Status Pelunasan</span>
                <strong
                  className={
                    bills[0]?.status === "Lunas"
                      ? "text-emerald-300"
                      : bills[0]?.status === "Menunggu Verifikasi"
                      ? "text-amber-200"
                      : "text-rose-200"
                  }
                >
                  {bills[0]?.status || "Belum Bayar"}
                </strong>
              </div>
              <div className="quiz-stat-box">
                <span>Batas Waktu Pelunasan</span>
                <strong className="text-blue-200">
                  {bills[0]?.dueDate
                    ? new Date(bills[0].dueDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "15 Oktober 2026"}
                </strong>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STUDENT ACTIVE BILL CARD / PAYMENT BANNER (FOR STUDENT)                 */}
      {/* ========================================================================= */}
      {isStudent && bills.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                bills[0].status === "Lunas"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : bills[0].status === "Menunggu Verifikasi"
                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                  : "bg-blue-50 text-[#193966] border border-blue-200"
              }`}
            >
              {bills[0].status === "Lunas" ? (
                <ShieldCheck size={30} />
              ) : bills[0].status === "Menunggu Verifikasi" ? (
                <Clock size={30} />
              ) : (
                <Wallet size={30} />
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Semester Ganjil 2026/2027
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    bills[0].status === "Lunas"
                      ? "bg-emerald-100 text-emerald-800"
                      : bills[0].status === "Menunggu Verifikasi"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {bills[0].status}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
                {formatRupiah(bills[0].amount)}
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                {bills[0].status === "Lunas"
                  ? "Pembayaran UKT telah lunas terverifikasi. Hak registrasi akademik dan KRS aktif."
                  : bills[0].status === "Menunggu Verifikasi"
                  ? "Transaksi transfer telah dikonfirmasi dan sedang ditinjau oleh Bagian Keuangan BAAK."
                  : "Lakukan pembayaran sebelum batas akhir pelunasan agar akses pengisian KRS tidak tertunda."}
              </p>
            </div>
          </div>

          {/* Action on Active Bill */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            {bills[0].status === "Belum Bayar" && (
              <button
                onClick={() => {
                  setSelectedBillForPay(bills[0]);
                  setPayModalOpen(true);
                }}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-[#193966] hover:bg-[#122b50] text-white transition shadow-md hover:shadow-lg cursor-pointer"
              >
                <CreditCard size={15} />
                <span>Bayar UKT Sekarang</span>
              </button>
            )}

            {bills[0].status === "Menunggu Verifikasi" && (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl px-4 py-2 text-xs font-medium flex items-center gap-2">
                  <Clock size={14} className="text-amber-600 animate-pulse" />
                  <span>Verifikasi Sedang Diproses</span>
                </div>
              </div>
            )}

            {bills[0].status === "Lunas" && (
              <button
                onClick={() => {
                  setSelectedBillForReceipt(bills[0]);
                  setReceiptModalOpen(true);
                }}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-md hover:shadow-lg cursor-pointer"
              >
                <Download size={15} />
                <span>Unduh Bukti Lunas</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIRTUAL ACCOUNT BOX FOR STUDENT (WHEN BILL IS UNPAID OR PENDING)        */}
      {/* ========================================================================= */}
      {isStudent && bills.length > 0 && bills[0].status !== "Lunas" && (
        <div className="bg-gradient-to-r from-slate-900 via-[#193966] to-[#0f2442] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <span className="text-xs uppercase font-semibold text-emerald-300 tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} />
              Nomor Virtual Account (VA) Resmi Mahasiswa
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-2xl md:text-3xl font-black tracking-wider text-white">
                {bills[0].payment?.vaNumber || `8808${studentInfo?.nim || "2023101001"}`}
              </span>
              <button
                onClick={() =>
                  handleCopyVA(
                    bills[0].payment?.vaNumber || `8808${studentInfo?.nim || "2023101001"}`
                  )
                }
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
                title="Salin Nomor VA"
              >
                {copiedVA === (bills[0].payment?.vaNumber || `8808${studentInfo?.nim || "2023101001"}`) ? (
                  <Check size={18} className="text-emerald-300" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>
            <span className="text-xs text-slate-300 mt-1">
              Bank: <strong>{bills[0].payment?.method || "Bank BNI / Mandiri / BCA"}</strong> · Atas Nama:{" "}
              <strong>{user?.name || "Mahasiswa"}</strong>
            </span>
          </div>

          <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
            {bills[0].status === "Belum Bayar" && (
              <button
                onClick={() => {
                  setSelectedBillForPay(bills[0]);
                  setPayModalOpen(true);
                }}
                className="w-full md:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                <span>Konfirmasi / Bayar VA Sekarang</span>
              </button>
            )}
            <span className="text-[11px] text-slate-300/80">
              Transfer dapat dilakukan dari seluruh ATM dan Mobile Banking di Indonesia.
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FILTER CONTROLS & SEARCH BAR                                            */}
      {/* ========================================================================= */}
      <div className="quiz-control-bar">
        {/* Tab Filters */}
        <div className="lms-tab-nav">
          <button
            onClick={() => setActiveTab("all")}
            className={activeTab === "all" ? "active" : ""}
          >
            <span>Semua Tagihan</span>
            <span className="lms-tab-pill">{bills.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("Lunas")}
            className={activeTab === "Lunas" ? "active" : ""}
          >
            <span>Lunas</span>
            <span className="lms-tab-pill">
              {bills.filter((b) => b.status === "Lunas").length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("Menunggu Verifikasi")}
            className={activeTab === "Menunggu Verifikasi" ? "active" : ""}
          >
            <span>Menunggu Verifikasi</span>
            <span className="lms-tab-pill">
              {bills.filter((b) => b.status === "Menunggu Verifikasi").length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("Belum Bayar")}
            className={activeTab === "Belum Bayar" ? "active" : ""}
          >
            <span>Belum Bayar</span>
            <span className="lms-tab-pill">
              {bills.filter((b) => b.status === "Belum Bayar").length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isAdmin ? "Cari Mahasiswa, NIM, Prodi..." : "Cari riwayat tagihan..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#193966]/20 focus:border-[#193966] bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BILLS LIST / CARD GRID                                                  */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw size={28} className="animate-spin text-[#193966]" />
          <span className="text-xs font-semibold text-slate-600">
            Memuat data transaksi dan tagihan UKT...
          </span>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
          <CreditCard size={36} className="text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">Tidak ada data tagihan UKT ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {searchQuery
              ? `Tidak ditemukan tagihan yang sesuai dengan kata kunci "${searchQuery}".`
              : "Belum ada catatan tagihan pada kategori filter ini."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBills.map((bill) => {
            const isLunas = bill.status === "Lunas";
            const isPending = bill.status === "Menunggu Verifikasi";

            return (
              <div
                key={bill.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow relative"
              >
                <div>
                  {/* Top Meta */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700">
                      <GraduationCap size={13} className="text-[#193966]" />
                      <span>Golongan {bill.uktGroup}</span>
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isLunas
                          ? "bg-emerald-100 text-emerald-800"
                          : isPending
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </div>

                  {/* Student info if admin */}
                  {isAdmin && (
                    <div className="flex items-start gap-3 mb-3.5 pb-3 border-b border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#193966] font-black text-xs flex items-center justify-center flex-shrink-0">
                        {bill.studentName ? bill.studentName.slice(0, 2).toUpperCase() : "MH"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {bill.studentName || "Mahasiswa"}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          NIM: <strong>{bill.studentNim}</strong> · {bill.studyProgramName}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Nominal and Due Date */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-slate-500 font-medium">Nominal UKT Semester</span>
                    <span className="text-xl font-black text-slate-900 tracking-tight">
                      {formatRupiah(bill.amount)}
                    </span>
                  </div>

                  {/* Payment Details */}
                  {bill.payment && (
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Metode Bayar:</span>
                        <strong className="text-slate-800">{bill.payment.method}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Nomor VA:</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                          <span>{bill.payment.vaNumber}</span>
                          <button
                            onClick={() => handleCopyVA(bill.payment!.vaNumber)}
                            className="text-slate-400 hover:text-slate-600"
                            title="Salin VA"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Tanggal Bayar:</span>
                        <span className="text-slate-700">
                          {new Date(bill.payment.paidAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>
                      Jatuh Tempo:{" "}
                      {new Date(bill.dueDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Admin Actions */}
                  {isAdmin ? (
                    isPending && bill.payment ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          disabled={verifyingId === bill.payment.id}
                          onClick={() => handleVerifyPayment(bill.payment!.id, "approve")}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={13} />
                          <span>{verifyingId === bill.payment.id ? "Memproses..." : "Verifikasi Lunas"}</span>
                        </button>
                        <button
                          disabled={verifyingId === bill.payment.id}
                          onClick={() => handleVerifyPayment(bill.payment!.id, "reject")}
                          className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer border border-rose-200"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : isLunas ? (
                      <button
                        onClick={() => {
                          setSelectedBillForReceipt(bill);
                          setReceiptModalOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer border border-slate-200 flex items-center justify-center gap-1.5"
                      >
                        <FileText size={13} className="text-[#193966]" />
                        <span>Lihat Bukti Bayar</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Menunggu pembayaran mahasiswa</span>
                    )
                  ) : (
                    /* Student Actions */
                    isLunas ? (
                      <button
                        onClick={() => {
                          setSelectedBillForReceipt(bill);
                          setReceiptModalOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition cursor-pointer border border-emerald-200 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={13} />
                        <span>Unduh Lembar Bukti Lunas</span>
                      </button>
                    ) : isPending ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 flex items-center justify-center gap-1.5">
                        <Clock size={13} className="animate-spin text-amber-600" />
                        <span>Sedang Ditinjau Admin</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedBillForPay(bill);
                          setPayModalOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#193966] hover:bg-[#122b50] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CreditCard size={13} />
                        <span>Bayar Tagihan Ini</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: STUDENT PAY UKT / VIRTUAL ACCOUNT SELECTOR                      */}
      {/* ========================================================================= */}
      {payModalOpen && selectedBillForPay && (
        <div className="modal-backdrop">
          <div className="user-form-modal course-modal max-w-xl">
            <div className="user-modal-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#193966] text-white flex items-center justify-center flex-shrink-0">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Pembayaran UKT Mahasiswa</h3>
                  <p className="text-xs text-slate-500">
                    Pilih bank penerbit Virtual Account untuk menyelesaikan pelunasan semester.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="user-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="flex flex-col gap-5 p-6">
              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Total Nominal UKT</span>
                  <h4 className="text-xl font-black text-slate-900">
                    {formatRupiah(selectedBillForPay.amount)}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Golongan {selectedBillForPay.uktGroup} · Biaya Admin: Rp 0 (Gratis)
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-blue-100 text-[#193966] font-bold text-xs">
                  Semester Ganjil
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-bold text-slate-700">Pilih Metode Pembayaran VA</label>
                <div className="flex flex-col gap-2">
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = selectedMethod === pm.name;
                    return (
                      <div
                        key={pm.id}
                        onClick={() => setSelectedMethod(pm.name)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? "border-[#193966] bg-blue-50/50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl ${pm.logoColor} text-white flex items-center justify-center font-black text-xs flex-shrink-0`}
                          >
                            {pm.bank.split(" ")[1] || "VA"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900">{pm.name}</span>
                            <span className="text-[11px] text-slate-500">{pm.desc}</span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-[#193966] bg-[#193966] text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instant Verification Demo Checkbox */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <input
                  id="instantVerify"
                  type="checkbox"
                  checked={instantVerify}
                  onChange={(e) => setInstantVerify(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="instantVerify" className="text-xs text-emerald-900 cursor-pointer">
                  <strong>Simulasikan Pembayaran Langsung Lunas (Demo Mode)</strong>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Centang untuk memverifikasi otomatis pelunasan UKT tanpa harus menunggu persetujuan manual admin BAAK.
                  </p>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-6 py-2.5 rounded-xl bg-[#193966] hover:bg-[#122b50] text-white text-xs font-bold transition shadow-lg shadow-[#193966]/20 cursor-pointer flex items-center gap-2"
                >
                  {submittingPayment ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Konfirmasi Pembayaran</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: OFFICIAL DIGITAL RECEIPT / BUKTI LUNAS UKT                       */}
      {/* ========================================================================= */}
      {receiptModalOpen && selectedBillForReceipt && (
        <div className="modal-backdrop">
          <div className="user-form-modal course-modal max-w-2xl bg-white p-0 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShieldCheck size={22} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Bukti Pembayaran Resmi UKT</h3>
                  <span className="text-xs text-slate-300">
                    Biro Administrasi Akademik & Kemahasiswaan (BAAK)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 flex flex-col gap-6">
              {/* Receipt Header details */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    No. Kwitansi / Transaksi
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedBillForReceipt.payment?.id || `INV-${selectedBillForReceipt.id.toUpperCase()}`}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Status Dokumen
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                    LUNAS TERVERIFIKASI
                  </span>
                </div>
              </div>

              {/* Student & Bill Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Nama Mahasiswa</span>
                  <span className="font-bold text-slate-900">
                    {selectedBillForReceipt.studentName || user?.name}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Nomor Induk Mahasiswa (NIM)</span>
                  <span className="font-bold font-mono text-slate-900">
                    {selectedBillForReceipt.studentNim || studentInfo?.nim || "2023101001"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Program Studi</span>
                  <span className="font-bold text-slate-900">
                    {selectedBillForReceipt.studyProgramName || studentInfo?.studyProgramName || "Teknik Informatika"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Tahun Akademik / Semester</span>
                  <span className="font-bold text-slate-900">
                    {selectedBillForReceipt.semesterName || "Semester Ganjil 2026/2027"}
                  </span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Metode Pembayaran</span>
                  <strong className="text-slate-900">
                    {selectedBillForReceipt.payment?.method || "Virtual Account Bank BNI"}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Nomor Virtual Account</span>
                  <strong className="font-mono text-slate-900">
                    {selectedBillForReceipt.payment?.vaNumber || `8808${studentInfo?.nim || "2023101001"}`}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Waktu Pelunasan</span>
                  <span className="text-slate-700">
                    {selectedBillForReceipt.payment?.verifiedAt
                      ? new Date(selectedBillForReceipt.payment.verifiedAt).toLocaleString("id-ID")
                      : "22 September 2026, 09:00 WIB"}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2.5 mt-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Total Nominal Lunas</span>
                  <span className="text-lg font-black text-emerald-600">
                    {formatRupiah(selectedBillForReceipt.amount)}
                  </span>
                </div>
              </div>

              {/* Footer Stamp & Print Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 italic">
                  Dokumen digital ini sah dan diterbitkan secara elektronik oleh Sistem Informasi Akademik Universitas.
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Cetak Kwitansi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceiptModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-[#193966] text-white text-xs font-bold hover:bg-[#122b50] transition cursor-pointer"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: ADMIN CREATE / GENERATE UKT BILL                                 */}
      {/* ========================================================================= */}
      {createBillModalOpen && (
        <div className="modal-backdrop">
          <div className="user-form-modal course-modal max-w-xl">
            <div className="user-modal-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Terbitkan Tagihan UKT Baru</h3>
                  <p className="text-xs text-slate-500">
                    Konfigurasikan tagihan semester mahasiswa berdasarkan penetapan golongan UKT.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateBillModalOpen(false)}
                className="user-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBillSubmit} className="flex flex-col gap-5 p-6">
              <div className="academic-form-grid">
                {/* Select Student */}
                <div className="form-field full-width">
                  <label>Pilih Mahasiswa Penerima Tagihan*</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      const stu = allStudents.find((s) => s.id === e.target.value);
                      if (stu) {
                        setNewUktGroup(stu.uktGroup || 3);
                        const rates: Record<number, number> = {
                          1: 500000,
                          2: 1500000,
                          3: 2500000,
                          4: 4000000,
                          5: 5500000,
                          6: 7000000,
                        };
                        setNewAmount(rates[stu.uktGroup] || 2500000);
                      }
                    }}
                    required
                  >
                    {allStudents.map((stu) => (
                      <option key={stu.id} value={stu.id}>
                        {stu.name} ({stu.nim}) — {stu.studyProgramName} · Gol. {stu.uktGroup}
                      </option>
                    ))}
                  </select>
                </div>

                {/* UKT Group */}
                <div className="form-field">
                  <label>Golongan UKT (1 - 8)*</label>
                  <select
                    value={newUktGroup}
                    onChange={(e) => {
                      const grp = Number(e.target.value);
                      setNewUktGroup(grp);
                      const rates: Record<number, number> = {
                        1: 500000,
                        2: 1500000,
                        3: 2500000,
                        4: 4000000,
                        5: 5500000,
                        6: 7000000,
                      };
                      setNewAmount(rates[grp] || 2500000);
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                      <option key={g} value={g}>
                        Golongan {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nominal */}
                <div className="form-field">
                  <label>Nominal Pembayaran (Rp)*</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    min={500000}
                    step={100000}
                    required
                  />
                </div>

                {/* Due Date */}
                <div className="form-field full-width">
                  <label>Batas Akhir Pelunasan (Jatuh Tempo)*</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateBillModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creatingBill}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
                >
                  {creatingBill ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Terbitkan Tagihan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
