"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ClipboardCheck,
  Award,
  CreditCard,
  FileText,
  Sparkles,
  Info,
  CheckCheck,
  CalendarDays,
  ExternalLink,
  Filter,
  ChevronRight,
} from "lucide-react";
import type { AppNotification } from "../../src/models/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function NotificationPopover() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tabFilter, setTabFilter] = useState<"all" | "unread" | "tasks" | "academic">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setNotifications(json.data.notifications || []);
          setUnreadCount(json.data.unreadCount || 0);
        }
      }
    } catch {
      // Silently fail if server is unreachable
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Mark single notification as read and navigate
  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      try {
        await fetch(`${API_URL}/notifications/${notif.id}/read`, {
          method: "PUT",
          credentials: "include",
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Ignore
      }
    }
    setIsOpen(false);
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  // Badge label and icon helper based on type
  const getTypeMeta = (type: string) => {
    switch (type) {
      case "assignment":
        return {
          label: "Penugasan Kuliah",
          badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <ClipboardCheck size={16} className="text-blue-600" />,
          bgColor: "bg-blue-50",
        };
      case "quiz":
        return {
          label: "Kuis & Asesmen CBT",
          badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: <Award size={16} className="text-indigo-600" />,
          bgColor: "bg-indigo-50",
        };
      case "calendar":
        return {
          label: "Agenda Kalender",
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CalendarDays size={16} className="text-emerald-600" />,
          bgColor: "bg-emerald-50",
        };
      case "ukt":
        return {
          label: "Administrasi UKT",
          badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <CreditCard size={16} className="text-amber-600" />,
          bgColor: "bg-amber-50",
        };
      case "submission":
        return {
          label: "Pengumpulan Tugas",
          badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
          icon: <FileText size={16} className="text-teal-600" />,
          bgColor: "bg-teal-50",
        };
      case "grade":
        return {
          label: "Evaluasi Nilai",
          badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
          icon: <Sparkles size={16} className="text-purple-600" />,
          bgColor: "bg-purple-50",
        };
      default:
        return {
          label: "Warta Kampus",
          badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
          icon: <Info size={16} className="text-slate-600" />,
          bgColor: "bg-slate-50",
        };
    }
  };

  // Filtered notifications based on tab
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (tabFilter === "unread") return !n.isRead;
      if (tabFilter === "tasks") return n.type === "assignment" || n.type === "quiz" || n.type === "submission" || n.type === "grade";
      if (tabFilter === "academic") return n.type === "calendar" || n.type === "ukt" || n.type === "system";
      return true;
    });
  }, [notifications, tabFilter]);

  // Relative time format in natural Indonesian
  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return "Baru saja";
      if (diffMins < 60) return `${diffMins} mnt lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return "Kemarin";
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return past.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with refined animation and ring */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition duration-150 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        aria-label="Pemberitahuan Sistem"
        title="Lihat Pemberitahuan Akademik"
      >
        <Bell size={20} className="transition-transform active:scale-95" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10.5px] font-extrabold rounded-full flex items-center justify-center shadow-md animate-pulse border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel - Binance Inspired Luxury UI */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[calc(100vw-24px)] sm:w-[430px] max-w-[430px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-scale-up text-left ring-1 ring-black/5">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                  Pusat Notifikasi
                </h4>
                {unreadCount > 0 ? (
                  <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black rounded-full flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {unreadCount} Baru
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                    Terbaca Semua
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-200 transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                  title="Tandai semua notifikasi sudah dibaca"
                >
                  <CheckCheck size={13} className="text-[#234b8c]" />
                  <span>Tandai Semua Dibaca</span>
                </button>
              )}
            </div>

            {/* Sub-menu Tabs inside Popover - Binance Clean Segmented Style */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mt-2.5">
              {[
                { id: "all", label: "Semua", count: notifications.length },
                { id: "unread", label: "Belum Dibaca", count: unreadCount },
                {
                  id: "tasks",
                  label: "Tugas & Kuis",
                  count: notifications.filter(
                    (n) => n.type === "assignment" || n.type === "quiz" || n.type === "submission"
                  ).length,
                },
                {
                  id: "academic",
                  label: "Agenda & UKT",
                  count: notifications.filter((n) => n.type === "calendar" || n.type === "ukt").length,
                },
              ].map((tab) => {
                const isActive = tabFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTabFilter(tab.id as typeof tabFilter)}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer truncate ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    <span className="truncate">{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`text-[9.5px] px-1 py-0.2 rounded-full font-black flex-shrink-0 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-14 text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Bell size={22} className="opacity-50" />
                </div>
                <h5 className="text-xs font-bold text-slate-800">Tidak Ada Pemberitahuan</h5>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Semua aktivitas tugas, evaluasi ujian kuis, dan jadwal akademik akan diperbarui secara real-time di sini.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const meta = getTypeMeta(notif.type);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 relative border-l-[3px] group ${
                      !notif.isRead
                        ? "bg-blue-50/20 border-l-[#234b8c]"
                        : "bg-white border-l-transparent opacity-85 hover:opacity-100"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl ${meta.bgColor} flex items-center justify-center flex-shrink-0 border border-slate-200/70 shadow-xs mt-0.5`}
                    >
                      {meta.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border whitespace-nowrap ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" title="Belum dibaca" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap flex-shrink-0">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <h5
                        className={`text-[12.5px] leading-snug break-words ${
                          !notif.isRead ? "font-black text-slate-950" : "font-bold text-slate-800"
                        }`}
                      >
                        {notif.title}
                      </h5>

                      <p className="text-[11.5px] text-slate-600 font-medium break-words mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.actionUrl && (
                        <div className="flex items-center gap-1 text-[10.5px] font-bold text-[#234b8c] mt-2 group-hover:underline">
                          <span>Buka Detail</span>
                          <ChevronRight size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between px-4">
            <span className="text-[10.5px] text-slate-500 font-medium">
              Sistem Informasi Akademik Terpadu
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Sinkron
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
