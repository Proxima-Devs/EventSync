"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Calendar, MapPin, Layers, Pencil, Trash2, Plus, X, ExternalLink, CalendarDays, Search, AlertTriangle, ChevronRight } from "lucide-react";

// ─── Types ───

interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  location?: string | null;
  coverImage?: string | null;
  _count: { sessions: number };
}

interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  coverImage: string;
}

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

// ─── Skeleton ───

function EventRowSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-6 py-5 border-b border-[#1e2530]">
      <div className="w-10 h-10 rounded-xl bg-[#1e2530] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 bg-[#1e2530] rounded-lg" />
        <div className="h-2.5 w-1/4 bg-[#1e2530] rounded-lg" />
      </div>
      <div className="h-3 w-24 bg-[#1e2530] rounded-lg hidden sm:block" />
      <div className="h-3 w-16 bg-[#1e2530] rounded-lg hidden md:block" />
      <div className="flex gap-2 ml-auto">
        <div className="w-8 h-8 bg-[#1e2530] rounded-xl" />
        <div className="w-8 h-8 bg-[#1e2530] rounded-xl" />
        <div className="w-8 h-8 bg-[#1e2530] rounded-xl" />
      </div>
    </div>
  );
}

// ─── Input component ───

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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
  open,
  onClose,
  onSaved,
  editingEvent,
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

  // Sync form when editing
  useEffect(() => {
    const updateForm = () => {
      if (editingEvent) {
        setForm(prevForm => ({
          ...prevForm,
          title: editingEvent.title,
          description: editingEvent.description ?? "",
          startDate: toDatetimeLocal(editingEvent.startDate),
          endDate: toDatetimeLocal(editingEvent.endDate),
          location: editingEvent.location ?? "",
          coverImage: editingEvent.coverImage ?? "",
        }));
      } else {
        setForm(EMPTY_FORM);
      }
    };

    updateForm();
  }, [editingEvent, open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
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
            style={{
              boxShadow:
                "0 0 0 1px #00E5FF18, 0 0 40px #00E5FF18, 0 0 80px #00E5FF08, 0 32px 64px rgba(0,0,0,0.6)",
            }}
          >
            {/* Top neon line */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00E5FF60] to-transparent" />
            {/* Corner glow */}
            <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 bg-[#00E5FF08] rounded-full blur-3xl" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#1e2530]">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-6 h-6 rounded-lg bg-[#00E5FF15] border border-[#00E5FF30] flex items-center justify-center">
                    {isEdit ? (
                      <Pencil size={12} className="text-[#00E5FF]" />
                    ) : (
                      <Plus size={12} className="text-[#00E5FF]" strokeWidth={3} />
                    )}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative px-6 py-5 flex flex-col gap-4">
              <Field label="Titre" required>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Ex : DevConf Paris 2026"
                />
              </Field>

              <Field label="Description">
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Décrivez l'événement…"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Début" required>
                  <input
                    className={inputClass}
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                  />
                </Field>
                <Field label="Fin" required>
                  <input
                    className={inputClass}
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Lieu">
                <input
                  className={inputClass}
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Ex : Grande Halle, Paris"
                />
              </Field>

              <Field label="Image de couverture (URL)">
                <input
                  className={inputClass}
                  type="url"
                  value={form.coverImage}
                  onChange={(e) => set("coverImage", e.target.value)}
                  placeholder="https://…"
                />
              </Field>

              {/* Error */}
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

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#1e2530] text-sm text-[#4a5568] hover:text-white hover:border-[#2e3a4a] transition-all duration-200 font-semibold"
                >
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

function DeleteModal({
  event,
  onClose,
  onDeleted,
}: {
  event: Event | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
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
            style={{
              boxShadow: "0 0 0 1px #ff444418, 0 0 40px #ff444412, 0 32px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500/50 to-transparent" />

            <div className="px-6 pt-6 pb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-900/40 flex items-center justify-center mb-4">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <h2 className="text-base font-black text-white mb-1">Supprimer l'événement ?</h2>
              <p className="text-sm text-[#4a5568] leading-relaxed">
                <span className="text-[#ccc] font-semibold">{event.title}</span> et toutes ses sessions seront
                définitivement supprimés.
              </p>

              {error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-900/40 rounded-xl px-3 py-2">
                  <AlertTriangle size={13} className="shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#1e2530] text-sm text-[#4a5568] hover:text-white hover:border-[#2e3a4a] transition-all duration-200 font-semibold"
              >
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

// ─── Event Row ───

function EventRow({
  event,
  onEdit,
  onDelete,
}: {
  event: Event;
  onEdit: (ev: Event) => void;
  onDelete: (ev: Event) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className="group flex items-center gap-4 px-6 py-4 border-b border-[#1e2530] hover:bg-[#ffffff03] transition-colors"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-[#ffffff06] border border-[#1e2530] flex items-center justify-center shrink-0 group-hover:border-[#00E5FF22] transition-colors">
        <CalendarDays size={16} className="text-[#3a4a5a] group-hover:text-[#00E5FF] transition-colors" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-[#eee] truncate text-sm">{event.title}</span>
          <StatusBadge start={event.startDate} end={event.endDate} />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-[#3a4a5a] font-mono">{event.slug}</span>
          {event.location && (
            <span className="flex items-center gap-1 text-[11px] text-[#3a4a5a]">
              <MapPin size={10} />
              {event.location}
            </span>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-xs text-[#4a5568]">{formatDate(event.startDate)}</span>
        <span className="text-[10px] text-[#2a3a4a]">→ {formatDate(event.endDate)}</span>
      </div>

      {/* Sessions count */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <Layers size={12} className="text-[#3a4a5a]" />
        <span className="text-xs text-[#3a4a5a] font-semibold">
          {event._count.sessions} session{event._count.sessions !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/events/${event.slug}`}
          target="_blank"
          className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-[#00E5FF] hover:border-[#00E5FF33] transition-all duration-200"
          title="Voir la page publique"
        >
          <ExternalLink size={13} />
        </Link>
        <Link
          href={`/admin/events/${event.id}`}
          className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-white hover:border-[#2e3a4a] transition-all duration-200 group/btn"
          title="Gérer l'événement et les sessions"
        >
          <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
        <button
          onClick={() => onEdit(event)}
          className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-white hover:border-[#2e3a4a] transition-all duration-200"
          title="Modifier"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(event)}
          className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-red-400 hover:border-red-900/50 transition-all duration-200"
          title="Supprimer"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal state
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

  const openCreate = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const openEdit = (ev: Event) => {
    setEditingEvent(ev);
    setModalOpen(true);
  };

  const handleSaved = (saved: Event) => {
    const normalized: Event = {
      ...saved,
      _count: saved._count ?? { sessions: 0 },
    };
    setEvents((prev) => {
      const exists = prev.find((e) => e.id === normalized.id);
      if (exists) return prev.map((e) => (e.id === normalized.id ? { ...e, ...normalized } : e));
      return [normalized, ...prev];
    });
  };

  const handleDeleted = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const filtered = events.filter((e) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      e.title.toLowerCase().includes(q) ||
      e.slug.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q)
    );
  });

  // Counts
  const liveCount = events.filter((e) => isOngoing(e.startDate, e.endDate)).length;
  const upcomingCount = events.filter((e) => isUpcoming(e.startDate)).length;

  return (
    <>
      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        editingEvent={editingEvent}
      />
      <DeleteModal
        event={deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onDeleted={handleDeleted}
      />

      <main className="flex-1 px-8 py-12 max-w-6xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#4a5568] mb-8">
          <Link href="/admin" className="hover:text-[#00E5FF] transition-colors">
            Admin
          </Link>
          <ChevronRight size={13} />
          <span className="text-white">Événements</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          <div className="flex-1">
  
            <div >
              <div className="flex flex-row gap-4 ">
                <div className="w-8 h-8 rounded-xl mt-2  flex items-center justify-center">
                  <Calendar size={30} className="text-[#00E5FF] " />
                </div>
                <h1 className="font-black text-5xl">Liste des evenements </h1>                
              </div>

              <p className="text-lg text-[#4a5568]">
              Gérez, modifiez et planifiez tous vos événements.
            </p>
            </div>

          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black text-sm font-black tracking-wide hover:bg-[#00cfea] active:scale-95 transition-all duration-200"
            style={{ boxShadow: "0 0 24px #00E5FF30" }}
          >
            <Plus size={15} strokeWidth={3} />
            Créer un événement
          </button>
        </div>

        {/* Mini stats bar */}
        {!loading && events.length > 0 && (
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#0d1117]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
              <span className="text-xs text-[#3a4a5a] font-semibold">
                {liveCount} live
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#0d1117]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#edce00]" />
              <span className="text-xs text-[#3a4a5a] font-semibold">
                {upcomingCount} à venir
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#0d1117]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-[#3a4a5a] font-semibold">
                {events.length - liveCount - upcomingCount} tous
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1e2530] bg-[#0d1117]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3a4a5a]"/>
                  <span className="text-xs text-[#3a4a5a] font-semibold">
                      {events.length} total
                  </span>
            </div>

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

        {/* Table */}
        <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-6 py-3 border-b border-[#1e2530] bg-[#060a0f]">
            <div className="w-10 shrink-0" />
            <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-[#2a3a4a]">Événement</span>
            <span className="hidden sm:block w-32 text-right text-[10px] font-bold uppercase tracking-widest text-[#2a3a4a]">Dates</span>
            <span className="hidden md:block w-24 text-right text-[10px] font-bold uppercase tracking-widest text-[#2a3a4a]">Sessions</span>
            <span className="w-34 shrink-0" />
          </div>

          {/* Loading */}
          {loading && (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <EventRowSkeleton key={i} />
              ))}
            </>
          )}

          {/* Error */}
          {error && (
            <div className="px-6 py-10 flex items-center justify-center gap-2 text-red-400 text-sm">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && events.length === 0 && (
            <div className="py-20 text-center">
              <Calendar size={28} className="mx-auto text-[#1e2530] mb-3" />
              <p className="text-[#3a4a5a] italic text-sm mb-4">Aucun événement pour le moment.</p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF15] border border-[#00E5FF30] text-[#00E5FF] text-sm font-bold hover:bg-[#00E5FF20] transition-all"
              >
                <Plus size={13} />
                Créer le premier
              </button>
            </div>
          )}

          {/* No results */}
          {!loading && !error && events.length > 0 && filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[#3a4a5a] italic text-sm">
                Aucun résultat pour «&nbsp;{search}&nbsp;».
              </p>
            </div>
          )}

          {/* Rows */}
          <AnimatePresence initial={false}>
            {filtered.map((ev) => (
              <EventRow
                key={ev.id}
                event={ev}
                onEdit={openEdit}
                onDelete={(e) => setDeletingEvent(e)}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}