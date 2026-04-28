"use client";

import { useState } from "react";
import Sidebar from "./components/sidebare";

type Event = {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  place: string;
  sessions_count: number;
};

const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: "TechConf Antananarivo 2026",
    description: "La plus grande conférence tech de Madagascar. Sessions sur l'IA, le Web3 et le Cloud.",
    start_date: "2026-05-10",
    end_date: "2026-05-12",
    place: "Ivandry, Antananarivo",
    sessions_count: 14,
  },
  {
    id: 2,
    title: "Web3 Summit Africa",
    description: "Découvrez les dernières innovations blockchain et DeFi avec des speakers internationaux.",
    start_date: "2026-06-03",
    end_date: "2026-06-04",
    place: "Carlton Hotel, Antananarivo",
    sessions_count: 8,
  },
  {
    id: 3,
    title: "Design Systems Workshop",
    description: "Atelier pratique pour créer et maintenir un design system cohérent à grande échelle.",
    start_date: "2026-06-20",
    end_date: "2026-06-20",
    place: "Hub Innovation, Tana",
    sessions_count: 3,
  },
  {
    id: 4,
    title: "AI & Future of Work",
    description: "Comment l'IA transforme les métiers et le marché du travail africain.",
    start_date: "2026-07-15",
    end_date: "2026-07-16",
    place: "Palais des Congrès, Antananarivo",
    sessions_count: 10,
  },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState("");

  const filtered = MOCK_EVENTS.filter(
    (e) =>
      submitted === "" ||
      e.title.toLowerCase().includes(submitted.toLowerCase()) ||
      e.description.toLowerCase().includes(submitted.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#080a0c] text-white flex">
      <Sidebar />

      <main className="ml-[60px] flex-1 flex flex-col">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#00E5FF08] blur-[120px]" />
          </div>

          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 border border-[#00E5FF33] bg-[#00E5FF0a] text-[#00E5FF] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full">
            <span>✦</span> Connect &amp; Sync
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4">
            Synchronize Your
            <br />
            <span className="text-[#00E5FF]">Event Experience</span>
          </h1>

          <p className="text-[#6b7280] max-w-xl mx-auto text-base mb-10 leading-relaxed">
            Discover the most exciting tech conferences, workshops, and meetups.
            Manage your schedule, connect with speakers, and never miss a beat.
          </p>

          {/* Search bar */}
          <div className="w-full max-w-xl flex gap-0 rounded-full overflow-hidden border border-[#2a2a2a] bg-[#111318] shadow-xl shadow-[#00E5FF08]">
            <span className="flex items-center pl-5 text-[#555]">🔍</span>
            <input
              type="text"
              placeholder="Search events by title or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSubmitted(search)}
              className="flex-1 bg-transparent px-4 py-4 text-sm text-white placeholder-[#444] focus:outline-none"
            />
            <button
              onClick={() => setSubmitted(search)}
              className="px-6 py-4 bg-[#00E5FF] text-black font-bold text-sm hover:bg-[#00ffff] transition-colors"
            >
              Search
            </button>
          </div>
        </section>

        {/* Featured Events */}
        <section className="px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black">Featured Events</h2>
              <div className="h-[3px] w-10 bg-[#00E5FF] rounded-full" />
            </div>
            <span className="text-[#555] text-sm">Showing {filtered.length} events</span>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-[#1a1a1a] bg-[#0d0f12] py-20 text-center text-[#555] italic text-sm">
              No events found matching your search.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {filtered.map((event) => (
                <div
                  key={event.id}
                  className="group rounded-2xl border border-[#1a1a1a] bg-[#0d0f12] p-5 hover:border-[#00E5FF33] hover:bg-[#0f1114] transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-base group-hover:text-[#00E5FF] transition-colors leading-tight pr-4">
                      {event.title}
                    </h3>
                    <span className="text-[10px] font-bold tracking-wider text-[#00E5FF] bg-[#00E5FF15] border border-[#00E5FF33] px-2 py-1 rounded-full whitespace-nowrap">
                      {event.sessions_count} sessions
                    </span>
                  </div>
                  <p className="text-[#6b7280] text-xs leading-relaxed mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between text-[#444] text-xs border-t border-[#1a1a1a] pt-3">
                    <span>📍 {event.place}</span>
                    <span>
                      {formatDate(event.start_date)}
                      {event.start_date !== event.end_date && ` → ${formatDate(event.end_date)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}