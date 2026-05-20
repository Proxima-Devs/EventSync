"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import { apiFetch } from "@/lib/api";
import { SessionFavorite } from "@/types";

export default function FavoritesPage() {
  const { favorites, toggle } = useFavorites();
  const [sessions, setSessions] = useState<SessionFavorite[]>([]);
  const [loading, setLoading] = useState(true);

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

      {loading ? (
        <div className="text-[#4a5568]">Chargement...</div>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] py-20 text-center text-[#3a4550] italic text-sm">
          Aucun favori pour le moment.{" "}
          <Link href="/" className="text-[#00E5FF] not-italic hover:underline">
            Découvrir les événements →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
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
                className="absolute top-4 right-4 text-xl"
                title="Retirer des favoris"
              >
                ⭐
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}