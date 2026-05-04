"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Speaker = { id: string; fullName: string; photo?: string | null };
type Session = {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  isLive: boolean;
  room?: { id: string; name: string } | null;
  speakers: Speaker[];
};
type EventDetail = {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  startDate: string;
  endDate: string;
  location?: string | null;
  coverImage?: string | null;
  sessions: Session[];
};

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<EventDetail>(`/api/events/slug/${slug}`)
      .then(setEvent)
      .catch(() => setError("Événement introuvable"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-8 text-[#4a5568]">Chargement...</div>;
  if (error || !event)
    return (
      <div className="p-8 text-red-400">{error || "Événement introuvable"}</div>
    );

  return (
    <main className="flex-1 px-8 py-12 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-[#00E5FF] text-sm hover:underline">
          ← Retour aux événements
        </Link>
        <h1 className="text-4xl font-black mt-4 mb-2">{event.title}</h1>
        {event.description && (
          <p className="text-[#4a5568] max-w-2xl">{event.description}</p>
        )}
        <div className="flex gap-4 mt-4 text-sm text-[#4a5568]">
          <span>📅 {new Date(event.startDate).toLocaleDateString("fr-FR")}</span>
          {event.location && <span>📍 {event.location}</span>}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-3 mb-10">
        <Link
          href={`/events/${slug}/sessions`}
          className="px-4 py-2 rounded-full bg-[#00E5FF] text-black text-sm font-bold hover:bg-[#00ffff] transition-colors"
        >
          Voir toutes les sessions
        </Link>
        <Link
          href={`/events/${slug}/rooms`}
          className="px-4 py-2 rounded-full border border-[#1e2530] text-sm text-[#4a5568] hover:text-white hover:border-[#00E5FF44] transition-colors"
        >
          Voir les salles
        </Link>
      </div>

      {/* Sessions preview */}
      <h2 className="text-xl font-black mb-4">Sessions</h2>
      <div className="flex flex-col gap-3">
        {event.sessions.map((session) => (
          <Link
            key={session.id}
            href={`/events/${slug}/sessions/${session.id}`}
            className="block rounded-2xl border border-[#1e2530] bg-[#0d1117] p-5 hover:border-[#00E5FF44] transition-colors"
          >
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
        ))}
      </div>
    </main>
  );
}