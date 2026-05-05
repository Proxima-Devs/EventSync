"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Calendar, Mic, Building2, MessageSquare, Radio, LayoutDashboard, TrendingUp, X, Plus, ArrowUpRight, Clock, Users } from "lucide-react";
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
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
            accent
              ? "bg-[#00E5FF15] border border-[#00E5FF30] text-[#00E5FF] group-hover:bg-[#00E5FF20]"
              : "bg-[#ffffff08] border border-[#1e2530] text-[#3a4a5a] group-hover:text-[#00E5FF] group-hover:border-[#00E5FF30]"
          }`}
        >
          <Icon size={16} />
        </div>
      </div>
      <div
        className={`text-4xl font-black tracking-tight mb-1 transition-colors duration-300 ${
          accent
            ? "text-[#00E5FF]"
            : "text-white group-hover:text-[#eee]"
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
      setError("Titre, date de début et date de fin sont obligatoires.");
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError("La date de début doit être antérieure à la date de fin.");
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
        {/* Glow top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00E5FF40] to-transparent" />

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#1e2530]">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Nouvel événement</h2>
            <p className="text-xs text-[#3a4a5a] mt-0.5">Remplissez les informations ci-dessous</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-white hover:border-[#00E5FF33] transition-all duration-200"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-1.5">
              Titre <span className="text-[#00E5FF]">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex: DevConf Paris 2026"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Décrivez l'événement…"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all resize-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-1.5">
                Début <span className="text-[#00E5FF]">*</span>
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
                Fin <span className="text-[#00E5FF]">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-1.5">
              Lieu
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Ex: Grande Halle de la Villette, Paris"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#3a4a5a] mb-1.5">
              Image de couverture (URL)
            </label>
            <input
              type="url"
              value={form.coverImage}
              onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
              placeholder="https://…"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-900/60 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border border-[#1e2530] text-sm text-[#4a5568] hover:text-white hover:border-[#2e3a4a] transition-all duration-200 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#00E5FF] text-black text-sm font-black tracking-wide hover:bg-[#00cfea] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Création…" : "Créer l'événement"}
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

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStats(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
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

  return (
    <>
      <CreateEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setLoading(true);
          fetchStats();
        }}
      />

      <main className="flex-1 px-8 py-12 max-w-6xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#4a5568] mb-8">
          <Link href="/admin" className="hover:text-[#00E5FF] transition-colors">
            Admin
          </Link>
          <span>/</span>
          <span className="text-white">Dashboard</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#00E5FF15] border border-[#00E5FF30] flex items-center justify-center">
                <LayoutDashboard size={16} className="text-[#00E5FF]" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Admin Console
              </h1>
            </div>
            <p className="text-sm text-[#4a5568] ml-11">
              Gérez vos événements, intervenants et planning.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black text-sm font-black tracking-wide hover:bg-[#00cfea] active:scale-95 transition-all duration-200 shadow-[0_0_24px_#00E5FF30]"
          >
            <Plus size={15} strokeWidth={3} />
            Create Event
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-10">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
            : statCards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent Questions */}
          <div className="lg:col-span-3 rounded-2xl border border-[#1e2530] bg-[#0d1117] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2530]">
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-[#00E5FF]" />
                <h2 className="text-sm font-black text-white tracking-tight">Questions récentes</h2>
              </div>
              <Link
                href="/admin/events"
                className="text-xs font-semibold text-[#00E5FF] uppercase tracking-widest hover:text-[#00cfea] transition-colors flex items-center gap-1"
              >
                Voir tout <ArrowUpRight size={11} />
              </Link>
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
                  <p className="text-[#3a4a5a] italic text-sm">Aucune question pour le moment.</p>
                </div>
              )}

              {!loading &&
                stats?.recentQuestions.map((q) => (
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

          {/* Right column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Live Sessions */}
            <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] p-6 relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[radial-linear(ellipse_at_bottom_right,#00E5FF06_0%,transparent_70%)]" />
              <div className="flex items-center gap-2 mb-4">
                <Radio size={14} className="text-[#00E5FF]" />
                <h2 className="text-sm font-black text-white tracking-tight">En direct</h2>
                {stats && stats.live.activeSessions > 0 && (
                  <span className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-red-400 font-bold">LIVE</span>
                  </span>
                )}
              </div>
              <div className="text-5xl font-black text-[#00E5FF] mb-1">
                {loading ? "—" : stats?.live.activeSessions ?? 0}
              </div>
              <p className="text-xs text-[#3a4a5a]">sessions actives en ce moment</p>
            </div>

            {/* Upcoming */}
            <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={14} className="text-[#3a4a5a]" />
                <h2 className="text-sm font-black text-white tracking-tight">À venir</h2>
              </div>
              <div className="text-5xl font-black text-white mb-1">
                {loading ? "—" : stats?.upcoming.events ?? 0}
              </div>
              <p className="text-xs text-[#3a4a5a]">événements planifiés</p>

              <div className="mt-4 pt-4 border-t border-[#1e2530]">
                <Link
                  href="/admin/events"
                  className="inline-flex items-center gap-1.5 text-xs text-[#00E5FF] font-bold hover:text-[#00cfea] transition-colors"
                >
                  Voir le calendrier <ArrowUpRight size={11} />
                </Link>
              </div>
            </div>

            {/* Engagement summary */}
            <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-[#3a4a5a]" />
                <h2 className="text-sm font-black text-white tracking-tight">Engagement</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#3a4a5a] font-semibold uppercase tracking-widest">Live Q&A</span>
                  <span className="text-sm font-black text-white">
                    {loading ? "—" : stats?.totals.questions ?? 0}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1e2530] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-[#00E5FF] to-[#0066ff] transition-all duration-700"
                    style={{ width: stats ? `${Math.min(100, (stats.totals.questions / 200) * 100)}%` : "0%" }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[#3a4a5a] font-semibold uppercase tracking-widest">Sessions</span>
                  <span className="text-sm font-black text-white">
                    {loading ? "—" : stats?.totals.sessions ?? 0}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1e2530] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-[#00E5FF] to-[#0066ff] transition-all duration-700"
                    style={{ width: stats ? `${Math.min(100, (stats.totals.sessions / 50) * 100)}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}