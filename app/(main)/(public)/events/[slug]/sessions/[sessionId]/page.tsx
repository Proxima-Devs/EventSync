"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { useFavorites } from "@/hooks/useFavorites";
import QuestionSection from "@/components/QuestionSection";
import { Session } from "@/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SessionDetailPage() {
  const { slug, sessionId } = useParams<{ slug: string; sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toggle, isFavorite } = useFavorites();

  useEffect(() => {
    apiFetch<Session>(`/api/sessions/${sessionId}`)
      .then((data) => {
        if (!data) {
          setError("Session introuvable");
        } else {
          setSession(data);
        }
      })
      .catch(() => setError("Session introuvable"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading)
    return (
      <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-[#1e2530] rounded-full" />
          <div className="h-8 w-2/3 bg-[#1e2530] rounded-xl" />
          <div className="h-48 bg-[#1e2530] rounded-2xl" />
        </div>
      </main>
    );

  if (error || !session)
    return (
      <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
        <div className="rounded-2xl border border-red-900 bg-red-500/10 py-12 text-center text-red-400 text-sm">
          {error || "Session introuvable"}
        </div>
      </main>
    );

  const fav = isFavorite(session.id);

  return (
    <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#4a5568] mb-8 flex-wrap">
        <Link href="/" className="hover:text-[#00E5FF] transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link
          href={`/events/${slug}`}
          className="hover:text-[#00E5FF] transition-colors"
        >
          Événement
        </Link>
        <span>/</span>
        <Link
          href={`/events/${slug}/sessions`}
          className="hover:text-[#00E5FF] transition-colors"
        >
          Sessions
        </Link>
        <span>/</span>
        <span className="text-white truncate max-w-45">{session.title}</span>
      </div>
      <div className="border border-[#1e2530] bg-[#0d1117] w-210 rounded-2xl">
        <div className="rounded-2xl  p-8 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            {session.isLive && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-bold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                LIVE
              </span>
            )}
            {session.room && (
              <span className="text-xs text-[#00E5FF] border border-[#00E5FF33] bg-[#00E5FF08] px-3 py-1 rounded-full">
                📍 {session.room.name}
              </span>
            )}
          </div>
          <button
            onClick={() => toggle(session.id)}
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
              fav
                ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/20"
                : "bg-transparent border-[#1e2530] text-[#4a5568] hover:text-white hover:border-[#00E5FF44]"
            }`}
          >
            {fav ? "⭐ Favori" : "☆ Ajouter"}
          </button>
        </div>

        <h1 className="text-3xl font-black mb-4 text-white leading-tight">{session.title}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-[#4a5568] p- mb-6">
          <span>
            🕐 {formatTime(session.startTime)} → {formatTime(session.endTime)}
          </span>
          {session.capacity && (
            <span>👥 Capacité : {session.capacity} places</span>
          )}
        </div>

        {session.description && (
          <p className="text-[#6b7280] leading-relaxed ">{session.description}</p>
        )}
      </div>

      {/* Intervenants */}
      {session.speakers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-black mb-4 pl-7 text-white">Intervenants</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {session.speakers.map((speaker) => (
              <Link
                key={speaker.id}
                href={`/speakers/${speaker.slug}`}
                className="flex items-center gap-4 rounded-2xl px-4 py-3 mx-4 hover:border-[#00E5FF44] transition-all duration-200 group hover:border "
              >
                {speaker.photo ? (
                  <Image
                    src={speaker.photo}
                    alt={speaker.fullName}
                    width={56}
                    height={56}
                    unoptimized
                    className="rounded-full object-cover shrink-0 ring-2 ring-[#1e2530] group-hover:ring-[#00E5FF33] transition-all"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#1e2530] flex items-center justify-center text-[#00E5FF] font-black text-xl shrink-0 group-hover:bg-[#00E5FF15] transition-colors">
                    {speaker.fullName[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold group-hover:text-[#00E5FF] text-white transition-colors">
                    {speaker.fullName}
                  </p>
                  {speaker.bio && (
                    <p className="text-xs text-[#4a5568] mt-1 line-clamp-2">
                      {speaker.bio}
                    </p>
                  )}
                  <span className="text-xs text-[#00E5FF] opacity-0 group-hover:opacity-100 transition-opacity mt-1 inline-block">
                    Voir le profil →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
        <div className="rounded-2xl  bg-[#0d1117] p-6">
          <QuestionSection sessionId={session.id} isLive={session.isLive} />
        </div>
      </div>

    </main>
  );
}