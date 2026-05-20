"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useFavorites } from "@/hooks/useFavorites";
import ToggleSwitch from "@/components/ToggleSwitch";
import Link from "next/link";
import { Calendar, MapPin, Pencil, Trash2, Plus, X, AlertTriangle, ChevronRight, Clock, Mic, Building2, Radio, Users, Save, ExternalLink, CheckSquare, Square } from "lucide-react";
import SessionCardSchedule from "@/components/SessionSchedule";
import { Room, Session, SessionFormData, Speaker, Event } from "@/types";

const EMPTY_SESSION: SessionFormData = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  capacity: "",
  roomId: "",
  speakerIds: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDatetimeLocal(iso: string) {
  return new Date(iso).toISOString().slice(0, 16);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function duration(start: string, end: string) {
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
  if (diff < 60) return `${diff} min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-[#060a0f] border border-[#1e2530] text-sm text-[#ccc] placeholder-[#2a3a4a] focus:outline-none focus:border-[#00E5FF44] focus:ring-1 focus:ring-[#00E5FF22] transition-all duration-200";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest text-[#3a4a5a]">
          {label}
          {required && <span className="text-[#00E5FF] ml-1">*</span>}
        </label>
        {hint && <span className="text-[10px] text-[#2a3a4a]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SessionCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#1e2530] bg-[#0d1117] p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-[#1e2530] shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-3.5 w-1/2 bg-[#1e2530] rounded-lg" />
          <div className="h-2.5 w-1/3 bg-[#1e2530] rounded-lg" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-[#1e2530] rounded-lg" />
        <div className="h-6 w-24 bg-[#1e2530] rounded-lg" />
      </div>
    </div>
  );
}

// ─── Session Modal ────────────────────────────────────────────────────────────

function SessionModal({
  open,
  onClose,
  onSaved,
  editingSession,
  allSpeakers,
  allRooms,
  eventId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (s: Session) => void;
  editingSession: Session | null;
  allSpeakers: Speaker[];
  allRooms: Room[];
  eventId: string;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isEdit = !!editingSession;
  const [form, setForm] = useState<SessionFormData>(EMPTY_SESSION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevEditingSession, setPrevEditingSession] = useState(editingSession);

  if (open !== prevOpen || editingSession !== prevEditingSession) {
    setPrevOpen(open);
    setPrevEditingSession(editingSession);
    if (open) {
      setForm(editingSession ? {
        title: editingSession.title,
        description: editingSession.description ?? "",
        startTime: toDatetimeLocal(editingSession.startTime),
        endTime: toDatetimeLocal(editingSession.endTime),
        capacity: editingSession.capacity?.toString() ?? "",
        roomId: editingSession.room?.id ?? "",
        speakerIds: editingSession.speakers.map((s) => s.id),
      } : EMPTY_SESSION);
      setError("");
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const set = (field: keyof SessionFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleSpeaker = (id: string) => {
    setForm((f) => ({
      ...f,
      speakerIds: f.speakerIds.includes(id)
        ? f.speakerIds.filter((s) => s !== id)
        : [...f.speakerIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.startTime || !form.endTime) {
      setError("Titre, heure de début et heure de fin sont obligatoires.");
      return;
    }
    if (new Date(form.startTime) >= new Date(form.endTime)) {
      setError("L'heure de début doit être antérieure à l'heure de fin.");
      return;
    }
    if (form.speakerIds.length === 0) {
      setError("Sélectionnez au moins un intervenant.");
      return;
    }

    setLoading(true);
    try {
      const url = isEdit
        ? `/api/sessions/${editingSession!.id}`
        : `/api/events/${eventId}/sessions`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          startTime: form.startTime,
          endTime: form.endTime,
          capacity: form.capacity ? Number(form.capacity) : undefined,
          roomId: form.roomId || undefined,
          speakerIds: form.speakerIds,
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
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl rounded-2xl border border-[#1e2530] bg-[#0a0e14] overflow-hidden max-h-[90vh] flex flex-col"
            style={{
              boxShadow:
                "0 0 0 1px #00E5FF18, 0 0 40px #00E5FF18, 0 0 80px #00E5FF08, 0 32px 64px rgba(0,0,0,0.6)",
            }}
          >
            {/* Neon top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00E5FF60] to-transparent" />
            <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 bg-[#00E5FF08] rounded-full blur-3xl" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#1e2530] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#00E5FF15] border border-[#00E5FF30] flex items-center justify-center">
                  {isEdit ? (
                    <Pencil size={12} className="text-[#00E5FF]" />
                  ) : (
                    <Plus size={12} className="text-[#00E5FF]" strokeWidth={3} />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-black text-white tracking-tight">
                    {isEdit ? "Modifier la session" : "Nouvelle session"}
                  </h2>
                  <p className="text-xs text-[#3a4a5a]">
                    {isEdit ? editingSession?.title : "Ajoutez une session à cet événement"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-white hover:border-[#2e3a4a] transition-all duration-200"
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleSubmit} className="relative flex flex-col overflow-hidden flex-1">
              <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
                <Field label="Titre" required>
                  <input
                    className={inputClass}
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Ex : Keynote d'ouverture"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={2}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Résumé de la session…"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Début" required>
                    <input
                      className={inputClass}
                      type="datetime-local"
                      value={form.startTime}
                      onChange={(e) => set("startTime", e.target.value)}
                    />
                  </Field>
                  <Field label="Fin" required>
                    <input
                      className={inputClass}
                      type="datetime-local"
                      value={form.endTime}
                      onChange={(e) => set("endTime", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Salle">
                    <select
                      className={inputClass}
                      value={form.roomId}
                      onChange={(e) => set("roomId", e.target.value)}
                    >
                      <option value="">— Sans salle —</option>
                      {allRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Capacité" hint="(optionnel)">
                    <input
                      className={inputClass}
                      type="number"
                      min="1"
                      value={form.capacity}
                      onChange={(e) => set("capacity", e.target.value)}
                      placeholder="Ex : 150"
                    />
                  </Field>
                </div>

                {/* Speaker picker */}
                <Field label="Intervenants" required>
                  {allSpeakers.length === 0 ? (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-amber-900/40 bg-amber-500/10 text-amber-400 text-sm">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>
                        Aucun intervenant.{" "}
                        <Link href="/admin/speakers" className="underline hover:text-amber-300">
                          En créer un
                        </Link>{" "}
                        d&apos;abord.
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#1e2530] bg-[#060a0f] divide-y divide-[#1e2530] overflow-hidden">
                      {allSpeakers.map((sp) => {
                        const checked = form.speakerIds.includes(sp.id);
                        return (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => toggleSpeaker(sp.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${checked
                              ? "bg-[#00E5FF08] hover:bg-[#00E5FF10]"
                              : "hover:bg-[#ffffff04]"
                              }`}
                          >
                            {/* Avatar */}
                            <div className="w-7 h-7 rounded-full bg-[#1e2530] border border-[#2a3a4a] flex items-center justify-center text-[10px] font-black text-[#3a4a5a] shrink-0 overflow-hidden">
                              {sp.photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={sp.photo} alt={sp.fullName} className="w-full h-full object-cover" />
                              ) : (
                                sp.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <span
                              className={`flex-1 text-sm font-semibold transition-colors ${checked ? "text-white" : "text-[#4a5568]"
                                }`}
                            >
                              {sp.fullName}
                            </span>
                            {checked ? (
                              <CheckSquare size={15} className="text-[#00E5FF] shrink-0" />
                            ) : (
                              <Square size={15} className="text-[#2a3a4a] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {form.speakerIds.length > 0 && (
                    <p className="text-[11px] text-[#00E5FF] mt-1">
                      {form.speakerIds.length} intervenant{form.speakerIds.length !== 1 ? "s" : ""} sélectionné{form.speakerIds.length !== 1 ? "s" : ""}
                    </p>
                  )}
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
              </div>

              {/* Sticky footer */}
              <div className="px-6 pb-6 pt-4 border-t border-[#1e2530] bg-[#0a0e14] shrink-0 flex gap-3">
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
                  {loading
                    ? isEdit ? "Sauvegarde…" : "Création…"
                    : isEdit ? "Sauvegarder" : "Ajouter la session"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
// ─── Delete Session Modal ─────────────────────────────────────────────────────
function DeleteSessionModal({
  session,
  onClose,
  onDeleted,
}: {
  session: Session | null;
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
    if (session) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [session, onClose]);

  const handleDelete = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur lors de la suppression");
      }
      onDeleted(session.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {session && (
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
              boxShadow:
                "0 0 0 1px #ff444418, 0 0 40px #ff444412, 0 32px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500/50 to-transparent" />
            <div className="px-6 pt-6 pb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-900/40 flex items-center justify-center mb-4">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <h2 className="text-base font-black text-white mb-1">Supprimer la session ?</h2>
              <p className="text-sm text-[#4a5568] leading-relaxed">
                <span className="text-[#ccc] font-semibold">{session.title}</span> et toutes ses questions seront définitivement supprimées.
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
                className="flex-1 py-2.5 rounded-xl border border-[#1e2530] text-sm text-[#4a5568] hover:text-white transition-all font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500/90 text-white text-sm font-black hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50"
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

// ─── Edit Event Modal ─────────────────────────────────────────────────────────

function EditEventModal({
  open,
  onClose,
  event,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  event: Event;
  onSaved: (e: Event) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    coverImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevEvent, setPrevEvent] = useState(event);

  if (open !== prevOpen || event !== prevEvent) {
    setPrevOpen(open);
    setPrevEvent(event);
    if (open) {
      setForm({
        title: event.title,
        description: event.description ?? "",
        startDate: toDatetimeLocal(event.startDate),
        endDate: toDatetimeLocal(event.endDate),
        location: event.location ?? "",
        coverImage: event.coverImage ?? "",
      });
      setError("");
    }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.startDate || !form.endDate) {
      setError("Titre, date de début et date de fin sont obligatoires.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
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
      onSaved({ ...event, ...data });
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
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00E5FF60] to-transparent" />
            <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 bg-[#00E5FF08] rounded-full blur-3xl" />

            <div className="relative flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#1e2530]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#00E5FF15] border border-[#00E5FF30] flex items-center justify-center">
                  <Pencil size={12} className="text-[#00E5FF]" />
                </div>
                <h2 className="text-base font-black text-white">Modifier l&apos;événement</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl border border-[#1e2530] flex items-center justify-center text-[#3a4a5a] hover:text-white hover:border-[#2e3a4a] transition-all duration-200"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="relative px-6 py-5 flex flex-col gap-4">
              <Field label="Titre" required>
                <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Titre de l'événement" />
              </Field>
              <Field label="Description">
                <textarea className={`${inputClass} resize-none`} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Description…" />
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
                <input className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Ex : Paris, France" />
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
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1e2530] text-sm text-[#4a5568] hover:text-white transition-all font-semibold">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#00E5FF] text-black text-sm font-black hover:bg-[#00cfea] active:scale-95 transition-all disabled:opacity-50"
                  style={{ boxShadow: "0 0 20px #00E5FF30" }}
                >
                  {loading ? "Sauvegarde…" : "Sauvegarder"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({
  session,
  onEdit,
  onDelete,
}: {
  session: Session;
  onEdit: (s: Session) => void;
  onDelete: (s: Session) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-2xl border border-[#1e2530] bg-[#0d1117] p-5 hover:border-[#00E5FF22] transition-all duration-300 overflow-hidden mt-3"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_top_left,#00E5FF06_0%,transparent_60%)] m-5" />

      {/* Live badge */}
      {session.isLive && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
          <span className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-widest">Live</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3 pr-16">
        <div className="w-8 h-8 rounded-xl bg-[#ffffff06] border border-[#1e2530] flex items-center justify-center shrink-0 group-hover:border-[#00E5FF22] transition-colors">
          <Mic size={14} className="text-[#3a4a5a] group-hover:text-[#00E5FF] transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#eee] text-sm leading-tight truncate">{session.title}</h3>
          {session.description && (
            <p className="text-xs text-[#3a4a5a] mt-0.5 line-clamp-1">{session.description}</p>
          )}
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-[#1e2530] text-[#3a4a5a] font-semibold">
          <Clock size={9} />
          {formatTime(session.startTime)} — {formatTime(session.endTime)}
          <span className="text-[#2a3a4a] ml-0.5">· {duration(session.startTime, session.endTime)}</span>
        </span>

        {session.room && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-[#1e2530] text-[#3a4a5a] font-semibold">
            <Building2 size={9} />
            {session.room.name}
          </span>
        )}

        {session.capacity && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-[#1e2530] text-[#3a4a5a] font-semibold">
            <Users size={9} />
            {session.capacity} places
          </span>
        )}

        {(session._count?.questions ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-[#00E5FF20] bg-[#00E5FF08] text-[#00E5FF] font-semibold">
            💬 {session._count?.questions ?? 0} question{(session._count?.questions ?? 0) !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Speakers */}
      {session.speakers.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {session.speakers.slice(0, 4).map((sp) => (
              <div
                key={sp.id}
                className="w-6 h-6 rounded-full bg-[#1e2530] border-2 border-[#0d1117] flex items-center justify-center text-[8px] font-black text-[#3a4a5a] overflow-hidden"
                title={sp.fullName}
              >
                {sp.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sp.photo} alt={sp.fullName} className="w-full h-full object-cover" />
                ) : (
                  sp.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                )}
              </div>
            ))}
          </div>
          <span className="text-[11px] text-[#3a4a5a]">
            {session.speakers.map((s) => s.fullName).join(", ")}
            {session.speakers.length > 4 && ` +${session.speakers.length - 4}`}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-[#1e2530] mt66">
        <button
          onClick={() => onEdit(session)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-[#1e2530] text-xs text-[#3a4a5a] hover:text-white hover:border-[#2e3a4a] transition-all font-semibold"
        >
          <Pencil size={11} />
          Modifier
        </button>
        <button
          onClick={() => onDelete(session)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-[#1e2530] text-xs text-[#3a4a5a] hover:text-red-400 hover:border-red-900/50 transition-all font-semibold"
        >
          <Trash2 size={11} />
          Supprimer
        </button>
      </div>
    </motion.div>
  );
}


  function ListEventBySessionsPage(){
  const { eventId } = useParams<{ eventId: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [allSpeakers, setAllSpeakers] = useState<Speaker[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // Modals
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deletingSession, setDeletingSession] = useState<Session | null>(null);

  const load = useCallback(async () => {
    try {
      const [evtRes, spkRes, roomRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch("/api/speakers"),
        fetch("/api/rooms"),
      ]);
      const [evtData, spkData, roomData] = await Promise.all([
        evtRes.json(),
        spkRes.json(),
        roomRes.json(),
      ]);
      if (!evtRes.ok) throw new Error(evtData.error ?? "Erreur");
      setEvent(evtData);
      setAllSpeakers(Array.isArray(spkData) ? spkData : []);
      setAllRooms(Array.isArray(roomData) ? roomData : []);
    } catch {
      setPageError("Impossible de charger l'événement.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  const openCreateSession = () => {
    setEditingSession(null);
    setSessionModalOpen(true);
  };

  const openEditSession = (s: Session) => {
    setEditingSession(s);
    setSessionModalOpen(true);
  };

  const handleSessionSaved = (saved: Session) => {
    setEvent((prev) => {
      if (!prev) return prev;
      const exists = prev.sessions.find((s) => s.id === saved.id);
      return {
        ...prev,
        sessions: exists
          ? prev.sessions.map((s) => (s.id === saved.id ? saved : s))
          : [...prev.sessions, saved],
      };
    });
  };

  const handleSessionDeleted = (id: string) => {
    setEvent((prev) =>
      prev ? { ...prev, sessions: prev.sessions.filter((s) => s.id !== id) } : prev
    );
  };

  const sortedSessions = event?.sessions.slice().sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  ) ?? [];

  // ── Loading ──
  if (loading) {
    return (
      <main className="flex-1 px-8 py-12 max-w-6xl mx-auto w-full">
        <div className="h-4 w-32 bg-[#1e2530] rounded-lg animate-pulse mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-64 bg-[#0d1117] rounded-2xl border border-[#1e2530] animate-pulse" />
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SessionCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (pageError || !event) {
    return (
      <main className="flex-1 px-8 py-12 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertTriangle size={16} />
          {pageError || "Événement introuvable."}
        </div>
      </main>
    );
  }

    return (
      <div>      
        <EditEventModal
        open={editEventOpen}
        onClose={() => setEditEventOpen(false)}
        event={event}
        onSaved={setEvent}
      />
      <SessionModal
        open={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        onSaved={handleSessionSaved}
        editingSession={editingSession}
        allSpeakers={allSpeakers}
        allRooms={allRooms}
        eventId={eventId}
      />
      <DeleteSessionModal
        session={deletingSession}
        onClose={() => setDeletingSession(null)}
        onDeleted={handleSessionDeleted}
      />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Event details ── */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Event card */}
            <div
              className="relative rounded-2xl border border-[#1e2530] bg-[#0d1117] mt-20 overflow-hidden"
              style={{ boxShadow: "0 0 0 1px #00E5FF0a, 0 0 30px #07282c08" }}
            > 
              {/* Cover image */}
              {event.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-linear-to-br from-[#00E5FF08] to-[#0066ff08] border-b border-[#1e2530] flex items-center justify-center">
                  <Calendar size={28} className="text-[#1e2530]" />
                </div>
              )}

              {/* Top neon line */}
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#00E5FF40] to-transparent" />

              <div className="p-5">
                <h1 className="text-lg font-black text-white tracking-tight leading-tight mb-1">
                  {event.title}
                </h1>
                <p className="text-xs font-mono text-[#2a3a4a] mb-3">{event.slug}</p>
                {event.description && (
                  <p className="text-sm text-[#4a5568] leading-relaxed mb-4">{event.description}</p>
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-[#3a4a5a]">
                    <Calendar size={12} className="text-[#00E5FF] shrink-0" />
                    <span>{formatDate(event.startDate)}</span>
                    <span className="text-[#2a3a4a]">→</span>
                    <span>{formatDate(event.endDate)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-[#3a4a5a]">
                      <MapPin size={12} className="text-[#00E5FF] shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-[#3a4a5a]">
                    <Mic size={12} className="text-[#00E5FF] shrink-0" />
                    <span>{event.sessions.length} session{event.sessions.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-5 pt-4 border-t border-[#1e2530]">
                  <button
                    onClick={() => setEditEventOpen(true)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#1e2530] text-xs text-[#3a4a5a] hover:text-white hover:border-[#2e3a4a] transition-all font-semibold"
                  >
                    <Save size={11} />
                    Modifier
                  </button>
                  <Link
                    href={`/events/${event.slug}`}
                    target="_blank"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#1e2530] text-xs text-[#3a4a5a] hover:text-[#00E5FF] hover:border-[#00E5FF33] transition-all font-semibold"
                  >
                    <ExternalLink size={11} />
                    Voir
                  </Link>
                </div>
              </div>
            </div>
            {/* grille contenant les listes des sessions */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] p-4 text-center">
                <div className="text-2xl font-black text-[#00E5FF]">{event.sessions.length}</div>
                <div className="text-[10px] text-[#3a4a5a] font-semibold uppercase tracking-widest mt-0.5">Sessions</div>
              </div>
            <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] p-4 text-center">
              <div className="text-2xl font-black text-white">
                {event.sessions.filter((s) => s.isLive).length}
              </div>
              <div className="text-[10px] text-[#3a4a5a] font-semibold uppercase tracking-widest mt-0.5 flex items-center justify-center gap-1">
                {event.sessions.some((s) => s.isLive) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
              )}
              Live
              </div>
            </div>

            <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] p-4 text-center">
              <div className="text-2xl font-black text-white">
              {[...new Set(event.sessions.flatMap((s) => s.speakers.map((sp) => sp.id)))].length}
              </div>
              <div className="text-[10px] text-[#3a4a5a] font-semibold uppercase tracking-widest mt-0.5">Speakers</div>
            </div>

            <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] p-4 text-center">
              <div className="text-2xl font-black text-white">
                {event.sessions.reduce((sum, s) => sum + s._count.questions, 0)}
              </div>
              <div className="text-[10px] text-[#3a4a5a] font-semibold uppercase tracking-widest mt-0.5">Questions</div>
            </div>
          </div>
              </div>          
          {/* ── Right: Sessions ── */}
          <div className="lg:col-span-2 mt-20">
            {/* Sessions header */}
            <div className="flex items-center justify-between mb-5">
             <div className="flex items-center gap-2"> 
                <Radio size={25} className="text-[#00E5FF]" />
                <h2 className="text-3xl font-black tracking-tight">
                  Sessions
               </h2>
              </div>
              <button
                onClick={openCreateSession}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-black text-xs font-black tracking-wide hover:bg-[#00cfea] active:scale-95 transition-all duration-200"
                style={{ boxShadow: "0 0 20px #00E5FF25" }}
              >
                <Plus size={13} strokeWidth={3} />
                Ajouter une session
              </button>
            </div>

            {/* Empty */}
            {sortedSessions.length === 0 && (
              <div className="rounded-2xl border border-[#1e2530] bg-[#0d1117] py-20 text-center">
                <Mic size={28} className="mx-auto text-[#1e2530] mb-3" />
                <p className="text-[#3a4a5a] italic text-sm mb-4">
                  Aucune session pour le moment.
                </p>
                <button
                  onClick={openCreateSession}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF15] border border-[#00E5FF30] text-[#00E5FF] text-sm font-bold hover:bg-[#00E5FF20] transition-all"
                >
                  <Plus size={13} />
                  Créer la première session
                </button>
              </div>
            )}
              <AnimatePresence initial={false}>
                {sortedSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onEdit={openEditSession}
                    onDelete={(s) => setDeletingSession(s)}
                  />
                ))}
              </AnimatePresence>
          </div> 
        </div>
      </div>
  )}

  function PlanningPage({slug}: {slug: string}){
    const { eventId} = useParams<{ eventId: string}>();
    const [ session, setSession ] = useState<Session[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);
    const [ selectedRoom, setSelectedRoom ] = useState<string | null>(null);
    const { toggle, isFavorite } = useFavorites();


    useEffect(() => {
      const fetchSession = async () => {
        try{
          const response = await fetch(`/api/events/${eventId}/sessions`);
          if(!response.ok) throw new Error("Internal Servor Error");
          const data = await response.json(); 
          
          setSession(data);
          console.log(data);
          

        }catch{
          setError("Session charge failed");

        }finally{
          setLoading(false);
        }
      }
      fetchSession()

    }, [eventId]);

    const rooms = [...new Set(session.flatMap(s => s.room ? [s.room.name] : []))]

    if(loading) return <div className=" h-80 items-center justify-center flex">
      <div className="w-12 h-12 border-5 border-cyan-300 rounded-full border-t-transparent animate-spin"></div>
    </div>
    if(error) return <div>{error}</div>
    if(!rooms.length) return <div></div>

    return(    
      <div className="mt-3 rounded-lg bg-[#0B0F18]">
        <div className="flex flex-row justify-between p-5">
          <div className="flex gap-3">
            <button className="bg-[#00EEFF] text-black h-13 rounded-xl font-bold w-35" onClick={() => setSelectedRoom(null)}>Toutes les salles</button>
            {
              rooms.map(r => (
                <button 
                className="w-35 rounded-xl border-[#2A3A4A] hover:text-[#00EEFF] hover:border-[#00EEFF] text-[#3A4A5A] border h-13 font-bold " 
                key={r}
                onClick={() => setSelectedRoom(r)}
                >
                  {r}
                  </button>
              ))
            }
          </div>

        </div>

        
        <SessionCardSchedule session={session} selectedRoom={selectedRoom} toggle={toggle} isFavorite={isFavorite} slug={slug}/>
      </div>

    )
  }

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [allSpeakers, setAllSpeakers] = useState<Speaker[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [ isOn, setIsOn ] = useState(false);


  const load = useCallback(async () => {
    try {
      const [evtRes, spkRes, roomRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch("/api/speakers"),
        fetch("/api/rooms"),
      ]);
      const [evtData, spkData, roomData] = await Promise.all([
        evtRes.json(),
        spkRes.json(),
        roomRes.json(),
      ]);
      if (!evtRes.ok) throw new Error(evtData.error ?? "Erreur");
      setEvent(evtData);
      setAllSpeakers(Array.isArray(spkData) ? spkData : []);
      setAllRooms(Array.isArray(roomData) ? roomData : []);
    } catch {
      setPageError("Impossible de charger l'événement.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Loading ──
  if (loading) {
    return (
      <main className="flex-1 px-8 py-12 max-w-6xl mx-auto w-full">
        <div className="h-4 w-32 bg-[#1e2530] rounded-lg animate-pulse mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-64 bg-[#0d1117] rounded-2xl border border-[#1e2530] animate-pulse" />
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SessionCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (pageError || !event) {
    return (
      <main className="flex-1 px-8 py-12 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertTriangle size={16} />
          {pageError || "Événement introuvable."}
        </div>
      </main>
    );
  }

  return (
    
    <>
      <main className="flex-1 px-8 py-12 max-w-6xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#4a5568] mb-8 flex-wrap">
          <Link href="/admin" className="hover:text-[#00E5FF] transition-colors">Admin</Link>
          <ChevronRight size={13} />
          <Link href="/admin/events" className="hover:text-[#00E5FF] transition-colors">Événements</Link>
          <ChevronRight size={13} />
          <span className="text-white truncate max-w-50">{event.title}</span>
        </div>
        <ToggleSwitch isOn={isOn} setIsOn={setIsOn}/>
        {isOn? <PlanningPage slug={event.slug}/> : <ListEventBySessionsPage/> }

      </main>
    </>
  );
}