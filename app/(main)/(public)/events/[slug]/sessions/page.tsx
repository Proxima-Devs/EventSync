"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useFavorites } from "@/hooks/useFavorites";

type Session = {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  isLive: boolean;
  room?: { id: string; name: string } | null;
  speakers: { id: string; fullName: string }[];
};
type EventMeta = { id: string; title: string; slug: string };

export default function SessionsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventMeta | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [activeRoom, setActiveRoom] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toggle, isFavorite } = useFavorites();

  useEffect(() => {
    apiFetch<EventMeta & { sessions: Session[] }>(`/api/events/slug/${slug}`)
      .then((data) => {
        setEvent({ id: data.id, title: data.title, slug: data.slug });
        setSessions(data.sessions);
        return apiFetch<{ id: string; name: string }[]>(
          `/api/events/${data.id}/rooms`
        );
      })
      .then(setRooms)
      .finally(() => setLoading(false));
  }, [slug]);

  const filtered =
    activeRoom === "all"
      ? sessions
      : sessions.filter((s) => s.room?.id === activeRoom);

  if (loading) return <div className="p-8 text-[#4a5568]">Chargement...</div>;

  return (
    <main className="flex-1 px-8 py-12 max-w-5xl mx-auto w-full">
      <Link href={`/events/${slug}`} className="text-[#00E5FF] text-sm hover:underline">
        ← {event?.title}
      </Link>
      <h1 className="text-3xl font-black mt-4 mb-6">Sessions</h1>

      {/* Filtre par salle */}
      {rooms.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveRoom("all")}
            className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              activeRoom === "all"
                ? "bg-[#00E5FF] border-[#00E5FF] text-black"
                : "border-[#1e2530] text-[#4a5568] hover:text-white"
            }`}
          >
            Toutes
          </button>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`cursor-pointer px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                activeRoom === room.id
                  ? "bg-[#00E5FF] border-[#00E5FF] text-black"
                  : "border-[#1e2530] text-[#4a5568] hover:text-white"
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((session) => (
          <div key={session.id} className="relative">
            <Link
              href={`/events/${slug}/sessions/${session.id}`}
              className="block rounded-2xl border border-[#1e2530] bg-[#0d1117] p-5 hover:border-[#00E5FF44] transition-colors pr-14"
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
              <p className="font-bold ">{session.title}</p>
              {session.speakers.length > 0 && (
                <p className="text-xs text-[#4a5568] mt-1">
                  {session.speakers.map((s) => s.fullName).join(", ")}
                </p>
              )}
            </Link>
            {/* Bouton favori */}
            <button
              onClick={() => toggle(session.id)}
              className="absolute top-4 right-4 text-xl"
              title={isFavorite(session.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {isFavorite(session.id) ? "⭐" : "☆"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}