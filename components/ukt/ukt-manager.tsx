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
  ChevronDown,
  ShieldCheck,
  X,
  FileText,
  DollarSign,
  Wallet,
  ArrowRight,
  HelpCircle,
  Download,
  AlertTriangle,
  Plus,
  Landmark,
  BadgeCheck,
  Calendar,
  ExternalLink,
  BookOpen,
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

interface PaymentMethodDetail {
  id: string;
  name: string;
  bank: string;
  code: string;
  color: string;
  bgBadge: string;
  desc: string;
  atmSteps: string[];
  mBankingSteps: string[];
}

const PAYMENT_METHODS: PaymentMethodDetail[] = [
  {
    id: "va-bni",
    name: "Virtual Account BNI",
    bank: "Bank BNI",
    code: "8808",
    color: "from-orange-500 to-amber-600",
    bgBadge: "bg-orange-50 text-orange-700 border-orange-200",
    desc: "Bebas biaya admin transfer antar bank melalui ATM, Mobile, atau Internet Banking BNI.",
    atmSteps: [
      "Masukkan kartu ATM BNI dan PIN Anda.",
      "Pilih Menu Lainnya > Transfer > Jenis Rekening > Ke Rekening BNI.",
      "Masukkan Nomor Virtual Account BNI (contoh: 8808 + NIM Anda).",
      "Periksa rincian nama dan jumlah tagihan UKT pada layar konfirmasi, lalu pilih Ya.",
    ],
    mBankingSteps: [
      "Buka aplikasi BNI Mobile Banking dan login.",
      "Pilih menu Pembayaran > Biaya Pendidikan / Virtual Account Billing.",
      "Pilih rekening debet dan masukkan nomor Virtual Account.",
      "Konfirmasi rincian pembayaran, masukkan password transaksi, dan simpan struk elektronik.",
    ],
  },
  {
    id: "va-mandiri",
    name: "Virtual Account Mandiri",
    bank: "Bank Mandiri",
    code: "8950",
    color: "from-blue-600 to-indigo-700",
    bgBadge: "bg-blue-50 text-blue-700 border-blue-200",
    desc: "Pembayaran terverifikasi otomatis secara instan via aplikasi Livin' by Mandiri.",
    atmSteps: [
      "Masukkan kartu ATM Mandiri dan 6 digit PIN.",
      "Pilih Bayar / Beli > Pendidikan > Masukkan Kode Perusahaan Kampus.",
      "Masukkan Nomor Virtual Account Mandiri Anda.",
      "Tekan angka 1 untuk memilih tagihan, lalu pilih Ya untuk konfirmasi.",
    ],
    mBankingSteps: [
      "Buka aplikasi Livin' by Mandiri (ikon kuning) dan login.",
      "Pilih menu Bayar > Buat Pembayaran Baru > Pendidikan.",
      "Cari penyedia jasa universitas dan masukkan Nomor VA Anda.",
      "Cek nama mahasiswa dan nominal tagihan, lalu selesaikan dengan PIN Livin'.",
    ],
  },
  {
    id: "va-bca",
    name: "Virtual Account BCA",
    bank: "Bank BCA",
    code: "1234",
    color: "from-blue-800 to-cyan-800",
    bgBadge: "bg-cyan-50 text-cyan-800 border-cyan-200",
    desc: "Transfer cepat kapan saja melalui aplikasi BCA Mobile, myBCA, dan ATM BCA.",
    atmSteps: [
      "Masukkan kartu ATM BCA dan PIN Anda.",
      "Pilih menu Transaksi Lainnya > Transfer > Ke Rek BCA Virtual Account.",
      "Ketik Nomor Virtual Account BCA Anda.",
      "Cek kesesuaian nama dan jumlah tagihan pada layar, lalu tekan Ya.",
    ],
    mBankingSteps: [
      "Buka aplikasi BCA Mobile, pilih m-BCA dan masukkan kode akses.",
      "Pilih menu m-Transfer > BCA Virtual Account.",
      "Masukkan Nomor Virtual Account Anda dan tekan Send.",
      "Masukkan PIN m-BCA untuk mengonfirmasi transaksi pelunasan.",
    ],
  },
  {
    id: "va-bri",
    name: "Virtual Account BRI",
    bank: "Bank BRI",
    code: "0020",
    color: "from-sky-600 to-blue-700",
    bgBadge: "bg-sky-50 text-sky-800 border-sky-200",
    desc: "Didukung penuh melalui aplikasi BRImo dan jaringan ATM BRI seluruh Indonesia.",
    atmSteps: [
      "Masukkan kartu ATM BRI dan PIN.",
      "Pilih menu Transaksi Lain > Pembayaran > Lainnya > BRIVA.",
      "Masukkan nomor BRIVA (Kode 0020 + NIM Anda).",
      "Periksa rincian data mahasiswa pada monitor ATM, lalu tekan Ya.",
    ],
    mBankingSteps: [
      "Buka aplikasi BRImo dan login dengan fingerprint atau password.",
      "Pilih menu Pembayaran > BRIVA.",
      "Masukkan nomor BRIVA mahasiswa.",
      "Periksa detail tagihan UKT dan masukkan PIN BRImo Anda.",
    ],
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

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<"all" | "Lunas" | "Menunggu Verifikasi" | "Belum Bayar">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBillForPay, setSelectedBillForPay] = useState<ApiUktBill | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState(PAYMENT_METHODS[0].id);
  const [instantVerify, setInstantVerify] = useState(true);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<ApiUktBill | null>(null);

  // Instructions Modal
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [guideActiveBank, setGuideActiveBank] = useState(PAYMENT_METHODS[0].id);
  const [guideTab, setGuideTab] = useState<"mbanking" | "atm">("mbanking");

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
            setNewUktGroup(json.data.students[0].uktGroup || 3);
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

    const chosen = PAYMENT_METHODS.find((m) => m.id === selectedMethodId);
    const methodName = chosen ? chosen.name : PAYMENT_METHODS[0].name;

    setSubmittingPayment(true);
    try {
      const res = await authFetch(`${API_URL}/ukt/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId: selectedBillForPay.id,
          method: methodName,
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

  const selectedGuideMethod = useMemo(() => {
    return PAYMENT_METHODS.find((m) => m.id === guideActiveBank) || PAYMENT_METHODS[0];
  }, [guideActiveBank]);

  return (
    <div className="page-container space-y-6">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER HEADER & STATS STRIP                                        */}
      {/* ========================================================================= */}
      <div className="cal-hero-banner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="quiz-hero-tag">
              <CreditCard className="w-3.5 h-3.5" />
              <span>SISTEM MANAJEMEN FINANSIAL & UKT TERPADU</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              {isAdmin ? "Manajemen UKT & Verifikasi Pembayaran Mahasiswa" : "Uang Kuliah Tunggal (UKT) & Administrasi Keuangan"}
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl mt-2 leading-relaxed font-medium">
              {isAdmin
                ? "Pantau dan kelola seluruh transaksi pembayaran UKT mahasiswa, verifikasi bukti pelunasan transfer, serta terbitkan ketetapan tagihan semester."
                : "Informasi tagihan semester resmi, nomor Virtual Account transfer bank nasional, konfirmasi pembayaran, serta unduhan kwitansi pelunasan sah."}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-auto flex-wrap">
            <button
              onClick={fetchUktData}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs bg-white text-[#193966] hover:bg-slate-50 transition shadow-lg cursor-pointer"
              title="Perbarui Data UKT"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-[#193966]" : "text-[#193966]"} />
              <span>Segarkan</span>
            </button>

            {isStudent && (
              <button
                onClick={() => setGuideModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md border border-white/20 cursor-pointer"
              >
                <HelpCircle size={15} />
                <span>Petunjuk Bayar VA</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={openCreateBillModal}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Plus size={16} strokeWidth={3} />
                </div>
                <span>+ Terbitkan Tagihan UKT</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="quiz-stats-strip mt-6 pt-5 border-t border-white/20">
          {isAdmin ? (
            <>
              <div className="quiz-stat-box">
                <span className="text-blue-200 font-semibold text-xs">Total Tagihan Terbit</span>
                <strong className="text-white text-2xl font-black">
                  {summary?.totalBills ?? bills.length} Tagihan
                </strong>
              </div>
              <div className="quiz-stat-box">
                <span className="text-blue-200 font-semibold text-xs">Dana UKT Terkumpul</span>
                <strong className="text-emerald-300 text-2xl font-black">
                  {formatRupiah(summary?.totalCollected ?? 0)}
                </strong>
              </div>
              <div className="quiz-stat-box">
                <span className="text-blue-200 font-semibold text-xs">Menunggu Verifikasi</span>
                <strong className="text-amber-200 text-2xl font-black">
                  {summary?.pendingCount ?? 0} Transaksi
                </strong>
              </div>
              <div className="quiz-stat-box">
                <span className="text-blue-200 font-semibold text-xs">Belum Melakukan Bayar</span>
                <strong className="text-rose-200 text-2xl font-black">
                  {summary?.unpaidCount ?? 0} Mahasiswa
                </strong>
              </div>
            </>
          ) : (
            <>
              <div className="quiz-stat-box">
                <span className="text-blue-200 font-semibold text-xs">Golongan Penetapan UKT</span>
                <strong className="text-emerald-300 text-2xl font-black">
                  Golongan {studentInfo?.uktGroup ?? (bills[0]?.uktGroup || 3)}
                </strong>
              </div>
              <div className="quiz-stat-box">
                <span className="text-blue-200 font-semibold text-xs">Nominal Tagihan Semester</span>
                <strong className="text-white text-2xl font-black">
                  {formatRupiah(bills[0]?.amount || 2500000)}
                </strong>
              </div>
              <div className="quiz-stat-box">
                <span className="text-blue-200 font-semibold text-xs">Status Pelunasan</span>
                <strong
                  className={`text-2xl font-black ${
                    bills[0]?.status === "Lunas"
                      ? "text-emerald-300"
                      : bills[0]?.status === "Menunggu Verifikasi"
                      ? "text-amber-200"
                      : "text-rose-200"
                  }`}
                >
                  {bills[0]?.status || "Belum Bayar"}
                </strong>
              </div>
              <div className="quiz-stat-box">
                <span className="text-blue-200 font-semibold text-xs">Batas Waktu Pelunasan</span>
                <strong className="text-blue-200 text-base font-extrabold mt-1">
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
      {/* 2. STUDENT ACTIVE BILL HERO CARD (ELITE FINTECH / ACADEMIC STYLE)          */}
      {/* ========================================================================= */}
      {isStudent && bills.length > 0 && (
        <div className="lms-card-elevated border-2 border-slate-200/90 relative overflow-hidden p-6 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4 sm:gap-5">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  bills[0].status === "Lunas"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : bills[0].status === "Menunggu Verifikasi"
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : "bg-blue-50 text-[#193966] border border-blue-200"
                }`}
              >
                {bills[0].status === "Lunas" ? (
                  <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9" />
                ) : bills[0].status === "Menunggu Verifikasi" ? (
                  <Clock className="w-8 h-8 sm:w-9 sm:h-9 animate-pulse" />
                ) : (
                  <Wallet className="w-8 h-8 sm:w-9 sm:h-9" />
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-1 rounded-lg text-[10.5px] font-black uppercase tracking-wider bg-blue-50 text-[#193966] border border-blue-200 shadow-2xs">
                    Tagihan Semester Ganjil 2026/2027
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-black border shadow-2xs ${
                      bills[0].status === "Lunas"
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : bills[0].status === "Menunggu Verifikasi"
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : "bg-rose-100 text-rose-900 border-rose-300"
                    }`}
                  >
                    {bills[0].status}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                  {formatRupiah(bills[0].amount)}
                </h2>

                <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed font-medium">
                  {bills[0].status === "Lunas"
                    ? "Status keuangan Anda telah dinyatakan LUNAS terverifikasi oleh BAAK. Seluruh hak registrasi Kartu Rencana Studi (KRS) dan akses ujian CBT telah dibuka."
                    : bills[0].status === "Menunggu Verifikasi"
                    ? "Konfirmasi transfer Virtual Account telah diterima sistem dan dalam antrean verifikasi otomatis Bagian Keuangan BAAK."
                    : "Lakukan pelunasan sebelum jatuh tempo akademik agar masa pengisian KRS dan perkuliahan aktif tidak terhambat."}
                </p>
              </div>
            </div>

            {/* Action Buttons on Bill */}
            <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
              {bills[0].status === "Belum Bayar" && (
                <button
                  onClick={() => {
                    setSelectedBillForPay(bills[0]);
                    setPayModalOpen(true);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#193966] via-[#234b8c] to-[#1e40af] hover:from-[#132c50] hover:to-[#1a3869] shadow-xl shadow-blue-950/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <CreditCard size={16} />
                  <span>Bayar UKT Sekarang</span>
                  <ArrowRight size={14} />
                </button>
              )}

              {bills[0].status === "Menunggu Verifikasi" && (
                <div className="w-full sm:w-auto flex items-center gap-3 bg-amber-50 text-amber-900 border border-amber-200/90 rounded-2xl px-5 py-3 shadow-xs">
                  <Clock size={16} className="text-amber-600 animate-spin flex-shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black">Dalam Proses Verifikasi</span>
                    <span className="text-[11px] text-amber-700">Estimasi validasi berkisar 1 - 5 menit</span>
                  </div>
                </div>
              )}

              {bills[0].status === "Lunas" && (
                <button
                  onClick={() => {
                    setSelectedBillForReceipt(bills[0]);
                    setReceiptModalOpen(true);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-xl shadow-emerald-700/25 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <Download size={15} />
                  <span>Unduh Kwitansi Pelunasan</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIRTUAL ACCOUNT CARD WITH BANK SELECTOR CHIPS (FOR STUDENT)            */}
      {/* ========================================================================= */}
      {isStudent && bills.length > 0 && bills[0].status !== "Lunas" && (
        <div className="rounded-3xl bg-gradient-to-br from-[#0c1a30] via-[#162f55] to-[#1b3a6b] p-6 sm:p-7 text-white shadow-2xl border border-white/10 relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300">
                  <Landmark size={16} />
                </div>
                <span className="text-xs uppercase font-black text-emerald-300 tracking-wider">
                  Kanal Pembayaran Virtual Account (VA) Nasional
                </span>
              </div>
              <span className="text-[11px] text-blue-200 font-semibold">
                Biaya Admin Transaksi: <strong className="text-emerald-300">Rp 0 (Gratis)</strong>
              </span>
            </div>

            {/* Bank Selector Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = selectedMethodId === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setSelectedMethodId(pm.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer flex-shrink-0 border ${
                      isSelected
                        ? "bg-white text-[#193966] border-white shadow-md font-black"
                        : "bg-white/10 text-white/80 border-white/10 hover:bg-white/20"
                    }`}
                  >
                    <span>{pm.bank}</span>
                    {isSelected && <BadgeCheck size={14} className="text-[#193966]" />}
                  </button>
                );
              })}
            </div>

            {/* Virtual Account Display Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md">
              <div className="flex flex-col">
                <span className="text-xs text-blue-200 font-medium">
                  Nomor Virtual Account{" "}
                  <strong>{PAYMENT_METHODS.find((m) => m.id === selectedMethodId)?.bank}</strong>
                </span>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-white drop-shadow-sm">
                    {bills[0].payment?.vaNumber ||
                      `${PAYMENT_METHODS.find((m) => m.id === selectedMethodId)?.code || "8808"}${
                        studentInfo?.nim || "2023101001"
                      }`}
                  </span>
                  <button
                    onClick={() =>
                      handleCopyVA(
                        bills[0].payment?.vaNumber ||
                          `${PAYMENT_METHODS.find((m) => m.id === selectedMethodId)?.code || "8808"}${
                            studentInfo?.nim || "2023101001"
                          }`
                      )
                    }
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 transition cursor-pointer text-xs font-bold text-white border border-white/20"
                    title="Salin Nomor VA"
                  >
                    {copiedVA ? (
                      <>
                        <Check size={14} className="text-emerald-300" />
                        <span className="text-emerald-300">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Salin Nomor</span>
                      </>
                    )}
                  </button>
                </div>
                <span className="text-xs text-blue-200/90 mt-1.5">
                  Atas Nama Mahasiswa: <strong>{user?.name || "Mahasiswa"}</strong> · Kode Kampus: <strong>4401</strong>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                {bills[0].status === "Belum Bayar" && (
                  <button
                    onClick={() => {
                      setSelectedBillForPay(bills[0]);
                      setPayModalOpen(true);
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs transition shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>Konfirmasi Pembayaran VA</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setGuideActiveBank(selectedMethodId);
                    setGuideModalOpen(true);
                  }}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <BookOpen size={14} />
                  <span>Panduan Transfer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FILTER CONTROLS & SEARCH BAR                                            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="lms-tab-nav w-full lg:w-auto">
          {[
            {
              id: "all",
              label: "Semua Tagihan",
              count: bills.length,
              icon: CreditCard,
              badgeClass: "",
            },
            {
              id: "Lunas",
              label: "Lunas Terverifikasi",
              count: bills.filter((b) => b.status === "Lunas").length,
              icon: CheckCircle2,
              badgeClass: "bg-emerald-100 text-emerald-800",
            },
            {
              id: "Menunggu Verifikasi",
              label: "Menunggu Verifikasi",
              count: bills.filter((b) => b.status === "Menunggu Verifikasi").length,
              icon: Clock,
              badgeClass: "bg-amber-100 text-amber-800",
            },
            {
              id: "Belum Bayar",
              label: "Belum Bayar",
              count: bills.filter((b) => b.status === "Belum Bayar").length,
              icon: AlertCircle,
              badgeClass: "bg-rose-100 text-rose-800",
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`lms-tab-pill ${isActive ? "active" : ""}`}
              >
                <Icon size={14} className={isActive ? "text-[#193966]" : "text-slate-400"} />
                <span>{tab.label}</span>
                <span className={`lms-tab-badge ${tab.badgeClass}`}>{tab.count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 w-full lg:w-72">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isAdmin ? "Cari Nama, NIM, Prodi..." : "Cari riwayat tagihan..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#193966]/20 focus:border-[#193966] bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BILLS LIST / CARD GRID USING LMS-CARD-ELEVATED                          */}
      {/* ========================================================================= */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center shadow-sm">
          <div className="w-10 h-10 border-3 border-[#193966] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Memuat data transaksi dan tagihan UKT...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 p-5 rounded-2xl text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border-2 border-dashed border-slate-300 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3 border border-slate-200">
            <CreditCard className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Tidak Ada Data Tagihan Ditemukan</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed font-medium">
            {searchQuery
              ? `Tidak ditemukan tagihan yang sesuai dengan kata kunci "${searchQuery}".`
              : "Belum ada catatan tagihan pada kategori filter ini."}
          </p>
        </div>
      ) : (
        <div className="quiz-grid">
          {filteredBills.map((bill) => {
            const isLunas = bill.status === "Lunas";
            const isPending = bill.status === "Menunggu Verifikasi";

            return (
              <div
                key={bill.id}
                className="lms-card-elevated border-2 border-slate-200 group"
              >
                <div>
                  {/* Card Header with Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="px-3 py-1 rounded-lg text-[10.5px] font-black uppercase tracking-wider bg-blue-50 text-[#193966] border border-blue-200 shadow-2xs flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-[#193966]" />
                      <span>Golongan {bill.uktGroup}</span>
                    </span>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-black border shadow-2xs flex items-center gap-1.5 ${
                        isLunas
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : isPending
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-rose-100 text-rose-900 border-rose-300"
                      }`}
                    >
                      {isLunas ? (
                        <CheckCircle2 size={13} className="text-emerald-700" />
                      ) : isPending ? (
                        <Clock size={13} className="text-amber-700 animate-spin" />
                      ) : (
                        <AlertCircle size={13} className="text-rose-700" />
                      )}
                      <span>{bill.status}</span>
                    </span>
                  </div>

                  {/* Student info if admin */}
                  {isAdmin && (
                    <div className="flex items-start gap-3 mb-4 pb-3.5 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#193966] to-[#234b8c] text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                        {bill.studentName ? bill.studentName.slice(0, 2).toUpperCase() : "MH"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {bill.studentName || "Mahasiswa"}
                        </h4>
                        <span className="text-xs text-slate-500 font-semibold mt-0.5">
                          NIM: <strong className="text-slate-800">{bill.studentNim}</strong> · {bill.studyProgramName}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Nominal and Semester */}
                  <div className="flex flex-col gap-1 mb-3">
                    <span className="text-xs font-semibold text-slate-500">Nominal Tagihan UKT Semester</span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {formatRupiah(bill.amount)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {bill.semesterName || "Semester Ganjil 2026/2027"}
                    </span>
                  </div>

                  {/* Payment Details Container */}
                  {bill.payment ? (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs flex flex-col gap-2 mb-3">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium">Metode Pembayaran:</span>
                        <strong className="text-slate-800">{bill.payment.method}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium">Nomor VA:</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          <span>{bill.payment.vaNumber}</span>
                          <button
                            onClick={() => handleCopyVA(bill.payment!.vaNumber)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Salin VA"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium">Waktu Transaksi:</span>
                        <span className="text-slate-700 font-semibold">
                          {new Date(bill.payment.paidAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 mb-3 flex items-center gap-2">
                      <Clock size={13} className="text-slate-400 flex-shrink-0" />
                      <span>Belum ada transaksi pembayaran yang dilakukan.</span>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium mb-1">
                    <Calendar size={13} className="text-slate-400" />
                    <span>
                      Jatuh Tempo:{" "}
                      <strong>
                        {new Date(bill.dueDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2.5">
                  {isAdmin ? (
                    isPending && bill.payment ? (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          disabled={verifyingId === bill.payment.id}
                          onClick={() => handleVerifyPayment(bill.payment!.id, "approve")}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={14} />
                          <span>{verifyingId === bill.payment.id ? "Memproses..." : "Verifikasi Lunas"}</span>
                        </button>
                        <button
                          disabled={verifyingId === bill.payment.id}
                          onClick={() => handleVerifyPayment(bill.payment!.id, "reject")}
                          className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer border border-rose-200"
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
                        className="lms-btn-secondary w-full"
                      >
                        <FileText size={14} className="text-[#193966]" />
                        <span>Lihat Bukti Pelunasan</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 italic py-1">Menunggu transaksi mahasiswa</span>
                    )
                  ) : (
                    /* Student Actions */
                    isLunas ? (
                      <button
                        onClick={() => {
                          setSelectedBillForReceipt(bill);
                          setReceiptModalOpen(true);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs transition cursor-pointer border border-emerald-200 flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>Unduh Lembar Bukti Lunas</span>
                      </button>
                    ) : isPending ? (
                      <div className="w-full py-2.5 px-3 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 flex items-center justify-center gap-1.5">
                        <Clock size={14} className="animate-spin text-amber-600" />
                        <span>Sedang Ditinjau Admin</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedBillForPay(bill);
                          setPayModalOpen(true);
                        }}
                        className="lms-btn-primary w-full"
                      >
                        <CreditCard size={14} />
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
                  <p className="text-xs text-slate-500 font-medium">
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
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Total Nominal Tagihan UKT</span>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">
                    {formatRupiah(selectedBillForPay.amount)}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Golongan {selectedBillForPay.uktGroup} · Biaya Administrasi: <strong className="text-emerald-600">Rp 0 (Gratis)</strong>
                  </span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-blue-100 text-[#193966] font-black text-xs border border-blue-200">
                  Semester Ganjil
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-black text-slate-800">Pilih Rekening Bank Virtual Account</label>
                <div className="flex flex-col gap-2.5">
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = selectedMethodId === pm.id;
                    return (
                      <div
                        key={pm.id}
                        onClick={() => setSelectedMethodId(pm.id)}
                        className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? "border-[#193966] bg-blue-50/60 shadow-sm ring-1 ring-[#193966]"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pm.color} text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm`}
                          >
                            {pm.bank.split(" ")[1] || "VA"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900">{pm.name}</span>
                            <span className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">
                              {pm.desc}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
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
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-start gap-3">
                <input
                  id="instantVerify"
                  type="checkbox"
                  checked={instantVerify}
                  onChange={(e) => setInstantVerify(e.target.checked)}
                  className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="instantVerify" className="text-xs text-emerald-950 cursor-pointer">
                  <strong className="font-black">Simulasikan Pembayaran Langsung Lunas (Demo Mode)</strong>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed font-medium">
                    Centang opsi ini agar pembayaran diverifikasi otomatis seketika tanpa harus menunggu approval manual admin BAAK.
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
                  className="lms-btn-primary"
                >
                  {submittingPayment ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Memproses Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Konfirmasi & Dapatkan VA</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: OFFICIAL DIGITAL RECEIPT / BUKTI LUNAS UKT (HIGH PRESTIGE)       */}
      {/* ========================================================================= */}
      {receiptModalOpen && selectedBillForReceipt && (
        <div className="modal-backdrop">
          <div className="user-form-modal course-modal max-w-2xl bg-white p-0 overflow-hidden shadow-2xl">
            <div className="p-6 bg-gradient-to-r from-slate-900 via-[#193966] to-[#0f2442] text-white flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15">
                  <ShieldCheck size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Lembar Bukti Pelunasan Resmi UKT</h3>
                  <span className="text-xs text-blue-200 font-medium">
                    Biro Administrasi Akademik & Kemahasiswaan (BAAK) Universitas
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 cursor-pointer transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 flex flex-col gap-6">
              {/* Receipt Header details */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    No. Kwitansi Digital
                  </span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {selectedBillForReceipt.payment?.id || `INV-${selectedBillForReceipt.id.toUpperCase()}`}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    Status Dokumen
                  </span>
                  <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300">
                    LUNAS TERVERIFIKASI
                  </span>
                </div>
              </div>

              {/* Student & Bill Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-semibold">Nama Mahasiswa</span>
                  <span className="font-black text-slate-900 text-sm">
                    {selectedBillForReceipt.studentName || user?.name}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-semibold">Nomor Induk Mahasiswa (NIM)</span>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    {selectedBillForReceipt.studentNim || studentInfo?.nim || "2023101001"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-semibold">Program Studi</span>
                  <span className="font-bold text-slate-900">
                    {selectedBillForReceipt.studyProgramName || studentInfo?.studyProgramName || "Teknik Informatika"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-semibold">Tahun Akademik</span>
                  <span className="font-bold text-slate-900">
                    {selectedBillForReceipt.semesterName || "Semester Ganjil 2026/2027"}
                  </span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">Metode Pembayaran</span>
                  <strong className="text-slate-900">
                    {selectedBillForReceipt.payment?.method || "Virtual Account Bank BNI"}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">Nomor Virtual Account</span>
                  <strong className="font-mono text-slate-900">
                    {selectedBillForReceipt.payment?.vaNumber || `8808${studentInfo?.nim || "2023101001"}`}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">Waktu Transaksi Selesai</span>
                  <span className="text-slate-800 font-semibold">
                    {selectedBillForReceipt.payment?.verifiedAt
                      ? new Date(selectedBillForReceipt.payment.verifiedAt).toLocaleString("id-ID")
                      : "22 September 2026, 09:00 WIB"}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-3 mt-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Total Nominal Lunas</span>
                  <span className="text-xl font-black text-emerald-600">
                    {formatRupiah(selectedBillForReceipt.amount)}
                  </span>
                </div>
              </div>

              {/* Footer Stamp & Print Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <span className="text-[11px] text-slate-400 italic max-w-xs leading-tight">
                  Dokumen digital ini sah dan diterbitkan secara elektronik oleh Sistem Informasi Akademik Universitas.
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="lms-btn-secondary"
                  >
                    <Printer size={15} />
                    <span>Cetak Kwitansi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceiptModalOpen(false)}
                    className="lms-btn-primary"
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
      {/* 8. MODAL: PAYMENT GUIDE / PETUNJUK PEMBAYARAN VIRTUAL ACCOUNT             */}
      {/* ========================================================================= */}
      {guideModalOpen && (
        <div className="modal-backdrop">
          <div className="user-form-modal course-modal max-w-2xl bg-white p-0 overflow-hidden shadow-2xl">
            <div className="p-6 bg-[#193966] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <HelpCircle size={20} className="text-blue-200" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Petunjuk Pembayaran Virtual Account</h3>
                  <p className="text-xs text-blue-200">
                    Tata cara pelunasan tagihan melalui ATM dan Mobile Banking.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGuideModalOpen(false)}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 cursor-pointer transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Bank selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PAYMENT_METHODS.map((bank) => {
                  const isActive = guideActiveBank === bank.id;
                  return (
                    <button
                      key={bank.id}
                      onClick={() => setGuideActiveBank(bank.id)}
                      className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                        isActive
                          ? "bg-blue-50 border-[#193966] ring-1 ring-[#193966] text-[#193966]"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-br ${bank.color} text-white font-black text-[11px] flex items-center justify-center`}
                      >
                        {bank.bank.split(" ")[1]}
                      </div>
                      <span className="text-xs font-black">{bank.bank}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-tab: Mobile Banking vs ATM */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setGuideTab("mbanking")}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    guideTab === "mbanking"
                      ? "bg-[#193966] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Mobile Banking
                </button>
                <button
                  onClick={() => setGuideTab("atm")}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    guideTab === "atm"
                      ? "bg-[#193966] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  ATM & Setor Tunai
                </button>
              </div>

              {/* Step by Step instructions */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-black text-slate-800">
                  Langkah Pembayaran via {guideTab === "mbanking" ? "Mobile Banking" : "Mesin ATM"}:
                </span>
                <div className="flex flex-col gap-2.5">
                  {(guideTab === "mbanking"
                    ? selectedGuideMethod.mBankingSteps
                    : selectedGuideMethod.atmSteps
                  ).map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#193966] text-white text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="font-medium leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setGuideModalOpen(false)}
                  className="lms-btn-primary"
                >
                  Tutup Panduan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: ADMIN CREATE / GENERATE UKT BILL                                 */}
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
                  <p className="text-xs text-slate-500 font-medium">
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
                  className="lms-btn-primary"
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
