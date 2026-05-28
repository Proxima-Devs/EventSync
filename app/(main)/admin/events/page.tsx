"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Layers, Pencil, Trash2, Plus, X, ExternalLink, Search, AlertTriangle, ChevronRight, Settings2 } from "lucide-react";
import { Event, EventFormData } from "@/types";

const EMPTY_FORM: EventFormData = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
  coverImage: "",
};

// ─── Helpers ───

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toDatetimeLocal(iso: string) {
  return new Date(iso).toISOString().slice(0, 16);
}

function isUpcoming(iso: string) {
  return new Date(iso) > new Date();
}

function isOngoing(start: string, end: string) {
  const now = new Date();
  return new Date(start) <= now && new Date(end) >= now;
}

// ─── Status Badge ───

function StatusBadge({ start, end }: { start: string; end: string }) {
  if (isOngoing(start, end)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border border-[#00E5FF30] bg-[#00E5FF10] text-[#00E5FF] font-bold uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
        Live
      </span>
    );
  }
  if (isUpcoming(start)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border border-emerald-900/40 bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-widest">
        À venir
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border border-[#1e2530] bg-[#ffffff05] text-[#3a4a5a] font-bold uppercase tracking-widest">
      Terminé
    </span>
  );
}

// ─── Card Skeleton ───

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#1e2530] bg-[#0d1117] overflow-hidden">
      <div className="h-44 w-full bg-[#1e2530]" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 bg-[#1e2530] rounded-lg" />
        <div className="h-3 w-full bg-[#1e2530] rounded-lg" />
        <div className="h-3 w-1/2 bg-[#1e2530] rounded-lg" />
        <div className="h-px w-full bg-[#1e2530] rounded" />
        <div className="flex gap-2 pt-1">
          <div className="h-8 flex-1 bg-[#1e2530] rounded-xl" />
          <div className="h-8 flex-1 bg-[#1e2530] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Field ───

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
        {label}
        {required && <span className="text-[#00E5FF] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-[#060a0f] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#2a3a4a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all duration-200";

// ─── Event Form Modal ───

function EventModal({
  open, onClose, onSaved, editingEvent,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (ev: Event) => void;
  editingEvent: Event | null;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isEdit = !!editingEvent;
  const [form, setForm] = useState<EventFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingEvent) {
      setForm({
        title: editingEvent.title,
        description: editingEvent.description ?? "",
        startDate: toDatetimeLocal(editingEvent.startDate),
        endDate: toDatetimeLocal(editingEvent.endDate),
        location: editingEvent.location ?? "",
        coverImage: editingEvent.coverImage ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingEvent, open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const set = (field: keyof EventFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.startDate || !form.endDate) {
      setError("Titre, date de début et date de fin sont obligatoires.");
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError("La date de début doit être antérieure à la date de fin.");
      return;
    }
    setLoading(true);
    try {
      const url = isEdit ? `/api/events/${editingEvent!.id}` : "/api/events";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          startDate: form.startDate,
          endDate: form.endDate,
          location: form.location || undefined,
          coverImage: form.coverImage || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      onSaved(data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.target === overlayRef.current && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-2xl border border-[#1e2530] bg-[#0a0e14] overflow-hidden"
            style={{ boxShadow: "0 0 0 1px #00E5FF18, 0 0 40px #00E5FF18, 0 0 80px #00E5FF08, 0 32px 64px rgba(0,0,0,0.6)" }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00E5FF60] to-transparent" />
            <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 bg-[#00E5FF08] rounded-full blur-3xl" />

            <div className="relative flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#1e2530]">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-6 h-6 rounded-lg bg-[#00E5FF15] border border-[#00E5FF30] flex items-center justify-center">
                    {isEdit ? <Pencil size={12} className="text-[#00E5FF]" /> : <Plus size={12} className="text-[#00E5FF]" strokeWidth={3} />}
                  </div>
                  <h2 className="text-base font-black text-white tracking-tight">
                    {isEdit ? "Modifier l'événement" : "Nouvel événement"}
                  </h2>
                </div>
                <p className="text-xs text-[#3a4a5a] ml-8">
                  {isEdit ? `Slug : ${editingEvent?.slug}` : "Remplissez les informations ci-dessous"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-white hover:border-[#00E5FF33] transition-all duration-200"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="relative px-6 py-5 flex flex-col gap-4">
              <Field label="Titre" required>
                <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex : DevConf Paris 2026" />
              </Field>
              <Field label="Description">
                <textarea className={`${inputClass} resize-none`} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Décrivez l'événement…" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Début" required>
                  <input className={inputClass} type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
                </Field>
                <Field label="Fin" required>
                  <input className={inputClass} type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
                </Field>
              </div>
              <Field label="Lieu">
                <input className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Ex : Grande Halle, Paris" />
              </Field>
              <Field label="Image de couverture (URL)">
                <input className={inputClass} type="url" value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} placeholder="https://…" />
              </Field>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2.5 rounded-xl border border-red-900/60 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                  >
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1e2530] text-sm text-[#4a5568] hover:text-white hover:border-[#2e3a4a] transition-all duration-200 font-semibold">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#00E5FF] text-black text-sm font-black tracking-wide hover:bg-[#00cfea] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ boxShadow: "0 0 20px #00E5FF30" }}
                >
                  {loading ? (isEdit ? "Sauvegarde…" : "Création…") : isEdit ? "Sauvegarder" : "Créer l'événement"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Confirm Modal ───

function DeleteModal({ event, onClose, onDeleted }: {
  event: Event | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (event) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [event, onClose]);

  const handleDelete = async () => {
    if (!event) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur lors de la suppression");
      }
      onDeleted(event.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.target === overlayRef.current && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm rounded-2xl border border-red-900/40 bg-[#0a0e14] overflow-hidden"
            style={{ boxShadow: "0 0 0 1px #ff444418, 0 0 40px #ff444412, 0 32px 64px rgba(0,0,0,0.6)" }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500/50 to-transparent" />
            <div className="px-6 pt-6 pb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-900/40 flex items-center justify-center mb-4">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <h2 className="text-base font-black text-white mb-1">Supprimer l'événement ?</h2>
              <p className="text-sm text-[#4a5568] leading-relaxed">
                <span className="text-[#ccc] font-semibold">{event.title}</span> et toutes ses sessions seront définitivement supprimés.
              </p>
              {error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-900/40 rounded-xl px-3 py-2">
                  <AlertTriangle size={13} className="shrink-0" />
                  {error}
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1e2530] text-sm text-[#4a5568] hover:text-white hover:border-[#2e3a4a] transition-all duration-200 font-semibold">
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500/90 text-white text-sm font-black tracking-wide hover:bg-red-500 active:scale-95 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Admin Event Card ───

function AdminEventCard({
  event,
  index,
  onEdit,
  onDelete,
}: {
  event: Event;
  index: number;
  onEdit: (ev: Event) => void;
  onDelete: (ev: Event) => void;
}) {
  const day = new Date(event.startDate).getDate();
  const month = new Date(event.startDate).toLocaleDateString("fr-FR", { month: "short" });
  const isMultiDay = event.startDate.slice(0, 10) !== event.endDate.slice(0, 10);
  const ongoing = isOngoing(event.startDate, event.endDate);
  const upcoming = isUpcoming(event.startDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl border border-[#1e2530] bg-[#0b0f18] overflow-hidden shadow-lg shadow-black/30 flex flex-col"
    >
      {/* ── Cover Image ── */}
      <div className="relative h-44 w-full overflow-hidden bg-[#0d1117] shrink-0">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 50vw"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-[#00E5FF08] via-[#0d1117] to-[#001a1e]" />
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`grid-admin-${event.id}`} width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#00E5FF" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-admin-${event.id})`} />
            </svg>
            <span className="relative text-[#00E5FF15] text-7xl font-black select-none tracking-tighter">
              {event.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0b0f18] via-[#0b0f1850] to-transparent" />

        {/* Date badge */}
        <div className="absolute top-3 left-3 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#0b0f18cc] border border-[#00E5FF33] backdrop-blur-sm">
          <span className="text-lg font-black text-[#00E5FF] leading-none">{day}</span>
          <span className="text-[9px] text-[#00E5FF88] uppercase tracking-widest">{month}</span>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge start={event.startDate} end={event.endDate} />
        </div>


      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title */}
        <div>
          <h3 className="text-white font-bold text-lg leading-snug line-clamp-1">
            {event.title}
          </h3>
          <p className="text-[#3a4a5a] text-xs font-mono mt-0.5">{event.slug}</p>
        </div>

        {/* Description */}
        <p className="text-[#4a5568] text-sm line-clamp-2 leading-relaxed flex-1">
          {event.description ?? "Aucune description disponible."}
        </p>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 text-xs text-[#3a4550]">
          <span className="flex items-center gap-2">
            <MapPin size={11} className="text-[#00E5FF55] shrink-0" />
            <span className="truncate">{event.location ?? "Lieu non précisé"}</span>
          </span>
          <span className="flex items-center gap-2">
            <Calendar size={11} className="text-[#00E5FF55] shrink-0" />
            {isMultiDay
              ? `${formatDate(event.startDate)} → ${formatDate(event.endDate)}`
              : formatDate(event.startDate)}
          </span>
          <span className="flex items-center gap-2">
            <Layers size={11} className="text-[#00E5FF55] shrink-0" />
            {event._count.sessions} session{event._count.sessions !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1a2030]" />

        {/* ── Action Buttons ── */}
        <div className="grid grid-cols-2 gap-2">
          {/* Voir le programme */}
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#00E5FF30] bg-[#00E5FF08] text-[#00E5FF] text-xs font-bold hover:bg-[#00E5FF18] hover:border-[#00E5FF55] transition-all duration-200"
          >
            <ExternalLink size={12} />
            Voir le programme
          </Link>

          {/* Gérer l'événement */}
          <Link
            href={`/admin/events/${event.slug}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#1e2530] bg-[#ffffff05] text-[#aaa] text-xs font-bold hover:bg-[#ffffff0d] hover:border-[#2e3a4a] hover:text-white transition-all duration-200"
          >
            <Settings2 size={12} />
            Gérer
          </Link>
        </div>

        {/* Bottom edit/delete row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(event)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[#1e2530] text-[#3a4a5a] text-[11px] font-semibold hover:text-white hover:border-[#2e3a4a] hover:bg-[#ffffff06] transition-all duration-200"
          >
            <Pencil size={11} />
            Modifier
          </button>
          <button
            onClick={() => onDelete(event)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[#1e2530] text-[#3a4a5a] text-[11px] font-semibold hover:text-red-400 hover:border-red-900/50 hover:bg-red-500/05 transition-all duration-200"
          >
            <Trash2 size={11} />
            Supprimer
          </button>
        </div>
      </div>

      {/* Neon bottom line on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#00E5FF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
}

// ─── Main Page ───

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<"all" | "live" | "upcoming" | "past">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/events?perPage=100");
        const data = await res.json();
        setEvents(data.data ?? []);
      } catch {
        setError("Erreur lors du chargement des événements.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openCreate = () => { setEditingEvent(null); setModalOpen(true); };
  const openEdit = (ev: Event) => { setEditingEvent(ev); setModalOpen(true); };

  const handleSaved = (saved: Event) => {
    const normalized: Event = { ...saved, _count: saved._count ?? { sessions: 0 } };
    setEvents((prev) => {
      const exists = prev.find((e) => e.id === normalized.id);
      if (exists) return prev.map((e) => (e.id === normalized.id ? { ...e, ...normalized } : e));
      return [normalized, ...prev];
    });
  };

  const handleDeleted = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));

  const filtered = events.filter((e) => {
    // Tab filter
    if (filter === "live" && !isOngoing(e.startDate, e.endDate)) return false;
    if (filter === "upcoming" && !isUpcoming(e.startDate)) return false;
    if (filter === "past" && (isOngoing(e.startDate, e.endDate) || isUpcoming(e.startDate))) return false;
    // Search filter
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      e.title.toLowerCase().includes(q) ||
      e.slug.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q)
    );
  });

  const liveCount = events.filter((e) => isOngoing(e.startDate, e.endDate)).length;
  const upcomingCount = events.filter((e) => isUpcoming(e.startDate)).length;
  const pastCount = events.length - liveCount - upcomingCount;

  return (
    <>
      <EventModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={handleSaved} editingEvent={editingEvent} />
      <DeleteModal event={deletingEvent} onClose={() => setDeletingEvent(null)} onDeleted={handleDeleted} />

      <main className="flex-1 px-8 py-12 max-w-6xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#4a5568] mb-8">
          <Link href="/" className="hover:text-[#00E5FF] transition-colors">Home</Link>
          <ChevronRight size={13} />
          <span className="text-white">Événements</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          <div className="flex-1">
            <div className="flex flex-row gap-4">
              <div className="w-8 h-8 rounded-xl mt-2 flex items-center justify-center">
                <Calendar size={30} className="text-[#00E5FF]" />
              </div>
              <h1 className="font-black text-5xl">Liste des événements</h1>
            </div>
            <p className="text-lg text-[#4a5568] mt-1">Gérez, modifiez et planifiez tous vos événements.</p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black text-sm font-black tracking-wide hover:bg-[#00cfea] active:scale-95 transition-all duration-200 shrink-0"
            style={{ boxShadow: "0 0 24px #00E5FF30" }}
          >
            <Plus size={15} strokeWidth={3} />
            Créer un événement
          </button>
        </div>

        {/* Filter tabs + Search */}
        {!loading && events.length > 0 && (
          <div className="flex items-center gap-3 mb-7 flex-wrap">
            {/* Filter tabs */}
            {(
              [
                { key: "all", label: "Tous", count: events.length, dot: "#3a4a5a" },
                { key: "live", label: "Live", count: liveCount, dot: "#00E5FF", pulse: true },
                { key: "upcoming", label: "À venir", count: upcomingCount, dot: "#34d399" },
                { key: "past", label: "Passés", count: pastCount, dot: "#2a3a4a" },
              ] as const
            ).map(({ key, label, count, dot, pulse }: { key: "all" | "live" | "upcoming" | "past"; label: string; count: number; dot: string; pulse?: boolean }) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={[
                    "relative flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-200",
                    active
                      ? "border-[#00E5FF44] bg-[#00E5FF12] text-white"
                      : "border-[#1e2530] bg-[#0d1117] text-[#3a4a5a] hover:border-[#2e3a4a] hover:text-[#8a9aaa]",
                  ].join(" ")}
                >
                  <span
                    className={["w-1.5 h-1.5 rounded-full shrink-0", pulse ? "animate-pulse" : ""].join(" ")}
                    style={{ backgroundColor: active ? dot : dot }}
                  />
                  {label}
                  <span
                    className={[
                      "ml-0.5 text-[10px] font-black tabular-nums",
                      active ? "text-[#00E5FF]" : "text-[#2a3a4a]",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 rounded-xl border border-[#00E5FF33] pointer-events-none"
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </button>
              );
            })}

            {/* Search */}
            <div className="relative ml-auto">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a4a5a] pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-52 pl-9 pr-4 py-2 rounded-xl bg-[#0d1117] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#3a4a5a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
              />
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-20">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0d1117] border border-[#1e2530] flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-[#1e2530]" />
            </div>
            <p className="text-[#3a4a5a] italic text-sm mb-5">Aucun événement pour le moment.</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF15] border border-[#00E5FF30] text-[#00E5FF] text-sm font-bold hover:bg-[#00E5FF20] transition-all"
            >
              <Plus size={13} />
              Créer le premier événement
            </button>
          </div>
        )}

        {/* No search results */}
        {!loading && !error && events.length > 0 && filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[#3a4a5a] italic text-sm">Aucun résultat pour «&nbsp;{search}&nbsp;».</p>
          </div>
        )}

        {/* ── 2-Column Card Grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <AnimatePresence initial={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filtered.map((ev, i) => (
                <AdminEventCard
                  key={ev.id}
                  event={ev}
                  index={i}
                  onEdit={openEdit}
                  onDelete={(e) => setDeletingEvent(e)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
    </>
  );
}