"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { Room, EventMeta } from "@/types";

function RoomCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] p-6 animate-pulse">
      <div className="w-8 h-8 rounded-md bg-[#1e2530] mb-2" />
      <div className="h-5 w-3/4 rounded-md bg-[#1e2530] mb-2" />
      <div className="h-3 w-1/3 rounded-md bg-[#1e2530] mt-1" />
    </div>
  );
}

export default function RoomsPage() {
  const t = useTranslations("EventRoomsPage");
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventMeta | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<EventMeta>(`/api/events/slug/${slug}`)
      .then((data) => {
        setEvent(data);
        return apiFetch<Room[]>(`/api/events/${data.id}/rooms`);
      })
      .then(setRooms)
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <main className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">
      <Link href={`/events/${slug}`} className="text-[#00E5FF] text-sm hover:underline">
        ← {event?.title}
      </Link>
      <h1 className="text-3xl font-black mt-4 mb-8">{t("pageTitle")}</h1>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] py-16 text-center text-[#3a4550] italic text-sm">
          {t("emptyState")}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/events/${slug}/sessions?room=${room.slug}`}
              className="rounded-2xl border border-[#1e2530] bg-[#0d1117] p-6 hover:border-[#00E5FF44] transition-colors"
            >
              <div className="text-2xl mb-2">🏛️</div>
              <p className="font-bold text-lg">{room.name}</p>
              <p className="text-xs text-[#4a5568] mt-1">{t("viewSessions")}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}