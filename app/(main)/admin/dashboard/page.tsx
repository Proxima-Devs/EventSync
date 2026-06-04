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
} from "lucide-react";
import { EventPayload, Stats } from "@/types";


function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-3 w-24 bg-white/10 rounded-lg" />
        <div className="w-9 h-9 bg-white/10 rounded-xl" />
      </div>
      <div className="h-8 w-16 bg-white/10 rounded-lg mb-2" />
      <div className="h-3 w-28 bg-white/10 rounded-lg" />
    </div>
  );
}



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
      className="
        group relative flex flex-col
        rounded-3xl border border-white/10
        bg-gradient-to-b from-slate-900 to-slate-950
        p-6
        hover:-translate-y-1
        hover:shadow-[0_15px_50px_rgba(0,229,255,0.12)]
        transition-all duration-300
        overflow-hidden
      "
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-cyan-500/5 transition" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>

        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition
          ${
            accent
              ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-400"
              : "bg-white/5 border-white/10 text-slate-400 group-hover:text-cyan-400"
          }`}
        >
          <Icon size={16} />
        </div>
      </div>

      <div
        className={`text-4xl font-black tracking-tight
          ${accent ? "text-cyan-400" : "text-white group-hover:text-slate-200"}
        `}
      >
        {value}
      </div>

      {sub && (
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          <TrendingUp size={10} className="text-emerald-400" />
          {sub}
        </p>
      )}
    </Link>
  );
}


export default function DashboardPage() {
  const t = useTranslations("AdminDashboardPage");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    fetchStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
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
          label: "Live",
          value: stats.live.activeSessions,
          icon: Radio,
          href: "/admin/events",
          accent: stats.live.activeSessions > 0,
          sub:
            stats.live.activeSessions > 0
              ? "En cours"
              : "Aucune session",
        },
      ]
    : [];

  const quickActions = [
    {
      label: t("quickActions.newEvent"),
      icon: Calendar,
      href: "/admin/events",
      accent: true,
    },
    {
      label: t("quickActions.newSpeaker"),
      icon: Users,
      href: "/admin/speakers",
    },
    {
      label: t("quickActions.manageRooms"),
      icon: Building2,
      href: "/admin/rooms",
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">

      {/* HEADER */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
            <LayoutDashboard className="text-cyan-400" size={18} />
          </div>
          <h1 className="text-3xl font-black text-white">
            {t("pageTitle")}
          </h1>
        </div>
        <p className="text-slate-400 ml-11">
          {t("pageDescription")}
        </p>
      </div>

    
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : statCards.map((c) => (
              <StatCard key={c.label} {...c} />
            ))}
      </div>

     
      <div className="grid lg:grid-cols-5 gap-6">

        
        <div className="lg:col-span-3 rounded-3xl border border-white/10 bg-slate-950 overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-white/10">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Calendar size={16} className="text-cyan-400" />
              {t("recentEventsTitle")}
            </h2>

            <Link
              href="/admin/events"
              className="text-xs text-cyan-400 flex items-center gap-1"
            >
              {t("seeAll")} <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="p-4 space-y-2">
            {loading && (
              <div className="text-slate-500 text-sm">
                Loading...
              </div>
            )}

            {!loading &&
              stats?.recentEvents?.slice(0, 5).map((e) => (
                <Link
                  key={e.id}
                  href={`/admin/events/${e.slug}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Calendar size={14} />
                  </div>

                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">
                      {e.title}
                    </p>
                    <p className="text-xs text-slate-500 flex gap-2">
                      <MapPin size={12} /> {e.location}
                    </p>
                  </div>

                  <ChevronRight size={14} className="text-slate-500" />
                </Link>
              ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-950 p-5">
          <h2 className="text-white font-bold flex items-center gap-2 mb-4">
            <Zap size={16} className="text-cyan-400" />
            {t("quickActions.title")}
          </h2>

          <div className="space-y-3">
            {quickActions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-cyan-400/30 hover:bg-white/5 transition"
              >
                <a.icon size={16} className="text-cyan-400" />
                <span className="text-sm text-white">
                  {a.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}