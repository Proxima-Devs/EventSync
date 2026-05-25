"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useFavorites } from "@/hooks/useFavorites";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Eye, Pencil, Trash2, Plus, X, AlertTriangle,
  Clock, Building2, Users, CheckSquare, Square,
  List, LayoutGrid, Heart, Calendar, MapPin,
} from "lucide-react";
import { Room, Session, SessionFormData, Speaker, Event } from "@/types";

const EMPTY_SESSION: SessionFormData = {
  title: "", description: "", startTime: "", endTime: "",
  capacity: "", roomId: "", speakerIds: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDatetimeLocal(iso: string) {
  return new Date(iso).toISOString().slice(0, 16);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function duration(start: string, end: string) {
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
  if (diff < 60) return `${diff} min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all bg-slate-900";

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {label}{required && <span className="text-cyan-400 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Session Modal ────────────────────────────────────────────────────────────

function SessionModal({ open, onClose, onSaved, editingSession, allSpeakers, allRooms, eventId }: {
  open: boolean; onClose: () => void; onSaved: (s: Session) => void;
  editingSession: Session | null; allSpeakers: Speaker[]; allRooms: Room[]; eventId: string | null;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isEdit = !!editingSession;
  const [form, setForm] = useState<SessionFormData>(EMPTY_SESSION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevEditing, setPrevEditing] = useState(editingSession);

  if (open !== prevOpen || editingSession !== prevEditing) {
    setPrevOpen(open); setPrevEditing(editingSession);
    if (open) {
      setForm(editingSession ? {
        title: editingSession.title, description: editingSession.description ?? "",
        startTime: toDatetimeLocal(editingSession.startTime), endTime: toDatetimeLocal(editingSession.endTime),
        capacity: editingSession.capacity?.toString() ?? "", roomId: editingSession.room?.id ?? "",
        speakerIds: editingSession.speakers.map((s) => s.id),
      } : EMPTY_SESSION);
      setError("");
    }
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  const set = (f: keyof SessionFormData, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const toggleSpeaker = (id: string) =>
    setForm((p) => ({
      ...p,
      speakerIds: p.speakerIds.includes(id) ? p.speakerIds.filter((s) => s !== id) : [...p.speakerIds, id],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!form.title || !form.startTime || !form.endTime) { setError("Titre, début et fin sont obligatoires."); return; }
    if (new Date(form.startTime) >= new Date(form.endTime)) { setError("Le début doit être avant la fin."); return; }
    if (form.speakerIds.length === 0) { setError("Sélectionnez au moins un intervenant."); return; }
    setLoading(true);
    try {
      if (!eventId) {
        throw new Error("Impossible d'enregistrer : événement non chargé.");
      }
      const url = isEdit ? `/api/sessions/${editingSession!.id}` : `/api/events/${eventId}/sessions`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title, description: form.description || undefined,
          startTime: form.startTime, endTime: form.endTime,
          capacity: form.capacity ? Number(form.capacity) : undefined,
          roomId: form.roomId || undefined, speakerIds: form.speakerIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      onSaved(data); onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={overlayRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={(e) => e.target === overlayRef.current && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">{isEdit ? "Modifier la session" : "Nouvelle session"}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1">
              <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
                <Field label="Titre" required>
                  <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex : Keynote d'ouverture" />
                </Field>
                <Field label="Description">
                  <textarea className={`${inputCls} resize-none`} rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Résumé…" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Début" required><input className={inputCls} type="datetime-local" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} /></Field>
                  <Field label="Fin" required><input className={inputCls} type="datetime-local" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Salle">
                    <select className={inputCls} value={form.roomId} onChange={(e) => set("roomId", e.target.value)}>
                      <option value="" disabled>Choisir une salle</option>
                      {allRooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Capacité" hint="(optionnel)">
                    <input className={inputCls} type="number" min="1" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="Ex : 150" />
                  </Field>
                </div>
                <Field label="Intervenants" required>
                  {allSpeakers.length === 0 ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm">
                      <AlertTriangle size={14} /><span>Aucun intervenant. <Link href="/admin/speakers" className="underline">En créer un</Link> d&apos;abord.</span>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-700 divide-y divide-slate-800 overflow-hidden">
                      {allSpeakers.map((sp) => {
                        const checked = form.speakerIds.includes(sp.id);
                        return (
                          <button key={sp.id} type="button" onClick={() => toggleSpeaker(sp.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${checked ? "bg-cyan-500/10" : "hover:bg-slate-800"}`}>
                            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0 overflow-hidden">
                              {sp.photo ? <img src={sp.photo} alt={sp.fullName} className="w-full h-full object-cover" /> : sp.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <span className={`flex-1 text-sm font-medium ${checked ? "text-cyan-300" : "text-slate-300"}`}>{sp.fullName}</span>
                            {checked ? <CheckSquare size={15} className="text-cyan-400" /> : <Square size={15} className="text-slate-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {form.speakerIds.length > 0 && (
                    <p className="text-[11px] text-cyan-400 mt-1">{form.speakerIds.length} intervenant{form.speakerIds.length !== 1 ? "s" : ""} sélectionné{form.speakerIds.length !== 1 ? "s" : ""}</p>
                  )}
                </Field>
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />{error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="px-6 pb-6 pt-4 border-t border-slate-800 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-2xl border border-slate-700 text-sm text-slate-400 hover:text-white transition-colors font-semibold">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-2xl bg-cyan-500 text-slate-950 text-sm font-bold hover:bg-cyan-400 active:scale-[0.98] transition-all disabled:opacity-50">
                  {loading ? (isEdit ? "Sauvegarde…" : "Création…") : (isEdit ? "Sauvegarder" : "Ajouter")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteSessionModal({ session, onClose, onDeleted }: {
  session: Session | null; onClose: () => void; onDeleted: (id: string) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (session) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [session, onClose]);

  const handleDelete = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Erreur lors de la suppression");
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
            style={{ boxShadow: "0 0 0 1px #ff444418, 0 0 40px #ff444412, 0 32px 64px rgba(0,0,0,0.6)" }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500/50 to-transparent" />
            <div className="px-6 pt-6 pb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-900/40 flex items-center justify-center mb-4">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <h2 className="text-base font-black text-white mb-1">Supprimer la session ?</h2>
              <p className="text-sm text-[#4a5568] leading-relaxed">
                <span className="text-[#ccc] font-semibold">{session.title}</span> sera définitivement supprimée.
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

// ─── Edit Event Modal ─────────────────────────────────────────────────────────

function EditEventModal({ open, onClose, event, onSaved }: {
  open: boolean; onClose: () => void; event: Event; onSaved: (e: Event) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ title: "", description: "", startDate: "", endDate: "", location: "", coverImage: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevEvent, setPrevEvent] = useState(event);

  if (open !== prevOpen || event !== prevEvent) {
    setPrevOpen(open); setPrevEvent(event);
    if (open) {
      setForm({ title: event.title, description: event.description ?? "", startDate: toDatetimeLocal(event.startDate), endDate: toDatetimeLocal(event.endDate), location: event.location ?? "", coverImage: event.coverImage ?? "" });
      setError("");
    }
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!form.title || !form.startDate || !form.endDate) { setError("Titre, début et fin sont obligatoires."); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.title, description: form.description || undefined, startDate: form.startDate, endDate: form.endDate, location: form.location || undefined, coverImage: form.coverImage || undefined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      onSaved({ ...event, ...data }); onClose();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erreur inconnue"); } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={overlayRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={(e) => e.target === overlayRef.current && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Modifier l&apos;événement</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><X size={14} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
              <Field label="Titre" required><input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Titre de l'événement" /></Field>
              <Field label="Description"><textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Description…" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Début" required><input className={inputCls} type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
                <Field label="Fin" required><input className={inputCls} type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></Field>
              </div>
              <Field label="Lieu"><input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Ex : Paris, France" /></Field>
              <Field label="Image de couverture (URL)"><input className={inputCls} type="url" value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} placeholder="https://…" /></Field>
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />{error}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-2xl border border-slate-700 text-sm text-slate-400 hover:text-white font-semibold transition-colors">Annuler</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-2xl bg-cyan-500 text-slate-950 text-sm font-bold hover:bg-cyan-400 active:scale-[0.98] transition-all disabled:opacity-50">
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

// ─── Planning Grid ────────────────────────────────────────────────────────────

function PlanningGrid({ sessions, selectedRoom, toggle, isFavorite, slug }: {
  sessions: Session[]; selectedRoom: string | null;
  toggle: (id: string) => void; isFavorite: (id: string) => boolean; slug: string;
}) {
  const allRooms = [...new Set(sessions.flatMap((s) => s.room ? [s.room.name] : []))];
  const visibleRooms = selectedRoom ? [selectedRoom] : allRooms;

  const timeSlots = [...new Set(
    sessions
      .filter((s) => !selectedRoom || s.room?.name === selectedRoom)
      .map((s) => formatTime(s.startTime))
  )].sort();

  const sessionsByTimeAndRoom: Record<string, Record<string, Session[]>> = {};
  sessions.forEach((s) => {
    if (selectedRoom && s.room?.name !== selectedRoom) return;
    const time = formatTime(s.startTime);
    const room = s.room?.name ?? "__no_room__";
    if (!sessionsByTimeAndRoom[time]) sessionsByTimeAndRoom[time] = {};
    if (!sessionsByTimeAndRoom[time][room]) sessionsByTimeAndRoom[time][room] = [];
    sessionsByTimeAndRoom[time][room].push(s);
  });

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500 text-sm">
        Aucune session pour cette salle.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-20 py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">
              Heure
            </th>
            {visibleRooms.map((room) => (
              <th key={room} className="py-3 px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-slate-900/50 border-l border-slate-800">
                {room}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time) => (
            <tr key={time} className="border-b border-slate-800/60 align-top">
              <td className="py-4 px-4 text-sm font-semibold text-slate-400 whitespace-nowrap w-20">
                {time}
              </td>
              {visibleRooms.map((room) => {
                const roomSessions = sessionsByTimeAndRoom[time]?.[room] ?? [];
                return (
                  <td key={room} className="py-3 px-3 border-l border-slate-800 min-w-[200px]">
                    {roomSessions.map((s) => (
                      <Link key={s.id} href={`/events/${slug}/sessions/${s.slug}`}
                        className="block rounded-2xl border border-slate-700 bg-slate-900/80 p-3 mb-2 hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-200 leading-snug group-hover:text-cyan-300 transition-colors">{s.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {formatTime(s.startTime)}–{formatTime(s.endTime)}
                            </p>
                            {s.speakers.length > 0 && (
                              <p className="text-xs text-cyan-400 mt-1">
                                {s.speakers.map((sp) => sp.fullName).join(", ")}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => { e.preventDefault(); toggle(s.id); }}
                            className="shrink-0 mt-0.5 text-slate-600 hover:text-rose-400 transition-colors"
                            aria-label="Favori">
                            <Heart size={15} className={isFavorite(s.id) ? "fill-rose-400 text-rose-400" : ""} />
                          </button>
                        </div>
                      </Link>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [allSpeakers, setAllSpeakers] = useState<Speaker[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [view, setView] = useState<"liste" | "planning">("liste");

  const [editEventOpen, setEditEventOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deletingSession, setDeletingSession] = useState<Session | null>(null);

  const [planSessions, setPlanSessions] = useState<Session[]>([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const { toggle, isFavorite } = useFavorites();

  const load = useCallback(async () => {
    try {
      const [evtRes, spkRes, roomRes] = await Promise.all([
        fetch(`/api/events/slug/${slug}`), fetch("/api/speakers"), fetch("/api/rooms"),
      ]);
      const [evtData, spkData, roomData] = await Promise.all([evtRes.json(), spkRes.json(), roomRes.json()]);
      if (!evtRes.ok) throw new Error(evtData.error ?? "Erreur");
      setEvent(evtData);
      setAllSpeakers(Array.isArray(spkData) ? spkData : []);
      setAllRooms(Array.isArray(roomData) ? roomData : []);
    } catch { setPageError("Impossible de charger l'événement."); } finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (event?.title) {
      document.title = event.title;
    }
  }, [event]);

  useEffect(() => {
    if (view !== "planning" || !event?.id) return;
    setPlanLoading(true);
    fetch(`/api/events/${event.id}/sessions`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setPlanSessions(d); })
      .catch(() => {})
      .finally(() => setPlanLoading(false));
  }, [view, event?.id]);

  const handleSessionSaved = (saved: Session) => {
    setEvent((prev) => {
      if (!prev) return prev;
      const exists = prev.sessions.find((s) => s.id === saved.id);
      return { ...prev, sessions: exists ? prev.sessions.map((s) => s.id === saved.id ? saved : s) : [...prev.sessions, saved] };
    });
  };

  const handleSessionDeleted = (id: string) => {
    setEvent((prev) => prev ? { ...prev, sessions: prev.sessions.filter((s) => s.id !== id) } : prev);
  };

  const sortedSessions = event?.sessions.slice().sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  ) ?? [];

  const planRooms = [...new Set(planSessions.flatMap((s) => s.room ? [s.room.name] : []))];

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="flex-1 min-h-screen bg-slate-950">
        <div className="h-72 w-full bg-slate-800 animate-pulse" />
        <div className="px-6 py-8 max-w-5xl mx-auto w-full">
          <div className="h-4 w-24 bg-slate-800 rounded animate-pulse mb-8" />
          <div className="h-8 w-64 bg-slate-800 rounded animate-pulse mb-3" />
          <div className="h-4 w-48 bg-slate-800 rounded animate-pulse mb-8" />
          <div className="flex gap-4 mt-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 flex-1 bg-slate-800/50 rounded-2xl border border-slate-800 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (pageError || !event) {
    return (
      <main className="flex-1 min-h-screen bg-slate-950 px-6 py-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2 text-rose-300 text-sm bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3">
          <AlertTriangle size={15} />{pageError || "Événement introuvable."}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Modals */}
      <EditEventModal open={editEventOpen} onClose={() => setEditEventOpen(false)} event={event} onSaved={setEvent} />
      <SessionModal open={sessionModalOpen} onClose={() => setSessionModalOpen(false)} onSaved={handleSessionSaved}
        editingSession={editingSession} allSpeakers={allSpeakers} allRooms={allRooms} eventId={event?.id ?? null} />
      <DeleteSessionModal session={deletingSession} onClose={() => setDeletingSession(null)} onDeleted={handleSessionDeleted} />

      {/* ── Cover Image ─────────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="h-72 w-full overflow-hidden bg-slate-900">
          <Image
            src={event.coverImage ?? "/background.png"}
            alt={event.title}
            fill
            className="w-full h-full object-cover opacity-70"
          />
        </div>
        {/* gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        {/* gradient overlay top (for back link readability) */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-950/60 to-transparent" />

        {/* Back link floating on image */}
        <div className="absolute top-5 left-0 right-0 px-6 max-w-5xl mx-auto">
          <Link href="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-slate-300 hover:text-cyan-300 transition-colors">
            <ArrowLeft size={12} /> Événements
          </Link>
        </div>
      </div>

      <main className="px-6 pb-12 max-w-5xl mx-auto w-full -mt-6">

        {/* ── Event header card ──────────────────────────────────────────────── */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* accent bar */}
              <div className="h-2 w-16 rounded-full bg-cyan-400/30 mb-5" />
              <h1 className="text-3xl font-black text-white tracking-tight">{event.title}</h1>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Calendar size={13} className="text-cyan-400" />
                  {formatDate(event.startDate)}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-400">
                    <MapPin size={13} className="text-cyan-400" />
                    {event.location}
                  </span>
                )}
              </div>
              {event.description && (
                <p className="mt-4 text-slate-400 leading-7 text-sm max-w-2xl">{event.description}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/events/${event.slug}`} target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-700 text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-all font-medium">
                <Eye size={14} /> Voir
              </Link>
              <button onClick={() => setEditEventOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-all font-medium">
                <Pencil size={14} /> Modifier
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs: Liste | Planning ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-0">
          <div className="flex gap-1">
            <button
              onClick={() => setView("liste")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all -mb-px ${
                view === "liste"
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}>
              <List size={15} />
              Sessions
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${view === "liste" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-slate-800 text-slate-400"}`}>
                {event.sessions.length}
              </span>
            </button>
            <button
              onClick={() => setView("planning")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all -mb-px ${
                view === "planning"
                  ? "border-cyan-400 text-cyan-300"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}>
              <LayoutGrid size={15} />
              Planning
            </button>
          </div>
        </div>

        {/* ── LISTE VIEW ──────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {view === "liste" && (
            <motion.div key="liste" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Sessions</h2>
                <button
                  onClick={() => { setEditingSession(null); setSessionModalOpen(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500 text-slate-950 text-sm font-bold hover:bg-cyan-400 active:scale-[0.98] transition-all shadow-sm shadow-cyan-500/20">
                  <Plus size={14} strokeWidth={2.5} /> Nouvelle session
                </button>
              </div>

              {sortedSessions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 py-16 text-center">
                  <p className="text-slate-500 text-sm mb-4">Aucune session pour le moment.</p>
                  <button
                    onClick={() => { setEditingSession(null); setSessionModalOpen(true); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-700 text-sm text-slate-400 hover:text-white font-semibold transition-colors">
                    <Plus size={13} /> Créer la première session
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {sortedSessions.map((s) => (
                      <motion.div key={s.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 hover:border-slate-700 hover:bg-slate-900 transition-all group">
                        <div className="flex-1 min-w-0">
                          <Link href={`/events/${event.slug}/sessions/${s.slug}`}
                            className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors truncate block">
                            {s.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock size={10} className="text-slate-600" />
                              {formatTime(s.startTime)}–{formatTime(s.endTime)}
                              <span className="text-slate-700 ml-0.5">· {duration(s.startTime, s.endTime)}</span>
                            </span>
                            {s.room && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Building2 size={10} className="text-slate-600" /> {s.room.name}
                              </span>
                            )}
                            {s.capacity && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Users size={10} className="text-slate-600" /> {s.capacity} places
                              </span>
                            )}
                            {s.speakers.length > 0 && (
                              <span className="text-xs text-slate-500">
                                {s.speakers.map((sp) => sp.fullName).join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {s.isLive && (
                            <span className="mr-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-full px-2 py-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse inline-block" /> Live
                            </span>
                          )}
                          <button
                            onClick={() => { setEditingSession(s); setSessionModalOpen(true); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                            aria-label="Modifier">
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeletingSession(s)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[#1e2530] text-[#3a4a5a] text-[11px] font-semibold hover:text-red-400 hover:border-red-900/50 hover:bg-red-500/05 transition-all duration-200"
                          >
                            <Trash2 size={11} />
                            Supprimer
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* ── PLANNING VIEW ─────────────────────────────────────────────────── */}
          {view === "planning" && (
            <motion.div key="planning" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
              <div className="flex items-center justify-end gap-2 mb-6 flex-wrap">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${selectedRoom === null ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20" : "border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"}`}>
                  Toutes les salles
                </button>
                {planRooms.map((r) => (
                  <button key={r}
                    onClick={() => setSelectedRoom(r)}
                    className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all ${selectedRoom === r ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20" : "border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"}`}>
                    {r}
                  </button>
                ))}
              </div>

              {planLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                  <PlanningGrid
                    sessions={planSessions}
                    selectedRoom={selectedRoom}
                    toggle={toggle}
                    isFavorite={isFavorite}
                    slug={event.slug}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}