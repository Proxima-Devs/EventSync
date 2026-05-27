"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { apiFetch } from "@/lib/api";
import { SessionFavorite } from "@/types";

const FILTERS = ["All", "Live", "Upcoming", "Past"];

function SessionSkeleton() {
  return (
    <div className="relative">
      <div className="block rounded-2xl border border-[#1e2530] bg-[#0d1117] p-5 pr-14 animate-pulse">
        <div className="h-3.5 w-1/4 rounded-full bg-[#1e2530] mb-3" />
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-16 rounded-full bg-[#1e2530]" />
          <div className="h-3.5 w-28 rounded-full bg-[#1e2530]" />
          <div className="h-5 w-20 rounded-full bg-[#1e2530]" />
        </div>
        <div className="h-5 rounded-full bg-[#1e2530] mb-3" />
        <div className="h-3.5 rounded-full bg-[#1e2530] w-5/6" />
      </div>
      <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-[#1e2530]" />
    </div>
  );
}

export default function FavoritesPage() {
  const { favorites, toggle } = useFavorites();
  const [sessions, setSessions] = useState<SessionFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = new Date();

    return sessions.filter((session) => {
      const searchMatch =
        query === "" ||
        session.title.toLowerCase().includes(query) ||
        session.event.title.toLowerCase().includes(query) ||
        session.speakers.some((speaker) => speaker.fullName.toLowerCase().includes(query)) ||
        session.room?.name.toLowerCase().includes(query);

      if (!searchMatch) return false;

      if (activeFilter === "Live") {
        return session.isLive;
      }

      const start = new Date(session.startTime);
      if (activeFilter === "Upcoming") {
        return start >= now;
      }
      if (activeFilter === "Past") {
        return start < now;
      }

      return true;
    });
  }, [sessions, search, activeFilter]);

  useEffect(() => {
    if (favorites.length === 0) {
      setLoading(false);
      return;
    }
    // On fetch tous les events pour retrouver les sessions favorites
    apiFetch<{ data: { slug: string; title: string; id: string }[] }>("/api/events")
      .then(async (res) => {
        const all: SessionFavorite[] = [];
        for (const event of res.data) {
          const detail = await apiFetch<{
            sessions: Omit<SessionFavorite, "event">[];
          }>(`/api/events/slug/${event.slug}`);
          for (const s of detail.sessions) {
            if (favorites.includes(s.id)) {
              all.push({ ...s, event: { slug: event.slug, title: event.title } });
            }
          }
        }
        setSessions(all);
      })
      .finally(() => setLoading(false));
  }, [favorites.join(",")]);

  return (
    <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
      <h1 className="text-3xl font-black mb-2">⭐ Mes favoris</h1>
      <p className="text-[#4a5568] text-sm mb-8">
        Sessions sauvegardées localement sur cet appareil.
      </p>

      {favorites.length === 0 && !loading ? (
        <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] py-20 text-center text-[#3a4550] italic text-sm">
          Aucun favori pour le moment.{" "}
          <Link href="/" className="text-[#00E5FF] not-italic hover:underline">
            Découvrir les événements →
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-30 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 order-1 sm:order-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  disabled={loading}
                  className={`cursor-pointer px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${activeFilter === filter
                    ? "bg-[#00E5FF] border-[#00E5FF] text-black shadow-lg shadow-[#00E5FF33]"
                    : "bg-transparent border-[#1e2530] text-[#cbd5e1] hover:text-white hover:border-[#00E5FF44]"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {filter === "All" ? "Tous" : filter === "Live" ? "En direct" : filter === "Upcoming" ? "À venir" : "Passé"}
                </button>
              ))}
            </div>
            <div className="flex-1 min-w-0 order-2 sm:order-2">
              <div className="relative rounded-full border border-[#1e2530] bg-[#0d1117] flex items-center overflow-hidden max-w-2xl ml-auto">
                <input
                  type="text"
                  placeholder="Rechercher un favori..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                  className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-[#64748b] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  disabled={loading}
                  className="inline-flex h-11 w-11 items-center justify-center text-white rounded-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Rechercher"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              <SessionSkeleton />
              <SessionSkeleton />
              <SessionSkeleton />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] py-20 text-center text-[#3a4550] italic text-sm">
              Aucun favori ne correspond à ces filtres.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredSessions.map((session) => (
                <div key={session.id} className="relative">
                  <Link
                    href={`/events/${session.event.slug}/sessions/${session.slug}`}
                    className="block rounded-2xl border border-[#1e2530] bg-[#0d1117] p-5 hover:border-[#00E5FF44] transition-colors pr-14"
                  >
                    <p className="text-xs text-[#00E5FF] mb-1">{session.event.title}</p>
                    <div className="flex items-center gap-2 mb-1">
                      {session.isLive && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                          LIVE
                        </span>
                      )}
                      <span className="text-xs text-[#4a5568]">
                        {new Date(session.startTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" → "}
                        {new Date(session.endTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {session.room && (
                        <span className="text-xs text-[#00E5FF] border border-[#00E5FF33] px-2 py-0.5 rounded-full">
                          {session.room.name}
                        </span>
                      )}
                    </div>
                    <p className="font-bold">{session.title}</p>
                    {session.speakers.length > 0 && (
                      <p className="text-xs text-[#4a5568] mt-1">
                        {session.speakers.map((s) => s.fullName).join(", ")}
                      </p>
                    )}
                  </Link>
                  <button
                    onClick={() => toggle(session.id)}
                    className="absolute top-4 right-4 rounded-full bg-[#0d1117] p-2 text-[#00E5FF] shadow-lg shadow-[#00E5FF33]"
                    title="Retirer des favoris"
                    aria-label="Retirer des favoris"
                  >
                    <Star className="h-5 w-5" fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}