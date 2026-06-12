"use client";

import { MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";


type Event = {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  startDate: string;
  endDate: string;
  location?: string | null;
  coverImage?: string | null;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


export default function EventCard({ event, index = 0 }: { event: Event; index?: number }) {
  const day = new Date(event.startDate).getDate();
  const month = new Date(event.startDate).toLocaleDateString("fr-FR", { month: "short" });
  const isMultiDay = event.startDate.slice(0, 10) !== event.endDate.slice(0, 10);
  const isUpcoming = new Date(event.startDate) >= new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/events/${event.slug}`} className="group block">
        <motion.div
          className="relative rounded-2xl overflow-hidden border border-[#1e2530] bg-[#0b0f18] shadow-lg shadow-black/30 cursor-pointer"
        >
          {/* Cover Image */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-44 w-full overflow-hidden bg-surface-secondary"
          >
            {event.coverImage ? (
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500"
              />
            ) : (
              /* Placeholder pattern when no image */
              <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: 'linear-gradient(to bottom right, color-mix(in srgb, var(--color-primary) 5%), #0d1117, #001a1e)' }}
                />
                {/* Grid pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id={`grid-${event.id}`} width="32" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#grid-${event.id})`} />
                </svg>
                <span className="relative text-[var(--color-primary)] opacity-10 text-7xl font-black select-none tracking-tighter">
                  {event.title.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-surface-event-card via-surface-event-card/25 to-transparent" />

            {/* Date badge */}
            <div className="absolute top-3 left-3 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#0b0f18cc] border border-[var(--color-primary)] opacity-30 backdrop-blur-sm">
              <span className="text-lg font-black text-[var(--color-primary)] leading-none">{day}</span>
              <span className="text-[9px] text-[var(--color-primary)] opacity-50 uppercase tracking-widest">{month}</span>
            </div>

            {/* Status badge */}
            {isUpcoming && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[var(--color-primary)] opacity-10 border border-[var(--color-primary)] opacity-30 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-[var(--color-primary)] tracking-widest uppercase">À venir</span>
              </div>
            )}
          </motion.div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-content-default font-bold text-2xl leading-snug line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors duration-200">
              {event.title}
            </h3>
            <p className="text-content-secondary text-lg h-15 mt-1.5 line-clamp-2 leading-relaxed">
              {event.description ?? "Aucune description disponible."}
            </p>

            <div className="mt-4 pt-3 border-t border-[#1a2030] flex flex-col gap-2 text-lg text-content-muted">
              <span className="flex items-center gap-2">
                <MapPin size={11} className="text-[var(--color-primary)] opacity-40" />
                <span className="line-clamp-1">{event.location ?? "Lieu non précisé"}</span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <Calendar size={11} className="text-[var(--color-primary)] opacity-40" />
                {isMultiDay
                  ? `${formatDate(event.startDate)} → ${formatDate(event.endDate)}`
                  : formatDate(event.startDate)}
              </span>
            </div>

            <div className="mt-5 overflow-hidden">
              <div className="rounded-full border border-[var(--color-primary)] bg-surface-event-card px-4 py-2 text-sm font-semibold text-[var(--color-primary)] text-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                Voir le programme
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>
      </Link>
    </motion.div>
  );
}