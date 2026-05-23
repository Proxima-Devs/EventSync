"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Event } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faArrowLeft, faMapPin, faCalendar, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
function TimeProgress({ start, end }: { start: string; end: string }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      if (now < s) return setPct(0);
      if (now > e) return setPct(100);
      setPct(Math.round(((now - s) / (e - s)) * 100));
    };
    calc();
    const id = setInterval(calc, 30_000);
    return () => clearInterval(id);
  }, [start, end]);
  if (pct <= 0 || pct >= 100) return null;
  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div
        className="h-full rounded-full bg-linear-to-r from-violet-500 via-cyan-400 to-sky-400 shadow-lg shadow-cyan-500/20 transition-[width] duration-500 ease-linear"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Event>(`/api/events/slug/${slug}`)
      .then(setEvent)
      .catch(() => setError("Événement introuvable"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (event?.title) {
      document.title = event.title;
    }
  }, [event]);

  if (loading)
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
        <div className="mx-auto max-w-5xl space-y-8 animate-pulse">
          <div className="h-72 rounded-4xl bg-slate-800 shadow-inner" />
          <div className="space-y-3">
            <div className="h-6 w-3/5 rounded-full bg-slate-800" />
            <div className="h-5 w-2/3 rounded-full bg-slate-800" />
            <div className="flex flex-wrap gap-3">
              <div className="h-10 w-32 rounded-full bg-slate-800" />
              <div className="h-10 w-24 rounded-full bg-slate-800" />
            </div>
          </div>
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 space-y-4">
                <div className="h-4 w-1/2 rounded-full bg-slate-800" />
                <div className="h-3 w-4/5 rounded-full bg-slate-800" />
                <div className="h-2.5 w-full rounded-full bg-slate-800" />
                <div className="h-2.5 w-3/4 rounded-full bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );

  if (error || !event)
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-10">
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-8 py-6 text-rose-200">
          <p className="text-sm font-semibold">{error || "Événement introuvable"}</p>
        </div>
      </main>
    );

  const formattedDate = new Date(event.startDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="relative">
        <div className="h-80 w-full overflow-hidden bg-slate-900">
          <Image
            src={event.coverImage ?? "/background.png"}
            alt={event.title}
            fill
            className="w-screen h-screen object-cover"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500 transition hover:text-cyan-300">
          <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
          Retour aux événements
        </Link>

        <div className="mt-8 rounded-4xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-[1.55fr_0.9fr] lg:items-end">
            <div className="space-y-6">
              <div className="h-2.5 w-20 rounded-full bg-cyan-400/25" />
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">{event.title}</h1>
              <p className="max-w-3xl text-slate-400 leading-8">
                {event.description || "Aucune description disponible pour cet événement."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-4 text-sm text-slate-300">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Dates</div>
                <div className="mt-3 text-base font-semibold text-white">{formattedDate}</div>
              </div>
              {event.location && (
                <div className="rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-4 text-sm text-slate-300">
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Lieu</div>
                  <div className="mt-3 flex items-center gap-2 font-semibold text-white">
                    <FontAwesomeIcon icon={faMapPin} className="text-cyan-400" />
                    {event.location}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/events/${slug}/sessions`} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Toutes les sessions
              <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
            </Link>
            <Link href={`/events/${slug}/rooms`} className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white">
              Voir les salles
            </Link>
          </div>

          <section className="mt-14">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">Sessions</span>
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">{event.sessions.length}</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="grid gap-4">
              {event.sessions.map((session) => (
                <Link key={session.id} href={`/events/${slug}/sessions/${session.slug}`} className="group block rounded-[1.75rem] border border-slate-800 bg-slate-950/95 p-5 transition hover:border-cyan-400/30 hover:bg-slate-900/95">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 text-slate-300">
                      <FontAwesomeIcon icon={faClock} className="text-base text-cyan-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {session.isLive && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1 text-rose-200">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-400 animate-pulse" />
                            LIVE
                          </span>
                        )}
                        <span>{new Date(session.startTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} → {new Date(session.endTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        {session.room && <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-cyan-200">{session.room.name}</span>}
                      </div>
                      <h2 className="mt-3 text-lg font-semibold text-white">{session.title}</h2>
                      {session.speakers.length > 0 && (
                        <p className="mt-2 text-sm text-slate-500">{session.speakers.map((s) => s.fullName).join(", ")}</p>
                      )}
                      <TimeProgress start={session.startTime} end={session.endTime} />
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} className="mt-2 text-sm text-slate-500 transition group-hover:text-cyan-300" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}