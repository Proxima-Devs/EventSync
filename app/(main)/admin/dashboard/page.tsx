"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Calendar,
  Mic,
  Building2,
  MessageSquare,
  Radio,
  LayoutDashboard,
  TrendingUp,
  X,
  Plus,
  ArrowUpRight,
  Users,
  Zap,
  ChevronRight,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { EventPayload, Stats } from "@/types";


function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#1e2530] bg-[#0d1117] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-24 bg-[#1e2530] rounded-lg" />
        <div className="w-9 h-9 bg-[#1e2530] rounded-xl" />
      </div>
      <div className="h-8 w-16 bg-[#1e2530] rounded-lg mb-2" />
      <div className="h-3 w-28 bg-[#1e2530] rounded-lg" />
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accent = false,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  accent?: boolean;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-2xl border border-[#1e2530] bg-[#0d1117] p-6 hover:border-[#00E5FF33] transition-all duration-300 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_top_left,#00E5FF08_0%,transparent_60%)]" />
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${accent
            ? "bg-[#00E5FF15] border border-[#00E5FF30] text-[#00E5FF] group-hover:bg-[#00E5FF20]"
            : "bg-[#ffffff08] border border-[#1e2530] text-[#3a4a5a] group-hover:text-[#00E5FF] group-hover:border-[#00E5FF30]"
            }`}
        >
          <Icon size={16} />
        </div>
      </div>
      <div
        className={`text-4xl font-black tracking-tight mb-1 transition-colors duration-300 ${accent ? "text-[#00E5FF]" : "text-white group-hover:text-[#eee]"
          }`}
      >
        {value}
      </div>
      {sub && (
        <p className="text-xs text-[#3a4a5a] flex items-center gap-1 mt-0.5">
          <TrendingUp size={10} className="text-emerald-500" />
          {sub}
        </p>
      )}
    </Link>
  );
}

// ─── Create Event Modal ───────────────────────────────────────────────────────

function CreateEventModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const t = useTranslations("AdminDashboardPage");
  const overlayRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<EventPayload>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    coverImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  const handleClose = useCallback(() => {
    setForm({ title: "", description: "", startDate: "", endDate: "", location: "", coverImage: "" });
    setError("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.startDate || !form.endDate) {
      setError(t("createEventModal.errors.requiredFields"));
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError(t("createEventModal.errors.startBeforeEnd"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur lors de la création");
      }
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      style={{ animation: "fadeIn 0.15s ease" }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[#1e2530] bg-[#0a0e14] shadow-2xl"
        style={{ animation: "slideUp 0.2s ease" }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00E5FF40] to-transparent" />

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#1e2530]">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">{t("createEventModal.title")}</h2>
            <p className="text-xs text-[#3a4a5a] mt-0.5">{t("createEventModal.description")}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-white hover:border-[#00E5FF33] transition-all duration-200"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-1.5">
              {t("createEventModal.titleLabel")} <span className="text-[#00E5FF]">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={t("createEventModal.titlePlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-1.5">
              {t("createEventModal.descriptionLabel")}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={t("createEventModal.descriptionPlaceholder")}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-1.5">
                {t("createEventModal.startDateLabel")} <span className="text-[#00E5FF]">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-1.5">
                {t("createEventModal.endDateLabel")} <span className="text-[#00E5FF]">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-1.5">
              {t("createEventModal.locationLabel")}
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder={t("createEventModal.locationPlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-1.5">
              {t("createEventModal.coverImageLabel")}
            </label>
            <input
              type="url"
              value={form.coverImage}
              onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
              placeholder={t("createEventModal.coverImagePlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-900/60 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border border-[#1e2530] text-sm text-[#4a5568] hover:text-white hover:border-[#2e3a4a] transition-all duration-200 font-semibold"
            >
              {t("createEventModal.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#00E5FF] text-black text-sm font-black tracking-wide hover:bg-[#00cfea] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("createEventModal.creating") : t("createEventModal.submitButton")}
            </button>
          </div>
        </form>

        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
        `}</style>
      </div>
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({
  event,
}: {
  event: {
    id: string;
    slug: string;
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    _count?: { sessions?: number };
  };
}) {
  const t = useTranslations("AdminDashboardPage");
  const start = new Date(event.startDate);
  const now = new Date();
  const isLive = start <= now && now <= new Date(event.endDate);
  const isPast = new Date(event.endDate) < now;

  return (
    <Link
      href={`/admin/events/${event.slug}`}
      className="group flex items-center gap-4 p-4 rounded-xl border border-[#1e2530] bg-[#0a0e14] hover:border-[#00E5FF33] hover:bg-[#00E5FF05] transition-all duration-200"
    >
      {/* Date badge */}
      <div className="shrink-0 flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-[#1e2530] text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#3a4a5a] leading-none">
          {start.toLocaleDateString("fr-FR", { month: "short" })}
        </span>
        <span className="text-base font-black text-white leading-tight">
          {start.getDate()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate group-hover:text-[#00E5FF] transition-colors">
          {event.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {event.location && (
            <span className="flex items-center gap-1 text-[10px] text-[#3a4a5a] font-semibold">
              <MapPin size={9} /> {event.location}
            </span>
          )}
          {event._count?.sessions !== undefined && (
            <span className="flex items-center gap-1 text-[10px] text-[#3a4a5a] font-semibold">
              <Mic size={9} /> {event._count.sessions} session{event._count.sessions !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Status badge */}
      <div className="shrink-0">
        {isLive ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-[10px] font-bold text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {t("live")}
          </span>
        ) : isPast ? (
          <span className="px-2 py-0.5 rounded-full bg-[#1e2530] text-[10px] font-bold text-[#3a4a5a]">
              {t("ended")}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
              {t("upcoming")}
          </span>
        )}
      </div>

      <ChevronRight size={14} className="shrink-0 text-[#3a4a5a] group-hover:text-[#00E5FF] transition-colors" />
    </Link>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const t = useTranslations("AdminDashboardPage");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchStats().then((data) => {
      if (isMounted) {
        setStats(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [fetchStats]);

  const statCards = stats
    ? [
      {
        label: "Événements",
        value: stats.totals.events,
        icon: Calendar,
        href: "/admin/events",
        sub: `${stats.upcoming.events} à venir`,
      },
      {
        label: "Intervenants",
        value: stats.totals.speakers,
        icon: Users,
        href: "/admin/speakers",
      },
      {
        label: "Sessions",
        value: stats.totals.sessions,
        icon: Mic,
        href: "/admin/events",
      },
      {
        label: "Salles",
        value: stats.totals.rooms,
        icon: Building2,
        href: "/admin/rooms",
      },
      {
        label: "Questions",
        value: stats.totals.questions,
        icon: MessageSquare,
        href: "/admin/events",
      },
      {
        label: "Sessions live",
        value: stats.live.activeSessions,
        icon: Radio,
        href: "/admin/events",
        accent: stats.live.activeSessions > 0,
        sub: stats.live.activeSessions > 0 ? "En cours maintenant" : undefined,
      },
    ]
    : [];

  // Quick actions config
  const quickActions = [
    {
      label: t("quickActions.newEvent"),
      description: t("quickActions.newEventDescription"),
      icon: Calendar,
      href: "/admin/events",
      accent: true,
    },
    {
      label: t("quickActions.newSpeaker"),
      description: t("quickActions.newSpeakerDescription"),
      icon: Users,
      href: "/admin/speakers",
      accent: false,
    },
    {
      label: t("quickActions.manageRooms"),
      description: t("quickActions.manageRoomsDescription"),
      icon: Building2,
      href: "/admin/rooms",
      accent: false,
    },
  ];

  return (
    <>

      <main className="flex-1 px-8 py-12 max-w-6xl mx-auto w-full">
        {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#4a5568] mb-8">
            <Link href="/" className="hover:text-[#00E5FF] transition-colors">{t("breadcrumbHome")}</Link>
            <ChevronRight size={13} />
            <span className="text-white">{t("breadcrumbDashboard")}</span>
          </div>


        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#00E5FF15] border border-[#00E5FF30] flex items-center justify-center">
                <LayoutDashboard size={16} className="text-[#00E5FF]" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">{t("pageTitle")}</h1>
            </div>
            <p className="text-sm text-[#4a5568] ml-11">{t("pageDescription")}</p>
          </div>

          <Link
            href="/admin/react"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black text-sm font-black tracking-wide hover:bg-[#00cfea] active:scale-95 transition-all duration-200 shadow-[0_0_24px_#00E5FF30]"
          >
            <Plus size={15} strokeWidth={3} />
            Admin
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-10">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
            : statCards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>

        {/* ── Middle row : Events list + Quick Actions (same height) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

          {/* Events list — 3 cols */}
          <div className="lg:col-span-3 rounded-2xl border border-[#1e2530] bg-[#0d1117] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2530] shrink-0">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-[#00E5FF]" />
                <h2 className="text-sm font-black text-white tracking-tight">{t("recentEventsTitle")}</h2>
              </div>
              <Link
                href="/admin/events"
                className="text-xs font-semibold text-[#00E5FF] uppercase tracking-widest hover:text-[#00cfea] transition-colors flex items-center gap-1"
              >
                {t("seeAll")} <ArrowUpRight size={11} />
              </Link>
            </div>

            <div className="flex-1 flex flex-col p-4 gap-2">
              {/* Skeletons */}
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-xl border border-[#1e2530]">
                    <div className="w-11 h-11 rounded-xl bg-[#1e2530] shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 bg-[#1e2530] rounded-lg" />
                      <div className="h-2.5 w-1/2 bg-[#1e2530] rounded-lg" />
                    </div>
                    <div className="w-14 h-5 bg-[#1e2530] rounded-full shrink-0" />
                  </div>
                ))}

              {/* Empty state */}
              {!loading && (!stats?.recentEvents || stats.recentEvents.length === 0) && (
                <div className="flex-1 flex flex-col items-center justify-center py-10">
                  <Calendar size={28} className="text-[#1e2530] mb-3" />
                  <p className="text-[#3a4a5a] italic text-sm">{t("noRecentEvents")}</p>
                </div>
              )}

              {/* Event cards — max 5 */}
              {!loading &&
                stats?.recentEvents?.slice(0, 5).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
            </div>
          </div>

          {/* Quick Actions — 2 cols */}
          <div className="lg:col-span-2 rounded-2xl border border-[#1e2530] bg-[#0d1117] overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1e2530] shrink-0">
              <Zap size={15} className="text-[#00E5FF]" />
              <h2 className="text-sm font-black text-white tracking-tight">{t("quickActions.title")}</h2>
            </div>

            <div className="flex-1 flex flex-col p-4 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${action.accent
                    ? "border-[#00E5FF33] bg-[#00E5FF08] hover:bg-[#00E5FF12] hover:border-[#00E5FF55]"
                    : "border-[#1e2530] bg-[#0a0e14] hover:border-[#00E5FF33] hover:bg-[#00E5FF05]"
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${action.accent
                      ? "bg-[#00E5FF15] border border-[#00E5FF30] text-[#00E5FF] group-hover:bg-[#00E5FF25]"
                      : "bg-[#1e2530] border border-[#2a3545] text-[#3a4a5a] group-hover:text-[#00E5FF] group-hover:border-[#00E5FF33]"
                      }`}
                  >
                    <action.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-bold transition-colors duration-200 ${action.accent
                        ? "text-[#00E5FF]"
                        : "text-white group-hover:text-[#00E5FF]"
                        }`}
                    >
                      {action.label}
                    </p>
                    <p className="text-[10px] text-[#3a4a5a] font-semibold mt-0.5">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight
                    size={15}
                    className={`shrink-0 transition-colors duration-200 ${action.accent ? "text-[#00E5FF80]" : "text-[#3a4a5a] group-hover:text-[#00E5FF]"
                      }`}
                  />
                </Link>
              ))}

              {/* Filler area to stretch card to full height */}
              <div className="flex-1 mt-2 rounded-xl border border-dashed border-[#1e2530] flex flex-col items-center justify-center gap-2 p-6 text-center">
                <div className="w-9 h-9 rounded-xl bg-[#1e2530] flex items-center justify-center">
                  <TrendingUp size={15} className="text-[#3a4a5a]" />
                </div>
                <p className="text-xs text-[#3a4a5a] font-semibold">
                  {loading ? "—" : t("stats.liveSessionsSub", { count: stats?.live.activeSessions ?? 0 })}
                </p>
                {stats && stats.live.activeSessions > 0 && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {t("live")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#1e2530]">
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-4 animate-pulse flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1e2530] mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-4/5 bg-[#1e2530] rounded-lg" />
                    <div className="h-2.5 w-1/2 bg-[#1e2530] rounded-lg" />
                  </div>
                </div>
              ))}

            {!loading && (!stats || stats.recentQuestions.length === 0) && (
              <div className="px-6 py-12 text-center">
                <MessageSquare size={24} className="mx-auto text-[#1e2530] mb-3" />
                <p className="text-[#3a4a5a] italic text-sm">{t("noQuestions")}</p>
              </div>
            )}

            {/* max 5 questions */}
            {!loading &&
              stats?.recentQuestions.slice(0, 5).map((q) => (
                <div key={q.id} className="px-6 py-4 group hover:bg-[#ffffff03] transition-colors">
                  <p className="text-sm text-[#ccc] leading-relaxed mb-1.5">{q.content}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-[#1e2530] text-[#3a4a5a] font-semibold">
                      📍 {q.session.event.title}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-[#1e2530] text-[#3a4a5a] font-semibold">
                      🎙️ {q.session.title}
                    </span>
                    <span className="text-[10px] text-[#3a4a5a] ml-auto font-semibold">
                      ▲ {q.upvotes} vote{q.upvotes !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </>
  );
}